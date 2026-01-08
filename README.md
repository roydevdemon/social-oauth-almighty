# nest-oauth-almighty

Server-side OAuth social authenticator supporting multiple providers with seamless integration for NestJS applications.

## Features

- 🔐 Multiple OAuth providers support (Google, GitHub, Facebook, X(Twitter), Kakao, Naver)
- 🚀 Easy NestJS integration with dynamic module
- 📦 TypeScript support with full type definitions
- 🎯 Simple and intuitive API
- 🔄 Token refresh and revoke support
- 🏗️ Class-based provider architecture
- 🔧 Extensible - add new providers by extending BaseOAuthProvider
- 🧪 Comprehensive test coverage

## Installation

```bash
# npm
npm install nest-oauth-almighty

# yarn
yarn add nest-oauth-almighty

# pnpm
pnpm add nest-oauth-almighty
```

## Quick Start

### 1. Set up environment variables

Create a `.env` file in your project root:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
GOOGLE_SCOPE=email profile

KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret
KAKAO_REDIRECT_URI=http://localhost:3000/auth/kakao/callback

# Add other providers as needed
FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret
FACEBOOK_REDIRECT_URI=http://localhost:3000/auth/facebook/callback

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:3000/auth/github/callback

X_CLIENT_ID=your_x_client_id
X_CLIENT_SECRET=your_x_client_secret
X_REDIRECT_URI=http://localhost:3000/auth/x/callback

NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
NAVER_REDIRECT_URI=http://localhost:3000/auth/naver/callback
```

### 2. Import the module

```typescript
import { Module } from '@nestjs/common';
import { OAuthModule } from 'nest-oauth-almighty';

@Module({
  imports: [
    OAuthModule.forRoot({
      providers: [
        {
          name: 'google',
          credentials: {
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI,
          },
        },
        {
          name: 'facebook',
          credentials: {
            client_id: process.env.FACEBOOK_CLIENT_ID,
            client_secret: process.env.FACEBOOK_CLIENT_SECRET,
            redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
            api_version: process.env.FACEBOOK_API_VERSION || 'v24.0',
          },
        },
        {
          name: 'github',
          credentials: {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            redirect_uri: process.env.GITHUB_REDIRECT_URI,
          },
        },
        {
          name: 'x',
          credentials: {
            client_id: process.env.X_CLIENT_ID,
            client_secret: process.env.X_CLIENT_SECRET,
            redirect_uri: process.env.X_REDIRECT_URI,
          },
        },
        {
          name: 'kakao',
          credentials: {
            client_id: process.env.KAKAO_CLIENT_ID,
            client_secret: process.env.KAKAO_CLIENT_SECRET,
            redirect_uri: process.env.KAKAO_REDIRECT_URI,
          },
        },
        {
          name: 'naver',
          credentials: {
            client_id: process.env.NAVER_CLIENT_ID,
            client_secret: process.env.NAVER_CLIENT_SECRET,
            redirect_uri: process.env.NAVER_REDIRECT_URI,
          },
        },
      ],
    }),
  ],
})
export class AppModule {}
```

### 3. Use in your controller

```typescript
import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { OAuthService } from 'nest-oauth-almighty';

@Controller('auth')
export class AuthController {
  constructor(private readonly oauthService: OAuthService) {}

  @Get('google')
  googleAuth(@Res() res: Response) {
    const url = this.oauthService.generateAuthUrl('google', {
      scope: 'email profile',
      state: 'random-state-string',
    });
    return res.redirect(url);
  }

  @Get('google/callback')
  async googleCallback(@Query('code') code: string, @Query('state') state: string) {
    const tokens = await this.oauthService.handleCallback('google', { code, state });
    const user = await this.oauthService.getUserInfo('google', tokens.access_token);

    return { tokens, user };
  }
}
```

## Supported Providers

| Provider | Status | Auth URL | Token Exchange | Token Refresh | Token Revoke | User Info |
|----------|--------|----------|----------------|---------------|--------------|-----------|
| Google | ✅ Ready | ✅ | ✅ | ✅ | ✅ | ✅ |
| Facebook | ✅ Ready | ✅ | ✅ | ✅ | ✅ | ✅ |
| GitHub | ✅ Ready | ✅ | ✅ | ✅ | ✅ | ✅ |
| X (Twitter) | ✅ Ready | ✅ | ✅ | ✅ | ✅ | ✅ |
| Kakao | ✅ Ready | ✅ | ✅ | ✅ | ✅ | ✅ |
| Naver | ✅ Ready | ✅ | ✅ | ✅ | ✅ | ✅ |

## API Reference

### OAuthModule

#### `forRoot(options: OAuthModuleOptions): DynamicModule`

Configure OAuth providers synchronously.

```typescript
OAuthModule.forRoot({
  isGlobal: true, // Optional: register as global module
  providers: [
    {
      name: 'google',
      credentials: {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      },
    },
  ],
})
```

#### `forRootAsync(options: OAuthModuleAsyncOptions): DynamicModule`

Configure OAuth providers asynchronously with dependency injection.

```typescript
OAuthModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    providers: [
      {
        name: 'google',
        credentials: {
          client_id: configService.get('GOOGLE_CLIENT_ID'),
          client_secret: configService.get('GOOGLE_CLIENT_SECRET'),
          redirect_uri: configService.get('GOOGLE_REDIRECT_URI'),
        },
      },
    ],
  }),
  inject: [ConfigService],
})
```

### OAuthService

#### `generateAuthUrl(providerName: string, options?: AuthUrlOptions): string`
Generate OAuth authorization URL.

```typescript
// Google
const googleUrl = oauthService.generateAuthUrl('google', {
  scope: 'email profile',
  state: 'random-state',
  access_type: 'offline', // 'online' or 'offline'
  include_granted_scopes: true, // Optional
  enable_granular_consent: true, // Optional
  login_hint: 'user@example.com', // Optional
  prompt: 'consent', // Optional: 'none', 'consent', 'select_account' 
});

