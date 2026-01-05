import { BaseOAuthProvider } from '../core/base-provider';
import {
  AuthUrlOptions,
  OAuthTokenResponse,
  TokenRefreshOptions,
  TokenRevokeOptions,
  UserInfoResponse,
} from '../types/provider.types';

/**
 * Facebook OAuth Provider
 */
export class FacebookProvider extends BaseOAuthProvider {
  get name(): string {
    return 'facebook';
  }

  protected getRequiredCredentials(): string[] {
    return ['client_id', 'client_secret', 'redirect_uri', 'api_version'];
  }

  generateAuthUrl(options: AuthUrlOptions = {}): string {
    const apiVersion = this.credentials.api_version || 'v18.0';
    const params: Record<string, any> = {
      client_id: this.credentials.client_id,
      redirect_uri: this.credentials.redirect_uri,
      response_type: 'code',
      scope: options.scope || 'public_profile,email',
    };

    if (options.state) params.state = options.state;

    return this.buildUrl(`https://www.facebook.com/${apiVersion}/dialog/oauth`, params);
  }

  protected async exchangeCodeForToken(
    code: string,
    _state?: string,
    _codeVerifier?: string,
  ): Promise<OAuthTokenResponse> {
    const apiVersion = this.credentials.api_version || 'v18.0';

    // Step 1: Get short-lived access token
    const shortLivedToken = await this.httpClient.get<OAuthTokenResponse>(
      `https://graph.facebook.com/${apiVersion}/oauth/access_token`,
      {
        params: {
          client_id: this.credentials.client_id,
          redirect_uri: this.credentials.redirect_uri,
          client_secret: this.credentials.client_secret,
          code,
        },
      },
    );

    // Step 2: Exchange for long-lived token (60 days)
    return this.httpClient.get<OAuthTokenResponse>(
      `https://graph.facebook.com/${apiVersion}/oauth/access_token`,
      {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: this.credentials.client_id,
          client_secret: this.credentials.client_secret,
          fb_exchange_token: shortLivedToken.access_token,
        },
      },
    );
  }

  async refreshToken(options: TokenRefreshOptions): Promise<OAuthTokenResponse> {
    const apiVersion = this.credentials.api_version || 'v18.0';

    // Facebook doesn't support traditional refresh tokens
    // Instead, re-exchange the long-lived token to extend its validity
    return this.httpClient.get<OAuthTokenResponse>(
      `https://graph.facebook.com/${apiVersion}/oauth/access_token`,
      {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: this.credentials.client_id,
          client_secret: this.credentials.client_secret,
          fb_exchange_token: options.refresh_token,
        },
      },
    );
  }

  async revokeToken(options: TokenRevokeOptions): Promise<void> {
    const apiVersion = this.credentials.api_version || 'v18.0';

    await this.httpClient.delete(`https://graph.facebook.com/${apiVersion}/me/permissions`, {
      headers: {
        Authorization: `Bearer ${options.token}`,
      },
    });
  }

  async getUserInfo(accessToken: string): Promise<UserInfoResponse> {
    const apiVersion = this.credentials.api_version || 'v18.0';

    return this.httpClient.get<UserInfoResponse>(`https://graph.facebook.com/${apiVersion}/me`, {
      params: {
        fields: 'id,name,email,first_name,last_name,picture',
        access_token: accessToken,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    });
  }
}
