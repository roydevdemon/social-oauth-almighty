import { ModuleMetadata, Type } from '@nestjs/common';
import { ProviderCredentials } from './provider.types';

/**
 * Provider configuration for module registration
 */
export interface OAuthProviderConfig {
  name: string;
  credentials: ProviderCredentials;
}

/**
 * Options for OAuthModule registration
 */
export interface OAuthModuleOptions {
  /**
   * List of providers to register
   */
  providers: OAuthProviderConfig[];

  /**
   * Whether to register as global module (default: false)
   */
  isGlobal?: boolean;
}

/**
 * Factory for creating OAuthModuleOptions asynchronously
 */
export interface OAuthModuleOptionsFactory {
  createOAuthOptions(): Promise<OAuthModuleOptions> | OAuthModuleOptions;
}

/**
 * Async options for OAuthModule registration
 */
export interface OAuthModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  /**
   * Whether to register as global module (default: false)
   */
  isGlobal?: boolean;

  /**
   * Factory function to create options
   */
  useFactory?: (...args: any[]) => Promise<OAuthModuleOptions> | OAuthModuleOptions;

  /**
   * Dependencies to inject into useFactory
   */
  inject?: any[];

  /**
   * Class to use for creating options
   */
  useClass?: Type<OAuthModuleOptionsFactory>;

  /**
   * Existing instance to use for creating options
   */
  useExisting?: Type<OAuthModuleOptionsFactory>;
}
