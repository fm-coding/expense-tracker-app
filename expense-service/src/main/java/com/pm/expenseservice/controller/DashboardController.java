package com.pm.expenseservice.controller;

import com.pm.expenseservice.dto.common.ApiResponse;
import com.pm.expenseservice.dto.response.DashboardResponseDto;
import com.pm.expenseservice.security.CurrentUser;
import com.pm.expenseservice.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class DashboardController {

    private final DashboardService dashboardService;

    // Endpoint to get the dashboard data for the authenticated user
    @GetMapping
    public ResponseEntity<ApiResponse<DashboardResponseDto>> getDashboard(
            @CurrentUser Long userId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {

        // Default to current month if not specified
        LocalDate now = LocalDate.now();
        if (year == null) year = now.getYear();
        if (month == null) month = now.getMonthValue();

        DashboardResponseDto dashboard = dashboardService.getDashboard(userId, year, month);

        return ResponseEntity.ok(ApiResponse.success("Dashboard data retrieved successfully", dashboard));
    }
}