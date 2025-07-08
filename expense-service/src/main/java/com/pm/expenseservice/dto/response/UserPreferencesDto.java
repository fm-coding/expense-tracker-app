package com.pm.expenseservice.dto.response;

import lombok.Data;
import lombok.Builder;

@Data
@Builder
public class UserPreferencesDto {
    private String currency;
    private String theme;
    private String language;
    private Boolean emailNotifications;
    private Boolean pushNotifications;
    private Boolean monthlyReports;
    private Boolean budgetAlerts;
    private Boolean soundEnabled;
}