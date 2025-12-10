import { Injectable } from '@nestjs/common';
import { google, calendar_v3 } from 'googleapis';

@Injectable()
export class GoogleOAuthService {
  private oauthClient = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL,
  );

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
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  async getTokens(code: string) {
    const { tokens } = await this.oauthClient.getToken(code);
    return { tokens };
  }
 
  getClientWithUser(user: any) {
    const client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.REDIRECT_URL,
    );

    client.setCredentials({
      access_token: user.access_token
    });

    return client;
  }

  async createGoogleCalendarEvent(user: any, eventData: calendar_v3.Schema$Event) {
    const oAuth2Client = await this.getClientWithUser(user);
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: eventData,
      conferenceDataVersion: 1
    });

    return response.data;
  }

  async getGoogleCalendarEvent(user: any) {
    const oAuth2Client = await this.getClientWithUser(user);
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

    const response = await calendar.events.list({
      calendarId: 'primary',
      maxResults: 50,
      singleEvents: true,
      // orderBy: 'startTime',
      // timeMin: new Date().toISOString(),
    });

    return response.data.items || [];
  }

  async cancelGoogleCalendarEvent(user: any, eventId: string) {
    const oAuth2Client = await this.getClientWithUser(user);
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

    return await calendar.events.delete({
      calendarId: 'primary',
      eventId,
    });;
  }
}
