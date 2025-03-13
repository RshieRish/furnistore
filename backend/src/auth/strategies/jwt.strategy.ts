import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService
  ) {
    // Get JWT secret from config service or use fallback
    const jwtSecret = configService.get<string>('JWT_SECRET') || 'fallback_jwt_secret_for_development_only';
    console.log('JWT Secret:', jwtSecret ? 'Set (hidden)' : 'Not set');
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findById(payload.sub);
    return {
      _id: user._id,
      email: user.email,
      role: user.role,
      isAdmin: user.isAdmin,
    };
  }
} 