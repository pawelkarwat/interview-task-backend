import { MemoryStoredFile } from 'nestjs-form-data';

export class RegisterDto {
  avatar: MemoryStoredFile;
  login: string;
  password: string;
}
