-- Remove unused analytics fields from countries table.
-- These fields were seeded but never read by any app code.
ALTER TABLE "countries" DROP COLUMN IF EXISTS "avg_eyeball";
ALTER TABLE "countries" DROP COLUMN IF EXISTS "avg_cpe";
ALTER TABLE "countries" DROP COLUMN IF EXISTS "food_bev_eng";
ALTER TABLE "countries" DROP COLUMN IF EXISTS "beauty_eng";
ALTER TABLE "countries" DROP COLUMN IF EXISTS "snack_trend";
ALTER TABLE "countries" DROP COLUMN IF EXISTS "est_orders";
ALTER TABLE "countries" DROP COLUMN IF EXISTS "cats";
