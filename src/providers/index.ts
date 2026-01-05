/**
 * Provider registry
 * Maps provider names to their implementation classes
 */

import { BaseOAuthProvider } from '../core/base-provider';
import { ProviderCredentials } from '../types/provider.types';
import { GoogleProvider } from './google.provider';
import { KakaoProvider } from './kakao.provider';
import { NaverProvider } from './naver.provider';
import { GitHubProvider } from './github.provider';
import { FacebookProvider } from './facebook.provider';
import { XProvider } from './x.provider';

type ProviderConstructor = new (credentials: ProviderCredentials) => BaseOAuthProvider;

/**
 * Registry of available OAuth providers
 */
export const PROVIDER_REGISTRY: Record<string, ProviderConstructor> = {
  google: GoogleProvider,
  kakao: KakaoProvider,
  naver: NaverProvider,
  github: GitHubProvider,
  facebook: FacebookProvider,
  x: XProvider,
};

/**
 * Create a provider instance by name
 * @param providerName - Name of the provider (e.g., 'google', 'kakao')
 * @param credentials - Provider credentials
 * @returns Provider instance
 */
export function createProvider(
  providerName: string,
  credentials: ProviderCredentials,
): BaseOAuthProvider {
  const ProviderClass = PROVIDER_REGISTRY[providerName];

  if (!ProviderClass) {
    throw new Error(
      `Unknown provider: ${providerName}. Available providers: ${Object.keys(PROVIDER_REGISTRY).join(', ')}`,
    );
  }

  return new ProviderClass(credentials);
}

/**
 * Get list of available provider names
 * @returns Array of provider names
 */
export function getAvailableProviders(): string[] {
  return Object.keys(PROVIDER_REGISTRY);
}

/**
 * Check if a provider is available
 * @param providerName - Provider name to check
 * @returns True if provider exists
 */
export function hasProvider(providerName: string): boolean {
  return providerName in PROVIDER_REGISTRY;
}

// Export individual providers
export { GoogleProvider } from './google.provider';
export { KakaoProvider } from './kakao.provider';
export { NaverProvider } from './naver.provider';
export { GitHubProvider } from './github.provider';
export { FacebookProvider } from './facebook.provider';
export { XProvider } from './x.provider';
