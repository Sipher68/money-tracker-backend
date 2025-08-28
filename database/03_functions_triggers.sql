-- Database Functions and Triggers
-- Execute these commands in your Supabase SQL Editor

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update the updated_at column
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_categories_updated_at 
  BEFORE UPDATE ON budget_categories 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at 
  BEFORE UPDATE ON transactions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at 
  BEFORE UPDATE ON budgets 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_savings_goals_updated_at 
  BEFORE UPDATE ON savings_goals 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to calculate budget usage percentage
CREATE OR REPLACE FUNCTION get_budget_usage(budget_id_param UUID, start_date_param DATE, end_date_param DATE)
RETURNS TABLE (
  budget_amount DECIMAL(12, 2),
  spent_amount DECIMAL(12, 2),
  usage_percentage DECIMAL(5, 2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.amount as budget_amount,
    COALESCE(SUM(t.amount), 0) as spent_amount,
    CASE 
      WHEN b.amount > 0 THEN ROUND((COALESCE(SUM(t.amount), 0) / b.amount) * 100, 2)
      ELSE 0
    END as usage_percentage
  FROM budgets b
  LEFT JOIN transactions t ON t.category_id = b.category_id 
    AND t.user_id = b.user_id
    AND t.type = 'expense'
    AND t.date >= start_date_param
    AND t.date <= end_date_param
  WHERE b.id = budget_id_param
  GROUP BY b.id, b.amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get spending summary by category for a date range
CREATE OR REPLACE FUNCTION get_spending_summary(user_id_param UUID, start_date_param DATE, end_date_param DATE)
RETURNS TABLE (
  category_name TEXT,
  category_color TEXT,
  total_spent DECIMAL(12, 2),
  transaction_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(bc.name, 'Uncategorized') as category_name,
    COALESCE(bc.color, '#6B7280') as category_color,
    SUM(t.amount) as total_spent,
    COUNT(t.id) as transaction_count
  FROM transactions t
  LEFT JOIN budget_categories bc ON t.category_id = bc.id
  WHERE t.user_id = user_id_param
    AND t.type = 'expense'
    AND t.date >= start_date_param
    AND t.date <= end_date_param
  GROUP BY bc.name, bc.color
  ORDER BY total_spent DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
