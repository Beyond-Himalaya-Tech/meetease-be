-- Users table
CREATE TABLE "users" (
    "id" SERIAL PRIMARY KEY,
    "email" VARCHAR NOT NULL UNIQUE,
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
    "id" SERIAL PRIMARY KEY,
    "user_id" INT NOT NULL REFERENCES "users"("id"),
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
    "id" SERIAL PRIMARY KEY,
    "user_id" INT NOT NULL REFERENCES "users"("id"),
    "day_of_week" INT NOT NULL, -- 0 = Sunday ... 6 = Saturday
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "created_at" TIMESTAMP DEFAULT now(),
    "updated_at" TIMESTAMP DEFAULT now()
);

-- Contacts table
CREATE TABLE "contacts" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INT NOT NULL REFERENCES "users"("id"),
    "name" VARCHAR NOT NULL,
    "email" VARCHAR NOT NULL UNIQUE,
    "phone" VARCHAR,
    "tag" VARCHAR,
    "created_at" TIMESTAMP DEFAULT now(),
    "updated_at" TIMESTAMP DEFAULT now()
);

-- Events table
CREATE TABLE "events" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INT NOT NULL REFERENCES "users"("id"),
    "event_type_id" INT NOT NULL REFERENCES "event_types"("id"),
    "contact_id" INT REFERENCES "contacts"("id"), -- optional contact
    "start_at" TIMESTAMP NOT NULL,
    "end_at" TIMESTAMP NOT NULL,
    "timezone" VARCHAR NOT NULL,
    "location_link" VARCHAR NOT NULL,
    "status" VARCHAR NOT NULL, -- CREATED, COMPLETED, CANCELLED
    "calendar_event_id" VARCHAR,
    "created_at" TIMESTAMP DEFAULT now(),
    "updated_at" TIMESTAMP DEFAULT now()
);
