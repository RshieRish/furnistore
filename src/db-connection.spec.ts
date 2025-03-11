import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import mongoose from 'mongoose';

describe('Database Connection', () => {
  let connection: mongoose.Connection;

  beforeAll(async () => {
    // Connect directly to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/furniture-store-test');
    connection = mongoose.connection;
  });

  afterAll(async () => {
    await connection.close();
  });

  it('should connect to MongoDB', () => {
    expect(connection.readyState).toBe(1); // 1 = connected
  });

  it('should have the correct database name', () => {
    expect(connection.db.databaseName).toBe('furniture-store-test');
  });
}); 