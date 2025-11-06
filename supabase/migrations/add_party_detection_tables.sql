-- Migration: Add party detection tables
-- This migration adds tables to store detected parties and user party selections

-- Table to store detected parties for each contract
CREATE TABLE IF NOT EXISTS contract_parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  party_name TEXT NOT NULL,
  party_role TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_contract_party UNIQUE (contract_id, party_name)
);

-- Table to store user's selected party for each contract
CREATE TABLE IF NOT EXISTS contract_user_party (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  selected_party_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_user_contract_party UNIQUE (contract_id, user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_contract_parties_contract_id ON contract_parties(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_user_party_contract_id ON contract_user_party(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_user_party_user_id ON contract_user_party(user_id);

-- Enable Row Level Security
ALTER TABLE contract_parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_user_party ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contract_parties
-- Users can view parties for contracts they own
CREATE POLICY "Users can view parties for their contracts"
  ON contract_parties
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM contracts
      WHERE contracts.id = contract_parties.contract_id
      AND contracts.user_id = auth.uid()
    )
  );

-- RLS Policies for contract_user_party
-- Users can view their own party selections
CREATE POLICY "Users can view their own party selections"
  ON contract_user_party
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own party selections
CREATE POLICY "Users can insert their own party selections"
  ON contract_user_party
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own party selections
CREATE POLICY "Users can update their own party selections"
  ON contract_user_party
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own party selections
CREATE POLICY "Users can delete their own party selections"
  ON contract_user_party
  FOR DELETE
  USING (user_id = auth.uid());

-- Add comment to tables
COMMENT ON TABLE contract_parties IS 'Stores detected parties for each contract';
COMMENT ON TABLE contract_user_party IS 'Stores user selections of which party they represent for each contract';

COMMENT ON COLUMN contract_parties.party_name IS 'Name of the party as detected from the contract';
COMMENT ON COLUMN contract_parties.party_role IS 'Role of the party (e.g., Client, Vendor, Service Provider)';
COMMENT ON COLUMN contract_parties.order_index IS 'Order in which parties appear in the contract';
COMMENT ON COLUMN contract_user_party.selected_party_name IS 'Name of the party the user selected to represent';

