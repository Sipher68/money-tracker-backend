import { Router, Response } from 'express';
import { authenticateFirebaseToken } from '../middleware/auth';
import { supabase } from '../services/supabase';
import { AuthenticatedRequest } from '../types';

const router = Router();

// Apply authentication middleware
router.use(authenticateFirebaseToken);

// GET /api/subscriptions - Get all subscriptions for user
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    const { data: subscriptionsData, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('next_billing_date', { ascending: true });

    if (error) {
      console.error('Error fetching subscriptions:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch subscriptions',
      });
    }

    // Transform data to match frontend format
    const subscriptions = (subscriptionsData || []).map((sub) => ({
      id: sub.id,
      name: sub.name,
      category: sub.category,
      amount: parseFloat(sub.amount),
      billingCycle: sub.billing_cycle,
      nextBillingDate: sub.next_billing_date,
      isActive: sub.is_active,
      description: sub.description,
      website: sub.website,
      reminderDays: sub.reminder_days,
      createdAt: sub.created_at,
      updatedAt: sub.updated_at,
    }));

    res.json({
      success: true,
      data: subscriptions,
    });
  } catch (error) {
    console.error('Error in GET /api/subscriptions:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// POST /api/subscriptions - Create a new subscription
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const {
      name,
      category,
      amount,
      billingCycle,
      nextBillingDate,
      description,
      website,
      reminderDays,
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    // Validation
    if (!name || !amount || !billingCycle || !nextBillingDate) {
      return res.status(400).json({
        success: false,
        error:
          'Name, amount, billing cycle, and next billing date are required',
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be positive',
      });
    }

    const validBillingCycles = ['weekly', 'monthly', 'quarterly', 'yearly'];
    if (!validBillingCycles.includes(billingCycle)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid billing cycle',
      });
    }

    const { data: subscriptionData, error } = await supabase
      .from('subscriptions')
      .insert([
        {
          user_id: userId,
          name,
          category: category || 'Other',
          amount,
          billing_cycle: billingCycle,
          next_billing_date: nextBillingDate,
          is_active: true,
          description: description || null,
          website: website || null,
          reminder_days: reminderDays || 3,
        },
      ])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating subscription:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create subscription',
      });
    }

    const subscription = {
      id: subscriptionData.id,
      name: subscriptionData.name,
      category: subscriptionData.category,
      amount: parseFloat(subscriptionData.amount),
      billingCycle: subscriptionData.billing_cycle,
      nextBillingDate: subscriptionData.next_billing_date,
      isActive: subscriptionData.is_active,
      description: subscriptionData.description,
      website: subscriptionData.website,
      reminderDays: subscriptionData.reminder_days,
      createdAt: subscriptionData.created_at,
      updatedAt: subscriptionData.updated_at,
    };

    res.status(201).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    console.error('Error in POST /api/subscriptions:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// PUT /api/subscriptions/:id - Update a subscription
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const subscriptionId = req.params.id;
    const {
      name,
      category,
      amount,
      billingCycle,
      nextBillingDate,
      isActive,
      description,
      website,
      reminderDays,
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (amount !== undefined) {
      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Amount must be positive',
        });
      }
      updateData.amount = amount;
    }
    if (billingCycle !== undefined) {
      const validBillingCycles = ['weekly', 'monthly', 'quarterly', 'yearly'];
      if (!validBillingCycles.includes(billingCycle)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid billing cycle',
        });
      }
      updateData.billing_cycle = billingCycle;
    }
    if (nextBillingDate !== undefined)
      updateData.next_billing_date = nextBillingDate;
    if (isActive !== undefined) updateData.is_active = isActive;
    if (description !== undefined) updateData.description = description;
    if (website !== undefined) updateData.website = website;
    if (reminderDays !== undefined) updateData.reminder_days = reminderDays;

    const { data: subscriptionData, error } = await supabase
      .from('subscriptions')
      .update(updateData)
      .eq('id', subscriptionId)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating subscription:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update subscription',
      });
    }

    if (!subscriptionData) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found',
      });
    }

    const subscription = {
      id: subscriptionData.id,
      name: subscriptionData.name,
      category: subscriptionData.category,
      amount: parseFloat(subscriptionData.amount),
      billingCycle: subscriptionData.billing_cycle,
      nextBillingDate: subscriptionData.next_billing_date,
      isActive: subscriptionData.is_active,
      description: subscriptionData.description,
      website: subscriptionData.website,
      reminderDays: subscriptionData.reminder_days,
      createdAt: subscriptionData.created_at,
      updatedAt: subscriptionData.updated_at,
    };

    res.json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    console.error('Error in PUT /api/subscriptions:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// DELETE /api/subscriptions/:id - Delete a subscription
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const subscriptionId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', subscriptionId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting subscription:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete subscription',
      });
    }

    res.json({
      success: true,
      data: { message: 'Subscription deleted successfully' },
    });
  } catch (error) {
    console.error('Error in DELETE /api/subscriptions:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
