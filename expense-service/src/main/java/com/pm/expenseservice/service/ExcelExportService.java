package com.pm.expenseservice.service;

import com.pm.expenseservice.entity.Transaction;
import com.pm.expenseservice.enums.TransactionType;
import com.pm.expenseservice.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExcelExportService {

    private final TransactionRepository transactionRepository;

    public byte[] exportMonthlyReport(Long userId, int year, int month) throws Exception {
        log.info("Generating Excel report for user: {} for {}/{}", userId, month, year);

        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Monthly Report " + month + "-" + year);

            // Create styles
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dateStyle = createDateStyle(workbook);
            CellStyle currencyStyle = createCurrencyStyle(workbook);
            CellStyle totalStyle = createTotalStyle(workbook);

            // Create header row
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Date", "Expense Description", "Expense Amount",
                    "Income Description", "Income Amount"};

            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Get transactions using the new method
            List<Transaction> expenses = transactionRepository.findByUserIdAndTypeAndDateRange(
                    userId, TransactionType.EXPENSE, startDate, endDate);

            List<Transaction> incomes = transactionRepository.findByUserIdAndTypeAndDateRange(
                    userId, TransactionType.INCOME, startDate, endDate);

            // Write data
            int rowNum = 1;
            int maxRows = Math.max(expenses.size(), incomes.size());

            BigDecimal totalExpense = BigDecimal.ZERO;
            BigDecimal totalIncome = BigDecimal.ZERO;

            for (int i = 0; i < maxRows; i++) {
                Row row = sheet.createRow(rowNum++);

                // Date column
                Cell dateCell = row.createCell(0);
                LocalDate date = null;

                // Expense columns
                if (i < expenses.size()) {
                    Transaction expense = expenses.get(i);
                    date = expense.getTransactionDate();

                    row.createCell(1).setCellValue(expense.getDescription() != null ?
                            expense.getDescription() : expense.getCategory().getName());

                    Cell amountCell = row.createCell(2);
                    amountCell.setCellValue(expense.getAmount().doubleValue());
                    amountCell.setCellStyle(currencyStyle);

                    totalExpense = totalExpense.add(expense.getAmount());
                }

                // Income columns
                if (i < incomes.size()) {
                    Transaction income = incomes.get(i);
                    if (date == null) date = income.getTransactionDate();

                    row.createCell(3).setCellValue(income.getDescription() != null ?
                            income.getDescription() : income.getCategory().getName());

                    Cell amountCell = row.createCell(4);
                    amountCell.setCellValue(income.getAmount().doubleValue());
                    amountCell.setCellStyle(currencyStyle);

                    totalIncome = totalIncome.add(income.getAmount());
                }

                // Set date
                if (date != null) {
                    dateCell.setCellValue(date.toString());
                    dateCell.setCellStyle(dateStyle);
                }
            }

            // Add summary section
            rowNum++; // Empty row

            // Totals row
            Row totalRow = sheet.createRow(rowNum++);
            Cell totalLabel = totalRow.createCell(1);
            totalLabel.setCellValue("TOTAL:");
            totalLabel.setCellStyle(totalStyle);

            Cell expenseTotal = totalRow.createCell(2);
            expenseTotal.setCellValue(totalExpense.doubleValue());
            expenseTotal.setCellStyle(totalStyle);

            Cell incomeTotalLabel = totalRow.createCell(3);
            incomeTotalLabel.setCellValue("TOTAL:");
            incomeTotalLabel.setCellStyle(totalStyle);

            Cell incomeTotal = totalRow.createCell(4);
            incomeTotal.setCellValue(totalIncome.doubleValue());
            incomeTotal.setCellStyle(totalStyle);

            // Net amount row
            rowNum++;
            Row netRow = sheet.createRow(rowNum);
            Cell netLabel = netRow.createCell(1);
            netLabel.setCellValue("NET AMOUNT (Income - Expenses):");
            netLabel.setCellStyle(totalStyle);

            Cell netAmount = netRow.createCell(2);
            netAmount.setCellValue(totalIncome.subtract(totalExpense).doubleValue());
            netAmount.setCellStyle(totalStyle);

            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            // Write to byte array
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        return style;
    }

    private CellStyle createDateStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        CreationHelper createHelper = workbook.getCreationHelper();
        style.setDataFormat(createHelper.createDataFormat().getFormat("yyyy-mm-dd"));
        return style;
    }

    private CellStyle createCurrencyStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("$#,##0.00"));
        return style;
    }

    private CellStyle createTotalStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("$#,##0.00"));
        return style;
    }
}