"use strict";
// import { Module, Controller, Get, Query, Redirect } from '@nestjs/common';
// import { OAuthModule, OAuthService } from 'nest-oauth-almighty';
// // Example 1: Basic module configuration
// @Module({
//   imports: [
//     OAuthModule.forRoot({
//       providers: {
//         google: {
//           clientId: process.env.GOOGLE_CLIENT_ID!,
//           clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//           redirectUri: 'http://localhost:3000/auth/google/callback',
//           scope: ['email', 'profile'],
//         },
//         github: {
//           clientId: process.env.GITHUB_CLIENT_ID!,
//           clientSecret: process.env.GITHUB_CLIENT_SECRET!,
//           redirectUri: 'http://localhost:3000/auth/github/callback',
//         },
//       },
//     }),
//   ],
//   controllers: [AuthController],
// })
// export class AppModule {}
// // Example 2: Auth controller with multiple providers
// @Controller('auth')
// export class AuthController {
//   constructor(private readonly oauthService: OAuthService) {}
//   // Google OAuth
//   @Get('google')
//   @Redirect()
//   googleAuth() {
//     const url = this.oauthService.getAuthorizationUrl('google');
//     return { url };
//   }
//   @Get('google/callback')
//   async googleCallback(@Query('code') code: string) {
//     const { tokenResponse, userProfile } = await this.oauthService.authenticate('google', code);
//     // TODO: Save user to database, create session, etc.
//     return { user: userProfile, token: tokenResponse };
//   }
//   // GitHub OAuth
//   @Get('github')
//   @Redirect()
//   githubAuth() {
//     const url = this.oauthService.getAuthorizationUrl('github');
//     return { url };
//   }
//   @Get('github/callback')
//   async githubCallback(@Query('code') code: string) {
//     const { tokenResponse, userProfile } = await this.oauthService.authenticate('github', code);
//     // TODO: Save user to database, create session, etc.
//     return { user: userProfile, token: tokenResponse };
//   }
// }
//# sourceMappingURL=basic-usage.js.map