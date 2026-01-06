import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto, CreateEventDataDto, EventStatus } from 'src/dto/events.dto';
import { EventTypesService } from '../event-types/event-types.service';
import { ContactsService } from '../contacts/contacts.service';
import { CreateContactDto } from 'src/dto/contacts.dto';
import { GoogleOAuthService } from '../google-oauth/google-oauth.service';
import { responseFormatter } from 'src/helpers/response.helper';
import { toUTCDate } from 'src/helpers/time.helper';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';

/**
 * Public controller for booking pages (like Calendly)
 * Allows unauthenticated users to book events
 * Events are created on behalf of the event type's organizer
 */
@Controller('public/events')
export class PublicEventsController {
  constructor(
    private readonly eventService: EventsService,
    private readonly contactService: ContactsService,
    private readonly eventTypeService: EventTypesService,
    private readonly oAuthService: GoogleOAuthService,
    private readonly mailService: MailService,
    private readonly userService: UsersService
  ) {}

  @Post()
  async create(@Body() dto: CreateEventDto) {
    try {
      // Get event type to find the organizer
      const eventType = await this.eventTypeService.findOne(dto.event_type_id);
      
      if (!eventType || !eventType.is_active) {
        throw new BadRequestException('Event type not found or inactive');
      }

      // Get organizer's user record (needed for Google Calendar and contact association)
      const organizer = await this.userService.findOne(eventType.user_id);
      
      if (!organizer) {
        throw new BadRequestException('Organizer not found');
      }

      // Create or update contact associated with the organizer
      const contactData: CreateContactDto = {
        user_id: organizer.id, // Associate contact with organizer
        email: dto.email,
        name: dto.name,
        timezone: dto.timezone || undefined
      };

      if (dto.phone) {
        contactData.phone = dto.phone;
      }
      if (eventType?.client_tag) {
        contactData.tag = eventType?.client_tag;
      }

      const contact = await this.contactService.upsert(contactData);
      
      // Calculate start and end times
      const start_at = new Date(dto.start_at);
      const end_at = dto?.end_at
        ? new Date(dto.end_at)
        : new Date(start_at.getTime() + ((eventType?.duration_minutes ?? 30) * 60000));

      // Create Google Calendar event using organizer's credentials
      // Note: organizer must have Google OAuth connected
      const calendarEvent = await this.oAuthService.createGoogleCalendarEvent(organizer, {
        summary: `Meeting by ${organizer.name || organizer.email} with ${dto.name}`,
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
      
      // Create event data
      const eventData: CreateEventDataDto = {
        user_id: organizer.id, // Event belongs to organizer
        event_type_id: dto.event_type_id,
        start_at: start_at,
        end_at: end_at,
        timezone: dto.timezone,
        location_link: calendarEvent.hangoutLink ?? 'https://meet.google.com',
        status: dto.status ?? EventStatus.CREATED,
        calendar_event_id: calendarEvent.id ?? '',
        contact_id: contact.id,
        description: dto.description ? dto.description : '',
      };

      // Send confirmation emails
      const templateData = {
        hostName: organizer.name || organizer.email,
        name: dto.name,
        email: dto.email,
        meetingDate: start_at.toLocaleDateString(),
        meetingTime: start_at.toLocaleTimeString(),
        timezone: eventData.timezone,
        meetingLink: eventData.location_link,
        description: eventData.description
      };
      
      // Send email to organizer
      this.mailService.sendEmail({
        subject: 'New Meeting Scheduled',
        template: 'new-meet-set',
        context: templateData,
        emailsList: organizer.email
      });
      
      // Send email to attendee
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
}

