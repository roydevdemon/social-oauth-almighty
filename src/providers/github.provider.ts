import { BaseOAuthProvider } from '../core/base-provider';
import {
  AuthUrlOptions,
  OAuthTokenResponse,
  TokenRefreshOptions,
  TokenRevokeOptions,
  UserInfoResponse,
} from '../types/provider.types';

/**
 * GitHub OAuth Provider
 */
export class GitHubProvider extends BaseOAuthProvider {
  get name(): string {
    return 'github';
  }

  protected getRequiredCredentials(): string[] {
    return ['client_id', 'client_secret', 'redirect_uri'];
  }

  generateAuthUrl(options: AuthUrlOptions = {}): string {
    const params: Record<string, any> = {
      client_id: this.credentials.client_id,
      redirect_uri: this.credentials.redirect_uri,
    };

    if (options.scope) params.scope = options.scope;
    if (options.state) params.state = options.state;
    if (options.allow_signup !== undefined) params.allow_signup = options.allow_signup;

    return this.buildUrl('https://github.com/login/oauth/authorize', params);
  }

  protected async exchangeCodeForToken(
    code: string,
    _state?: string,
    _codeVerifier?: string,
  ): Promise<OAuthTokenResponse> {
    const data = {
      client_id: this.credentials.client_id,
      client_secret: this.credentials.client_secret,
      code,
      redirect_uri: this.credentials.redirect_uri,
    };

    return this.httpClient.post<OAuthTokenResponse>(
      'https://github.com/login/oauth/access_token',
      data,
      {
        headers: {
          Accept: 'application/json',
        },
      },
    );
  }

  async refreshToken(options: TokenRefreshOptions): Promise<OAuthTokenResponse> {
    const data = {
      grant_type: 'refresh_token',
      client_id: this.credentials.client_id,
      client_secret: this.credentials.client_secret,
      refresh_token: options.refresh_token,
    };

    return this.httpClient.post<OAuthTokenResponse>(
      'https://github.com/login/oauth/access_token',
      data,
      {
        headers: {
          Accept: 'application/json',
        },
      },
    );
  }

  async revokeToken(options: TokenRevokeOptions): Promise<void> {
    await this.httpClient.delete(
      `https://api.github.com/applications/${this.credentials.client_id}/token`,
      {
        data: {
          access_token: options.token,
        },
        headers: {
          Accept: 'application/vnd.github+json',
        },
        auth: {
          username: this.credentials.client_id,
          password: this.credentials.client_secret,
        },
      },
    );
  }

  async getUserInfo(accessToken: string): Promise<UserInfoResponse> {
    return this.httpClient.get<UserInfoResponse>('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
      },
    });
  }
}
