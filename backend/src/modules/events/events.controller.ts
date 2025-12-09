import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, NotFoundException, Request } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from 'src/dto/events.dto';
import { AuthGuard } from '../auth/auth.guard';
import { EventTypesService } from '../event-types/event-types.service';

@UseGuards(AuthGuard)
@Controller('events')
export class EventsController {
  constructor(
    private readonly eventService: EventsService,
    private readonly eventTypeService: EventTypesService
  ) {}

  @Post()
  async create(@Body() dto: CreateEventDto, @Request() req) {
    const eventTypes = await this.eventTypeService.findOne(dto.event_type_id);
    const contact = {
      user_id: req.user.id,
      name: dto.name || null,
      email: dto.email,
      phone: dto.phone || null,
      tag: eventTypes ? eventTypes.client_tag : null
    };
    console.log(contact);
    return dto;
    // return this.eventService.create({...dto, ...{user_id: req.user.id}});
  }

  // GET /events?user_id=123
  @Get()
  async findAll(@Query('user_id') user_id: number) {
    const userEvents = await this.eventService.findAllByUser(user_id);
    if(userEvents) {
      throw new NotFoundException("No user events");
    }
    return userEvents;
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.eventService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateEventDto) {
    return this.eventService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.eventService.remove(id);
  }
}
