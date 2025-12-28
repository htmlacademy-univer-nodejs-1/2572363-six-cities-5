export class CreateUserDto {
  public name!: string;
  public email!: string;
  public avatar?: string;
  public password!: string;
  public type!: 'ordinary' | 'pro';
}
