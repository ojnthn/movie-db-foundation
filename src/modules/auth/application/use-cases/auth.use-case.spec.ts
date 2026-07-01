import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '../../../../shared/exceptions/domain.exception';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { AuthUseCase } from './auth.use-case';

const VALID_MD5 = '5f4dcc3b5aa765d61d8327deb882cf99'; // "password"
const WRONG_MD5 = 'aaaabbbbccccddddeeeeffffaaaabbbb';

function makeUser(password = VALID_MD5) {
  const result = User.create({
    id: 'uuid-1',
    name: 'Test User',
    email: 'test@example.com',
    password,
  });
  if (!result.ok) throw new Error(result.error);
  return result.value;
}

describe('AuthUseCase', () => {
  let useCase: AuthUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('jwt-token'),
    } as unknown as jest.Mocked<JwtService>;
    useCase = new AuthUseCase(userRepository, jwtService);
  });

  it('should return a token when credentials are valid', async () => {
    userRepository.findByEmail.mockResolvedValue(makeUser());

    const result = await useCase.execute({
      email: 'test@example.com',
      password: VALID_MD5,
    });

    expect(result).toEqual({ token: 'jwt-token' });
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: 'uuid-1',
      email: 'test@example.com',
    });
  });

  it('should throw UnauthorizedException when user is not found', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({ email: 'unknown@example.com', password: VALID_MD5 }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should throw UnauthorizedException when password is wrong', async () => {
    userRepository.findByEmail.mockResolvedValue(makeUser());

    await expect(
      useCase.execute({ email: 'test@example.com', password: WRONG_MD5 }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should throw UnauthorizedException when user is inactive', async () => {
    const result = User.create({
      id: 'uuid-2',
      name: 'Inactive',
      email: 'inactive@example.com',
      password: VALID_MD5,
      status: 'inactive',
    });
    if (!result.ok) throw new Error(result.error);
    userRepository.findByEmail.mockResolvedValue(result.value);

    await expect(
      useCase.execute({ email: 'inactive@example.com', password: VALID_MD5 }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
