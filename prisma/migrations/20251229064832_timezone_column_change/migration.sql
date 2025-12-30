ALTER TABLE "availabilities" DROP COLUMN "timezone";

ALTER TABLE "users"
ADD COLUMN "timezone" VARCHAR(50);

ALTER TABLE "contacts"
ADD COLUMN "timezone" VARCHAR(50);
