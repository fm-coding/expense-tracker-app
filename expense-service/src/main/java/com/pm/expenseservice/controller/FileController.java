package com.pm.expenseservice.controller;

import com.pm.expenseservice.dto.common.ApiResponse;
import com.pm.expenseservice.dto.response.ImportResultDto;
import com.pm.expenseservice.security.CurrentUser;
import com.pm.expenseservice.service.ExcelExportService;
import com.pm.expenseservice.service.ExcelImportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

@Slf4j
@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class FileController {

    private final ExcelImportService excelImportService;
    private final ExcelExportService excelExportService;

    @PostMapping("/import")
    public ResponseEntity<ApiResponse<ImportResultDto>> importExcel(
            @CurrentUser Long userId,
            @RequestParam("file") MultipartFile file) {

        log.info("Importing Excel file for user: {}, filename: {}", userId, file.getOriginalFilename());

        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Please select a file to upload"));
        }

        if (!file.getOriginalFilename().endsWith(".xlsx") && !file.getOriginalFilename().endsWith(".xls")) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Please upload an Excel file (.xlsx or .xls)"));
        }

        ImportResultDto result = excelImportService.importExcel(userId, file);

        return ResponseEntity.ok(ApiResponse.success("File imported successfully", result));
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportExcel(
            @CurrentUser Long userId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {

        // Default to current month if not specified
        LocalDate now = LocalDate.now();
        if (year == null) year = now.getYear();
        if (month == null) month = now.getMonthValue();

        log.info("Exporting Excel file for user: {} for {}/{}", userId, month, year);

        try {
            byte[] excelData = excelExportService.exportMonthlyReport(userId, year, month);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment",
                    String.format("expense-report-%d-%02d.xlsx", year, month));

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(excelData);

        } catch (Exception e) {
            log.error("Error exporting Excel file", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/template")
    public ResponseEntity<byte[]> downloadTemplate() {
        log.info("Downloading Excel template");

        try {
            // Create a template Excel file
            byte[] templateData = createExcelTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", "expense-import-template.xlsx");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(templateData);

        } catch (Exception e) {
            log.error("Error creating Excel template", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    private byte[] createExcelTemplate() throws Exception {
        try (org.apache.poi.xssf.usermodel.XSSFWorkbook workbook = new org.apache.poi.xssf.usermodel.XSSFWorkbook()) {
            org.apache.poi.ss.usermodel.Sheet sheet = workbook.createSheet("Transactions");

            // Create header row
            org.apache.poi.ss.usermodel.Row headerRow = sheet.createRow(0);
            String[] headers = {"Date", "Expense Description", "Expense Amount", "Income Description", "Income Amount"};

            org.apache.poi.ss.usermodel.CellStyle headerStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            for (int i = 0; i < headers.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Add sample data
            org.apache.poi.ss.usermodel.Row sampleRow = sheet.createRow(1);
            sampleRow.createCell(0).setCellValue(LocalDate.now().toString());
            sampleRow.createCell(1).setCellValue("Grocery shopping at Walmart");
            sampleRow.createCell(2).setCellValue(150.50);
            sampleRow.createCell(3).setCellValue("Monthly salary");
            sampleRow.createCell(4).setCellValue(5000.00);

            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            java.io.ByteArrayOutputStream outputStream = new java.io.ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }
}