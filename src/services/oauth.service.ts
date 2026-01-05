import { Injectable } from '@nestjs/common';
import { BaseOAuthProvider } from '../core/base-provider';
import {
  ProviderCredentials,
  AuthUrlOptions,
  OAuthCallbackParams,
  OAuthTokenResponse,
  TokenRefreshOptions,
  TokenRevokeOptions,
  UserInfoResponse,
} from '../types/provider.types';
import { createProvider, getAvailableProviders } from '../providers';

/**
 * OAuth Service
 * Main service for handling OAuth operations across multiple providers
 */
@Injectable()
export class OAuthService {
  private providers: Map<string, BaseOAuthProvider> = new Map();

  /**
   * Registers a new OAuth provider
   * @param providerName - Name of the provider (e.g., 'google', 'kakao')
   * @param credentials - Provider credentials from environment variables
   *
   * @example
   * ```ts
   * oauthService.registerProvider('google', {
   *   client_id: process.env.GOOGLE_CLIENT_ID,
   *   client_secret: process.env.GOOGLE_CLIENT_SECRET,
   *   redirect_uri: process.env.GOOGLE_REDIRECT_URI
   * });
   * ```
   */
  registerProvider(providerName: string, credentials: ProviderCredentials): void {
    const provider = createProvider(providerName, credentials);
    this.providers.set(providerName, provider);
  }

  /**
   * Gets a registered provider instance
   * @param providerName - Name of the provider
   * @returns OAuth provider instance
   * @throws Error if provider is not registered
   */
  getProvider(providerName: string): BaseOAuthProvider {
    const provider = this.providers.get(providerName);
    if (!provider) {
      const registered = Array.from(this.providers.keys()).join(', ');
      const available = getAvailableProviders().join(', ');
      throw new Error(
        `Provider '${providerName}' is not registered. ` +
          `Registered: ${registered || 'none'}. ` +
          `Available: ${available}`,
      );
    }
    return provider;
  }

  /**
   * Gets list of registered provider names
   * @returns Array of provider names
   */
  getRegisteredProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Generates authorization URL for a provider
   * @param providerName - Name of the provider
   * @param options - Authorization options
   * @returns Authorization URL
   *
   * @example
   * ```ts
   * const url = oauthService.generateAuthUrl('google', {
   *   scope: 'email profile',
   *   state: 'random-state'
   * });
   * ```
   */
  generateAuthUrl(providerName: string, options: AuthUrlOptions = {}): string {
    const provider = this.getProvider(providerName);
    return provider.generateAuthUrl(options);
  }

  /**
   * Handles OAuth callback and exchanges code for tokens
   * @param providerName - Name of the provider
   * @param callbackParams - Callback query parameters
   * @returns Token response
   *
   * @example
   * ```ts
   * const tokens = await oauthService.handleCallback('google', {
   *   code: req.query.code,
   *   state: req.query.state
   * });
   * ```
   */
  async handleCallback(
    providerName: string,
    callbackParams: OAuthCallbackParams,
  ): Promise<OAuthTokenResponse> {
    const provider = this.getProvider(providerName);
    return provider.handleCallback(callbackParams);
  }

  /**
   * Refreshes access token
   * @param providerName - Name of the provider
   * @param options - Refresh options
   * @returns New token response
   *
   * @example
   * ```ts
   * const newTokens = await oauthService.refreshToken('google', {
   *   refresh_token: 'existing-refresh-token'
   * });
   * ```
   */
  async refreshToken(
    providerName: string,
    options: TokenRefreshOptions,
  ): Promise<OAuthTokenResponse> {
    const provider = this.getProvider(providerName);
    return provider.refreshToken(options);
  }

  /**
   * Revokes access or refresh token
   * @param providerName - Name of the provider
   * @param options - Revoke options
   *
   * @example
   * ```ts
   * await oauthService.revokeToken('google', {
   *   token: 'access-or-refresh-token'
   * });
   * ```
   */
  async revokeToken(providerName: string, options: TokenRevokeOptions): Promise<void> {
    const provider = this.getProvider(providerName);
    return provider.revokeToken(options);
  }

  /**
   * Gets user information using access token
   * @param providerName - Name of the provider
   * @param accessToken - OAuth access token
   * @returns User information
   *
   * @example
   * ```ts
   * const user = await oauthService.getUserInfo('google', 'access-token');
   * ```
   */
  async getUserInfo(providerName: string, accessToken: string): Promise<UserInfoResponse> {
    const provider = this.getProvider(providerName);
    return provider.getUserInfo(accessToken);
  }
}
