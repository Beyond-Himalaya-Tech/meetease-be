export class CreateEventDto {
  user_id: string;
  event_type_id: string;
  contact_id?: string;
  start_at: string;
  end_at: string;
  timezone: string;
  location_link: string;
  status: string;
  calendar_event_id?: string;
}

export class UpdateEventDto {
  contact_id?: string;
  start_at: string;
  end_at: string;
  timezone: string;
  location_link: string;
  status: string;
  calendar_event_id?: string;
}