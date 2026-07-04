import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class AdminLoginDto {
  @ApiProperty({
    example: 'email@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password@2342',
  })
  @IsString()
  password: string;
}