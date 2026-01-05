import { BaseOAuthProvider } from '../core/base-provider';
import {
  AuthUrlOptions,
  OAuthTokenResponse,
  TokenRefreshOptions,
  TokenRevokeOptions,
  UserInfoResponse,
} from '../types/provider.types';

/**
 * Kakao OAuth Provider
 */
export class KakaoProvider extends BaseOAuthProvider {
  get name(): string {
    return 'kakao';
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

    if (options.scope) params.scope = options.scope;
    if (options.state) params.state = options.state;
    if (options.prompt) params.prompt = options.prompt;
    if (options.login_hint) params.login_hint = options.login_hint;
    if (options.service_terms) params.service_terms = options.service_terms;
    if (options.nonce) params.nonce = options.nonce;

    return this.buildUrl('https://kauth.kakao.com/oauth/authorize', params);
  }

  protected async exchangeCodeForToken(
    code: string,
    _state?: string,
    _codeVerifier?: string,
  ): Promise<OAuthTokenResponse> {
    const data: Record<string, any> = {
      grant_type: 'authorization_code',
      client_id: this.credentials.client_id,
      redirect_uri: this.credentials.redirect_uri,
      code,
    };

    if (this.credentials.client_secret) {
      data.client_secret = this.credentials.client_secret;
    }

    return this.httpClient.post<OAuthTokenResponse>('https://kauth.kakao.com/oauth/token', data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
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

    return this.httpClient.post<OAuthTokenResponse>('https://kauth.kakao.com/oauth/token', data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    });
  }

  async revokeToken(options: TokenRevokeOptions): Promise<void> {
    // Kakao uses logout endpoint for token revocation
    await this.httpClient.post(
      'https://kapi.kakao.com/v1/user/logout',
      {
        target_id_type: 'user_id',
        target_id: options.target_id || '',
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          Authorization: `Bearer ${options.token}`,
        },
      },
    );
  }

  async getUserInfo(accessToken: string): Promise<UserInfoResponse> {
    return this.httpClient.get<UserInfoResponse>('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }
}
