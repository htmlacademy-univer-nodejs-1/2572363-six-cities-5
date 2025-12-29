import { IsEnum, IsOptional, IsString, Length } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(1, 15, { message: 'Name must be between 1 and 15 characters' })
  public name?: string;

  @IsOptional()
  @IsString()
  public avatar?: string;

  @IsOptional()
  @IsEnum(['ordinary', 'pro'])
  public type?: 'ordinary' | 'pro';
}
