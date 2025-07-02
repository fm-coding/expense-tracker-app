package com.pm.expenseservice.controller;

import com.pm.expenseservice.dto.common.ApiResponse;
import com.pm.expenseservice.dto.request.CreateTransactionDto;
import com.pm.expenseservice.dto.request.UpdateTransactionDto;
import com.pm.expenseservice.dto.response.TransactionResponseDto;
import com.pm.expenseservice.enums.TransactionType;
import com.pm.expenseservice.security.CurrentUser;
import com.pm.expenseservice.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class TransactionController {

    private final TransactionService transactionService;

    /**
     * Create a new transaction.
     *
     * @param userId the ID of the authenticated user
     * @param dto    the details of the transaction to create
     * @return the created transaction
     */
    @PostMapping
    public ResponseEntity<ApiResponse<TransactionResponseDto>> createTransaction(
            @CurrentUser Long userId,
            @Valid @RequestBody CreateTransactionDto dto) {

        TransactionResponseDto response = transactionService.createTransaction(userId, dto);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Transaction created successfully", response));
    }

    // Endpoint to get transactions for the authenticated user
    @GetMapping
    public ResponseEntity<ApiResponse<Page<TransactionResponseDto>>> getTransactions(
            @CurrentUser Long userId,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @PageableDefault(size = 20, sort = "transactionDate", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<TransactionResponseDto> transactions = transactionService.getUserTransactions(
                userId, type, categoryId, startDate, endDate, pageable);

        return ResponseEntity.ok(ApiResponse.success("Transactions retrieved successfully", transactions));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TransactionResponseDto>> getTransaction(
            @CurrentUser Long userId,
            @PathVariable Long id) {

        TransactionResponseDto transaction = transactionService.getTransaction(userId, id);

        return ResponseEntity.ok(ApiResponse.success("Transaction retrieved successfully", transaction));
    }

    // Endpoint to update a transaction
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TransactionResponseDto>> updateTransaction(
            @CurrentUser Long userId,
            @PathVariable Long id,
            @Valid @RequestBody UpdateTransactionDto dto) {

        TransactionResponseDto updated = transactionService.updateTransaction(userId, id, dto);

        return ResponseEntity.ok(ApiResponse.success("Transaction updated successfully", updated));
    }

    // Endpoint to delete a transaction
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTransaction(
            @CurrentUser Long userId,
            @PathVariable Long id) {

        transactionService.deleteTransaction(userId, id);

        return ResponseEntity.ok(ApiResponse.success("Transaction deleted successfully", null));
    }
}