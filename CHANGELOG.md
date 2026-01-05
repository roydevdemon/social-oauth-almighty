# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.2] - 2026-01-05

### Added
- PKCE (Proof Key for Code Exchange) support for X (Twitter) OAuth provider
- `code_verifier` parameter support in `OAuthCallbackParams` interface
- Enhanced `exchangeCodeForToken` method to accept optional `codeVerifier` parameter across all providers

### Changed
- Updated `BaseOAuthProvider.exchangeCodeForToken()` signature to include optional `codeVerifier` parameter
- Updated `handleCallback()` to pass `code_verifier` from callback parameters to token exchange
- All provider implementations now accept `codeVerifier` parameter (backward compatible)

### Technical Details
- X Provider now properly supports PKCE flow with code_verifier validation
- Other providers (Google, GitHub, Kakao, Facebook, Naver) accept but ignore the parameter for compatibility

## [0.0.1] - 2026-01-05

### Added
- Initial release
- Support for 6 OAuth providers: Google, Kakao, Naver, GitHub, Facebook, X(Twitter)
- NestJS module integration
- TypeScript support with full type definitions
- HTTP client with automatic form encoding and Basic Auth
- State and PKCE generator utilities
- Comprehensive test coverage
- TypeDoc documentation

### Features

#### Providers
- ✅ Google OAuth 2.0
- ✅ Kakao OAuth 2.0
- ✅ Naver OAuth 2.0
- ✅ GitHub OAuth 2.0
- ✅ Facebook OAuth 2.0
- ✅ X (Twitter) OAuth 2.0 with PKCE

#### Core Features
- OAuth URL generation
- Token exchange
- Token refresh
- Token revocation
- User info retrieval
- State parameter generation (CSRF protection)
- PKCE support (Proof Key for Code Exchange)
- Nonce generation (OpenID Connect)

#### Developer Experience
- Full TypeScript support
- Type-safe API
- NestJS dependency injection
- Extensible provider system
- Comprehensive documentation
- Usage examples

## [0.0.1] - YYYY-MM-DD

### Added
- Initial setup and project structure
- Core OAuth implementation
- Provider system architecture
- Test suite
- Documentation

[Unreleased]: https://github.com/roydevdemon/social-oauth-almighty/compare/v0.0.2...HEAD
[0.0.2]: https://github.com/roydevdemon/social-oauth-almighty/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/roydevdemon/social-oauth-almighty/releases/tag/v0.0.1
