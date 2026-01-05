/**
 * Provider configuration types
 */

/**
 * HTTP method types
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * Provider credentials from environment variables
 */
export interface ProviderCredentials {
  client_id: string;
  client_secret: string;
  redirect_uri?: string;
  api_version?: string;
  [key: string]: string | undefined;
}

/**
 * OAuth token response
 */
export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
  scope?: string;
  id_token?: string;
  [key: string]: any;
}

/**
 * OAuth callback query parameters
 */
export interface OAuthCallbackParams {
  code?: string;
  state?: string;
  error?: string;
  error_description?: string;
  [key: string]: string | undefined;
}

/**
 * User info response (generic)
 */
export interface UserInfoResponse {
  [key: string]: any;
}

/**
 * Options for generating authorization URL
 */
export interface AuthUrlOptions {
  scope?: string | string[];
  state?: string;
  code_challenge?: string; // For PKCE (X/Twitter)
  code_challenge_method?: string; // For PKCE (X/Twitter)
  [key: string]: any;
}

/**
 * Options for token refresh
 */
export interface TokenRefreshOptions {
  refresh_token: string;
}

/**
 * Options for token revoke
 */
export interface TokenRevokeOptions {
  token: string;
  token_type_hint?: 'access_token' | 'refresh_token';
  target_id?: string; // For Kakao
  [key: string]: any; // Allow provider-specific fields
}
