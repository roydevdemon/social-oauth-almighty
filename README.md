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

| Provider | Status | Implementation |
|----------|--------|----------------|
| Google | ✅ Ready | [GoogleProvider](src/providers/google.provider.ts:11) |
| Kakao | ✅ Ready | [KakaoProvider](src/providers/kakao.provider.ts:11) |
| Naver | ✅ Ready | [NaverProvider](src/providers/naver.provider.ts:11) |
| GitHub | ✅ Ready | [GitHubProvider](src/providers/github.provider.ts:11) |

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

## License

MIT

## Author

roydevdemon
