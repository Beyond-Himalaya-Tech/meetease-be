import { IsInt, IsString, IsOptional } from 'class-validator';

export class CreateAvailabilityDto {
  @IsOptional()
  @IsInt()
  user_id: number;

  @IsInt()
  day_of_week: number; // 0 = Sunday ... 6 = Saturday

  @IsString()
  start_time: string;

  @IsString()
  end_time: string;
}

export class UpdateAvailabilityDto {
  @IsOptional()
  @IsString()
  start_time?: string;

  @IsOptional()
  @IsString()
  end_time?: string;
}
