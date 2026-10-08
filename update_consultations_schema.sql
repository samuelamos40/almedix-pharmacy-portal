ALTER TABLE consultations ADD COLUMN IF NOT EXISTS assigned_staff_id UUID;
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS assigned_staff_name TEXT;
