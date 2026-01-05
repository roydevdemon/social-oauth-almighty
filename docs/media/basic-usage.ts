import { Module, Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { OAuthModule, OAuthService } from '../src/index';

/**
 * Example 1: Basic Synchronous Module Configuration
 */
@Module({
  imports: [
    OAuthModule.forRoot({
      providers: [
        {
          name: 'google',
          credentials: {
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            redirect_uri: 'http://localhost:3000/auth/google/callback',
          },
        },
        {
          name: 'kakao',
          credentials: {
            client_id: process.env.KAKAO_CLIENT_ID!,
            client_secret: process.env.KAKAO_CLIENT_SECRET!,
            redirect_uri: 'http://localhost:3000/auth/kakao/callback',
          },
        },
      ],
    }),
  ],
  controllers: [AuthController],
})
export class AppModule {}

/**
 * Example 2: Auth Controller with Multiple Providers
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly oauthService: OAuthService) {}

  /**
   * Google OAuth - Redirect to Google authorization page
   */
  @Get('google')
  googleAuth(@Res() res: Response) {
    const url = this.oauthService.generateAuthUrl('google', {
      scope: 'email profile',
      state: 'random-state-string',
    });
    return res.redirect(url);
  }

  /**
   * Google OAuth - Handle callback and get user info
   */
  @Get('google/callback')
  async googleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
  ) {
    // Exchange code for tokens
    const tokens = await this.oauthService.handleCallback('google', {
      code,
      state,
    });

    // Get user information
    const user = await this.oauthService.getUserInfo(
      'google',
      tokens.access_token,
    );

    // TODO: Save user to database, create session, etc.
    return {
      message: 'Authentication successful',
      tokens,
      user,
    };
  }

  /**
   * Kakao OAuth - Redirect to Kakao authorization page
   */
  @Get('kakao')
  kakaoAuth(@Res() res: Response) {
    const url = this.oauthService.generateAuthUrl('kakao', {
      state: 'random-state-string',
    });
    return res.redirect(url);
  }

  /**
   * Kakao OAuth - Handle callback
   */
  @Get('kakao/callback')
  async kakaoCallback(
    @Query('code') code: string,
    @Query('state') state: string,
  ) {
    const tokens = await this.oauthService.handleCallback('kakao', {
      code,
      state,
    });

    const user = await this.oauthService.getUserInfo(
      'kakao',
      tokens.access_token,
    );

    return {
      message: 'Authentication successful',
      tokens,
      user,
    };
  }

  /**
   * Refresh access token
   */
  @Get('refresh/:provider')
  async refreshToken(
    @Query('provider') provider: string,
    @Query('refresh_token') refreshToken: string,
  ) {
    const newTokens = await this.oauthService.refreshToken(provider, {
      refresh_token: refreshToken,
    });

    return {
      message: 'Token refreshed successfully',
      tokens: newTokens,
    };
  }

  /**
   * Revoke/logout
   */
  @Get('logout/:provider')
  async logout(
    @Query('provider') provider: string,
    @Query('token') token: string,
  ) {
    await this.oauthService.revokeToken(provider, {
      token,
    });

    return {
      message: 'Logged out successfully',
    };
  }
}
