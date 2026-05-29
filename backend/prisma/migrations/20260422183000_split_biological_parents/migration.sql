ALTER TABLE "Member"
ADD COLUMN "biologicalMotherId" TEXT,
ADD COLUMN "biologicalFatherId" TEXT;

UPDATE "Member" AS child
SET
  "biologicalMotherId" = CASE
    WHEN lower(coalesce(parent.role, '')) IN ('mother', 'madre')
      OR lower(coalesce(parent.sex, '')) IN ('f', 'female', 'femenino')
    THEN child."biologicalParentId"
    ELSE NULL
  END,
  "biologicalFatherId" = CASE
    WHEN lower(coalesce(parent.role, '')) IN ('mother', 'madre')
      OR lower(coalesce(parent.sex, '')) IN ('f', 'female', 'femenino')
    THEN NULL
    ELSE child."biologicalParentId"
  END
FROM "Member" AS parent
WHERE child."biologicalParentId" = parent.id;

ALTER TABLE "Member"
ADD CONSTRAINT "Member_biologicalMotherId_fkey"
FOREIGN KEY ("biologicalMotherId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Member"
ADD CONSTRAINT "Member_biologicalFatherId_fkey"
FOREIGN KEY ("biologicalFatherId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Member_biologicalMotherId_idx" ON "Member"("biologicalMotherId");
CREATE INDEX "Member_biologicalFatherId_idx" ON "Member"("biologicalFatherId");

ALTER TABLE "Member" DROP CONSTRAINT "Member_biologicalParentId_fkey";
ALTER TABLE "Member" DROP COLUMN "biologicalParentId";
