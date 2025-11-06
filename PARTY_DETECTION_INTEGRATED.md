# Party Detection - Integrated with Existing Tables

## Overview

The party detection feature is now **fully integrated** with your existing database structure. It works seamlessly with your linked tables without requiring separate tables.

## Database Changes

### ✅ What Changed

**Only ONE column added:**
- `contracts.user_selected_party` (TEXT) - Stores which party the user represents

**Existing columns used:**
- `analyses.parties` (JSONB) - Already exists! Now stores:
  - Detected parties array
  - User's selected party
  - Detection metadata

### ❌ What Was Removed

The separate `contract_parties` and `contract_user_party` tables are **NOT needed**. Everything works through your existing linked structure.

## How It Works

### 1. **Party Detection Flow**
```
Upload Contract → Detect Parties → User Selects Party → Analysis
     ↓                ↓                    ↓              ↓
  contracts      (in memory)        contracts.user_   analyses.parties
                                      selected_party    (JSONB)
```

### 2. **Data Storage**

**Detected Parties:**
- Stored in `analyses.parties` JSONB field when analysis is created
- Structure:
```json
{
  "parties": [
    {
      "name": "Company A",
      "role": "Client",
      "description": "Service recipient"
    },
    {
      "name": "Company B",
      "role": "Vendor", 
      "description": "Service provider"
    }
  ],
  "user_party": "Company A",
  "detected_at": "2024-01-01T00:00:00Z"
}
```

**User Selection:**
- Stored in `contracts.user_selected_party` (TEXT)
- Links directly to the contract record
- Used for personalized metrics

### 3. **Integration Points**

All tables work together:
- `contracts` → Has `user_selected_party`
- `analyses` → Has `parties` JSONB with all party data
- `extractions` → Provides text for party detection
- Everything is linked via `contract_id`

## Migration Steps

### Step 1: Rollback (if you ran the old migration)

Run `rollback_party_detection_tables.sql` to remove separate tables if they exist.

### Step 2: Run Integrated Migration

Run `add_party_detection_integrated.sql` which only adds:
- `contracts.user_selected_party` column
- Index for performance

That's it! No new tables needed.

## Code Updates

All server actions have been updated to work with your existing structure:

1. **`detect-contract-parties.ts`**
   - Detects parties from contract text
   - Returns parties (stored in analyses.parties during analysis)

2. **`save-user-party-selection.ts`**
   - Saves to `contracts.user_selected_party`
   - Verifies contract ownership

3. **`get-user-party-selection.ts`**
   - Reads from `contracts.user_selected_party`
   - Simple, direct query

4. **`analyze-with-gemini.ts`**
   - Gets user's selected party from `contracts.user_selected_party`
   - Detects parties if not already done
   - Stores everything in `analyses.parties` JSONB
   - Everything linked and integrated!

## Benefits of This Approach

✅ **No separate tables** - Uses existing structure  
✅ **Everything linked** - All data connected via contract_id  
✅ **Simple queries** - Direct access to user selection  
✅ **Flexible** - JSONB allows rich party data  
✅ **Backward compatible** - Works with existing analyses  

## Usage in Analysis

When you need the user's party in your analysis logic:

```typescript
import { getUserPartySelection } from '@/app/(actions)/get-user-party-selection'

const partyResult = await getUserPartySelection(contractId)
if (partyResult.success && partyResult.partyName) {
  // Use partyResult.partyName for personalized analysis
  // This party is stored in contracts.user_selected_party
}
```

To get all parties from analysis:

```typescript
const { data: analysis } = await supabase
  .from('analyses')
  .select('parties')
  .eq('contract_id', contractId)
  .single()

if (analysis?.parties) {
  const parties = analysis.parties.parties // Array of parties
  const userParty = analysis.parties.user_party // User's selection
}
```

## Summary

- ✅ One column added: `contracts.user_selected_party`
- ✅ Uses existing `analyses.parties` JSONB field
- ✅ Everything works through your existing linked tables
- ✅ No separate tables needed
- ✅ Fully integrated with your current structure

The feature is ready to use! Just run the integrated migration and everything will work seamlessly with your existing database structure.

