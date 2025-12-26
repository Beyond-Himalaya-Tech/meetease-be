import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, Query } from '@nestjs/common';
import { EventTypesService } from './event-types.service';
import { CreateEventTypeDto, UpdateEventTypeDto } from 'src/dto/eventsType.dto';
import { AuthGuard } from '../auth/auth.guard';
import { AvailabilitiesService } from '../availabilities/availabilities.service';
import { dateToTimeString, getDateTime, msToHour, timeStringToDate, toTimezoneDate, toUTCDate } from 'src/helpers/time.helper';
import { responseFormatter, notFoundResponse } from 'src/helpers/response.helper';
import { GoogleOAuthService } from '../google-oauth/google-oauth.service';
import { paginateData } from '@/helpers/paginage.helper';

@UseGuards(AuthGuard)
@Controller('event-types')
export class EventTypesController {
  constructor(
    private readonly oauthService: GoogleOAuthService,
    private readonly eventTypeService: EventTypesService,
    private readonly availabilitiesService: AvailabilitiesService
  ) {}

  @Post()
  async create(@Body() dto: CreateEventTypeDto, @Request() req) {
    try {
      return responseFormatter(await this.eventTypeService.create({...dto, ...{ user_id: req.user.id }}));
    } catch (err) {
      throw responseFormatter(err, "error");
    }
  }

  @Get()
  async findAll(@Request() req, @Query('current_page') current_page?: number, @Query('size') size?: number) {
    try {
      const userEventTypes = await this.eventTypeService.findAllByUser(req.user.id, current_page, size);
      if(!userEventTypes.length) {
        throw notFoundResponse("No user event types");
      }

      const total = await this.eventTypeService.count({user_id: req.user.id})
      const response = paginateData(userEventTypes, total, current_page, size)
      return response;
    } catch (err) {
      throw responseFormatter(err, "error");
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    try {
      return responseFormatter(await this.eventTypeService.findOne(id));
    } catch (err) {
      throw responseFormatter(err, "error");
    }
  }

  @Get('availabilities/:id/:date/:timezone')
  async findAvailability(@Param('id') id: number, @Param('date') date: string, @Param('timezone') timezone: string, @Request() req) {
    try {
      const eventType = await this.eventTypeService.findOne(id);
      const givenDate = new Date(date);

      if(date < (new Date).toISOString().split('T')[0]) {
        return responseFormatter([]);
      }
      const day = givenDate.getDay();
      const userAvailabilities = await this.availabilitiesService.findByUser({ user_id: req.user.id, day_of_week: day });
      
      if(userAvailabilities.length == 0) {
        return responseFormatter({});
      }
      let startTime = new Date(userAvailabilities[0].start_time);
      let endTime = new Date(userAvailabilities[0].end_time);

      const intervalMs = eventType?.duration_minutes ? eventType.duration_minutes * 60 * 1000 : 30 * 60 * 1000;
      const allSlots: number[] = [];
      
      const availableEvents = await this.oauthService.getGoogleCalendarEvent(req.user, givenDate, startTime.getTime(), endTime.getTime());
      const eventTimes = availableEvents.map((events) => {
        const start = events?.start?.dateTime && timezone ? toTimezoneDate(new Date(events?.start?.dateTime), timezone) : new Date(givenDate);
        const end = events?.end?.dateTime && timezone ? toTimezoneDate(new Date(events?.end?.dateTime), timezone) : new Date(givenDate);
        return {
          start: timeStringToDate(dateToTimeString(start)).getTime(),
          end: timeStringToDate(dateToTimeString(end)).getTime()
        }
      })

      const timeNow = timeStringToDate(dateToTimeString(toTimezoneDate(new Date(), timezone))).getTime();
      for (let currentTime = startTime.getTime(); currentTime < endTime.getTime(); currentTime += intervalMs) {
        if(date == (new Date).toISOString().split('T')[0]) {
          if(currentTime > timeNow)  allSlots.push(currentTime);
        } else {
          allSlots.push(currentTime);
        }
      }
      const filteredSlots = allSlots.filter(time => {
        return !eventTimes.some(event => time >= event.start && time < event.end);
      });
      const availableSlots = filteredSlots.map(msToHour);

      if(userAvailabilities[0].timezone !== timezone) {
        const zoneWiseSlot = availableSlots.map((slot) => {
          const [startHourStr, startMinuteStr] = slot.split(":");
  
          const startHour = Number(startHourStr);
          const startMinute = Number(startMinuteStr);
          startTime = new Date(givenDate);
          startTime.setHours(startHour, startMinute, 0, 0);
          const toUtcDate = toUTCDate(startTime, userAvailabilities[0].timezone ?? 'Asia/Kathmandu')
          const convertedDate = toTimezoneDate(toUtcDate, timezone)
          return getDateTime(convertedDate);
        })
        return responseFormatter(zoneWiseSlot);
      }

      return responseFormatter(availableSlots);
    } catch (err) {
      throw responseFormatter(err, "error");
    }
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() dto: UpdateEventTypeDto) {
    try {
      return responseFormatter(await this.eventTypeService.update(id, dto));
    } catch (err) {
      throw responseFormatter(err, "error");
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    try {
      return responseFormatter(await this.eventTypeService.remove(id));
    } catch (err) {
      throw responseFormatter(err, "error");
    }
  }
}
