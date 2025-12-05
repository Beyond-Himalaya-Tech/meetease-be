import { Controller, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { google } from 'googleapis';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('authorize')
  async getAuthUrl() {  
    return this.authService.getAuthUrl();
  }

  @Get('callback')
  async authCallback(@Query('code') code: string) {
    try {
      const url = await this.authService.handleCallback(code);
      return url;
    } catch (err) {
      return {error: err.message};
    }
  }
}
