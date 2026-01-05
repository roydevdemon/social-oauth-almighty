# HTTP Client 사용 가이드

`HttpClient`는 OAuth 요청을 위한 편리한 래퍼 클래스입니다.

## 기본 사용법

### GET 요청
```typescript
const data = await httpClient.get<UserInfo>(
  'https://api.example.com/user',
  {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    params: {
      fields: 'email,name',
    },
  }
);
```

### POST 요청
```typescript
const response = await httpClient.post<TokenResponse>(
  'https://oauth.example.com/token',
  {
    grant_type: 'authorization_code',
    code: 'auth-code',
    client_id: 'your-client-id',
  },
  {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }
);
```

### PUT 요청
```typescript
const updated = await httpClient.put<Profile>(
  'https://api.example.com/profile',
  {
    name: 'New Name',
    email: 'new@email.com',
  },
  {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }
);
```

### PATCH 요청
```typescript
const patched = await httpClient.patch<Profile>(
  'https://api.example.com/profile',
  {
    name: 'Updated Name',
  },
  {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }
);
```

### DELETE 요청
```typescript
await httpClient.delete(
  'https://api.example.com/resource/123',
  {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }
);
```

## Basic Authentication

HTTP Basic Authentication이 필요한 경우 `auth` 옵션을 사용합니다.

### 사용 예시

```typescript
// GitHub API - Application을 통한 토큰 삭제
await httpClient.delete(
  `https://api.github.com/applications/${clientId}/token`,
  {
    data: {
      access_token: token,
    },
    headers: {
      Accept: 'application/vnd.github+json',
    },
    auth: {
      username: clientId,
      password: clientSecret,
    },
  }
);
```

### 내부 동작

`auth` 옵션을 제공하면:
1. `username:password` 형태로 조합
2. Base64로 인코딩
3. `Authorization: Basic {encoded}` 헤더로 자동 추가

### 수동 방식과 비교

#### Before (수동 인코딩)
```typescript
const auth = `${clientId}:${clientSecret}`;
const encodedAuth = Buffer.from(auth).toString('base64');

await httpClient.delete(url, {
  headers: {
    Authorization: `Basic ${encodedAuth}`,
  },
});
```

#### After (auth 옵션 사용)
```typescript
await httpClient.delete(url, {
  auth: {
    username: clientId,
    password: clientSecret,
  },
});
```

## 자동 Form Encoding

POST 요청 시 `Content-Type`이 `application/x-www-form-urlencoded`이면 자동으로 URLSearchParams로 변환됩니다.

```typescript
// 이 데이터는 자동으로 form-urlencoded 형식으로 변환됩니다
await httpClient.post(
  'https://oauth.example.com/token',
  {
    grant_type: 'authorization_code',
    code: 'auth-code',
  },
  {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }
);

// 실제 전송되는 body: "grant_type=authorization_code&code=auth-code"
```

## 에러 처리

```typescript
try {
  const data = await httpClient.get('https://api.example.com/data');
} catch (error) {
  // HTTP 4xx, 5xx 에러
  // 또는 네트워크 에러
  console.error('Request failed:', error.message);
}
```

## 타임아웃

기본 타임아웃은 10초입니다.

```typescript
// 10초 후 자동으로 타임아웃
const data = await httpClient.get('https://slow-api.example.com/data');
```

## 지원하는 HTTP 메서드

| 메서드 | 용도 | Body 지원 | Auth 지원 |
|--------|------|-----------|-----------|
| GET | 데이터 조회 | ❌ | ❌ |
| POST | 데이터 생성 | ✅ | ✅ |
| PUT | 데이터 전체 수정 | ✅ | ❌ |
| PATCH | 데이터 부분 수정 | ✅ | ❌ |
| DELETE | 데이터 삭제 | ✅ | ✅ |

## Provider에서 사용 예시

### Google Provider
```typescript
async getUserInfo(accessToken: string) {
  return this.httpClient.get<UserInfo>(
    'https://www.googleapis.com/oauth2/v2/userinfo',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
}
```

### GitHub Provider (Basic Auth with DELETE)
```typescript
async revokeToken(options: TokenRevokeOptions) {
  await this.httpClient.delete(
    `https://api.github.com/applications/${this.credentials.client_id}/token`,
    {
      data: { access_token: options.token },
      headers: { Accept: 'application/vnd.github+json' },
      auth: {
        username: this.credentials.client_id,
        password: this.credentials.client_secret,
      },
    }
  );
}
```

### X (Twitter) Provider (Basic Auth with POST)
```typescript
async refreshToken(options: TokenRefreshOptions) {
  return this.httpClient.post<OAuthTokenResponse>(
    'https://api.x.com/2/oauth2/token',
    {
      grant_type: 'refresh_token',
      refresh_token: options.refresh_token,
      client_id: this.credentials.client_id,
    },
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      auth: {
        username: this.credentials.client_id,
        password: this.credentials.client_secret,
      },
    }
  );
}
```

## 장점

1. **일관된 인터페이스**: 모든 HTTP 메서드가 동일한 패턴
2. **자동 처리**: Form encoding, Basic Auth 자동 처리
3. **타입 안정성**: 제네릭으로 응답 타입 지정
4. **에러 처리**: 통합된 에러 처리 로직
5. **간결성**: Boilerplate 코드 최소화
