import { IsInt, IsOptional, IsString, IsEmail, IsEnum, IsISO8601, IsBoolean } from 'class-validator';

export enum EventStatus {
  CREATED = 'CREATED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export class CreateEventDto {
  @IsOptional()
  @IsInt()
  user_id: number;

  @IsInt()
  event_type_id: number;

  @IsISO8601()
  start_at: Date;

  @IsOptional()
  @IsISO8601()
  end_at?: Date;

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

  @IsOptional()
  @IsString()
  description?: string;
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

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @IsOptional()
  @IsString()
  description?: string;
}

export class RescheduleEventDto {
  @IsISO8601()
  start_at: Date;

  @IsOptional()
  @IsISO8601()
  end_at?: Date;

  @IsString()
  timezone: string;
}
