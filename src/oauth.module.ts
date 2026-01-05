import { DynamicModule, Module, Provider } from '@nestjs/common';
import { OAuthService } from './services/oauth.service';
import {
  OAuthModuleOptions,
  OAuthModuleAsyncOptions,
  OAuthModuleOptionsFactory,
} from './types/module-options.types';

/**
 * OAuth Module for NestJS
 * Provides OAuth authentication for multiple social providers
 *
 * @example
 * ```ts
 * // Synchronous registration
 * OAuthModule.forRoot({
 *   providers: [
 *     {
 *       name: 'google',
 *       credentials: {
 *         client_id: process.env.GOOGLE_CLIENT_ID,
 *         client_secret: process.env.GOOGLE_CLIENT_SECRET,
 *         redirect_uri: process.env.GOOGLE_REDIRECT_URI
 *       }
 *     }
 *   ]
 * })
 *
 * // Asynchronous registration
 * OAuthModule.forRootAsync({
 *   useFactory: (configService: ConfigService) => ({
 *     providers: [
 *       {
 *         name: 'google',
 *         credentials: {
 *           client_id: configService.get('GOOGLE_CLIENT_ID'),
 *           client_secret: configService.get('GOOGLE_CLIENT_SECRET'),
 *           redirect_uri: configService.get('GOOGLE_REDIRECT_URI')
 *         }
 *       }
 *     ]
 *   }),
 *   inject: [ConfigService]
 * })
 * ```
 */
@Module({})
export class OAuthModule {
  /**
   * Register OAuth module with synchronous configuration
   * @param options - Module options
   * @returns Dynamic module
   */
  static forRoot(options: OAuthModuleOptions): DynamicModule {
    const providers: Provider[] = [
      {
        provide: 'OAUTH_MODULE_OPTIONS',
        useValue: options,
      },
      {
        provide: OAuthService,
        useFactory: (moduleOptions: OAuthModuleOptions) => {
          const service = new OAuthService();

          // Register all providers
          for (const providerConfig of moduleOptions.providers) {
            service.registerProvider(providerConfig.name, providerConfig.credentials);
          }

          return service;
        },
        inject: ['OAUTH_MODULE_OPTIONS'],
      },
    ];

    return {
      module: OAuthModule,
      providers,
      exports: [OAuthService],
      global: options.isGlobal || false,
    };
  }

  /**
   * Register OAuth module with asynchronous configuration
   * @param options - Async module options
   * @returns Dynamic module
   */
  static forRootAsync(options: OAuthModuleAsyncOptions): DynamicModule {
    const providers: Provider[] = [
      ...this.createAsyncProviders(options),
      {
        provide: OAuthService,
        useFactory: (moduleOptions: OAuthModuleOptions) => {
          const service = new OAuthService();

          // Register all providers
          for (const providerConfig of moduleOptions.providers) {
            service.registerProvider(providerConfig.name, providerConfig.credentials);
          }

          return service;
        },
        inject: ['OAUTH_MODULE_OPTIONS'],
      },
    ];

    return {
      module: OAuthModule,
      imports: options.imports || [],
      providers,
      exports: [OAuthService],
      global: options.isGlobal || false,
    };
  }

  /**
   * Creates async providers based on options
   * @param options - Async options
   * @returns Array of providers
   */
  private static createAsyncProviders(options: OAuthModuleAsyncOptions): Provider[] {
    if (options.useFactory) {
      return [
        {
          provide: 'OAUTH_MODULE_OPTIONS',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
      ];
    }

    if (options.useClass) {
      return [
        {
          provide: 'OAUTH_MODULE_OPTIONS',
          useFactory: async (optionsFactory: OAuthModuleOptionsFactory) =>
            optionsFactory.createOAuthOptions(),
          inject: [options.useClass],
        },
        {
          provide: options.useClass,
          useClass: options.useClass,
        },
      ];
    }

    if (options.useExisting) {
      return [
        {
          provide: 'OAUTH_MODULE_OPTIONS',
          useFactory: async (optionsFactory: OAuthModuleOptionsFactory) =>
            optionsFactory.createOAuthOptions(),
          inject: [options.useExisting],
        },
      ];
    }

    throw new Error('Invalid async options provided to OAuthModule');
  }
}
