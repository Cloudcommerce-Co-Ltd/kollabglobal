-- DropForeignKey
ALTER TABLE "package_creators" DROP CONSTRAINT "package_creators_creator_id_fkey";

-- DropForeignKey
ALTER TABLE "package_creators" DROP CONSTRAINT "package_creators_package_id_fkey";

-- AddForeignKey
ALTER TABLE "package_creators" ADD CONSTRAINT "package_creators_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_creators" ADD CONSTRAINT "package_creators_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "creators"("id") ON DELETE CASCADE ON UPDATE CASCADE;
