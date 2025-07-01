-- Insert default expense categories
INSERT INTO categories (id, name, type, icon, color, is_system, created_at) VALUES
                                                                                (1, 'Housing', 'EXPENSE', 'home', '#8B4513', true, CURRENT_TIMESTAMP),
                                                                                (2, 'Transportation', 'EXPENSE', 'car', '#1E90FF', true, CURRENT_TIMESTAMP),
                                                                                (3, 'Food & Dining', 'EXPENSE', 'utensils', '#FF6347', true, CURRENT_TIMESTAMP),
                                                                                (4, 'Utilities', 'EXPENSE', 'bolt', '#FFD700', true, CURRENT_TIMESTAMP),
                                                                                (5, 'Healthcare', 'EXPENSE', 'heart', '#FF69B4', true, CURRENT_TIMESTAMP),
                                                                                (6, 'Shopping', 'EXPENSE', 'shopping-bag', '#9370DB', true, CURRENT_TIMESTAMP),
                                                                                (7, 'Entertainment', 'EXPENSE', 'film', '#FF1493', true, CURRENT_TIMESTAMP),
                                                                                (8, 'Education', 'EXPENSE', 'graduation-cap', '#4169E1', true, CURRENT_TIMESTAMP),
                                                                                (9, 'Insurance', 'EXPENSE', 'shield', '#2F4F4F', true, CURRENT_TIMESTAMP),
                                                                                (10, 'Other Expenses', 'EXPENSE', 'ellipsis-h', '#808080', true, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Insert default income categories
INSERT INTO categories (id, name, type, icon, color, is_system, created_at) VALUES
                                                                                (11, 'Salary', 'INCOME', 'briefcase', '#228B22', true, CURRENT_TIMESTAMP),
                                                                                (12, 'Freelance', 'INCOME', 'laptop', '#32CD32', true, CURRENT_TIMESTAMP),
                                                                                (13, 'Investment', 'INCOME', 'chart-line', '#006400', true, CURRENT_TIMESTAMP),
                                                                                (14, 'Business', 'INCOME', 'store', '#3CB371', true, CURRENT_TIMESTAMP),
                                                                                (15, 'Other Income', 'INCOME', 'plus-circle', '#90EE90', true, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Reset sequence to avoid conflicts
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories) + 1);