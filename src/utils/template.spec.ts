import { describe, it, expect } from 'vitest';
import { replaceTemplate, buildQueryString, buildUrl } from './template';

describe('Template Utils', () => {
  describe('replaceTemplate', () => {
    it('should replace single variable', () => {
      const result = replaceTemplate('Hello {{name}}', { name: 'World' });
      expect(result).toBe('Hello World');
    });

    it('should replace multiple variables', () => {
      const result = replaceTemplate('{{greeting}} {{name}}', {
        greeting: 'Hello',
        name: 'World',
      });
      expect(result).toBe('Hello World');
    });

    it('should handle missing variables', () => {
      const result = replaceTemplate('Hello {{name}}', {});
      expect(result).toBe('Hello {{name}}');
    });

    it('should replace variables in URLs', () => {
      const result = replaceTemplate(
        'https://api.example.com/{{version}}/users',
        { version: 'v1' },
      );
      expect(result).toBe('https://api.example.com/v1/users');
    });
  });

  describe('buildQueryString', () => {
    it('should build query string from object', () => {
      const result = buildQueryString({ foo: 'bar', baz: 'qux' });
      expect(result).toContain('foo=bar');
      expect(result).toContain('baz=qux');
    });

    it('should handle array values', () => {
      const result = buildQueryString({ scope: ['email', 'profile'] });
      expect(result).toBe('scope=email+profile');
    });

    it('should skip undefined values', () => {
      const result = buildQueryString({ foo: 'bar', baz: undefined });
      expect(result).toBe('foo=bar');
    });

    it('should handle empty object', () => {
      const result = buildQueryString({});
      expect(result).toBe('');
    });
  });

  describe('buildUrl', () => {
    it('should build URL with query parameters', () => {
      const result = buildUrl('https://example.com/auth', {
        client_id: '123',
        redirect_uri: 'http://localhost/callback',
      });
      expect(result).toContain('https://example.com/auth?');
      expect(result).toContain('client_id=123');
    });

    it('should return base URL when no params', () => {
      const result = buildUrl('https://example.com/auth', {});
      expect(result).toBe('https://example.com/auth');
    });
  });
});
