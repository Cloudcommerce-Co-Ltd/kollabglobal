-- CreateTable
CREATE TABLE "packages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "badge" TEXT,
    "num_creators" INTEGER NOT NULL,
    "price_per_creator" INTEGER NOT NULL,
    "discount_pct" INTEGER NOT NULL DEFAULT 0,
    "est_reach" TEXT,
    "est_engagement" TEXT,

    CONSTRAINT "packages_pkey" PRIMARY KEY ("id")
);
