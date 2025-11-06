# Party Detection Feature Documentation

## Overview

The party detection feature automatically identifies all parties involved in a contract and allows users to select which party they represent. This selection is then used to provide personalized risk assessments, negotiation suggestions, and metrics.

## How It Works

1. **Upload Contract**: User uploads a contract file (DOCX)
2. **Detect Parties**: AI analyzes the contract text to identify all parties
3. **Select Party**: User selects which party they represent
4. **Personalized Analysis**: Metrics and analysis are tailored to the selected party

## Database Schema

### New Tables

#### `contract_parties`
Stores detected parties for each contract.

```sql
- id: UUID (Primary Key)
- contract_id: UUID (Foreign Key → contracts.id)
- party_name: TEXT (Name of the party)
- party_role: TEXT (Role: Client, Vendor, Service Provider, etc.)
- description: TEXT (Brief description)
- order_index: INTEGER (Order in contract)
- created_at: TIMESTAMPTZ
```

#### `contract_user_party`
Stores user's selected party for each contract.

```sql
- id: UUID (Primary Key)
- contract_id: UUID (Foreign Key → contracts.id)
- user_id: UUID (Foreign Key → auth.users.id)
- selected_party_name: TEXT (Name of selected party)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

## How to Get Your Supabase Schema

### Method 1: Supabase Dashboard (Easiest)

1. Go to your Supabase project dashboard
2. Navigate to **Database** → **Tables**
3. Click on each table to see its structure
4. Or use the **SQL Editor** to run:

```sql
-- Get all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Get columns for a specific table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'contracts'
ORDER BY ordinal_position;
```

### Method 2: Export Full Schema

In Supabase SQL Editor, run:

```sql
SELECT 
  t.table_name,
  c.column_name,
  c.data_type,
  c.is_nullable,
  c.column_default,
  c.character_maximum_length
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name, c.ordinal_position;
```

### Method 3: Supabase CLI

If you have Supabase CLI installed:

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Dump schema
supabase db dump --schema public > schema.sql
```

## Running the Migration

### Option 1: Supabase Dashboard

1. Go to **SQL Editor** in Supabase Dashboard
2. Copy the contents of `supabase/migrations/add_party_detection_tables.sql`
3. Paste and run in the SQL Editor

### Option 2: Supabase CLI

```bash
# Run migration
supabase db push

# Or apply specific migration
supabase migration up
```

## API Functions

### `detectContractParties(contractId: string)`

Detects parties from a contract using AI.

**Returns:**
```typescript
{
  success: boolean
  parties?: Array<{
    name: string
    role: string
    description: string
  }>
  error?: string
}
```

### `saveUserPartySelection(contractId: string, partyName: string)`

Saves the user's selected party for a contract.

**Returns:**
```typescript
{
  success: boolean
  error?: string
}
```

### `getUserPartySelection(contractId: string)`

Gets the user's selected party for a contract.

**Returns:**
```typescript
{
  success: boolean
  partyName?: string | null
  error?: string
}
```

## Using Party Selection in Analysis

To use the selected party in your analysis, import and use the helper function:

```typescript
import { getUserPartySelection } from '@/app/(actions)/get-user-party-selection'

// In your analysis function
const partyResult = await getUserPartySelection(contractId)
if (partyResult.success && partyResult.partyName) {
  // Use partyResult.partyName in your analysis
  // This allows you to provide party-specific insights
}
```

## Workflow

1. **Upload** → User uploads contract
2. **Detect Type** → System detects contract type
3. **Detect Parties** → AI identifies all parties (NEW STEP)
4. **Select Party** → User selects their party (NEW STEP)
5. **Confirm** → User confirms and proceeds
6. **Analyze** → AI analyzes contract with party context
7. **Results** → Personalized results based on selected party

## UI Components

### `PartySelection`

Component for displaying and selecting parties.

**Props:**
- `contractId: string` - Contract ID
- `parties: Array<Party>` - Array of detected parties
- `onPartySelected: (partyName: string) => void` - Callback when party is selected
- `onSkip?: () => void` - Optional skip callback

## Environment Variables

Make sure you have `GEMINI_API_KEY` set in your environment variables for party detection to work.

## Notes

- Party detection uses Google Gemini AI
- If no parties are detected, the user can skip this step
- Party selection is stored per user per contract
- Users can change their selection later (update the `contract_user_party` table)
- The selected party is used to personalize risk assessments and metrics

## Future Enhancements

- Allow users to change party selection after analysis
- Show party-specific risk scores
- Provide party-specific negotiation suggestions
- Display party-specific metrics in dashboard

