import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/shared/filters/global-exception/global-exception.filter';

const VALID_MD5 = '5f4dcc3b5aa765d61d8327deb882cf99';

const VALID_CONFIG = {
  language: 'pt-BR',
  region: 'BR',
  includeAdult: false,
  favoriteGenres: [28, 12, 878],
  theme: 'dark',
  itemsPerPage: 20,
  defaultSortBy: 'popularity.desc',
  streamingProviders: [8, 337, 119],
  notifications: {
    newReleasesFromFavoriteGenres: true,
    watchlistUpcomingReminders: true,
  },
};

describe('UserConfig (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();

    const email = `user_config_${Date.now()}@example.com`;
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'User Config Test', email, password: VALID_MD5 });

    token = registerRes.body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /user/config', () => {
    it('should return default config for a user without saved preferences', () => {
      return request(app.getHttpServer())
        .get('/user/config')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            language: 'en-US',
            region: 'US',
            includeAdult: false,
            theme: 'dark',
            itemsPerPage: 20,
            defaultSortBy: 'popularity.desc',
          });
        });
    });

    it('should return 401 without a token', () => {
      return request(app.getHttpServer()).get('/user/config').expect(401);
    });
  });

  describe('PUT /user/config', () => {
    it('should update and persist the config', async () => {
      await request(app.getHttpServer())
        .put('/user/config')
        .set('Authorization', `Bearer ${token}`)
        .send(VALID_CONFIG)
        .expect(200)
        .expect((res) => {
          const numericSort = (a: number, b: number) => a - b;
          expect(res.body.language).toBe('pt-BR');
          expect([...res.body.favoriteGenres].sort(numericSort)).toEqual([
            12, 28, 878,
          ]);
          expect([...res.body.streamingProviders].sort(numericSort)).toEqual([
            8, 119, 337,
          ]);
        });

      return request(app.getHttpServer())
        .get('/user/config')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.language).toBe('pt-BR');
        });
    });

    it('should return 401 without a token', () => {
      return request(app.getHttpServer())
        .put('/user/config')
        .send(VALID_CONFIG)
        .expect(401);
    });

    it('should return 400 for an invalid theme', () => {
      return request(app.getHttpServer())
        .put('/user/config')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...VALID_CONFIG, theme: 'blue' })
        .expect(400);
    });
  });
});
