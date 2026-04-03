-- CreateTable
CREATE TABLE "package_creators" (
    "id" TEXT NOT NULL,
    "package_id" INTEGER NOT NULL,
    "creator_id" TEXT NOT NULL,
    "is_backup" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "package_creators_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "package_creators_package_id_creator_id_key" ON "package_creators"("package_id", "creator_id");

-- AddForeignKey
ALTER TABLE "package_creators" ADD CONSTRAINT "package_creators_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_creators" ADD CONSTRAINT "package_creators_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "creators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
