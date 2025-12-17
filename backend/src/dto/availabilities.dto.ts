export class CreateAvailabilityDto {
  user_id: string;
  day_of_week: number; // 0 = Sun ... 6 = Sat
  start_time_minutes: number;
  end_time_minutes: number;
}

export class UpdateAvailabilityDto {
  start_time_minutes?: number;
  end_time_minutes?: number;
}