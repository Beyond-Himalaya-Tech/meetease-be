export class CreateAvailabilityDto {
  user_id: number;
  day_of_week: number; // 0 = Sun ... 6 = Sat
  start_time: string;
  end_time: string;
}

export class UpdateAvailabilityDto {
  start_time?: string;
  end_time?: string;
}