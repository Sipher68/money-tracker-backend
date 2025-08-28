import { Router, Response } from 'express';
import { authenticateFirebaseToken } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import { supabase } from '../services/supabase';

const router = Router();

// Apply authentication middleware
router.use(authenticateFirebaseToken);

interface Budget {
  id: string;
  category: string;
  budgetAmount: number;
  spentAmount?: number;
  period: 'monthly' | 'weekly' | 'yearly';
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// GET /api/budgets - Get all budgets for the authenticated user
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Get budgets first
    const { data: budgetsData, error: budgetsError } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (budgetsError) {
      console.error('Error fetching budgets:', budgetsError);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch budgets'
      });
    }

    // Get category names
    const categoryIds = budgetsData?.map(b => b.category_id) || [];
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('budget_categories')
      .select('id, name')
      .in('id', categoryIds);

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch categories'
      });
    }

    // Create a map for quick category lookups
    const categoryMap = new Map(categoriesData?.map(cat => [cat.id, cat.name]) || []);

    // Calculate spent amounts for each budget
    const budgetsWithSpent = await Promise.all(
      (budgetsData || []).map(async (budget: any) => {
        // Get spent amount for this budget's category within the date range
        const { data: spentData, error: spentError } = await supabase
          .from('transactions')
          .select('amount')
          .eq('user_id', userId)
          .eq('type', 'expense')
          .gte('date', budget.start_date)
          .lte('date', budget.end_date)
          .eq('category_id', budget.category_id);

        const spentAmount = spentData?.reduce((sum, transaction) => 
          sum + parseFloat(transaction.amount), 0) || 0;

        // Check if budget is active (current date is within the budget period)
        const now = new Date();
        const startDate = new Date(budget.start_date);
        const endDate = new Date(budget.end_date);
        const isActive = now >= startDate && now <= endDate;

        return {
          id: budget.id,
          category: categoryMap.get(budget.category_id) || 'Unknown',
          budgetAmount: parseFloat(budget.amount),
          spentAmount,
          period: budget.period,
          startDate: budget.start_date,
          endDate: budget.end_date,
          isActive,
          createdAt: budget.created_at,
          updatedAt: budget.updated_at
        };
      })
    );

    res.json({
      success: true,
      data: budgetsWithSpent
    });

  } catch (error) {
    console.error('Error in GET /api/budgets:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/budgets - Create a new budget
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const { category, budgetAmount, period, startDate, endDate } = req.body;

    if (!category || !budgetAmount || !period || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: category, budgetAmount, period, startDate, endDate'
      });
    }

    // First, get or create the category
    let { data: categoryData, error: categoryError } = await supabase
      .from('budget_categories')
      .select('id')
      .eq('user_id', userId)
      .eq('name', category)
      .single();

    if (categoryError && categoryError.code !== 'PGRST116') { // PGRST116 = no rows found
      return res.status(500).json({
        success: false,
        error: 'Failed to check category'
      });
    }

    let categoryId = categoryData?.id;

    // Create category if it doesn't exist
    if (!categoryId) {
      const { data: newCategory, error: createCategoryError } = await supabase
        .from('budget_categories')
        .insert([{
          user_id: userId,
          name: category
        }])
        .select('id')
        .single();

      if (createCategoryError) {
        return res.status(500).json({
          success: false,
          error: 'Failed to create category'
        });
      }

      categoryId = newCategory.id;
    }

    // Create the budget
    const { data: budgetData, error: budgetError } = await supabase
      .from('budgets')
      .insert([{
        user_id: userId,
        category_id: categoryId,
        amount: budgetAmount,
        period,
        start_date: startDate,
        end_date: endDate
      }])
      .select('*')
      .single();

    if (budgetError) {
      console.error('Error creating budget:', budgetError);
      return res.status(500).json({
        success: false,
        error: 'Failed to create budget'
      });
    }

    const budget = {
      id: budgetData.id,
      category: category, // We already have the category name
      budgetAmount: parseFloat(budgetData.amount),
      spentAmount: 0,
      period: budgetData.period,
      startDate: budgetData.start_date,
      endDate: budgetData.end_date,
      isActive: true,
      createdAt: budgetData.created_at,
      updatedAt: budgetData.updated_at
    };

    res.status(201).json({
      success: true,
      data: budget
    });

  } catch (error) {
    console.error('Error in POST /api/budgets:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// PUT /api/budgets/:id - Update a budget
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const budgetId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const { budgetAmount, period, startDate, endDate } = req.body;

    const { data: updatedBudget, error } = await supabase
      .from('budgets')
      .update({
        amount: budgetAmount,
        period,
        start_date: startDate,
        end_date: endDate,
        updated_at: new Date().toISOString()
      })
      .eq('id', budgetId)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating budget:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update budget'
      });
    }

    if (!updatedBudget) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found'
      });
    }

    // Get the category name
    const { data: categoryData } = await supabase
      .from('budget_categories')
      .select('name')
      .eq('id', updatedBudget.category_id)
      .single();

    // Check if budget is active
    const now = new Date();
    const startDateObj = new Date(updatedBudget.start_date);
    const endDateObj = new Date(updatedBudget.end_date);
    const isActive = now >= startDateObj && now <= endDateObj;

    const budget = {
      id: updatedBudget.id,
      category: categoryData?.name || 'Unknown',
      budgetAmount: parseFloat(updatedBudget.amount),
      spentAmount: 0, // Will be calculated by the frontend context
      period: updatedBudget.period,
      startDate: updatedBudget.start_date,
      endDate: updatedBudget.end_date,
      isActive,
      createdAt: updatedBudget.created_at,
      updatedAt: updatedBudget.updated_at
    };

    res.json({
      success: true,
      data: budget
    });

  } catch (error) {
    console.error('Error in PUT /api/budgets:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// DELETE /api/budgets/:id - Delete a budget
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const budgetId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', budgetId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting budget:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete budget'
      });
    }

    res.json({
      success: true,
      data: { message: 'Budget deleted successfully' }
    });

  } catch (error) {
    console.error('Error in DELETE /api/budgets:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
