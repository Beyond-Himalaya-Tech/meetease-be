import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, NotFoundException, BadRequestException, Request } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDataDto, CreateEventDto, UpdateEventDto } from 'src/dto/events.dto';
import { AuthGuard } from '../auth/auth.guard';
import { EventTypesService } from '../event-types/event-types.service';
import { ContactsService } from '../contacts/contacts.service';
import { CreateContactDto } from 'src/dto/contacts.dto';
import { GoogleOAuthService } from '../google-oauth/google-oauth.service';

@UseGuards(AuthGuard)
@Controller('events')
export class EventsController {
  constructor(
    private readonly eventService: EventsService,
    private readonly contactService: ContactsService,
    private readonly eventTypeService: EventTypesService,
    private readonly oAuthService: GoogleOAuthService
  ) {}

  @Post()
  async create(@Body() dto: CreateEventDto, @Request() req) {
    const eventTypes = await this.eventTypeService.findOne(dto.event_type_id);
    const contactData: CreateContactDto = {
      user_id: req.user.id,
      email: dto.email,
      name: dto.name
    };

    if(dto.phone)  contactData.phone = dto.phone;
    if(eventTypes?.client_tag)  contactData.tag = eventTypes?.client_tag;

    const contact = await this.contactService.upsert(contactData);
    
    const calendarEvent = await this.oAuthService.createGoogleCalendarEvent(req.user, {
      summary: `Meeting with ${eventTypes?.client_tag ?? 'client'}`,
      description: `Event for ${eventTypes?.title}`,
      start: {
        dateTime: new Date(dto.start_at).toISOString(),
        timeZone: dto.timezone,
      },
      end: {
        dateTime: new Date(dto.end_at).toISOString(),
        timeZone: dto.timezone,
      },
      attendees: [{ email: dto.email }],
      conferenceData: {
        createRequest: {
          requestId: Date.now().toString(),
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    });
    
    const eventData: CreateEventDataDto = {
      user_id: req.user.id,
      event_type_id: dto.event_type_id,
      start_at: new Date(dto.start_at),
      end_at: new Date(dto.end_at),
      timezone: dto.timezone,
      location_link: calendarEvent.hangoutLink ?? 'https://meet.google.com',
      status: dto.status ?? 'PENDING',
      calendar_event_id: calendarEvent.id ?? '1',
      contact_id: contact.id
    };
    return await this.eventService.create(eventData);
  }

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
