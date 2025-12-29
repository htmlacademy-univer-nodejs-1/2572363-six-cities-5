import { UserEntity } from '../../models/user/user.entity.js';
import { DocumentType } from '@typegoose/typegoose';
import { LoginUserDto } from '../../models/user/dto/login-user.dto.js';

export interface AuthService {
  authenticate(user: DocumentType<UserEntity>): Promise<string>;
  verify(dto: LoginUserDto): Promise<DocumentType<UserEntity>>;
}
