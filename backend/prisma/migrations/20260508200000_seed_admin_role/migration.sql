-- Create admin role if it doesn't exist
INSERT INTO "Role" (id, name, description, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin',
  'Administrator role with full access',
  NOW(),
  NOW()
)
ON CONFLICT (name) DO NOTHING;

-- Assign admin role to admin user only when roleId column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'User'
      AND column_name = 'roleId'
  ) THEN
    UPDATE "User"
    SET "roleId" = (SELECT id FROM "Role" WHERE name = 'admin' LIMIT 1)
    WHERE username = 'admin';
  END IF;
END $$;
