import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(user: any) {
    // Ensure we have the latest user data
    const freshUser = await this.usersService.findById(user._id);
    if (!freshUser) {
      throw new UnauthorizedException('User not found');
    }

    const payload = { 
      email: freshUser.email, 
      sub: freshUser._id, 
      role: freshUser.role,
      isAdmin: freshUser.isAdmin 
    };

    console.log('Login payload:', payload); // Debug log

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        email: freshUser.email,
        name: freshUser.name,
        role: freshUser.role,
        isAdmin: freshUser.isAdmin,
        _id: freshUser._id,
      },
    };
  }

  async register(createUserDto: CreateUserDto) {
    // Set isAdmin based on role for consistency
    if (createUserDto.role === 'admin') {
      createUserDto.isAdmin = true;
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.login(user);
  }
} 