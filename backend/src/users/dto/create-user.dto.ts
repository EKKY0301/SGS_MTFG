export class CreateUserDto {
  username: string;
  passwordHash: string;
  isActive?: boolean;
}
