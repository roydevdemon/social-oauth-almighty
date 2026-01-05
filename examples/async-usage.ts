import { Module, Injectable } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OAuthModule } from '../src/index';

/**
 * Example: Asynchronous Module Configuration with ConfigService
 * This example shows how to use environment variables with @nestjs/config
 */

@Injectable()
class OAuthConfigService {
  createOAuthOptions() {
    return {
      providers: [
        {
          name: 'google',
          credentials: {
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
          },
        },
        {
          name: 'kakao',
          credentials: {
            client_id: process.env.KAKAO_CLIENT_ID!,
            client_secret: process.env.KAKAO_CLIENT_SECRET!,
            redirect_uri: process.env.KAKAO_REDIRECT_URI!,
          },
        },
        {
          name: 'naver',
          credentials: {
            client_id: process.env.NAVER_CLIENT_ID!,
            client_secret: process.env.NAVER_CLIENT_SECRET!,
            redirect_uri: process.env.NAVER_REDIRECT_URI!,
          },
        },
      ],
    };
  }
}

/**
 * Option 1: Using useFactory with ConfigService
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    OAuthModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        providers: [
          {
            name: 'google',
            credentials: {
              client_id: configService.get<string>('GOOGLE_CLIENT_ID')!,
              client_secret: configService.get<string>('GOOGLE_CLIENT_SECRET')!,
              redirect_uri: configService.get<string>('GOOGLE_REDIRECT_URI')!,
            },
          },
          {
            name: 'github',
            credentials: {
              client_id: configService.get<string>('GITHUB_CLIENT_ID')!,
              client_secret: configService.get<string>('GITHUB_CLIENT_SECRET')!,
              redirect_uri: configService.get<string>('GITHUB_REDIRECT_URI')!,
            },
          },
        ],
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModuleWithFactory {}

/**
 * Option 2: Using useClass
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    OAuthModule.forRootAsync({
      useClass: OAuthConfigService,
    }),
  ],
})
export class AppModuleWithClass {}

/**
 * Option 3: Using useExisting
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    OAuthModule.forRootAsync({
      useExisting: OAuthConfigService,
    }),
  ],
  providers: [OAuthConfigService],
})
export class AppModuleWithExisting {}

/**
 * Option 4: Global module configuration
 * When isGlobal is true, you don't need to import OAuthModule in other modules
 */
@Module({
  imports: [
    OAuthModule.forRoot({
      isGlobal: true,
      providers: [
        {
          name: 'google',
          credentials: {
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
          },
        },
      ],
    }),
  ],
})
export class AppModuleGlobal {}
