import { fromZonedTime, toZonedTime } from 'date-fns-tz';

export function timeStringToDate(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date(0);
  date.setUTCHours(hours, minutes, 0, 0);
  return date;
}

export function dateToTimeString(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function msToHour(time: number): string {
  const totalMinutes = Math.floor(time / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const hh = hours.toString().padStart(2, '0');
  const mm = minutes.toString().padStart(2, '0');

  return `${hh}:${mm}`;
}

export function toUTCDate(date: Date, timezone: string) {
  return fromZonedTime(date, timezone);
}

export function toTimezoneDate(date: Date, timezone: string) {
  return toZonedTime(date, timezone);
}

