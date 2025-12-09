import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { google } from 'googleapis';

@Injectable()
export class AuthService {
  private oauth2Client;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.REDIRECT_URL
    );
  }

  async getAuthUrl() {
    const authUrl = await this.oauth2Client.generateAuthUrl({
      access_type: 'offline', // needed to get refresh token
      scope: [
        'openid',
        'profile',
        'email',
        'https://www.googleapis.com/auth/calendar', // calendar access
      ],
    });
    return { authUrl };
  }

  async handleCallback(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token || !tokens.id_token) {
      if(tokens.id_token)
        return { access_token: tokens.id_token }
      throw new Error('Failed to get Google tokens');
    }

    const { data } = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${tokens.access_token}`
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
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
      });
    } else {
      await this.usersService.update(user.id, {
        google_account_id: sub,
        name: `${given_name || ''} ${family_name || ''}`.trim(),
        picture: picture || '',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || user.refresh_token, // keep old if missing
        token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined
      });
    }

    const payload = { sub: user.id, email: user.email };
    const access_token = await this.jwtService.signAsync(payload);

    return { access_token };
  }

  async getOAuthClientForUser(userId: string) {
    const user = await this.usersService.findOne(userId);

    if (!user || !user.access_token) {
      throw new Error('User does not have Google tokens');
    }

    const client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.REDIRECT_URL
    );

    client.setCredentials({
      access_token: user.access_token,
      refresh_token: user.refresh_token,
      expiry_date: user.token_expiry ? user.token_expiry.getTime() : null
    });

    client.on('tokens', async (tokens) => {
      if (tokens.access_token) {
        await this.usersService.update(user.id, {
          access_token: tokens.access_token,
          token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null
        });
      }
      if (tokens.refresh_token) {
        await this.usersService.update(user.id, {
          refresh_token: tokens.refresh_token,
        });
      }
    });

    return client;
  }
}
