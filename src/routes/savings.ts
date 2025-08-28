import { Router, Response } from 'express';
import { authenticateFirebaseToken } from '../middleware/auth';
import { supabase } from '../services/supabase';
import { AuthenticatedRequest } from '../types';

const router = Router();

// Apply authentication middleware
router.use(authenticateFirebaseToken);

// GET /api/savings - Get all savings goals for user
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    const { data: savingsData, error } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching savings goals:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch savings goals',
      });
    }

    // Transform data to match frontend format
    const savingsGoals = (savingsData || []).map((goal) => ({
      id: goal.id,
      title: goal.name,
      description: goal.description || '',
      targetAmount: parseFloat(goal.target_amount),
      currentAmount: parseFloat(goal.current_amount),
      category: goal.category || 'Other',
      targetDate: goal.target_date,
      priority: goal.priority || 'medium',
      isCompleted: goal.is_completed,
      createdAt: goal.created_at,
      updatedAt: goal.updated_at,
    }));

    res.json({
      success: true,
      data: savingsGoals,
    });
  } catch (error) {
    console.error('Error in GET /api/savings:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// POST /api/savings - Create a new savings goal
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const { title, description, targetAmount, category, targetDate, priority } =
      req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    // Validation
    if (!title || !targetAmount) {
      return res.status(400).json({
        success: false,
        error: 'Title and target amount are required',
      });
    }

    if (targetAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Target amount must be positive',
      });
    }

    const { data: savingsData, error } = await supabase
      .from('savings_goals')
      .insert([
        {
          user_id: userId,
          name: title,
          description: description || '',
          target_amount: targetAmount,
          current_amount: 0,
          target_date: targetDate,
          category: category || 'Other',
          priority: priority || 'medium',
          is_completed: false,
        },
      ])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating savings goal:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create savings goal',
      });
    }

    const savingsGoal = {
      id: savingsData.id,
      title: savingsData.name,
      description: savingsData.description || '',
      targetAmount: parseFloat(savingsData.target_amount),
      currentAmount: parseFloat(savingsData.current_amount),
      category: savingsData.category || 'Other',
      targetDate: savingsData.target_date,
      priority: savingsData.priority || 'medium',
      isCompleted: savingsData.is_completed,
      createdAt: savingsData.created_at,
      updatedAt: savingsData.updated_at,
    };

    res.status(201).json({
      success: true,
      data: savingsGoal,
    });
  } catch (error) {
    console.error('Error in POST /api/savings:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// PUT /api/savings/:id - Update a savings goal
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const savingsId = req.params.id;
    const {
      title,
      description,
      targetAmount,
      currentAmount,
      category,
      targetDate,
      priority,
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    const updateData: any = {};
    if (title) updateData.name = title;
    if (description !== undefined) updateData.description = description;
    if (targetAmount !== undefined) {
      if (targetAmount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Target amount must be positive',
        });
      }
      updateData.target_amount = targetAmount;
    }
    if (currentAmount !== undefined) {
      if (currentAmount < 0) {
        return res.status(400).json({
          success: false,
          error: 'Current amount cannot be negative',
        });
      }
      updateData.current_amount = currentAmount;
      // Update completion status based on current vs target
      if (targetAmount !== undefined) {
        updateData.is_completed = currentAmount >= targetAmount;
      }
    }
    if (category !== undefined) updateData.category = category;
    if (targetDate !== undefined) updateData.target_date = targetDate;
    if (priority !== undefined) updateData.priority = priority;

    const { data: savingsData, error } = await supabase
      .from('savings_goals')
      .update(updateData)
      .eq('id', savingsId)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating savings goal:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update savings goal',
      });
    }

    if (!savingsData) {
      return res.status(404).json({
        success: false,
        error: 'Savings goal not found',
      });
    }

    const savingsGoal = {
      id: savingsData.id,
      title: savingsData.name,
      description: savingsData.description || '',
      targetAmount: parseFloat(savingsData.target_amount),
      currentAmount: parseFloat(savingsData.current_amount),
      category: savingsData.category || 'Other',
      targetDate: savingsData.target_date,
      priority: savingsData.priority || 'medium',
      isCompleted: savingsData.is_completed,
      createdAt: savingsData.created_at,
      updatedAt: savingsData.updated_at,
    };

    res.json({
      success: true,
      data: savingsGoal,
    });
  } catch (error) {
    console.error('Error in PUT /api/savings:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// DELETE /api/savings/:id - Delete a savings goal
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const savingsId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    const { error } = await supabase
      .from('savings_goals')
      .delete()
      .eq('id', savingsId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting savings goal:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete savings goal',
      });
    }

    res.json({
      success: true,
      data: { message: 'Savings goal deleted successfully' },
    });
  } catch (error) {
    console.error('Error in DELETE /api/savings:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
