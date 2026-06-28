import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/shared/filters/global-exception.filter';

const VALID_MD5 = '5f4dcc3b5aa765d61d8327deb882cf99';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register and return a token', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ name: 'Test User', email: `user_${Date.now()}@example.com`, password: VALID_MD5 })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('token');
        });
    });

    it('should return 400 for invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ name: 'Test', email: 'not-an-email', password: VALID_MD5 })
        .expect(400);
    });

    it('should return 400 for non-MD5 password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ name: 'Test', email: 'user@example.com', password: 'plaintext' })
        .expect(400);
    });
  });

  describe('POST /auth', () => {
    it('should return 401 for unknown email', () => {
      return request(app.getHttpServer())
        .post('/auth')
        .send({ email: 'nobody@example.com', password: VALID_MD5 })
        .expect(401);
    });

    it('should return 401 for wrong password', async () => {
      const email = `auth_${Date.now()}@example.com`;
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ name: 'Auth Test', email, password: VALID_MD5 });

      return request(app.getHttpServer())
        .post('/auth')
        .send({ email, password: 'aaaabbbbccccddddeeeeffffaaaabbbb' })
        .expect(401);
    });

    it('should return a token for valid credentials', async () => {
      const email = `login_${Date.now()}@example.com`;
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ name: 'Login Test', email, password: VALID_MD5 });

      return request(app.getHttpServer())
        .post('/auth')
        .send({ email, password: VALID_MD5 })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('token');
        });
    });
  });
});
