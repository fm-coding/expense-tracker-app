package com.pm.expenseservice.dto.request;

import lombok.Data;

@Data
public class UpdatePreferencesDto {
    private String currency;
    private String theme;
    private String language;
    private Boolean emailNotifications;
    private Boolean pushNotifications;
    private Boolean monthlyReports;
    private Boolean budgetAlerts;
    private Boolean soundEnabled;
}