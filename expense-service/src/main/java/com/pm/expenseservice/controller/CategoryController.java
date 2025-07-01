package com.pm.expenseservice.controller;

import com.pm.expenseservice.dto.common.ApiResponse;
import com.pm.expenseservice.dto.request.CategoryDto;
import com.pm.expenseservice.entity.Category;
import com.pm.expenseservice.enums.TransactionType;
import com.pm.expenseservice.security.CurrentUser;
import com.pm.expenseservice.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Category>>> getCategories(
            @CurrentUser Long userId,
            @RequestParam(required = false) TransactionType type) {

        List<Category> categories = type != null ?
                categoryService.getUserCategoriesByType(userId, type) :
                categoryService.getUserCategories(userId);

        return ResponseEntity.ok(ApiResponse.success("Categories retrieved successfully", categories));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Category>> createCategory(
            @CurrentUser Long userId,
            @Valid @RequestBody CategoryDto dto) {

        Category category = categoryService.createCategory(userId, dto);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Category created successfully", category));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Category>> updateCategory(
            @CurrentUser Long userId,
            @PathVariable Long id,
            @Valid @RequestBody CategoryDto dto) {

        Category updated = categoryService.updateCategory(userId, id, dto);

        return ResponseEntity.ok(ApiResponse.success("Category updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(
            @CurrentUser Long userId,
            @PathVariable Long id) {

        categoryService.deleteCategory(userId, id);

        return ResponseEntity.ok(ApiResponse.success("Category deleted successfully", null));
    }
}