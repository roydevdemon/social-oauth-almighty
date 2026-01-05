import { BaseOAuthProvider } from '../core/base-provider';
import {
  AuthUrlOptions,
  OAuthTokenResponse,
  TokenRefreshOptions,
  TokenRevokeOptions,
  UserInfoResponse,
} from '../types/provider.types';

/**
 * X (Twitter) OAuth Provider
 */
export class XProvider extends BaseOAuthProvider {
  get name(): string {
    return 'x';
  }

  protected getRequiredCredentials(): string[] {
    return ['client_id', 'client_secret', 'redirect_uri'];
  }

  generateAuthUrl(options: AuthUrlOptions = {}): string {
    const params: Record<string, any> = {
      response_type: 'code',
      client_id: this.credentials.client_id,
      redirect_uri: this.credentials.redirect_uri,
      scope: options.scope || 'tweet.read users.read',
    };

    if (options.state) params.state = options.state;
    if (options.code_challenge) params.code_challenge = options.code_challenge;
    if (options.code_challenge_method) params.code_challenge_method = options.code_challenge_method;

    return this.buildUrl('https://x.com/i/oauth2/authorize', params);
  }

  protected async exchangeCodeForToken(
    code: string,
    _state?: string,
    codeVerifier?: string,
  ): Promise<OAuthTokenResponse> {
    const data: Record<string, any> = {
      grant_type: 'authorization_code',
      code,
      client_id: this.credentials.client_id,
      redirect_uri: this.credentials.redirect_uri,
    };

    if (codeVerifier) {
      data.code_verifier = codeVerifier;
    }

    return this.httpClient.post<OAuthTokenResponse>('https://api.x.com/2/oauth2/token', data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      auth: {
        username: this.credentials.client_id,
        password: this.credentials.client_secret,
      },
    });
  }

  async refreshToken(options: TokenRefreshOptions): Promise<OAuthTokenResponse> {
    const data = {
      grant_type: 'refresh_token',
      refresh_token: options.refresh_token,
      client_id: this.credentials.client_id,
    };

    return this.httpClient.post<OAuthTokenResponse>('https://api.x.com/2/oauth2/token', data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      auth: {
        username: this.credentials.client_id,
        password: this.credentials.client_secret,
      },
    });
  }

  async revokeToken(options: TokenRevokeOptions): Promise<void> {
    await this.httpClient.post(
      'https://api.x.com/2/oauth2/revoke',
      {
        token: options.token,
        client_id: this.credentials.client_id,
        token_type_hint: options.token_type_hint || 'access_token',
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        auth: {
          username: this.credentials.client_id,
          password: this.credentials.client_secret,
        },
      },
    );
  }

  async getUserInfo(accessToken: string): Promise<UserInfoResponse> {
    return this.httpClient.get<UserInfoResponse>('https://api.x.com/2/users/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }
}
