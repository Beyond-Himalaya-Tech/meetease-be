/* =========================================================
   EVENT TYPES
   ========================================================= */

CREATE INDEX IF NOT EXISTS idx_event_types_user_id
ON meet_ease.event_types(user_id);

CREATE INDEX IF NOT EXISTS idx_event_types_user_id_active
ON meet_ease.event_types(user_id, is_active);



/* =========================================================
   AVAILABILITIES
   ========================================================= */

CREATE INDEX IF NOT EXISTS idx_availabilities_user_day
ON meet_ease.availabilities(user_id, day_of_week);

CREATE INDEX IF NOT EXISTS idx_availabilities_user_apply_date
ON meet_ease.availabilities(user_id, apply_date);

CREATE INDEX IF NOT EXISTS idx_availabilities_apply_date
ON meet_ease.availabilities(apply_date);



/* =========================================================
   CONTACTS
   ========================================================= */

CREATE INDEX IF NOT EXISTS idx_contacts_user_id
ON meet_ease.contacts(user_id);

CREATE INDEX IF NOT EXISTS idx_contacts_phone
ON meet_ease.contacts(phone);

CREATE INDEX IF NOT EXISTS idx_contacts_tag
ON meet_ease.contacts(tag);

CREATE INDEX IF NOT EXISTS idx_contacts_user_active
ON meet_ease.contacts(user_id)
WHERE deleted_at IS NULL;



/* =========================================================
   EVENTS
   ========================================================= */

CREATE INDEX IF NOT EXISTS idx_events_user_id
ON meet_ease.events(user_id);

CREATE INDEX IF NOT EXISTS idx_events_event_type_id
ON meet_ease.events(event_type_id);

CREATE INDEX IF NOT EXISTS idx_events_contact_id
ON meet_ease.events(contact_id);

CREATE INDEX IF NOT EXISTS idx_events_start_at
ON meet_ease.events(start_at);

CREATE INDEX IF NOT EXISTS idx_events_user_status
ON meet_ease.events(user_id, status);

CREATE INDEX IF NOT EXISTS idx_events_user_start_at
ON meet_ease.events(user_id, start_at);

