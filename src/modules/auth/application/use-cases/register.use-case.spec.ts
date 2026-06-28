import { JwtService } from '@nestjs/jwt';
import {
  ConflictException,
  DomainException,
} from '../../../../shared/exceptions/domain.exception';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { RegisterUseCase } from './register.use-case';

const VALID_MD5 = '5f4dcc3b5aa765d61d8327deb882cf99';

function makeUser() {
  const result = User.create({
    id: 'uuid-1',
    name: 'New User',
    email: 'new@example.com',
    password: VALID_MD5,
  });
  if (!result.ok) throw new Error(result.error);
  return result.value;
}

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(() => {
    userRepository = { findByEmail: jest.fn(), create: jest.fn() };
    jwtService = { sign: jest.fn().mockReturnValue('jwt-token') } as unknown as jest.Mocked<JwtService>;
    useCase = new RegisterUseCase(userRepository, jwtService);
  });

  it('should register a new user and return a token', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.create.mockResolvedValue(makeUser());

    const result = await useCase.execute({
      name: 'New User',
      email: 'new@example.com',
      password: VALID_MD5,
    });

    expect(result).toEqual({ token: 'jwt-token' });
    expect(userRepository.create).toHaveBeenCalled();
  });

  it('should throw ConflictException when email is already taken', async () => {
    userRepository.findByEmail.mockResolvedValue(makeUser());

    await expect(
      useCase.execute({ name: 'New User', email: 'new@example.com', password: VALID_MD5 }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('should throw DomainException when domain validation fails', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({ name: 'New User', email: 'invalid-email', password: VALID_MD5 }),
    ).rejects.toBeInstanceOf(DomainException);
  });
});
