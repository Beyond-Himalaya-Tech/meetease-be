ALTER TABLE "availabilities"
DROP CONSTRAINT IF EXISTS "user_id_day_of_week";

ALTER TABLE "availabilities"
ADD CONSTRAINT "user_day_time_unique"
UNIQUE ("user_id", "day_of_week", "start_time", "end_time");

ALTER TABLE "availabilities"
ADD COLUMN "apply_date" DATE;

ALTER TABLE "availabilities"
ADD COLUMN "timezone" VARCHAR(50);