import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  name: string;

  @ApiProperty({ example: 'usuario@exemplo.com' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @ApiProperty({
    example: '5f4dcc3b5aa765d61d8327deb882cf99',
    description: 'Hash MD5 da senha',
  })
  @Matches(/^[a-f0-9]{32}$/i, {
    message: 'A senha deve ser um hash MD5 válido (32 caracteres hexadecimais)',
  })
  password: string;
}
