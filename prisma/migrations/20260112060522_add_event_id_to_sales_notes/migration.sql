/*
  Warnings:

  - You are about to drop the `Auth` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[calendar_event_id]` on the table `events` will be added. If there are existing duplicate values, this will fail.
  - Made the column `created_at` on table `availabilities` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `availabilities` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `contacts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `contacts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `is_active` on table `event_types` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `event_types` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `event_types` required. This step will fail if there are existing NULL values in that column.
  - Made the column `calendar_event_id` on table `events` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `events` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `events` required. This step will fail if there are existing NULL values in that column.
  - Made the column `is_rescheduled` on table `events` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "availabilities" DROP CONSTRAINT "availabilities_user_id_fkey";

-- DropForeignKey
ALTER TABLE "contacts" DROP CONSTRAINT "contacts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "event_types" DROP CONSTRAINT "event_types_user_id_fkey";

-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_contact_id_fkey";

-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_event_type_id_fkey";

-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_user_id_fkey";

-- DropIndex
DROP INDEX "idx_availabilities_apply_date";

-- DropIndex
DROP INDEX "idx_availabilities_user_apply_date";

-- DropIndex
DROP INDEX "idx_availabilities_user_day";

-- DropIndex
DROP INDEX "idx_contacts_phone";

-- DropIndex
DROP INDEX "idx_contacts_tag";

-- DropIndex
DROP INDEX "idx_contacts_user_id";

-- DropIndex
DROP INDEX "idx_event_types_user_id";

-- DropIndex
DROP INDEX "idx_event_types_user_id_active";

-- DropIndex
DROP INDEX "idx_events_contact_id";

-- DropIndex
DROP INDEX "idx_events_event_type_id";

-- DropIndex
DROP INDEX "idx_events_start_at";

-- DropIndex
DROP INDEX "idx_events_user_id";

-- DropIndex
DROP INDEX "idx_events_user_start_at";

-- DropIndex
DROP INDEX "idx_events_user_status";

-- AlterTable
ALTER TABLE "availabilities" ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "contacts" ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "email" SET DATA TYPE TEXT,
ALTER COLUMN "phone" SET DATA TYPE TEXT,
ALTER COLUMN "tag" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "deleted_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "timezone" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "event_types" ALTER COLUMN "title" SET DATA TYPE TEXT,
ALTER COLUMN "is_active" SET NOT NULL,
ALTER COLUMN "client_tag" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "events" ALTER COLUMN "start_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "end_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "timezone" SET DATA TYPE TEXT,
ALTER COLUMN "location_link" SET DATA TYPE TEXT,
ALTER COLUMN "status" SET DATA TYPE TEXT,
ALTER COLUMN "calendar_event_id" SET NOT NULL,
ALTER COLUMN "calendar_event_id" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "is_rescheduled" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "email" SET DATA TYPE TEXT,
ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "picture" SET DATA TYPE TEXT,
ALTER COLUMN "google_account_id" SET DATA TYPE TEXT,
ALTER COLUMN "token_expiry" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "timezone" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "Auth";

-- CreateTable
CREATE TABLE "sales_notes" (
    "id" SERIAL NOT NULL,
    "contact_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "event_id" INTEGER,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "events_calendar_event_id_key" ON "events"("calendar_event_id");

-- AddForeignKey
ALTER TABLE "event_types" ADD CONSTRAINT "event_types_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availabilities" ADD CONSTRAINT "availabilities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_event_type_id_fkey" FOREIGN KEY ("event_type_id") REFERENCES "event_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_notes" ADD CONSTRAINT "sales_notes_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_notes" ADD CONSTRAINT "sales_notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_notes" ADD CONSTRAINT "sales_notes_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "user_day_time_unique" RENAME TO "availabilities_user_id_day_of_week_start_time_end_time_key";

-- RenameIndex
ALTER INDEX "contacts_user_id_email_unique" RENAME TO "contacts_user_id_email_key";
