import { Module } from '@nestjs/common';
import { HttpModule as NestHttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { RestClient } from './contracts/rest-client.interface';
import { RestClientService } from './implementations/rest-client.service';

@Module({
  imports: [NestHttpModule, ConfigModule],
  providers: [
    {
      provide: RestClient,
      useClass: RestClientService,
    },
  ],
  exports: [RestClient],
})
export class HttpModule {}
