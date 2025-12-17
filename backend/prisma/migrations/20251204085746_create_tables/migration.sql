-- Users table
CREATE TABLE "users" (
    "id" VARCHAR PRIMARY KEY,
    "email" VARCHAR NOT NULL UNIQUE,
    "password_hash" VARCHAR,
    "name" VARCHAR,
    "picture" VARCHAR,
    "google_account_id" VARCHAR,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT,
    "token_expiry" TIMESTAMP,
    "created_at" TIMESTAMP DEFAULT now(),
    "updated_at" TIMESTAMP DEFAULT now()
);

-- Event types table
CREATE TABLE "event_types" (
    "id" VARCHAR PRIMARY KEY,
    "user_id" VARCHAR NOT NULL REFERENCES "users"("id"),
    "title" VARCHAR NOT NULL,
    "description" TEXT,
    "duration_minutes" INT NOT NULL,
    "is_active" BOOLEAN DEFAULT TRUE,
    "client_tag" VARCHAR,
    "created_at" TIMESTAMP DEFAULT now(),
    "updated_at" TIMESTAMP DEFAULT now()
);

-- Availabilities table
CREATE TABLE "availabilities" (
    "id" VARCHAR PRIMARY KEY,
    "user_id" VARCHAR NOT NULL REFERENCES "users"("id"),
    "day_of_week" INT NOT NULL,
    "start_time_minutes" INT NOT NULL,
    "end_time_minutes" INT NOT NULL,
    "created_at" TIMESTAMP DEFAULT now(),
    "updated_at" TIMESTAMP DEFAULT now()
);

-- Contacts table
CREATE TABLE "contacts" (
    "id" VARCHAR PRIMARY KEY,
    "user_id" VARCHAR NOT NULL REFERENCES "users"("id"),
    "name" VARCHAR NOT NULL,
    "email" VARCHAR NOT NULL UNIQUE,
    "phone" VARCHAR,
    "tag" VARCHAR,
    "created_at" TIMESTAMP DEFAULT now(),
    "updated_at" TIMESTAMP DEFAULT now()
);

-- Events table
CREATE TABLE "events" (
    "id" VARCHAR PRIMARY KEY,
    "user_id" VARCHAR NOT NULL REFERENCES "users"("id"),
    "event_type_id" VARCHAR NOT NULL REFERENCES "event_types"("id"),
    "contact_id" VARCHAR REFERENCES "contacts"("id"),
    "start_at" TIMESTAMP NOT NULL,
    "end_at" TIMESTAMP NOT NULL,
    "timezone" VARCHAR NOT NULL,
    "location_link" VARCHAR NOT NULL,
    "status" VARCHAR NOT NULL, -- PENDING, CONFIRMED, COMPLETED, CANCELLED, RESCHEDULE
    "calendar_event_id" VARCHAR,
    "created_at" TIMESTAMP DEFAULT now(),
    "updated_at" TIMESTAMP DEFAULT now()
);
