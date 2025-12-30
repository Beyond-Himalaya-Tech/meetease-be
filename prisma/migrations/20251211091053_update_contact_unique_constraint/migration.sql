ALTER TABLE "contacts"
DROP CONSTRAINT IF EXISTS "contacts_email_key";

ALTER TABLE "contacts"
ADD CONSTRAINT "contacts_user_id_email_unique"
UNIQUE ("user_id", "email");
