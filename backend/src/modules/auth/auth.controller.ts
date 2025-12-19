import { Controller, Get, Query, Res, Req, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { responseFormatter } from 'src/helpers/response.helper';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('authorize')
  async getAuthUrl() {  
    const authUrl = await this.authService.getAuthUrl();
    return authUrl;
  }

  @Get('callback')
  async authCallback(@Query('code') code: string, @Res() res: Response) {
    try {
      const { access_token, refresh_token } =
        await this.authService.handleCallback(code);

      // HttpOnly refresh token cookie
      res.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';

      const redirectUrl = `${frontendUrl}/oauth/callback?token=${encodeURIComponent(
        access_token,
      )}`;

      return res.redirect(redirectUrl);
    } catch (err) {
      throw responseFormatter(err, 'error');
    }
  }

  @Get('refresh')
  async refresh(@Req() req: Request) {
    const cookieHeader = req.headers['cookie'];
    if (!cookieHeader) {
      throw new UnauthorizedException('Missing refresh token');
    }

    const token = cookieHeader
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith('refresh_token='))?.split('=')[1];

    if (!token) {
      throw new UnauthorizedException('Missing refresh token');
    }

    return this.authService.refreshAccessToken(token);
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    // Clear refresh_token cookie
    res.cookie('refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return res.status(204).send();
  }
}
