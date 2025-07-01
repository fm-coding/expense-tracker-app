package com.pm.expenseservice.util;

import com.pm.expenseservice.enums.TransactionType;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class CategoryMatcher {

    private static final Map<String, List<String>> EXPENSE_KEYWORDS = new HashMap<>();
    private static final Map<String, List<String>> INCOME_KEYWORDS = new HashMap<>();

    static {
        // Expense keywords
        EXPENSE_KEYWORDS.put("Housing", Arrays.asList("rent", "mortgage", "property", "hoa", "maintenance"));
        EXPENSE_KEYWORDS.put("Transportation", Arrays.asList("fuel", "gas", "uber", "taxi", "bus", "train", "parking"));
        EXPENSE_KEYWORDS.put("Food & Dining", Arrays.asList("grocery", "restaurant", "food", "dining", "lunch", "dinner", "breakfast"));
        EXPENSE_KEYWORDS.put("Utilities", Arrays.asList("electricity", "water", "internet", "phone", "gas bill", "cable"));
        EXPENSE_KEYWORDS.put("Healthcare", Arrays.asList("doctor", "hospital", "pharmacy", "medicine", "health", "medical"));
        EXPENSE_KEYWORDS.put("Shopping", Arrays.asList("amazon", "walmart", "target", "clothes", "shoes", "shopping"));
        EXPENSE_KEYWORDS.put("Entertainment", Arrays.asList("movie", "netflix", "spotify", "game", "concert", "sports"));
        EXPENSE_KEYWORDS.put("Education", Arrays.asList("school", "course", "book", "tuition", "education", "training"));
        EXPENSE_KEYWORDS.put("Insurance", Arrays.asList("insurance", "premium", "policy"));

        // Income keywords
        INCOME_KEYWORDS.put("Salary", Arrays.asList("salary", "wage", "payroll", "paycheck"));
        INCOME_KEYWORDS.put("Freelance", Arrays.asList("freelance", "contract", "consulting", "project", "gig"));
        INCOME_KEYWORDS.put("Investment", Arrays.asList("dividend", "interest", "stock", "crypto", "trading", "investment"));
        INCOME_KEYWORDS.put("Business", Arrays.asList("sales", "revenue", "business", "income", "payment received"));
    }

    public String matchCategory(String description, TransactionType type) {
        if (description == null || description.trim().isEmpty()) {
            return type == TransactionType.EXPENSE ? "Other Expenses" : "Other Income";
        }

        String descLower = description.toLowerCase();
        Map<String, List<String>> keywords = type == TransactionType.EXPENSE ? EXPENSE_KEYWORDS : INCOME_KEYWORDS;

        // Find best match
        String bestMatch = null;
        int maxMatches = 0;

        for (Map.Entry<String, List<String>> entry : keywords.entrySet()) {
            int matches = 0;
            for (String keyword : entry.getValue()) {
                if (descLower.contains(keyword)) {
                    matches++;
                }
            }
            if (matches > maxMatches) {
                maxMatches = matches;
                bestMatch = entry.getKey();
            }
        }

        if (bestMatch != null) {
            return bestMatch;
        }

        return type == TransactionType.EXPENSE ? "Other Expenses" : "Other Income";
    }
}