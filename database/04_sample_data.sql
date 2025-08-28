-- Sample Data for Testing
-- Execute this in your Supabase SQL Editor AFTER setting up authentication
-- Replace the user_id values with actual auth.users.id from your test users

-- Note: This assumes you have test users created in Supabase Auth
-- You'll need to replace 'YOUR_TEST_USER_ID_HERE' with actual user IDs

-- Sample budget categories
INSERT INTO budget_categories (user_id, name, color) VALUES 
  ('YOUR_TEST_USER_ID_HERE', 'Food & Dining', '#EF4444'),
  ('YOUR_TEST_USER_ID_HERE', 'Transportation', '#3B82F6'),
  ('YOUR_TEST_USER_ID_HERE', 'Shopping', '#8B5CF6'),
  ('YOUR_TEST_USER_ID_HERE', 'Entertainment', '#F59E0B'),
  ('YOUR_TEST_USER_ID_HERE', 'Bills & Utilities', '#10B981'),
  ('YOUR_TEST_USER_ID_HERE', 'Healthcare', '#EC4899'),
  ('YOUR_TEST_USER_ID_HERE', 'Education', '#6366F1');

-- Sample transactions (you'll need to replace category_id values after categories are created)
-- Get the category IDs first: SELECT id, name FROM budget_categories WHERE user_id = 'YOUR_USER_ID';

/*
INSERT INTO transactions (user_id, category_id, type, amount, description, date) VALUES 
  ('YOUR_TEST_USER_ID_HERE', 'FOOD_CATEGORY_ID', 'expense', 45.67, 'Grocery shopping at Walmart', '2024-01-15'),
  ('YOUR_TEST_USER_ID_HERE', 'TRANSPORT_CATEGORY_ID', 'expense', 25.00, 'Gas for car', '2024-01-16'),
  ('YOUR_TEST_USER_ID_HERE', null, 'income', 3000.00, 'Monthly salary', '2024-01-01'),
  ('YOUR_TEST_USER_ID_HERE', 'ENTERTAINMENT_CATEGORY_ID', 'expense', 15.99, 'Netflix subscription', '2024-01-12'),
  ('YOUR_TEST_USER_ID_HERE', 'FOOD_CATEGORY_ID', 'expense', 78.90, 'Restaurant dinner', '2024-01-18');
*/

-- Sample budgets (replace with actual category IDs)
/*
INSERT INTO budgets (user_id, category_id, amount, period, start_date, end_date) VALUES 
  ('YOUR_TEST_USER_ID_HERE', 'FOOD_CATEGORY_ID', 400.00, 'monthly', '2024-01-01', '2024-01-31'),
  ('YOUR_TEST_USER_ID_HERE', 'TRANSPORT_CATEGORY_ID', 200.00, 'monthly', '2024-01-01', '2024-01-31'),
  ('YOUR_TEST_USER_ID_HERE', 'ENTERTAINMENT_CATEGORY_ID', 100.00, 'monthly', '2024-01-01', '2024-01-31');
*/

-- Sample savings goals
/*
INSERT INTO savings_goals (user_id, name, target_amount, current_amount, target_date, description) VALUES 
  ('YOUR_TEST_USER_ID_HERE', 'Emergency Fund', 5000.00, 1200.00, '2024-12-31', 'Build emergency savings for 3 months expenses'),
  ('YOUR_TEST_USER_ID_HERE', 'Vacation Fund', 2000.00, 350.00, '2024-06-15', 'Save for summer vacation trip'),
  ('YOUR_TEST_USER_ID_HERE', 'New Laptop', 1200.00, 800.00, '2024-03-01', 'Save for new MacBook Pro');
*/
