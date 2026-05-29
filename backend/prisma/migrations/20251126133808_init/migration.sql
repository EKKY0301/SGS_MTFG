-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "memberNumber" INTEGER,
    "status" TEXT,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "japaneseName" TEXT,
    "japaneseSurname" TEXT,
    "sex" TEXT,
    "birthDate" TIMESTAMP(3),
    "ci" TEXT,
    "ciExpirationDate" TIMESTAMP(3),
    "ruc" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "profession" TEXT,
    "bloodType" TEXT,
    "address" TEXT,
    "workAddress" TEXT,
    "workPhone" TEXT,
    "deathDate" TIMESTAMP(3),
    "adminParentId" TEXT,
    "biologicalParentId" TEXT,
    "dependencyStart" TIMESTAMP(3),
    "responsible" BOOLEAN,
    "joinDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Member_memberNumber_key" ON "Member"("memberNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Member_ci_key" ON "Member"("ci");

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_adminParentId_fkey" FOREIGN KEY ("adminParentId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_biologicalParentId_fkey" FOREIGN KEY ("biologicalParentId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
