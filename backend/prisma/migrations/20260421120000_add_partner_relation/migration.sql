-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "partnerId" TEXT;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;