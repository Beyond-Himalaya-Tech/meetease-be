import { Module, forwardRef } from '@nestjs/common';
import { GoogleOAuthService } from './google-oauth.service';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [forwardRef(() => UsersModule)],
    providers: [GoogleOAuthService],
    exports: [GoogleOAuthService]
})
export class GoogleOauthModule {}
