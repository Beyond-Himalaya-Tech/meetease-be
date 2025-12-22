import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDataDto, CreateEventDto, EventStatus, RescheduleEventDto, UpdateEventDto } from 'src/dto/events.dto';
import { AuthGuard } from '../auth/auth.guard';
import { EventTypesService } from '../event-types/event-types.service';
import { ContactsService } from '../contacts/contacts.service';
import { CreateContactDto } from 'src/dto/contacts.dto';
import { GoogleOAuthService } from '../google-oauth/google-oauth.service';
import { responseFormatter, notFoundResponse } from 'src/helpers/response.helper';
import { dateToTimeString, formatDateKey, toUTCDate } from 'src/helpers/time.helper';
import { MailService } from '../mail/mail.service';

@UseGuards(AuthGuard)
@Controller('events')
export class EventsController {
  constructor(
    private readonly eventService: EventsService,
    private readonly contactService: ContactsService,
    private readonly eventTypeService: EventTypesService,
    private readonly oAuthService: GoogleOAuthService,
    private readonly mailService: MailService
  ) {}

  @Post()
  async create(@Body() dto: CreateEventDto, @Request() req) {
    try {
      const eventTypes = await this.eventTypeService.findOne(dto.event_type_id);
      const contactData: CreateContactDto = {
        user_id: req.user.id,
        email: dto.email,
        name: dto.name
      };

      if(dto.phone)  contactData.phone = dto.phone;
      if(eventTypes?.client_tag)  contactData.tag = eventTypes?.client_tag;

      const contact = await this.contactService.upsert(contactData);
      const start_at = new Date(dto.start_at);
      const end_at = dto?.end_at
        ? new Date(dto.end_at)
        : new Date(start_at.getTime() + ((eventTypes?.duration_minutes ?? 30) * 60000));

      const calendarEvent = await this.oAuthService.createGoogleCalendarEvent(req.user, {
        summary: `Meeting by ${req.user.name} with ${dto.name}`,
        description: dto.description,
        start: {
          dateTime: toUTCDate(start_at, dto.timezone).toISOString(),
          timeZone: dto.timezone,
        },
        end: {
          dateTime: toUTCDate(end_at, dto.timezone).toISOString(),
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
        start_at: start_at,
        end_at: end_at,
        timezone: dto.timezone,
        location_link: calendarEvent.hangoutLink ?? 'https://meet.google.com',
        status: dto.status ?? 'CREATED',
        calendar_event_id: calendarEvent.id ?? '',
        contact_id: contact.id,
        description: dto.description ? dto.description : '',
      };

      const templateData = {
        hostName: eventData.user_id,
        name: dto.name,
        email: dto.email,
        meetingDate: start_at.toLocaleDateString(),
        meetingTime: start_at.toLocaleTimeString(),
        timezone: eventData.timezone,
        meetingLink: eventData.location_link,
        description: eventData.description
      };
      this.mailService.sendEmail({
        subject: 'New Meeting Scheduled',
        template: 'new-meet-set',
        context: templateData,
        emailsList: req.user.email
      });
      this.mailService.sendEmail({
        subject: 'New Meeting Scheduled',
        template: 'new-meet-set',
        context: templateData,
        emailsList: dto.email
      });

      return responseFormatter(await this.eventService.create(eventData));
    } catch (err) {
      throw responseFormatter(err, "error");
    }
  }

  @Get('filter/:event')
  async findAll(
    @Param('event') event: string,
    @Request() req,
    @Query('from_date') from_date?: string,
    @Query('to_date') to_date?: string,
  ) {
    try {
      const where: any = {
        user_id: req.user.id,
      };

      const now = new Date();

      switch (event) {
        case 'upcoming':
          where.start_at = {
            gte: now,
          };
          break;

        case 'past':
          where.start_at = {
            lt: now,
          };
          break;

        case 'range':
          if (!from_date || !to_date) {
            throw new BadRequestException(
              '`from` and `to` query parameters are required for range events',
            );
          }

          const from = new Date(from_date);
          const to = new Date(to_date);

          if (isNaN(from.getTime()) || isNaN(to.getTime())) {
            throw new BadRequestException('Invalid date format');
          }

          if (from > to) {
            throw new BadRequestException('`from` date must be before `to` date');
          }

          from.setHours(0, 0, 0, 0);
          to.setHours(23, 59, 59, 999); 

          where.start_at = {
            gte: from,
            lte: to,
          };
          break;

        default:
          throw new BadRequestException('Invalid event type');
      }

      const userEvents = await this.eventService.findFilteredByUser(where);

      if (!userEvents.length) {
        throw notFoundResponse('No user events');
      }

      const groupedResponse = userEvents.reduce((acc, event) => {
        const startDate = new Date(event.start_at);

        const dateKey = formatDateKey(startDate); // "19th Dec, 2025"

        const meetDate = startDate.toISOString().split('T')[0];

        const startTime = dateToTimeString(startDate);

        const endDate = new Date(event.end_at);
        const endTime = dateToTimeString(endDate)

        const formattedEvent = {
          id: event.id,
          start_at: event.start_at,
          end_at: event.end_at,
          meet_date: meetDate,
          start_time: startTime,
          end_time: endTime,
          timezone: event.timezone,
          location_link: event.location_link,
          description: event.description,
          is_rescheduled: event.is_rescheduled,

          event_types: event.event_types?.title,
          event_types_description: event.event_types?.description,
          duration_minutes: event.event_types?.duration_minutes,

          contact_name: event.contacts?.name,
          contact_email: event.contacts?.email,
          contact_tag: event.contacts?.tag,
        };

        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }

        acc[dateKey].push(formattedEvent);

        return acc;
      }, {} as Record<string, any[]>);


      return responseFormatter(groupedResponse);
    } catch (err) {
      throw responseFormatter(err, 'error');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    try {
      return responseFormatter(await this.eventService.findOne(id));
    } catch (err) {
      throw responseFormatter(err, "error");
    }
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() dto: UpdateEventDto, @Request() req) {
    try {
      if(dto?.description) {
        const event = await this.eventService.findOne(id);
        if(event?.calendar_event_id)
          await this.oAuthService.updateGoogleCalendarEvent(req.user, event.calendar_event_id, {
            description: dto.description
          });
      }
      return responseFormatter(await this.eventService.update(id, dto));
    } catch (err) {
      throw responseFormatter(err, "error");
    }
  }

  @Patch('reschedule/:id')
  async rescheduleEvent(@Param('id') id: number, @Body() dto: RescheduleEventDto, @Request() req) {
    try {
      const event = await this.eventService.findOne(id);

      const start_at: Date = new Date(dto.start_at);
      let end_at: Date;
      if(!(dto?.end_at)) {
        if(event?.event_type_id) {
          const eventTypes = await this.eventTypeService.findOne(event.event_type_id);
          end_at = new Date(start_at.getTime() + ((eventTypes?.duration_minutes ?? 30) * 60000));
        } else end_at = new Date(start_at.getTime() + (30 * 60000));
      } else  end_at = new Date(dto.end_at);


      if(event?.calendar_event_id) {
        const calendarEvent = await this.oAuthService.rescheduleGoogleCalendarEvent(req.user, event.calendar_event_id, {
          start: {
            dateTime: toUTCDate(start_at, dto.timezone).toISOString(),
            timeZone: dto.timezone
          },
          end: {
            dateTime: toUTCDate(end_at, dto.timezone).toISOString(),
            timeZone: dto.timezone
          },
          conferenceData: {
            createRequest: {
              requestId: Date.now().toString(),
              conferenceSolutionKey: { type: "hangoutsMeet" }
            }
          }
        });

        const eventData = {
          start_at: start_at.toISOString(),
          end_at: end_at.toISOString(),
          location_link: calendarEvent.hangoutLink ?? 'https://meet.google.com',
          is_rescheduled: true,
          calendar_event_id: calendarEvent.id ?? '1'
        };
        return responseFormatter(await this.eventService.update(id, eventData));
      }
    } catch (err) {
      throw responseFormatter(err, "error");
    }
  }

  @Patch('cancel/:id')
  async cancelEvent(@Param('id') id: number, @Request() req) {
    try {
      const updateEvent: UpdateEventDto = { status: EventStatus.CANCELLED };
      const event = await this.eventService.update(id, updateEvent);
      if(event?.calendar_event_id)
        await this.oAuthService.cancelGoogleCalendarEvent(req.user, event.calendar_event_id);
      return responseFormatter(event);
    } catch (err) {
      throw responseFormatter(err, "error");
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    try {
      return responseFormatter(await this.eventService.remove(id));
    } catch (err) {
      throw responseFormatter(err, "error");
    }
  }
}
