package com.pm.expenseservice.service;

import com.pm.expenseservice.dto.request.CategoryDto;
import com.pm.expenseservice.entity.Category;
import com.pm.expenseservice.enums.TransactionType;
import com.pm.expenseservice.exception.BadRequestException;
import com.pm.expenseservice.exception.ResourceNotFoundException;
import com.pm.expenseservice.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<Category> getUserCategories(Long userId) {
        return categoryRepository.findAllForUser(userId);
    }

    @Transactional(readOnly = true)
    public List<Category> getUserCategoriesByType(Long userId, TransactionType type) {
        return categoryRepository.findByTypeForUser(type, userId);
    }

    @Transactional
    public Category createCategory(Long userId, CategoryDto dto) {
        log.info("Creating category for user: {}", userId);

        // Check if category already exists for user
        if (categoryRepository.existsByNameAndTypeAndUserId(dto.getName(), dto.getType(), userId)) {
            throw new BadRequestException("Category already exists");
        }

        Category category = Category.builder()
                .name(dto.getName())
                .type(dto.getType())
                .icon(dto.getIcon())
                .color(dto.getColor())
                .isSystem(false)
                .userId(userId)
                .build();

        Category saved = categoryRepository.save(category);
        log.info("Category created with ID: {}", saved.getId());

        return saved;
    }

    @Transactional
    public Category updateCategory(Long userId, Long categoryId, CategoryDto dto) {
        log.info("Updating category: {} for user: {}", categoryId, userId);

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        // Ensure category belongs to user
        if (category.getIsSystem() || !category.getUserId().equals(userId)) {
            throw new BadRequestException("Cannot update this category");
        }

        category.setName(dto.getName());
        category.setIcon(dto.getIcon());
        category.setColor(dto.getColor());

        Category updated = categoryRepository.save(category);
        log.info("Category updated successfully");

        return updated;
    }

    @Transactional
    public void deleteCategory(Long userId, Long categoryId) {
        log.info("Deleting category: {} for user: {}", categoryId, userId);

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        // Ensure category belongs to user
        if (category.getIsSystem() || !category.getUserId().equals(userId)) {
            throw new BadRequestException("Cannot delete this category");
        }

        categoryRepository.delete(category);
        log.info("Category deleted successfully");
    }

    @Transactional
    public Long findOrCreateCategoryForUser(String categoryName, TransactionType type, Long userId) {
        // First check system categories
        return categoryRepository.findByNameAndTypeAndIsSystemTrue(categoryName, type)
                .map(Category::getId)
                .orElseGet(() -> {
                    // Then check user categories
                    return categoryRepository.findByNameAndTypeAndUserId(categoryName, type, userId)
                            .map(Category::getId)
                            .orElseGet(() -> {
                                // Create new user category
                                Category newCategory = Category.builder()
                                        .name(categoryName)
                                        .type(type)
                                        .isSystem(false)
                                        .userId(userId)
                                        .build();
                                return categoryRepository.save(newCategory).getId();
                            });
                });
    }
}