// Facebook
const fbUrl = oauthService.generateAuthUrl('facebook', {
  state: 'random-state',
});

// Github
const githubUrl = oauthService.generateAuthUrl('github', {});

// X(Twitter)
const xUrl = oauthService.generateAuthUrl('x', {
  scope: process.env.X_SCOPE || 'tweet.read users.read',
  state: 'random-state-string',
  code_challenge: 'your-code-challenge',
  code_challenge_method: 'plain', // 'plain' or 'S256' 
});

// Kakao
const kakaoUrl = oauthService.generateAuthUrl('x', {
   scope: 'profile_nickname profile_image account_email',
  prompt: 'login', // Optional: 'none', 'login', 'create', 'select_account'
  login_hint: 'user@example.com', // Optional
  service_terms: 'service_term_tag', // Optional
  state: 'random-state-string', // Optional
  nonce: 'random-nonce-string', // Optional
});

// Naver 
const naverUrl = oauthService.generateAuthUrl('naver', {
  state: 'random-state-string', // Optional
});

```

#### `handleCallback(providerName: string, callbackParams: OAuthCallbackParams): Promise<OAuthTokenResponse>`

Handle OAuth callback and exchange authorization code for tokens.

```typescript
const token = await oauthService.handleCallback('google', {
  code: 'authorization-code',
  state: 'state-string',
});
```

#### `refreshToken(providerName: string, options: TokenRefreshOptions): Promise<OAuthTokenResponse>`

Refresh access token using refresh token.

```typescript
const newTokens = await oauthService.refreshToken('google', {
  refresh_token: 'refresh-token',
});
```

#### `revokeToken(providerName: string, options: TokenRevokeOptions): Promise<void>`

Revoke access or refresh token (logout).

```typescript
await oauthService.revokeToken('google', {
  token: 'access-or-refresh-token',
});
```

#### `getUserInfo(providerName: string, accessToken: string): Promise<UserInfoResponse>`

Get user information using access token.

```typescript
const user = await oauthService.getUserInfo('google', 'access-token');
```

## Important Security & Configuration Notes

### 1. Verify OAuth App Credentials

Ensure your OAuth app credentials are accurate:
- **Client ID**: Must match exactly with your OAuth provider's app configuration
- **Client Secret**: Must be the correct secret key from your provider
- **Redirect URI**: Must match the redirect URI registered in your OAuth provider's app settings

Any mismatch in these credentials will result in authentication failures.

### 2. Use Environment Variables

**Never hardcode credentials in your source code.** Always use environment variables.

**Good Practice:**
```typescript
{
  name: 'google',
  credentials: {
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
  },
}
```

**Bad Practice - Never do this!**
```typescript
{
  name: 'google',
  credentials: {
    client_id: 'your-actual-client-id',  // Don't hardcode!
    client_secret: 'your-actual-secret', // Don't hardcode!
    redirect_uri: 'http://localhost:3000/callback',
  },
}
```

**Important:** Add your `.env` file to `.gitignore` to prevent accidental commits:

```gitignore
.env
.env.local
.env.*.local
.env.production
```

### 3. REST API Authentication

This library uses **REST API OAuth authentication** (server-side flow):
- Client SDK keys (JavaScript SDK keys) will **NOT** work
- You must use REST API credentials from your OAuth provider
- Ensure your OAuth app is configured for "Web Application" or "Server-side" authentication, not "Client-side" or "JavaScript" authentication

### 4. Production Deployment Checklist

Before deploying to production, ensure you complete the following steps:

#### OAuth Provider Approvals
- **Kakao**: Submit app for review and obtain production approval
- **Naver**: Register business application and get approval
- **Google**: Verify your app if using sensitive scopes
- **Facebook**: Submit app for review and obtain production approval
- **GitHub**: Generally no approval needed for public apps
- **X (Twitter)**: Apply for Elevated access if needed

#### Security & Configuration
- ✅ **Update redirect URIs** to use your production domain
- ✅ **Use HTTPS** for all redirect URIs in production (required)
- ✅ **Implement proper error handling** for OAuth failures
- ✅ **Store tokens securely** (encrypted database, secure session storage)
- ✅ **Implement token refresh** before tokens expire
- ✅ **Set up monitoring** for OAuth authentication failures
- ✅ **Enable rate limiting** to prevent abuse
- ✅ **Implement CSRF protection** using the `state` parameter
- ✅ **Validate redirect URIs** on the server side

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Issues and Support

If you encounter any issues, bugs, or have questions:

- Check existing [Issues](https://github.com/roydevdemon/social-oauth-almighty/issues) to see if your problem has been reported
- Open a new [Issue](https://github.com/roydevdemon/social-oauth-almighty/issues/new) with detailed information:
  - OAuth provider you're using
  - Error messages or unexpected behavior
  - Minimal code example to reproduce the issue
  - Environment details (Node.js version, NestJS version, etc.)

We'll do our best to respond and help resolve any problems.

## License

MIT

## Author

roydevdemon
