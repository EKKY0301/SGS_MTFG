-- CreateTable
CREATE TABLE "InstitutionalRecord" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "recordDate" TIMESTAMP(3) NOT NULL,
    "content" TEXT,
    "filePath" TEXT,
    "fileName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstitutionalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Regulation" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "content" TEXT,
    "filePath" TEXT,
    "fileName" TEXT,
    "effectiveDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Regulation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InstitutionalRecord_type_idx" ON "InstitutionalRecord"("type");

-- CreateIndex
CREATE INDEX "InstitutionalRecord_recordDate_idx" ON "InstitutionalRecord"("recordDate");

-- CreateIndex
CREATE INDEX "Regulation_type_idx" ON "Regulation"("type");

-- CreateIndex
CREATE INDEX "Regulation_isActive_idx" ON "Regulation"("isActive");