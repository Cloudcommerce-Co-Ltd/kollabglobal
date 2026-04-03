-- CreateTable
CREATE TABLE "creators" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "niche" TEXT NOT NULL,
    "engagement" TEXT NOT NULL,
    "reach" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "country_flag" TEXT NOT NULL,
    "is_backup" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "creators_pkey" PRIMARY KEY ("id")
);
