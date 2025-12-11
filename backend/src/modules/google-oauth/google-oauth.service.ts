import { Injectable } from '@nestjs/common';
import { google, calendar_v3 } from 'googleapis';
import { UsersService } from '../users/users.service'; // assuming you have a users service
import { toUTCDate } from 'src/helpers/time.helper';

@Injectable()
export class GoogleOAuthService {
  private oauthClient = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL,
  );

  constructor(private readonly usersService: UsersService) {}

  getAuthUrl() {
    const scopes = [
      'openid',
      'profile',
      'email',
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/calendar.events.owned'
    ];

    return this.oauthClient.generateAuthUrl({
      access_type: 'offline', // ensures refresh token is returned
      scope: scopes,
      prompt: 'consent',
    });
  }

  async getTokens(code: string) {
    const { tokens } = await this.oauthClient.getToken(code);
    return { tokens };
  }

  /**
   * Get OAuth2 client with user credentials and refresh if needed
   */
  private async getClientWithUser(user: any) {
    const client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.REDIRECT_URL,
    );

    // Set initial credentials
    client.setCredentials({
      access_token: user.access_token,
      refresh_token: user.refresh_token,
    });

    const expiryDate = user.token_expiry ? new Date(user.token_expiry).getTime() : 0;
    if (Date.now() >= expiryDate) {
      try {
        const { credentials } = await client.refreshAccessToken();
        await this.usersService.update(user.id, {
          access_token: credentials.access_token || user.access_token,
          token_expiry: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
        });
        client.setCredentials(credentials);
      } catch (err) {
        throw new Error('Failed to refresh Google access token');
      }
    }

    return client;
  }

  async createGoogleCalendarEvent(user: any, eventData: calendar_v3.Schema$Event) {
    const oAuth2Client = await this.getClientWithUser(user);
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: eventData,
      conferenceDataVersion: 1,
      sendUpdates: 'all'
    });

    return response.data;
  }

  async getGoogleCalendarEvent(user: any, date: Date, startTime: number, endTime: number) {
    const oAuth2Client = await this.getClientWithUser(user);
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

    const calendarInfo = await calendar.calendars.get({ calendarId: 'primary' });

    const timeZone = calendarInfo?.data?.timeZone ?? 'Asia/Kathmandu';

    const localStart = new Date(date.getTime() + startTime);
    const localEnd = new Date(date.getTime() + endTime);

    const startDateTime = toUTCDate(localStart, timeZone).toISOString();
    const endDateTime = toUTCDate(localEnd, timeZone).toISOString();

    const response = await calendar.events.list({
      calendarId: 'primary',
      singleEvents: true,
      timeMin: startDateTime,
      timeMax: endDateTime,
      orderBy: 'startTime',
      timeZone
    });
    
    return response.data.items || [];
  }

  async updateGoogleCalendarEvent(user: any, eventId: string, eventData: calendar_v3.Schema$Event) {
    const oAuth2Client = await this.getClientWithUser(user);
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId: eventId,
      requestBody: eventData
    });

    return response.data;
  }

  async rescheduleGoogleCalendarEvent(user: any, eventId: string, eventData: calendar_v3.Schema$Event) {
    const oAuth2Client = await this.getClientWithUser(user);
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId: eventId,
      requestBody: eventData,
      conferenceDataVersion: 1,
    });

    return response.data;
  }

  async cancelGoogleCalendarEvent(user: any, eventId: string) {
    const oAuth2Client = await this.getClientWithUser(user);
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

    return await calendar.events.delete({
      calendarId: 'primary',
      eventId,
    });
  }
}
