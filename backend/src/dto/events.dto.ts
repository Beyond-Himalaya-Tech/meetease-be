import { IsInt, IsOptional, IsString, IsEmail, IsEnum, IsISO8601 } from 'class-validator';

export enum EventStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RESCHEDULE = 'RESCHEDULE',
}

export class CreateEventDto {
  @IsInt()
  user_id: number;

  @IsInt()
  event_type_id: number;

  @IsISO8601()
  start_at: string;

  @IsISO8601()
  end_at: string;

  @IsString()
  timezone: string;

  @IsString()
  location_link: string;

  @IsEnum(EventStatus)
  status: EventStatus;

  @IsOptional()
  @IsString()
  calendar_event_id?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsInt()
  contact_id?: number;
}

export class UpdateEventDto {
  @IsOptional()
  @IsISO8601()
  start_at?: string;

  @IsOptional()
  @IsISO8601()
  end_at?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  location_link?: string;

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @IsOptional()
  @IsString()
  calendar_event_id?: string;
}
