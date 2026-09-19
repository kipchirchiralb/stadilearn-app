-- =============================================================================
-- Stadilearn super admin seed. Run once after schema.sql:
--   mysql -u root -p stadilearn < adminseed.sql
--
-- Creates (or promotes) the three Stadilearn super admins. Safe to rerun:
-- existing accounts with these emails are promoted and reactivated, not duplicated.
-- The schema caps super admins at 3, so this uses every slot.
--
-- No passwords: admins sign in with an emailed one-time code, so each address
-- must be a mailbox its owner controls. Edit full_name values as needed.
-- =============================================================================

USE stadilearn;

-- All or nothing: if any step fails, the client stops and nothing is kept.
START TRANSACTION;

-- 1. Create the accounts (or reactivate existing ones). The admin role is
--    granted in step 3, because the 3-admin cap trigger also fires on the
--    INSERT half of an upsert.
INSERT INTO users (email, full_name, status, email_verified_at) VALUES
  ('admin@stadilearn.co.ke',        'Stadilearn Admin',   'active', UTC_TIMESTAMP(3)),
  ('kipchirchiralb@gmail.com',      'Albert Kipchirchir', 'active', UTC_TIMESTAMP(3)),
  ('albertkipchirchir02@gmail.com', 'Albert Kipchirchir', 'active', UTC_TIMESTAMP(3))
ON DUPLICATE KEY UPDATE
  status            = 'active',
  email_verified_at = COALESCE(email_verified_at, UTC_TIMESTAMP(3));

-- 2. Audit only the accounts that are about to be promoted.
INSERT INTO audit_events (actor_id, action, entity_type, entity_id, details)
SELECT NULL, 'auth.super_admin_granted', 'user', CAST(id AS CHAR), JSON_OBJECT('source', 'adminseed.sql')
FROM users
WHERE email IN ('admin@stadilearn.co.ke', 'kipchirchiralb@gmail.com', 'albertkipchirchir02@gmail.com')
  AND account_type <> 'super_admin';

-- 3. Promote. Fails with "At most 3 super admins are allowed" if other
--    super admins already exist; demote them first.
UPDATE users SET account_type = 'super_admin'
WHERE email IN ('admin@stadilearn.co.ke', 'kipchirchiralb@gmail.com', 'albertkipchirchir02@gmail.com')
  AND account_type <> 'super_admin';

COMMIT;

SELECT id, email, full_name, account_type, status FROM users WHERE account_type = 'super_admin';
