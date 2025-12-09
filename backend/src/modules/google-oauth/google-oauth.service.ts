import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';

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
            'https://www.googleapis.com/auth/calendar'
        ];

        return this.oauthClient.generateAuthUrl({
            access_type: 'offline',
            scope: scopes
        });
    }

    async getTokens(code: string) {
        const { tokens } = await this.oauthClient.getToken(code);
        return { tokens };
    }
}
