export class CreateEventDto {
  user_id: number;
  event_type_id: number;
  contact_id?: number;
  start_at: string;
  end_at: string;
  timezone: string;
  location_link: string;
  status: string;
  calendar_event_id?: string;
}

export class UpdateEventDto {
  contact_id?: number;
  start_at: string;
  end_at: string;
  timezone: string;
  location_link: string;
  status: string;
  calendar_event_id?: string;
}