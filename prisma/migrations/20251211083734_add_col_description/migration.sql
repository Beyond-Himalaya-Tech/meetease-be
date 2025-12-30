ALTER TABLE "events"
ADD COLUMN "description" TEXT;

ALTER TABLE "events"
ADD COLUMN "is_rescheduled" BOOLEAN DEFAULT FALSE;
