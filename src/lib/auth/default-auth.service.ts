import { inject, injectable } from 'inversify';
import { DocumentType } from '@typegoose/typegoose';
import * as jose from 'jose';
import { UserEntity } from '../../models/user/user.entity.js';
import { UserService } from '../../models/user/user-service.interface.js';
import { LoginUserDto } from '../../models/user/dto/login-user.dto.js';
import { AuthService } from './auth-service.interface.js';
import { Component } from '../../types/component.enum.js';
import { Config } from '../../core/config/config.interface.js';
import { RestSchema } from '../../core/config/rest.schema.js';
import { JWT_ALGORITHM, JWT_EXPIRED } from '../../constants.js';
import { UserNotFoundException } from '../../errors/auth.errors.js';
import { UserPasswordIncorrectException } from '../../errors/auth.errors.js';

@injectable()
export class DefaultAuthService implements AuthService {
  constructor(
    @inject(Component.UserService) private readonly userService: UserService,
    @inject(Component.Config) private readonly config: Config<RestSchema>,
  ) {}

  public async authenticate(user: DocumentType<UserEntity>): Promise<string> {
    const jwtSecret = this.config.get('JWT_SECRET');
    const secretKey = new TextEncoder().encode(jwtSecret);

    const payload = {
      email: user.email,
      name: user.name,
      id: user.id,
      type: user.type,
    };

    return new jose.SignJWT(payload)
      .setProtectedHeader({ alg: JWT_ALGORITHM })
      .setIssuedAt()
      .setExpirationTime(JWT_EXPIRED)
      .sign(secretKey);
  }

  public async verify(dto: LoginUserDto): Promise<DocumentType<UserEntity>> {
    const user = await this.userService.findByEmail(dto.email);

    if (!user) {
      throw new UserNotFoundException(dto.email);
    }

    const salt = this.config.get('SALT');
    const isPasswordValid = user.verifyPassword(dto.password, salt);

    if (!isPasswordValid) {
      throw new UserPasswordIncorrectException();
    }

    return user;
  }
}
