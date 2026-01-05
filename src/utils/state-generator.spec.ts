import { describe, it, expect } from 'vitest';
import { createHash } from 'crypto';
import { generateState, generatePKCE, generateNonce } from './state-generator';

describe('State Generator', () => {
  describe('generateState', () => {
    it('should generate a random state string', () => {
      const state = generateState();
      expect(state).toBeDefined();
      expect(typeof state).toBe('string');
      expect(state.length).toBeGreaterThan(0);
    });

    it('should generate different states on each call', () => {
      const state1 = generateState();
      const state2 = generateState();
      expect(state1).not.toBe(state2);
    });

    it('should generate state with custom length', () => {
      const state = generateState(16);
      expect(state).toBeDefined();
      // base64url encoding will produce longer strings than the input bytes
      expect(state.length).toBeGreaterThan(0);
    });

    it('should generate URL-safe characters', () => {
      const state = generateState();
      // base64url should not contain +, /, or =
      expect(state).not.toMatch(/[+\/=]/);
    });
  });

  describe('generatePKCE', () => {
    it('should generate PKCE parameters', () => {
      const pkce = generatePKCE();
      expect(pkce).toBeDefined();
      expect(pkce.code_verifier).toBeDefined();
      expect(pkce.code_challenge).toBeDefined();
      expect(pkce.code_challenge_method).toBe('S256');
    });

    it('should generate different verifiers on each call', () => {
      const pkce1 = generatePKCE();
      const pkce2 = generatePKCE();
      expect(pkce1.code_verifier).not.toBe(pkce2.code_verifier);
      expect(pkce1.code_challenge).not.toBe(pkce2.code_challenge);
    });

    it('should generate URL-safe code verifier', () => {
      const pkce = generatePKCE();
      // base64url should not contain +, /, or =
      expect(pkce.code_verifier).not.toMatch(/[+\/=]/);
    });

    it('should generate URL-safe code challenge', () => {
      const pkce = generatePKCE();
      // base64url should not contain +, /, or =
      expect(pkce.code_challenge).not.toMatch(/[+\/=]/);
    });

    it('should generate deterministic challenge from verifier', () => {
      // Same verifier should produce same challenge
      const pkce = generatePKCE();
      const expectedChallenge = createHash('sha256')
        .update(pkce.code_verifier)
        .digest('base64url');
      expect(pkce.code_challenge).toBe(expectedChallenge);
    });
  });

  describe('generateNonce', () => {
    it('should generate a random nonce string', () => {
      const nonce = generateNonce();
      expect(nonce).toBeDefined();
      expect(typeof nonce).toBe('string');
      expect(nonce.length).toBeGreaterThan(0);
    });

    it('should generate different nonces on each call', () => {
      const nonce1 = generateNonce();
      const nonce2 = generateNonce();
      expect(nonce1).not.toBe(nonce2);
    });

    it('should generate nonce with custom length', () => {
      const nonce = generateNonce(16);
      expect(nonce).toBeDefined();
      expect(nonce.length).toBeGreaterThan(0);
    });

    it('should generate URL-safe characters', () => {
      const nonce = generateNonce();
      // base64url should not contain +, /, or =
      expect(nonce).not.toMatch(/[+\/=]/);
    });
  });
});
