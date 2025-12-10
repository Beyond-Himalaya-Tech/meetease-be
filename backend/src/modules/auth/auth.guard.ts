import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { Inject, forwardRef } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext
    
  ): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header required');
    }

    try {
      // Decode JWT
      const decoded = await this.jwtService.verifyAsync(authHeader);

      // Load user from DB
      const user = await this.usersService.findOne(decoded.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      req.user = user;

      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
