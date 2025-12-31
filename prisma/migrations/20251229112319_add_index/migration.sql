/* =========================================================
   EVENT TYPES
   ========================================================= */

CREATE INDEX IF NOT EXISTS idx_event_types_user_id
ON event_types(user_id);

CREATE INDEX IF NOT EXISTS idx_event_types_user_id_active
ON event_types(user_id, is_active);



/* =========================================================
   AVAILABILITIES
   ========================================================= */

CREATE INDEX IF NOT EXISTS idx_availabilities_user_day
ON availabilities(user_id, day_of_week);

CREATE INDEX IF NOT EXISTS idx_availabilities_user_apply_date
ON availabilities(user_id, apply_date);

CREATE INDEX IF NOT EXISTS idx_availabilities_apply_date
ON availabilities(apply_date);



/* =========================================================
   CONTACTS
   ========================================================= */

CREATE INDEX IF NOT EXISTS idx_contacts_user_id
ON contacts(user_id);

CREATE INDEX IF NOT EXISTS idx_contacts_phone
ON contacts(phone);

CREATE INDEX IF NOT EXISTS idx_contacts_tag
ON contacts(tag);

CREATE INDEX IF NOT EXISTS idx_contacts_user_active
ON contacts(user_id)
WHERE deleted_at IS NULL;



/* =========================================================
   EVENTS
   ========================================================= */

CREATE INDEX IF NOT EXISTS idx_events_user_id
ON events(user_id);

CREATE INDEX IF NOT EXISTS idx_events_event_type_id
ON events(event_type_id);

CREATE INDEX IF NOT EXISTS idx_events_contact_id
ON events(contact_id);

CREATE INDEX IF NOT EXISTS idx_events_start_at
ON events(start_at);

CREATE INDEX IF NOT EXISTS idx_events_user_status
ON events(user_id, status);

CREATE INDEX IF NOT EXISTS idx_events_user_start_at
ON events(user_id, start_at);

