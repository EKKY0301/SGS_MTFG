-- Enable pgcrypto to hash password using bcrypt-compatible crypt()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Change ONLY this value to customize the initial admin password
-- Current password: admin123
INSERT INTO "User" ("id", "username", "passwordHash", "isActive", "createdAt", "updatedAt")
VALUES (
  'seed-admin-user',
  'admin',
  crypt('admin123', gen_salt('bf', 10)),
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("username") DO UPDATE
SET
  "passwordHash" = EXCLUDED."passwordHash",
  "isActive" = true,
  "updatedAt" = CURRENT_TIMESTAMP;
