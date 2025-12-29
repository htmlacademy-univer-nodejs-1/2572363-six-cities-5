import { inject, injectable } from 'inversify';
import { DocumentType } from '@typegoose/typegoose';
import { UserEntity } from './user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UserService } from './user-service.interface.js';
import { Logger } from '../../core/logger/logger.interface.js';
import { Component } from '../../types/component.enum.js';
import { UserModel } from './user.entity.js';

@injectable()
export class DefaultUserService implements UserService {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger
  ) {}

  public async create(dto: CreateUserDto, salt: string): Promise<DocumentType<UserEntity>> {
    const user = new UserEntity({
      name: dto.name,
      email: dto.email,
      avatar: dto.avatar,
      type: dto.type
    });

    user.setPassword(dto.password, salt);

    try {
      const result = await UserModel.create(user);
      this.logger.info(`Created user: ${dto.email}`);
      return result;
    } catch (error) {
      this.logger.error(`User creation failed: ${dto.email}`, error as Error);
      throw error;
    }
  }

  public async findByEmail(email: string): Promise<DocumentType<UserEntity> | null> {
    try {
      return await UserModel.findOne({ email }).exec();
    } catch (error) {
      this.logger.error(`Failed to find user: ${email}`, error as Error);
      return null;
    }
  }

  public async findOrCreate(dto: CreateUserDto, salt: string): Promise<DocumentType<UserEntity>> {
    const existingUser = await this.findByEmail(dto.email);

    if (existingUser) {
      return existingUser;
    }

    return this.create(dto, salt);
  }

  public async updateById(userId: string, dto: UpdateUserDto): Promise<DocumentType<UserEntity> | null> {
    try {
      return await UserModel
        .findByIdAndUpdate(userId, dto, { new: true })
        .exec();
    } catch (error) {
      this.logger.error(`Failed to update user: ${userId}`, error as Error);
      return null;
    }
  }

  public async verifyUser(email: string, password: string, salt: string): Promise<DocumentType<UserEntity> | null> {
    try {
      const user = await UserModel.findOne({ email }).exec();
      if (!user) {
        return null;
      }

      if (!user.verifyPassword(password, salt)) {
        return null;
      }

      return user;
    } catch (error) {
      this.logger.error(`Failed to verify user: ${email}`, error as Error);
      return null;
    }
  }

  public async findById(userId: string): Promise<DocumentType<UserEntity> | null> {
    try {
      return await UserModel.findById(userId).exec();
    } catch (error) {
      this.logger.error(`Failed to find user by id: ${userId}`, error as Error);
      return null;
    }
  }
}
