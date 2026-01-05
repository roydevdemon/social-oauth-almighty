import { randomBytes, createHash } from 'crypto';

/**
 * Generate a cryptographically secure random state parameter for OAuth
 * @param length - Length of the state string (default: 32)
 * @returns Random state string
 */
export function generateState(length: number = 32): string {
  return randomBytes(length).toString('base64url');
}

/**
 * Generate PKCE (Proof Key for Code Exchange) parameters
 * @returns Object containing code_verifier and code_challenge
 */
export function generatePKCE(): {
  code_verifier: string;
  code_challenge: string;
  code_challenge_method: 'S256';
} {
  // Generate random code verifier (43-128 characters)
  const code_verifier = randomBytes(32).toString('base64url');

  // Generate code challenge using SHA256
  const code_challenge = createHash('sha256').update(code_verifier).digest('base64url');

  return {
    code_verifier,
    code_challenge,
    code_challenge_method: 'S256',
  };
}

/**
 * Generate a random nonce for OpenID Connect
 * @param length - Length of the nonce string (default: 32)
 * @returns Random nonce string
 */
export function generateNonce(length: number = 32): string {
  return randomBytes(length).toString('base64url');
}
