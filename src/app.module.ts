import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import aiConfig from './config/ai.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import redisConfig from './config/redis.config';
import { GlobalExceptionFilter } from './shared/filters/global-exception/global-exception.filter';
import { LoggingInterceptor } from './shared/interceptors/logging/logging.interceptor';
import { CacheModule } from './shared/cache/cache.module';
import { AiModule } from './shared/ai/ai.module';
import { AuthModule } from './modules/auth/auth.module';
import { MoviesModule } from './modules/movies/movies.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { UserConfigModule } from './modules/user-config/user-config.module';
import { JwtAuthGuard } from './modules/auth/infrastructure/guards/jwt-auth.guard';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, redisConfig, aiConfig],
    }),
    CacheModule,
    AiModule,
    AuthModule,
    MoviesModule,
    ReviewsModule,
    UserConfigModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
