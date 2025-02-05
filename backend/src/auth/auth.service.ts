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
    console.log('Validating user:', email);
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      console.log('User not found:', email);
      return null;
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password for user:', email);
      return null;
    }
    
    console.log('User validated successfully:', email);
    const { password: _, ...result } = user.toObject();
    return result;
  }

  async login(user: any) {
    try {
      // Ensure we have the latest user data
      const freshUser = await this.usersService.findById(user._id);
      if (!freshUser) {
        console.error('User not found during login:', user._id);
        throw new UnauthorizedException('User not found');
      }

      const payload = { 
        email: freshUser.email, 
        sub: freshUser._id, 
        role: freshUser.role,
        isAdmin: freshUser.isAdmin 
      };

      console.log('Creating login payload:', payload);

      const token = this.jwtService.sign(payload);
      console.log('JWT token generated successfully');

      return {
        access_token: token,
        user: {
          email: freshUser.email,
          name: freshUser.name,
          role: freshUser.role,
          isAdmin: freshUser.isAdmin,
          _id: freshUser._id,
        },
      };
    } catch (error) {
      console.error('Login error in service:', error);
      throw error;
    }
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