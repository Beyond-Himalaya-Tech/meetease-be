export class CreateEventTypeDto {
  user_id: string;
  title: string;
  description?: string;
  duration_minutes: number;
  is_active?: boolean;
  client_tag?: string;
}

export class UpdateEventTypeDto {
  title: string;
  description?: string;
  duration_minutes: number;
  is_active?: boolean;
  client_tag?: string;
}

