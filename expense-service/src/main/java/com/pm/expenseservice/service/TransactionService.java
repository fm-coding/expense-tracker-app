package com.pm.expenseservice.service;

import com.pm.expenseservice.dto.request.CreateTransactionDto;
import com.pm.expenseservice.dto.request.UpdateTransactionDto;
import com.pm.expenseservice.dto.response.TransactionResponseDto;
import com.pm.expenseservice.entity.Category;
import com.pm.expenseservice.entity.Transaction;
import com.pm.expenseservice.enums.TransactionType;
import com.pm.expenseservice.exception.BadRequestException;
import com.pm.expenseservice.exception.ResourceNotFoundException;
import com.pm.expenseservice.repository.CategoryRepository;
import com.pm.expenseservice.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    @Transactional
    public TransactionResponseDto createTransaction(Long userId, CreateTransactionDto dto) {
        log.info("Creating transaction for user: {}", userId);

        // Validate category
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        // Ensure category type matches transaction type
        if (!category.getType().equals(dto.getType())) {
            throw new BadRequestException("Category type does not match transaction type");
        }

        // Check if category belongs to user or is system category
        if (!category.getIsSystem() && !category.getUserId().equals(userId)) {
            throw new BadRequestException("Category does not belong to user");
        }

        Transaction transaction = Transaction.builder()
                .userId(userId)
                .category(category)
                .amount(dto.getAmount())
                .type(dto.getType())
                .description(dto.getDescription())
                .transactionDate(dto.getTransactionDate())
                .build();

        Transaction saved = transactionRepository.save(transaction);
        log.info("Transaction created with ID: {}", saved.getId());

        return mapToResponseDto(saved);
    }

    @Transactional(readOnly = true)
    public Page<TransactionResponseDto> getUserTransactions(Long userId,
                                                            TransactionType type,
                                                            Long categoryId,
                                                            LocalDate startDate,
                                                            LocalDate endDate,
                                                            Pageable pageable) {
        log.info("Fetching transactions for user: {} with filters", userId);

        return transactionRepository.findUserTransactionsWithFilters(
                        userId, type, categoryId, startDate, endDate, pageable)
                .map(this::mapToResponseDto);
    }

    @Transactional(readOnly = true)
    public TransactionResponseDto getTransaction(Long userId, Long transactionId) {
        Transaction transaction = transactionRepository.findByIdAndUserId(transactionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        return mapToResponseDto(transaction);
    }

    @Transactional
    public TransactionResponseDto updateTransaction(Long userId, Long transactionId,
                                                    UpdateTransactionDto dto) {
        log.info("Updating transaction: {} for user: {}", transactionId, userId);

        Transaction transaction = transactionRepository.findByIdAndUserId(transactionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        if (dto.getCategoryId() != null && !dto.getCategoryId().equals(transaction.getCategory().getId())) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

            if (!category.getType().equals(transaction.getType())) {
                throw new BadRequestException("Cannot change to a category of different type");
            }

            transaction.setCategory(category);
        }

        if (dto.getAmount() != null) {
            transaction.setAmount(dto.getAmount());
        }

        if (dto.getDescription() != null) {
            transaction.setDescription(dto.getDescription());
        }

        if (dto.getTransactionDate() != null) {
            transaction.setTransactionDate(dto.getTransactionDate());
        }

        Transaction updated = transactionRepository.save(transaction);
        log.info("Transaction updated successfully");

        return mapToResponseDto(updated);
    }

    @Transactional
    public void deleteTransaction(Long userId, Long transactionId) {
        log.info("Deleting transaction: {} for user: {}", transactionId, userId);

        Transaction transaction = transactionRepository.findByIdAndUserId(transactionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        transactionRepository.delete(transaction);
        log.info("Transaction deleted successfully");
    }

    TransactionResponseDto mapToResponseDto(Transaction transaction) {
        return TransactionResponseDto.builder()
                .id(transaction.getId())
                .categoryId(transaction.getCategory().getId())
                .categoryName(transaction.getCategory().getName())
                .categoryIcon(transaction.getCategory().getIcon())
                .categoryColor(transaction.getCategory().getColor())
                .amount(transaction.getAmount())
                .type(transaction.getType())
                .description(transaction.getDescription())
                .transactionDate(transaction.getTransactionDate())
                .createdAt(transaction.getCreatedAt())
                .build();
    }
}