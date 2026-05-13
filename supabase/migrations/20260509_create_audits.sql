-- Run this migration in the Supabase SQL editor to create the audit storage table.
CREATE TABLE audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  team_size INTEGER NOT NULL,
  use_case TEXT NOT NULL,
  tools JSONB NOT NULL,
  total_monthly_saving DECIMAL NOT NULL,
  total_annual_saving DECIMAL NOT NULL,
  recommendations JSONB NOT NULL,
  summary TEXT,
  email TEXT,
  company_name TEXT,
  role TEXT,
  is_high_savings BOOLEAN DEFAULT FALSE
);

CREATE INDEX audits_email_idx ON audits(email);
CREATE INDEX audits_created_at_idx ON audits(created_at);
