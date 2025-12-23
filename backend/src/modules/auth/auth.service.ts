import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { GoogleOAuthService } from '../google-oauth/google-oauth.service';
import { AvailabilitiesService } from '../availabilities/availabilities.service';
import { timeStringToDate } from '@/helpers/time.helper';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly availabiltyService: AvailabilitiesService,
    private readonly jwtService: JwtService,
    private readonly oAuthService: GoogleOAuthService
  ) {}

  async getAuthUrl() {
    const authUrl = await this.oAuthService.getAuthUrl();
    return { authUrl };
  }

  async handleCallback(code: string) {
    const { tokens } = await this.oAuthService.getTokens(code);

    const accessToken = tokens.access_token || tokens.refresh_token || tokens.id_token;
    if (!accessToken) {
      throw new Error('Failed to get Google tokens');
    }

    const { data } = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`
    );

    const { sub, given_name, family_name, picture, email } = data;

    if (!email) throw new Error('Failed to get Google user info');

    let user = await this.usersService.findByEmail(email);

    if (!user) {
      user = await this.usersService.create({
        google_account_id: sub,
        name: `${given_name || ''} ${family_name || ''}`.trim(),
        picture: picture || '',
        email,
        access_token: tokens.access_token || accessToken,
        refresh_token: tokens.refresh_token || undefined,
        token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
      });
      let availabilities: any = [];
      for(let i=1; i<6; i++) {
        availabilities.push({
          user_id: user.id,
          day_of_week: i,
          start_time: timeStringToDate("09:00"),
          end_time: timeStringToDate("17:00")
        });
      } 
      await this.availabiltyService.bulkCreate(availabilities);
    } else {
      await this.usersService.update(user.id, {
        google_account_id: sub,
        name: `${given_name || ''} ${family_name || ''}`.trim(),
        picture: picture || '',
        access_token: tokens.access_token || accessToken,
        refresh_token: tokens.refresh_token || user.refresh_token || undefined,
        token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined
      });
    }

    const payload = { sub: user.id, email: user.email };

    // Short-lived access token
    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    // Long-lived refresh token (used only from HttpOnly cookie)
    const refresh_token = await this.jwtService.signAsync(payload, {
      expiresIn: '30d',
    });

    return { access_token, refresh_token };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = await this.jwtService.verifyAsync<{
        sub: number;
        email: string;
      }>(refreshToken);

      const user = await this.usersService.findOne(decoded.sub);
      if (!user) {
        throw new Error('User not found');
      }

      const payload = { sub: user.id, email: user.email };
      const access_token = await this.jwtService.signAsync(payload, {
        expiresIn: '15m',
      });

      return { access_token };
    } catch {
      throw new Error('Invalid or expired refresh token');
    }
  }
}
