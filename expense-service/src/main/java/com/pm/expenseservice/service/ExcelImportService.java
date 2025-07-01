package com.pm.expenseservice.service;

import com.pm.expenseservice.dto.request.CreateTransactionDto;
import com.pm.expenseservice.dto.response.ImportResultDto;
import com.pm.expenseservice.enums.TransactionType;
import com.pm.expenseservice.util.CategoryMatcher;
import com.pm.expenseservice.util.ExcelHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExcelImportService {

    private final TransactionService transactionService;
    private final CategoryService categoryService;
    private final CategoryMatcher categoryMatcher;
    private final ExcelHelper excelHelper;

    public ImportResultDto importExcel(Long userId, MultipartFile file) {
        log.info("Starting Excel import for user: {}", userId);

        List<CreateTransactionDto> validTransactions = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        int rowsProcessed = 0;

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);

            // Find column indices
            Map<String, Integer> columnMap = findColumns(sheet.getRow(0));

            if (!validateColumns(columnMap, errors)) {
                return ImportResultDto.builder()
                        .totalRows(0)
                        .successCount(0)
                        .errorCount(errors.size())
                        .errors(errors)
                        .build();
            }

            // Process data rows
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                rowsProcessed++;

                // Process expenses
                processTransactionFromRow(row, columnMap, TransactionType.EXPENSE,
                        "expense_desc", "expense_amount", userId, validTransactions, errors, i);

                // Process income
                processTransactionFromRow(row, columnMap, TransactionType.INCOME,
                        "income_desc", "income_amount", userId, validTransactions, errors, i);
            }

        } catch (Exception e) {
            log.error("Error reading Excel file", e);
            errors.add("Failed to read file: " + e.getMessage());
        }

        // Save valid transactions
        int successCount = 0;
        for (CreateTransactionDto dto : validTransactions) {
            try {
                transactionService.createTransaction(userId, dto);
                successCount++;
            } catch (Exception e) {
                errors.add("Failed to save: " + dto.getDescription());
            }
        }

        log.info("Excel import completed. Rows: {}, Success: {}, Errors: {}",
                rowsProcessed, successCount, errors.size());

        return ImportResultDto.builder()
                .totalRows(rowsProcessed)
                .successCount(successCount)
                .errorCount(errors.size())
                .errors(errors)
                .build();
    }

    private Map<String, Integer> findColumns(Row headerRow) {
        Map<String, Integer> columnMap = new HashMap<>();

        for (Cell cell : headerRow) {
            String header = excelHelper.getCellValueAsString(cell).toLowerCase();
            int col = cell.getColumnIndex();

            if (header.contains("expense") && header.contains("desc")) {
                columnMap.put("expense_desc", col);
            } else if (header.contains("expense") && header.contains("amount")) {
                columnMap.put("expense_amount", col);
            } else if (header.contains("income") && header.contains("desc")) {
                columnMap.put("income_desc", col);
            } else if (header.contains("income") && header.contains("amount")) {
                columnMap.put("income_amount", col);
            } else if (header.contains("date")) {
                columnMap.put("date", col);
            }
        }

        return columnMap;
    }

    private boolean validateColumns(Map<String, Integer> columnMap, List<String> errors) {
        boolean hasExpense = columnMap.containsKey("expense_desc") &&
                columnMap.containsKey("expense_amount");
        boolean hasIncome = columnMap.containsKey("income_desc") &&
                columnMap.containsKey("income_amount");

        if (!hasExpense && !hasIncome) {
            errors.add("No valid expense or income columns found. Expected columns: 'Expense Description', 'Expense Amount', 'Income Description', 'Income Amount'");
            return false;
        }

        return true;
    }

    private void processTransactionFromRow(Row row, Map<String, Integer> columnMap,
                                           TransactionType type, String descKey, String amountKey,
                                           Long userId, List<CreateTransactionDto> transactions,
                                           List<String> errors, int rowNum) {
        try {
            Integer descCol = columnMap.get(descKey);
            Integer amountCol = columnMap.get(amountKey);

            if (descCol == null || amountCol == null) return;

            Cell descCell = row.getCell(descCol);
            Cell amountCell = row.getCell(amountCol);

            if (descCell == null || amountCell == null) return;

            String description = excelHelper.getCellValueAsString(descCell);
            if (description.isEmpty()) return;

            BigDecimal amount = excelHelper.getCellValueAsDecimal(amountCell);
            if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) return;

            // Get date if available, otherwise use today
            LocalDate date = LocalDate.now();
            if (columnMap.containsKey("date")) {
                Cell dateCell = row.getCell(columnMap.get("date"));
                LocalDate cellDate = excelHelper.getCellValueAsDate(dateCell);
                if (cellDate != null) {
                    date = cellDate;
                }
            }

            // Match category
            String categoryName = categoryMatcher.matchCategory(description, type);
            Long categoryId = categoryService.findOrCreateCategoryForUser(categoryName, type, userId);

            transactions.add(CreateTransactionDto.builder()
                    .categoryId(categoryId)
                    .amount(amount)
                    .type(type)
                    .description(description)
                    .transactionDate(date)
                    .build());

        } catch (Exception e) {
            errors.add(String.format("Row %d (%s): %s",
                    rowNum + 1, type.name().toLowerCase(), e.getMessage()));
        }
    }
}