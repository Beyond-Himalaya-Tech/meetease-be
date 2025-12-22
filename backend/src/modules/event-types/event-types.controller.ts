import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { EventTypesService } from './event-types.service';
import { CreateEventTypeDto, UpdateEventTypeDto } from 'src/dto/eventsType.dto';
import { AuthGuard } from '../auth/auth.guard';
import { AvailabilitiesService } from '../availabilities/availabilities.service';
import { dateToTimeString, msToHour, timeStringToDate, toTimezoneDate } from 'src/helpers/time.helper';
import { responseFormatter, notFoundResponse } from 'src/helpers/response.helper';
import { GoogleOAuthService } from '../google-oauth/google-oauth.service';

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
  async findAll(@Request() req) {
    try {
      const userEventTypes = await this.eventTypeService.findAllByUser(req.user.id);
      if(!userEventTypes.length) {
        throw notFoundResponse("No user event types");
      }
      return responseFormatter(userEventTypes);
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

  @Get('availabilities/:id/:date')
  async findAvailability(@Param('id') id: number, @Param('date') date: string, @Request() req) {
    try {
      const eventType = await this.eventTypeService.findOne(id);
      const givenDate = new Date(date);
      const day = givenDate.getDay();
      const userAvailabilities = await this.availabilitiesService.findByUser({ user_id: req.user.id, day_of_week: day });
      console.log(userAvailabilities);
      
      if(userAvailabilities.length == 0) {
        return responseFormatter({});
      }
      const startTime = new Date(userAvailabilities[0].start_time);
      const endTime = new Date(userAvailabilities[0].end_time);
      const intervalMs = eventType?.duration_minutes ? eventType.duration_minutes * 60 * 1000 : 30 * 60 * 1000;
      const allSlots: number[] = [];
      
      const availableEvents = await this.oauthService.getGoogleCalendarEvent(req.user, givenDate, startTime.getTime(), endTime.getTime());
      const eventTimes = availableEvents.map((events) => {
        const start = events?.start?.dateTime && events?.start?.timeZone ? toTimezoneDate(new Date(events?.start?.dateTime), events?.start?.timeZone) : new Date(givenDate);
        const end = events?.end?.dateTime && events?.end?.timeZone ? toTimezoneDate(new Date(events?.end?.dateTime), events?.end?.timeZone) : new Date(givenDate);
        return {
          start: timeStringToDate(dateToTimeString(start)).getTime(),
          end: timeStringToDate(dateToTimeString(end)).getTime()
        }
      })

      for (let currentTime = startTime.getTime(); currentTime < endTime.getTime(); currentTime += intervalMs) {
        allSlots.push(currentTime);
      }
      const filteredSlots = allSlots.filter(time => {
        return !eventTimes.some(event => time >= event.start && time < event.end);
      });
      const availableSlots = filteredSlots.map(msToHour);

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
