# Database Setup Guide

This guide will help you set up the database for your Money Tracker backend using Supabase.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Fill in project details:
   - **Name**: `money-tracker`
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to you
6. Click "Create new project"
7. Wait for the project to be created (this takes a few minutes)

## Step 2: Get Your Project Credentials

Once your project is ready:

1. Go to Settings → API
2. Copy these values:

   - **Project URL** (anon key URL)
   - **anon/public key**
   - **service_role/secret key** (keep this secret!)

3. Go to Settings → Database
4. Copy the **Connection string** (you'll need this for direct database access)

## Step 3: Update Your Environment Variables

Update your `.env` file:

```env
# Supabase Configuration
SUPABASE_URL=your_project_url_here
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Example:
# SUPABASE_URL=https://abcdefgh.supabase.co
# SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 4: Run the Database Setup Scripts

Execute these SQL files in order using the Supabase SQL Editor:

### 4.1 Open SQL Editor

1. In your Supabase dashboard, go to "SQL Editor"
2. Create a new query

### 4.2 Execute Scripts in Order

**Script 1: Create Tables** (`01_create_tables.sql`)

- Copy and paste the content of `database/01_create_tables.sql`
- Click "Run" to execute
- This creates all the main tables: users, budget_categories, transactions, budgets, savings_goals

**Script 2: Row Level Security** (`02_row_level_security.sql`)

- Copy and paste the content of `database/02_row_level_security.sql`
- Click "Run" to execute
- This sets up security policies so users can only access their own data

**Script 3: Functions & Triggers** (`03_functions_triggers.sql`)

- Copy and paste the content of `database/03_functions_triggers.sql`
- Click "Run" to execute
- This adds helpful functions and automatic timestamp updates

**Script 4: Sample Data** (`04_sample_data.sql`) - OPTIONAL

- Only run this if you want test data
- First, you need to create test users through Supabase Auth
- Replace 'YOUR_TEST_USER_ID_HERE' with actual user IDs
- Uncomment the INSERT statements and update with real category IDs

## Step 5: Verify Database Setup

### Check Tables Were Created

Run this query in SQL Editor:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see:

- budget_categories
- budgets
- savings_goals
- transactions
- users

### Check RLS Policies

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

## Step 6: Test Your Backend Connection

1. Start your backend server: `npm run dev`
2. Test the health endpoint: Visit `http://localhost:3000/health`
3. Try creating a user and some test data through your API endpoints

## Step 7: Set Up Authentication (Firebase)

You'll also need to set up Firebase for user authentication:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or use existing one
3. Enable Authentication
4. Set up sign-in methods (Email/Password, Google, etc.)
5. Get your Firebase config and service account key
6. Update your `.env` file with Firebase credentials

## Database Schema Overview

### Core Tables:

- **users**: User profiles (extends Supabase auth.users)
- **budget_categories**: Custom spending categories per user
- **transactions**: Income and expense records
- **budgets**: Monthly/weekly/yearly spending limits per category
- **savings_goals**: Financial goals with progress tracking

### Key Features:

- **Row Level Security**: Users can only access their own data
- **Automatic Timestamps**: `updated_at` fields update automatically
- **Data Integrity**: Foreign key constraints and check constraints
- **Useful Functions**: Budget usage calculation, spending summaries

## Troubleshooting

### Common Issues:

1. **"relation does not exist" error**

   - Make sure you executed the scripts in the correct order
   - Check that you're running scripts in the "public" schema

2. **"permission denied" error**

   - Verify RLS policies were created correctly
   - Check that you're using the service_role key for server operations

3. **Connection issues**

   - Verify your SUPABASE_URL and keys are correct
   - Check that your IP is allowed (Supabase allows all IPs by default)

4. **Foreign key constraint errors**
   - Make sure you're creating related records in the right order
   - Verify that referenced IDs actually exist

### Getting Help:

- Check the Supabase documentation: https://supabase.com/docs
- Join the Supabase Discord community
- Check the server logs for detailed error messages
