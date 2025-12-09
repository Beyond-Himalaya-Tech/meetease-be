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

  getGoogleCalendarClient(tokens: any) {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.REDIRECT_URL,
    );
    oAuth2Client.setCredentials(tokens);

    return google.calendar({ version: 'v3', auth: oAuth2Client });
  }

 
  async createGoogleCalendarEvent(user: any, eventData: calendar_v3.Schema$Event) {
    const token = await this.getTokens(user.refresh_token);
    const calendar = await this.getGoogleCalendarClient(token);

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: eventData
    });

    return response.data;
  }
}
