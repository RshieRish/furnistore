import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    // Ensure admin user exists when service is created
    this.ensureAdminExists();
  }

  private async ensureAdminExists() {
    try {
      const adminEmail = 'admin@cornwallis.com';
      const existingAdmin = await this.findByEmail(adminEmail);
      
      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('Admin@123', 10);
        await this.create({
          name: 'Admin User',
          email: adminEmail,
          password: hashedPassword,
          role: 'admin',
          isAdmin: true
        });
        console.log('Admin user created successfully');
      } else if (!existingAdmin.isAdmin || existingAdmin.role !== 'admin') {
        // Update existing user to have admin privileges
        await this.userModel.findByIdAndUpdate(existingAdmin._id, {
          role: 'admin',
          isAdmin: true
        });
        console.log('Admin user updated successfully');
      }
    } catch (error) {
      console.error('Error ensuring admin exists:', error);
    }
  }

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const existingUser = await this.userModel.findOne({ email: createUserDto.email });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async findById(id: string): Promise<UserDocument> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    return this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec();
  }

  async remove(id: string): Promise<UserDocument> {
    return this.userModel.findByIdAndDelete(id).exec();
  }
} 