# State Generator 사용 가이드

OAuth 인증 과정에서 필요한 보안 파라미터를 생성하는 유틸리티입니다.

## 주요 기능

### 1. State 파라미터 생성

OAuth 인증 요청 시 CSRF 공격을 방지하기 위한 state 파라미터를 생성합니다.

```typescript
import { generateState } from 'nest-oauth-almighty';

// 기본 길이 (32바이트)
const state = generateState();
// 예: "a7B9cD3eF1gH2iJ4kL5mN6oP7qR8sT9u"

// 커스텀 길이
const customState = generateState(16);
```

**특징:**
- 암호학적으로 안전한 난수 생성
- Base64URL 인코딩 (URL-safe)
- 매번 다른 값 생성 보장

**사용 예시:**
```typescript
import { generateState } from 'nest-oauth-almighty';
import { OAuthService } from 'nest-oauth-almighty';

@Injectable()
export class AuthService {
  constructor(private oauthService: OAuthService) {}

  async initiateLogin(provider: string) {
    const state = generateState();

    // state를 세션이나 Redis에 저장
    await this.saveState(state);

    // OAuth URL 생성 시 state 포함
    const authUrl = this.oauthService.generateAuthUrl(provider, {
      scope: 'email profile',
      state,
    });

    return authUrl;
  }

  async handleCallback(code: string, state: string) {
    // state 검증
    const isValid = await this.verifyState(state);
    if (!isValid) {
      throw new Error('Invalid state parameter');
    }

    // 토큰 교환 진행
    // ...
  }
}
```

### 2. PKCE 파라미터 생성

OAuth 2.0 PKCE (Proof Key for Code Exchange)에 필요한 파라미터를 생성합니다.
주로 공개 클라이언트(SPA, 모바일 앱)나 X(Twitter) OAuth에서 사용됩니다.

```typescript
import { generatePKCE } from 'nest-oauth-almighty';

const pkce = generatePKCE();
console.log(pkce);
// {
//   code_verifier: "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk",
//   code_challenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
//   code_challenge_method: "S256"
// }
```

**특징:**
- SHA256 해시 기반 code_challenge 생성
- RFC 7636 표준 준수
- URL-safe Base64 인코딩

**사용 예시 (X/Twitter OAuth):**
```typescript
import { generatePKCE } from 'nest-oauth-almighty';
import { OAuthService } from 'nest-oauth-almighty';

@Injectable()
export class XAuthService {
  constructor(private oauthService: OAuthService) {}

  async initiateXLogin() {
    const pkce = generatePKCE();
    const state = generateState();

    // PKCE 파라미터를 세션에 저장 (code_verifier는 나중에 필요)
    await this.savePKCE(pkce.code_verifier, state);

    // X OAuth URL 생성
    const authUrl = this.oauthService.generateAuthUrl('x', {
      scope: 'tweet.read users.read',
      state,
      code_challenge: pkce.code_challenge,
      code_challenge_method: pkce.code_challenge_method,
    });

    return authUrl;
  }

  async handleXCallback(code: string, state: string) {
    // 저장된 code_verifier 가져오기
    const codeVerifier = await this.getCodeVerifier(state);

    // 토큰 교환 (code_verifier 포함)
    const tokens = await this.oauthService.handleCallback('x', {
      code,
      state,
      code_verifier: codeVerifier,
    });

    return tokens;
  }
}
```

### 3. Nonce 생성

OpenID Connect에서 사용하는 nonce 파라미터를 생성합니다.
재생 공격(replay attack)을 방지하는 데 사용됩니다.

```typescript
import { generateNonce } from 'nest-oauth-almighty';

// 기본 길이 (32바이트)
const nonce = generateNonce();

// 커스텀 길이
const customNonce = generateNonce(16);
```

**특징:**
- 암호학적으로 안전한 난수 생성
- Base64URL 인코딩
- 매번 다른 값 생성 보장

**사용 예시 (Google OIDC):**
```typescript
import { generateNonce, generateState } from 'nest-oauth-almighty';
import { OAuthService } from 'nest-oauth-almighty';

@Injectable()
export class GoogleAuthService {
  constructor(private oauthService: OAuthService) {}

  async initiateGoogleLogin() {
    const state = generateState();
    const nonce = generateNonce();

    // state와 nonce 저장
    await this.saveAuthParams(state, nonce);

    // Google OAuth URL 생성 (OpenID Connect)
    const authUrl = this.oauthService.generateAuthUrl('google', {
      scope: 'openid email profile',
      state,
      nonce,
      response_type: 'code',
    });

    return authUrl;
  }

  async handleGoogleCallback(code: string, state: string) {
    const savedNonce = await this.getNonce(state);

    const tokens = await this.oauthService.handleCallback('google', {
      code,
      state,
    });

    // ID 토큰의 nonce 검증
    const idToken = this.decodeIdToken(tokens.id_token);
    if (idToken.nonce !== savedNonce) {
      throw new Error('Invalid nonce');
    }

    return tokens;
  }
}
```

