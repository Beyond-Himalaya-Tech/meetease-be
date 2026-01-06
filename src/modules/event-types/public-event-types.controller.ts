import { Controller, Get, Param } from '@nestjs/common';
import { EventTypesService } from './event-types.service';
import { AvailabilitiesService } from '../availabilities/availabilities.service';
import { responseFormatter } from 'src/helpers/response.helper';
import { dateToTimeString, getDateTime, msToHour, timeStringToDate, toTimezoneDate, toUTCDate } from 'src/helpers/time.helper';

/**
 * Public controller for booking pages (like Calendly)
 * These endpoints don't require authentication and can be embedded in other websites
 */
@Controller('public/event-types')
export class PublicEventTypesController {
  constructor(
    private readonly eventTypeService: EventTypesService,
    private readonly availabilitiesService: AvailabilitiesService
  ) {}

  /**
   * Get event type by ID (public)
   * Used for public booking pages
   */
  @Get(':id')
  async findOne(@Param('id') id: number) {
    try {
      const eventType = await this.eventTypeService.findOne(id);
      if (!eventType || !eventType.is_active) {
        throw new Error('Event type not found or inactive');
      }
      return responseFormatter(eventType);
    } catch (err) {
      throw responseFormatter(err, "error");
    }
  }

  /**
   * Get available time slots for a specific date (public)
   * Note: This doesn't check Google Calendar for existing events
   * It only returns time slots based on the user's availability windows
   */
  @Get(':id/availabilities/:date/:timezone')
  async findAvailability(
    @Param('id') id: number,
    @Param('date') date: string,
    @Param('timezone') timezone: string
  ) {
    try {
      const eventType = await this.eventTypeService.findOne(id);
      
      if (!eventType || !eventType.is_active) {
        throw new Error('Event type not found or inactive');
      }

      const givenDate = new Date(date);

      // Don't show past dates
      if (date < new Date().toISOString().split('T')[0]) {
        return responseFormatter([]);
      }

      const day = givenDate.getDay();
      
      // Get availabilities for the event type's owner
      const userAvailabilities = await this.availabilitiesService.findByUser({ 
        user_id: eventType.user_id, 
        day_of_week: day 
      });
      
      if (userAvailabilities.length == 0) {
        return responseFormatter([]);
      }

      let startTime = new Date(userAvailabilities[0].start_time);
      let endTime = new Date(userAvailabilities[0].end_time);

      const intervalMs = eventType?.duration_minutes 
        ? eventType.duration_minutes * 60 * 1000 
        : 30 * 60 * 1000;
      
      const allSlots: number[] = [];
      
      // Calculate current time in the requested timezone
      const timeNow = timeStringToDate(dateToTimeString(toTimezoneDate(new Date(), timezone))).getTime();
      
      // Generate all possible time slots
      for (let currentTime = startTime.getTime(); currentTime < endTime.getTime(); currentTime += intervalMs) {
        if (date == new Date().toISOString().split('T')[0]) {
          // For today, only show future slots
          if (currentTime > timeNow) {
            allSlots.push(currentTime);
          }
        } else {
          // For future dates, show all slots
          allSlots.push(currentTime);
        }
      }

      const availableSlots = allSlots.map(msToHour);

      // Convert timezone if needed
      const userTimezone = userAvailabilities[0].users?.timezone ?? 'Asia/Kathmandu';
      
      if (userTimezone !== timezone) {
        const zoneWiseSlot = availableSlots.map((slot) => {
          const [startHourStr, startMinuteStr] = slot.split(":");
          const startHour = Number(startHourStr);
          const startMinute = Number(startMinuteStr);
          const slotTime = new Date(givenDate);
          slotTime.setHours(startHour, startMinute, 0, 0);
          const toUtcDate = toUTCDate(slotTime, userTimezone);
          const convertedDate = toTimezoneDate(toUtcDate, timezone);
          return getDateTime(convertedDate);
        });
        return responseFormatter(zoneWiseSlot);
      }

      return responseFormatter(availableSlots);
    } catch (err) {
      throw responseFormatter(err, "error");
    }
  }

  /**
   * Get user availabilities for a specific user (public)
   * Used to determine which days of the week are available
   */
  @Get(':id/availability-days')
  async getAvailabilityDays(@Param('id') id: number) {
    try {
      const eventType = await this.eventTypeService.findOne(id);
      
      if (!eventType || !eventType.is_active) {
        throw new Error('Event type not found or inactive');
      }

      const availabilities = await this.availabilitiesService.findByUser({ 
        user_id: eventType.user_id 
      });
      
      // Extract unique day_of_week values
      const days = [...new Set(availabilities.map((avail) => avail.day_of_week))];
      
      return responseFormatter(days);
    } catch (err) {
      throw responseFormatter(err, "error");
    }
  }
}

