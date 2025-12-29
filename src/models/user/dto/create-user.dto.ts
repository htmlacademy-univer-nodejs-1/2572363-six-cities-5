import { IsEmail, IsEnum, IsOptional, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(1, 15, { message: 'Name must be between 1 and 15 characters' })
  public name!: string;

  @IsEmail()
  public email!: string;

  @IsOptional()
  @IsString()
  public avatar?: string;

  @IsString()
  @Length(6, 12, { message: 'Password must be between 6 and 12 characters' })
  public password!: string;

  @IsEnum(['ordinary', 'pro'])
  public type!: 'ordinary' | 'pro';
}
