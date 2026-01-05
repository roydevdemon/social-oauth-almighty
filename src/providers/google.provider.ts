import { BaseOAuthProvider } from '../core/base-provider';
import {
  AuthUrlOptions,
  OAuthTokenResponse,
  TokenRefreshOptions,
  TokenRevokeOptions,
  UserInfoResponse,
} from '../types/provider.types';

/**
 * Google OAuth Provider
 */
export class GoogleProvider extends BaseOAuthProvider {
  get name(): string {
    return 'google';
  }

  protected getRequiredCredentials(): string[] {
    return ['client_id', 'client_secret', 'redirect_uri'];
  }

  generateAuthUrl(options: AuthUrlOptions = {}): string {
    const params: Record<string, any> = {
      client_id: this.credentials.client_id,
      redirect_uri: this.credentials.redirect_uri,
      response_type: 'code',
      scope: options.scope || 'email profile',
      access_type: options.access_type || 'offline',
    };

    if (options.state) params.state = options.state;
    if (options.include_granted_scopes !== undefined)
      params.include_granted_scopes = options.include_granted_scopes;
    if (options.enable_granular_consent !== undefined)
      params.enable_granular_consent = options.enable_granular_consent;
    if (options.login_hint) params.login_hint = options.login_hint;
    if (options.prompt) params.prompt = options.prompt;

    return this.buildUrl('https://accounts.google.com/o/oauth2/v2/auth', params);
  }

  protected async exchangeCodeForToken(
    code: string,
    _state?: string,
    _codeVerifier?: string,
  ): Promise<OAuthTokenResponse> {
    const data = {
      code,
      client_id: this.credentials.client_id,
      client_secret: this.credentials.client_secret,
      redirect_uri: this.credentials.redirect_uri,
      grant_type: 'authorization_code',
    };

    return this.httpClient.post<OAuthTokenResponse>('https://oauth2.googleapis.com/token', data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  async refreshToken(options: TokenRefreshOptions): Promise<OAuthTokenResponse> {
    const data: Record<string, any> = {
      grant_type: 'refresh_token',
      client_id: this.credentials.client_id,
      refresh_token: options.refresh_token,
    };

    if (this.credentials.client_secret) {
      data.client_secret = this.credentials.client_secret;
    }

    return this.httpClient.post<OAuthTokenResponse>('https://oauth2.googleapis.com/token', data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    });
  }

  async revokeToken(options: TokenRevokeOptions): Promise<void> {
    await this.httpClient.post(
      'https://oauth2.googleapis.com/revoke',
      {
        token: options.token,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
  }

  async getUserInfo(accessToken: string): Promise<UserInfoResponse> {
    return this.httpClient.get<UserInfoResponse>('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }
}
