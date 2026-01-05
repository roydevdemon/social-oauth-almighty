import { describe, it, expect, beforeEach } from 'vitest';
import { OAuthService } from './oauth.service';
import { ProviderCredentials } from '../types/provider.types';

describe('OAuthService', () => {
  let service: OAuthService;
  let credentials: ProviderCredentials;

  beforeEach(() => {
    service = new OAuthService();
    credentials = {
      client_id: 'test-client-id',
      client_secret: 'test-client-secret',
      redirect_uri: 'http://localhost:8000',
    };
  });

  describe('registerProvider', () => {
    it('should register a provider successfully', () => {
      expect(() =>
        service.registerProvider('google', credentials),
      ).not.toThrow();
      expect(service.getRegisteredProviders()).toContain('google');
    });

    it('should register multiple providers', () => {
      service.registerProvider('google', credentials);
      service.registerProvider('kakao', credentials);

      const providers = service.getRegisteredProviders();
      expect(providers).toContain('google');
      expect(providers).toContain('kakao');
      expect(providers).toHaveLength(2);
    });

    it('should throw error for unknown provider', () => {
      expect(() => service.registerProvider('unknown', credentials)).toThrow(
        'Unknown provider: unknown',
      );
    });
  });

  describe('getProvider', () => {
    it('should return registered provider', () => {
      service.registerProvider('google', credentials);
      const provider = service.getProvider('google');

      expect(provider).toBeDefined();
      expect(provider.name).toBe('google');
    });

    it('should throw error for unregistered provider', () => {
      expect(() => service.getProvider('google')).toThrow(
        "Provider 'google' is not registered",
      );
    });
  });

  describe('generateAuthUrl', () => {
    it('should generate auth URL for registered provider', () => {
      service.registerProvider('google', credentials);
      const url = service.generateAuthUrl('google', { scope: 'email' });

      expect(url).toContain('https://accounts.google.com/o/oauth2/v2/auth');
      expect(url).toContain('client_id=test-client-id');
    });

    it('should throw error for unregistered provider', () => {
      expect(() =>
        service.generateAuthUrl('google', { scope: 'email' }),
      ).toThrow();
    });
  });

  describe('getRegisteredProviders', () => {
    it('should return empty array when no providers registered', () => {
      expect(service.getRegisteredProviders()).toEqual([]);
    });

    it('should return list of registered providers', () => {
      service.registerProvider('google', credentials);
      service.registerProvider('kakao', credentials);

      const providers = service.getRegisteredProviders();
      expect(providers).toHaveLength(2);
      expect(providers).toEqual(expect.arrayContaining(['google', 'kakao']));
    });
  });
});
