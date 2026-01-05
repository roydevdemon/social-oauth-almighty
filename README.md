# nest-oauth-almighty

Server-side OAuth social authenticator supporting multiple providers with seamless integration for NestJS applications.

## Features

- 🔐 Multiple OAuth providers support (Google, GitHub, Kakao, Naver)
- 🚀 Easy NestJS integration with dynamic module
- 📦 TypeScript support with full type definitions
- 🎯 Simple and intuitive API
- 🔄 Token refresh and revoke support
- 🏗️ Class-based provider architecture
- 🔧 Extensible - add new providers by extending BaseOAuthProvider
- 🧪 Comprehensive test coverage
- 🎨 Clean code with no runtime YAML dependencies

## Installation

```bash
npm install nest-oauth-almighty
```

## Quick Start

### 1. Set up environment variables

Create a `.env` file in your project root:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret
KAKAO_REDIRECT_URI=http://localhost:3000/auth/kakao/callback
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
          name: 'kakao',
          credentials: {
            client_id: process.env.KAKAO_CLIENT_ID,
            client_secret: process.env.KAKAO_CLIENT_SECRET,
            redirect_uri: process.env.KAKAO_REDIRECT_URI,
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

| Provider | Status | 
|----------|--------|
| Google | ✅ Ready | 
| Facebook | ✅ Ready | 
| GitHub | ✅ Ready | 
| X(Twitter) | ✅ Ready | 
| Kakao | ✅ Ready | 
| Naver | ✅ Ready | 

All providers support:
- ✅ Authorization URL generation
- ✅ OAuth callback handling
- ✅ Token exchange
- ✅ Token refresh
- ✅ Token revocation
- ✅ User info retrieval

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

#### `registerProvider(providerName: string, credentials: ProviderCredentials): void`

Manually register a provider at runtime.

#### `generateAuthUrl(providerName: string, options?: AuthUrlOptions): string`

Generate OAuth authorization URL.

```typescript
const url = oauthService.generateAuthUrl('google', {
  scope: 'email profile',
  state: 'random-state',
});
```

#### `handleCallback(providerName: string, callbackParams: OAuthCallbackParams): Promise<OAuthTokenResponse>`

Handle OAuth callback and exchange authorization code for tokens.

```typescript
const tokens = await oauthService.handleCallback('google', {
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

#### `getRegisteredProviders(): string[]`

Get list of registered provider names.

```typescript
const providers = oauthService.getRegisteredProviders(); // ['google', 'kakao']
```

## Important Security & Configuration Notes

### 1. Verify OAuth App Credentials

Ensure your OAuth app credentials are accurate:
- **Client ID**: Must match exactly with your OAuth provider's app configuration
- **Client Secret**: Must be the correct secret key from your provider
- **Redirect URI**: Must match the redirect URI registered in your OAuth provider's app settings

Any mismatch in these credentials will result in authentication failures.

### 2. Use Environment Variables

**Never hardcode credentials in your source code.** Always use environment variables:

```typescript
// Good
{
  name: 'google',
  credentials: {
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
  },
}

// Bad - Never do this!
{
  name: 'google',
  credentials: {
    client_id: 'your-actual-client-id',  // Don't hardcode!
    client_secret: 'your-actual-secret', // Don't hardcode!
    redirect_uri: 'http://localhost:3000/callback',
  },
}
```

Add your `.env` file to `.gitignore` to prevent accidental commits:

```gitignore
.env
.env.local
.env.production
```

### 3. REST API Authentication

This library uses **REST API OAuth authentication** (server-side flow):
- Client SDK keys (JavaScript SDK keys) will **NOT** work
- You must use REST API credentials from your OAuth provider
- Ensure your OAuth app is configured for "Web Application" or "Server-side" authentication, not "Client-side" or "JavaScript" authentication

### 4. Production Deployment

Before deploying to production:

- **Request production approval** from OAuth providers if required:
  - **Kakao**: Submit app for review and get production approval
  - **Naver**: Register business application and get approval
  - **Google**: Verify your app if using sensitive scopes
  - **GitHub**: Generally no approval needed for public apps

- **Update redirect URIs** to use your production domain
- **Use HTTPS** for all redirect URIs in production
- **Implement proper error handling** for OAuth failures
- **Store tokens securely** (encrypted database, secure session storage)
- **Implement token refresh** before tokens expire
- **Set up monitoring** for OAuth authentication failures

## Configuration Types

### OAuthModuleOptions

```typescript
interface OAuthModuleOptions {
  providers: OAuthProviderConfig[];
  isGlobal?: boolean;
}
```

### OAuthProviderConfig

```typescript
interface OAuthProviderConfig {
  name: string;
  credentials: ProviderCredentials;
}
```

### ProviderCredentials

```typescript
interface ProviderCredentials {
  client_id: string;
  client_secret: string;
  redirect_uri?: string;
  api_version?: string;
  [key: string]: string | undefined;
}
```

## Adding New Providers

To add a new OAuth provider, create a provider class extending `BaseOAuthProvider`:

### Step 1: Create Provider Class

Create a new file in `src/providers/your-provider.provider.ts`:

```typescript
import { BaseOAuthProvider } from '../core/base-provider';
import {
  AuthUrlOptions,
  OAuthTokenResponse,
  TokenRefreshOptions,
  TokenRevokeOptions,
  UserInfoResponse,
} from '../types/provider.types';

export class YourProvider extends BaseOAuthProvider {
  get name(): string {
    return 'your-provider';
  }

  protected getRequiredCredentials(): string[] {
    return ['client_id', 'client_secret', 'redirect_uri'];
  }

  generateAuthUrl(options: AuthUrlOptions = {}): string {
    const params = {
      client_id: this.credentials.client_id,
      redirect_uri: this.credentials.redirect_uri,
      response_type: 'code',
      scope: options.scope,
      state: options.state,
    };

    return this.buildUrl('https://oauth.provider.com/authorize', params);
  }

  protected async exchangeCodeForToken(
    code: string,
    state?: string,
  ): Promise<OAuthTokenResponse> {
    const data = {
      code,
      client_id: this.credentials.client_id,
      client_secret: this.credentials.client_secret,
      redirect_uri: this.credentials.redirect_uri,
      grant_type: 'authorization_code',
    };

    return this.httpClient.post<OAuthTokenResponse>(
      'https://oauth.provider.com/token',
      data,
    );
  }

  async refreshToken(options: TokenRefreshOptions): Promise<OAuthTokenResponse> {
    // Implement token refresh
  }

  async revokeToken(options: TokenRevokeOptions): Promise<void> {
    // Implement token revocation
  }

  async getUserInfo(accessToken: string): Promise<UserInfoResponse> {
    return this.httpClient.get<UserInfoResponse>(
      'https://api.provider.com/user',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
  }
}
```

### Step 2: Register in Provider Registry

Add your provider to `src/providers/index.ts`:

```typescript
import { YourProvider } from './your-provider.provider';

export const PROVIDER_REGISTRY: Record<string, ProviderConstructor> = {
  google: GoogleProvider,
  kakao: KakaoProvider,
  naver: NaverProvider,
  github: GitHubProvider,
  'your-provider': YourProvider, // Add your provider
};

export { YourProvider } from './your-provider.provider';
```

That's it! Your provider is now available for use.

## Advanced Usage

### Using with Guards

You can create custom guards to protect routes:

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { OAuthService } from 'nest-oauth-almighty';

@Injectable()
export class OAuthGuard implements CanActivate {
  constructor(private oauthService: OAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return false;
    }

    try {
      const user = await this.oauthService.getUserInfo('google', token);
      request.user = user;
      return true;
    } catch (error) {
      return false;
    }
  }
}
```

## Examples

Check the [examples](./examples) directory for more usage examples:

- [basic-usage.ts](./examples/basic-usage.ts) - Basic synchronous configuration
- [async-usage.ts](./examples/async-usage.ts) - Async configuration with ConfigService

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Lint
npm run lint

# Format
npm run format

# Test
npm test
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Issues and Support

If you encounter any issues, bugs, or have questions:

- Check existing [Issues](https://github.com/roydevdemon/nest-oauth-almighty/issues) to see if your problem has been reported
- Open a new [Issue](https://github.com/roydevdemon/nest-oauth-almighty/issues/new) with detailed information:
  - OAuth provider you're using
  - Error messages or unexpected behavior
  - Minimal code example to reproduce the issue
  - Environment details (Node.js version, NestJS version, etc.)

We'll do our best to respond and help resolve any problems.

## License

MIT

## Author

roydevdemon
