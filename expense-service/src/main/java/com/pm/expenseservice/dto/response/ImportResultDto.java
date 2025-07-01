package com.pm.expenseservice.dto.response;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportResultDto {
    private Integer totalRows;
    private Integer successCount;
    private Integer errorCount;
    private List<String> errors;
}