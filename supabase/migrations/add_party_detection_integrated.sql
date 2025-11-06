-- Migration: Add party detection integrated with existing tables
-- This integrates party detection with your existing analyses and contracts tables

-- Add user_selected_party column to contracts table
-- This stores which party the user represents for this contract
ALTER TABLE contracts 
ADD COLUMN IF NOT EXISTS user_selected_party TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_contracts_user_selected_party 
ON contracts(user_selected_party) 
WHERE user_selected_party IS NOT NULL;

-- Add comment
COMMENT ON COLUMN contracts.user_selected_party IS 'Name of the party the user selected to represent for this contract. Used for personalized analysis and metrics.';

-- Note: The analyses.parties JSONB column already exists and will store:
-- - Detected parties from AI analysis
-- - Party roles and descriptions
-- - Party-specific risk assessments
-- 
-- Structure example:
-- {
--   "parties": [
--     {
--       "name": "Company A",
--       "role": "Client",
--       "description": "Service recipient"
--     },
--     {
--       "name": "Company B", 
--       "role": "Vendor",
--       "description": "Service provider"
--     }
--   ],
--   "user_party": "Company A"  // Will be set from contracts.user_selected_party
-- }

