ALTER TABLE "availabilities"
ADD CONSTRAINT "user_id_day_of_week" UNIQUE ("user_id", "day_of_week");