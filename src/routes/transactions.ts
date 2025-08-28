import { Router, Request, Response } from 'express';
import { authenticateFirebaseToken } from '../middleware/auth';
import { supabase, TABLES } from '../services/supabase';
import { 
  Transaction, 
  NewTransaction, 
  TransactionFilters, 
  AuthenticatedRequest,
  ApiResponse 
} from '../types';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateFirebaseToken);

// GET /api/transactions - Get all transactions for user
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from(TABLES.TRANSACTIONS)
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      throw error;
    }

    const response: ApiResponse<Transaction[]> = {
      success: true,
      data: data || [],
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions',
    });
  }
});

// POST /api/transactions - Create new transaction
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const transactionData: NewTransaction = req.body;

    const { data, error } = await supabase
      .from(TABLES.TRANSACTIONS)
      .insert([
        {
          ...transactionData,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    const response: ApiResponse<Transaction> = {
      success: true,
      data: data,
      message: 'Transaction created successfully',
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create transaction',
    });
  }
});

// PUT /api/transactions/:id - Update transaction
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const transactionId = req.params.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const updates = {
      ...req.body,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from(TABLES.TRANSACTIONS)
      .update(updates)
      .eq('id', transactionId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found',
      });
    }

    const response: ApiResponse<Transaction> = {
      success: true,
      data: data,
      message: 'Transaction updated successfully',
    };

    res.json(response);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update transaction',
    });
  }
});

// DELETE /api/transactions/:id - Delete transaction
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const transactionId = req.params.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { error } = await supabase
      .from(TABLES.TRANSACTIONS)
      .delete()
      .eq('id', transactionId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    const response: ApiResponse = {
      success: true,
      message: 'Transaction deleted successfully',
    };

    res.json(response);
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete transaction',
    });
  }
});

export default router;
