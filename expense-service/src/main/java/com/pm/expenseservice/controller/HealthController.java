package com.pm.expenseservice.controller;

import com.pm.expenseservice.util.UserContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/expenses")
@RequiredArgsConstructor
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        try {
            response.put("status", "OK");
            response.put("authenticated", UserContext.isAuthenticated());
            response.put("userId", UserContext.getCurrentUserId());
            response.put("email", UserContext.getCurrentUserEmail());
            response.put("service", "expense-service");
        } catch (Exception e) {
            response.put("status", "ERROR");
            response.put("error", e.getMessage());
            response.put("authenticated", false);
        }
        return ResponseEntity.ok(response);
    }
}