## 전체 OAuth 플로우 예시

```typescript
import {
  generateState,
  generatePKCE,
  generateNonce,
  OAuthService
} from 'nest-oauth-almighty';

@Injectable()
export class AuthService {
  constructor(
    private oauthService: OAuthService,
    private sessionService: SessionService,
  ) {}

  /**
   * 1단계: OAuth 인증 시작
   */
  async startOAuth(provider: string, userId: string) {
    const state = generateState();

    // PKCE가 필요한 provider (X/Twitter 등)
    const usePKCE = provider === 'x';
    const pkce = usePKCE ? generatePKCE() : null;

    // OpenID Connect를 사용하는 경우
    const useOIDC = provider === 'google';
    const nonce = useOIDC ? generateNonce() : null;

    // 세션에 저장
    await this.sessionService.save(userId, {
      state,
      code_verifier: pkce?.code_verifier,
      nonce,
      provider,
    });

    // OAuth URL 생성
    const authUrl = this.oauthService.generateAuthUrl(provider, {
      state,
      ...(pkce && {
        code_challenge: pkce.code_challenge,
        code_challenge_method: pkce.code_challenge_method,
      }),
      ...(nonce && { nonce }),
    });

    return authUrl;
  }

  /**
   * 2단계: OAuth 콜백 처리
   */
  async handleOAuthCallback(
    userId: string,
    code: string,
    state: string,
  ) {
    // 세션에서 저장된 값 가져오기
    const session = await this.sessionService.get(userId);

    // state 검증
    if (session.state !== state) {
      throw new Error('Invalid state parameter');
    }

    // 토큰 교환
    const tokens = await this.oauthService.handleCallback(session.provider, {
      code,
      state,
      code_verifier: session.code_verifier, // PKCE 사용 시
    });

    // nonce 검증 (OIDC 사용 시)
    if (session.nonce && tokens.id_token) {
      const idToken = this.decodeIdToken(tokens.id_token);
      if (idToken.nonce !== session.nonce) {
        throw new Error('Invalid nonce');
      }
    }

    // 세션 정리
    await this.sessionService.delete(userId);

    return tokens;
  }
}
```

## 보안 권장사항

### State 파라미터
- ✅ 항상 state 파라미터를 사용하세요 (CSRF 방지)
- ✅ 서버 측에서 state를 생성하고 저장하세요
- ✅ 콜백에서 state를 검증한 후 즉시 삭제하세요
- ✅ state는 일회용으로 사용하세요 (재사용 금지)
- ✅ state에 만료 시간을 설정하세요 (예: 10분)

### PKCE
- ✅ 공개 클라이언트에서는 PKCE를 필수로 사용하세요
- ✅ code_verifier는 서버에만 저장하고 클라이언트에 노출하지 마세요
- ✅ S256 방식을 사용하세요 (plain 방식은 권장하지 않음)

### Nonce
- ✅ OpenID Connect 사용 시 nonce를 포함하세요
- ✅ ID 토큰의 nonce를 반드시 검증하세요
- ✅ nonce도 일회용으로 사용하세요

## API Reference

### `generateState(length?: number): string`

**Parameters:**
- `length` (optional): 생성할 난수의 바이트 길이 (기본값: 32)

**Returns:**
- Base64URL 인코딩된 난수 문자열

---

### `generatePKCE(): object`

**Returns:**
```typescript
{
  code_verifier: string;        // PKCE code verifier
  code_challenge: string;       // SHA256 해시된 challenge
  code_challenge_method: 'S256'; // 해시 방식 (항상 S256)
}
```

---

### `generateNonce(length?: number): string`

**Parameters:**
- `length` (optional): 생성할 난수의 바이트 길이 (기본값: 32)

**Returns:**
- Base64URL 인코딩된 난수 문자열

## 관련 문서

- [OAuth 2.0 RFC 6749](https://tools.ietf.org/html/rfc6749)
- [PKCE RFC 7636](https://tools.ietf.org/html/rfc7636)
- [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html)
