import { Controller, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { responseFormatter } from 'src/helpers/response.helper';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('authorize')
  async getAuthUrl() {  
    const authUrl = await this.authService.getAuthUrl();
    return authUrl;
  }

  @Get('callback')
  async authCallback(@Query('code') code: string) {
    try {
      const url = await this.authService.handleCallback(code);
      return url;
    } catch (err) {
      throw responseFormatter(err, "error");
    }
  }
}
