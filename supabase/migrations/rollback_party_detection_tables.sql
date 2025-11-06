-- Rollback Migration: Remove party detection tables
-- This will drop the tables and all associated policies/indexes

-- Drop RLS Policies first
DROP POLICY IF EXISTS "Users can view parties for their contracts" ON contract_parties;
DROP POLICY IF EXISTS "Users can view their own party selections" ON contract_user_party;
DROP POLICY IF EXISTS "Users can insert their own party selections" ON contract_user_party;
DROP POLICY IF EXISTS "Users can update their own party selections" ON contract_user_party;
DROP POLICY IF EXISTS "Users can delete their own party selections" ON contract_user_party;

-- Drop indexes
DROP INDEX IF EXISTS idx_contract_parties_contract_id;
DROP INDEX IF EXISTS idx_contract_user_party_contract_id;
DROP INDEX IF EXISTS idx_contract_user_party_user_id;

-- Drop tables (CASCADE will handle foreign key constraints)
DROP TABLE IF EXISTS contract_user_party CASCADE;
DROP TABLE IF EXISTS contract_parties CASCADE;

