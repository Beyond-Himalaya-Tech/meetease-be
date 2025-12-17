import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { google } from 'googleapis';

@Controller('auth')
export class AuthController {
  private oauth2Client;

  constructor(private readonly gcal: AuthService) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.REDIRECT_URI,
    );
  }

  @Get('authorize')
  async getAuthUrl() {
    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['openid', 'profile', 'email', 'https://www.googleapis.com/auth/calendar'],
    });
    
    return { authUrl };
  }
}
