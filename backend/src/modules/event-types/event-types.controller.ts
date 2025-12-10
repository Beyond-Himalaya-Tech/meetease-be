import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, NotFoundException } from '@nestjs/common';
import { EventTypesService } from './event-types.service';
import { CreateEventTypeDto, UpdateEventTypeDto } from 'src/dto/eventsType.dto';
import { AuthGuard } from '../auth/auth.guard';
import { AvailabilitiesService } from '../availabilities/availabilities.service';
import { msToHour } from 'src/helpers/time.helper';

@UseGuards(AuthGuard)
@Controller('event-types')
export class EventTypesController {
  constructor(
    private readonly eventTypeService: EventTypesService,
    private readonly availabilitiesService: AvailabilitiesService
  ) {}

  @Post()
  create(@Body() dto: CreateEventTypeDto, @Request() req) {
    return this.eventTypeService.create({...dto, ...{ user_id: req.user.id }});
  }

  @Get()
  async findAll(@Request() req) {
    const userEventTypes = await this.eventTypeService.findAllByUser(req.user.id);
    if(!userEventTypes.length) {
      throw new NotFoundException("No user event types");
    }
    return userEventTypes;
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.eventTypeService.findOne(id);
  }

  @Get('availabilities/:id/:date')
  async findAvailability(@Param('id') id: number, @Param('date') date: string, @Request() req) {
    const eventType = await this.eventTypeService.findOne(id);
    const givenDate = new Date(date);
    const day = givenDate.getDay();
    const userAvailabilities = await this.availabilitiesService.findByUser({ user_id: req.user.id, day_of_week: day });

    const startTime = new Date(userAvailabilities[0].start_time);
    const endTime = new Date(userAvailabilities[0].end_time);
    const intervalMs = eventType?.duration_minutes ? eventType.duration_minutes * 60 * 1000 : 30 * 60 * 1000;
    const availableTime: string[] = [];

    for (let currentTime = startTime.getTime(); currentTime < endTime.getTime(); currentTime += intervalMs) {
      availableTime.push(msToHour(currentTime));
    }
    return availableTime;
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateEventTypeDto) {
    return this.eventTypeService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.eventTypeService.remove(id);
  }
}
