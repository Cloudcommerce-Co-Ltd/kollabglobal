-- CreateTable
CREATE TABLE "countries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "flag" TEXT NOT NULL,
    "creators_avail" INTEGER NOT NULL DEFAULT 0,
    "avg_eyeball" TEXT,
    "avg_cpe" TEXT,
    "food_bev_eng" TEXT,
    "beauty_eng" TEXT,
    "snack_trend" TEXT,
    "platforms" TEXT[],
    "cats" TEXT[],
    "est_reach" TEXT,
    "est_orders" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);
