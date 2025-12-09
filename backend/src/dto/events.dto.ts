import { IsInt, IsOptional, IsString, IsEmail, IsEnum, IsISO8601 } from 'class-validator';

export enum EventStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RESCHEDULE = 'RESCHEDULE',
}

export class CreateEventDto {
  @IsOptional()
  @IsInt()
  user_id: number;

  @IsInt()
  event_type_id: number;

  @IsISO8601()
  start_at: Date;

  @IsISO8601()
  end_at: Date;

  @IsString()
  timezone: string;

  @IsOptional()
  @IsString()
  location_link: string;

  @IsEnum(EventStatus)
  status: EventStatus;

  @IsOptional()
  @IsString()
  calendar_event_id?: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsInt()
  contact_id?: number;
}

export class CreateEventDataDto {
  @IsInt()
  user_id: number;

  @IsInt()
  event_type_id: number;

  @IsString()
  start_at: Date;

  @IsString()
  end_at: Date;

  @IsString()
  timezone: string;

  @IsOptional()
  @IsString()
  location_link?: string;

  @IsEnum(EventStatus)
  status: EventStatus;

  @IsOptional()
  @IsString()
  calendar_event_id?: string;

  @IsInt()
  contact_id: number;
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

  @IsString()
  location_link: string;

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @IsString()
  calendar_event_id: string;
}
