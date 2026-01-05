import { BaseOAuthProvider } from '../core/base-provider';
import {
  AuthUrlOptions,
  OAuthTokenResponse,
  TokenRefreshOptions,
  TokenRevokeOptions,
  UserInfoResponse,
} from '../types/provider.types';

/**
 * Naver OAuth Provider
 */
export class NaverProvider extends BaseOAuthProvider {
  get name(): string {
    return 'naver';
  }

  protected getRequiredCredentials(): string[] {
    return ['client_id', 'client_secret', 'redirect_uri'];
  }

  generateAuthUrl(options: AuthUrlOptions = {}): string {
    const params: Record<string, any> = {
      client_id: this.credentials.client_id,
      redirect_uri: this.credentials.redirect_uri,
      response_type: 'code',
    };

    if (options.state) params.state = options.state;

    return this.buildUrl('https://nid.naver.com/oauth2.0/authorize', params);
  }

  protected async exchangeCodeForToken(
    code: string,
    state?: string,
    _codeVerifier?: string,
  ): Promise<OAuthTokenResponse> {
    const data: Record<string, any> = {
      grant_type: 'authorization_code',
      client_id: this.credentials.client_id,
      client_secret: this.credentials.client_secret,
      code,
    };

    if (state) data.state = state;

    return this.httpClient.post<OAuthTokenResponse>('https://nid.naver.com/oauth2.0/token', data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    });
  }

  async refreshToken(options: TokenRefreshOptions): Promise<OAuthTokenResponse> {
    const data = {
      grant_type: 'refresh_token',
      client_id: this.credentials.client_id,
      client_secret: this.credentials.client_secret,
      refresh_token: options.refresh_token,
    };

    return this.httpClient.post<OAuthTokenResponse>('https://nid.naver.com/oauth2.0/token', data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    });
  }

  async revokeToken(options: TokenRevokeOptions): Promise<void> {
    await this.httpClient.post(
      'https://nid.naver.com/oauth2.0/token',
      {
        grant_type: 'delete',
        client_id: this.credentials.client_id,
        client_secret: this.credentials.client_secret,
        access_token: options.token,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      },
    );
  }

  async getUserInfo(accessToken: string): Promise<UserInfoResponse> {
    return this.httpClient.get<UserInfoResponse>('https://openapi.naver.com/v1/nid/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }
}
