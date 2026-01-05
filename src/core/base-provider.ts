import {
  ProviderCredentials,
  AuthUrlOptions,
  OAuthTokenResponse,
  TokenRefreshOptions,
  TokenRevokeOptions,
  UserInfoResponse,
  OAuthCallbackParams,
} from '../types/provider.types';
import { HttpClient } from '../utils/http-client';
import { buildUrl } from '../utils/template';

/**
 * Abstract base class for OAuth providers
 * Each provider extends this class and implements provider-specific logic
 */
export abstract class BaseOAuthProvider {
  protected httpClient: HttpClient;

  constructor(protected readonly credentials: ProviderCredentials) {
    this.httpClient = new HttpClient();
    this.validateCredentials();
  }

  /**
   * Get the provider name
   */
  abstract get name(): string;

  /**
   * Validate required credentials
   */
  protected validateCredentials(): void {
    const required = this.getRequiredCredentials();
    for (const field of required) {
      if (!this.credentials[field]) {
        throw new Error(`Missing required credential: ${field} for provider ${this.name}`);
      }
    }
  }

  /**
   * Get list of required credential fields
   */
  protected abstract getRequiredCredentials(): string[];

  /**
   * Generate OAuth authorization URL
   */
  abstract generateAuthUrl(options?: AuthUrlOptions): string;

  /**
   * Handle OAuth callback
   */
  async handleCallback(callbackParams: OAuthCallbackParams): Promise<OAuthTokenResponse> {
    if (callbackParams.error) {
      throw new Error(
        `OAuth error: ${callbackParams.error} - ${callbackParams.error_description || ''}`,
      );
    }

    if (!callbackParams.code) {
      throw new Error('Missing authorization code in callback');
    }

    return this.exchangeCodeForToken(callbackParams.code, callbackParams.state);
  }

  /**
   * Exchange authorization code for access token
   */
  protected abstract exchangeCodeForToken(
    code: string,
    state?: string,
  ): Promise<OAuthTokenResponse>;

  /**
   * Refresh access token
   */
  abstract refreshToken(options: TokenRefreshOptions): Promise<OAuthTokenResponse>;

  /**
   * Revoke token (logout)
   */
  abstract revokeToken(options: TokenRevokeOptions): Promise<void>;

  /**
   * Get user information
   */
  abstract getUserInfo(accessToken: string): Promise<UserInfoResponse>;

  /**
   * Build URL with query parameters
   */
  protected buildUrl(baseUrl: string, params: Record<string, any>): string {
    return buildUrl(baseUrl, params);
  }
}
