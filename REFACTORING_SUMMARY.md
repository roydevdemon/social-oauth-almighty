# 리팩토링 요약: YAML 기반 → 클래스 기반 아키텍처

## 변경 이유

기존 YAML 파일 기반 접근 방식의 문제점:
- 런타임에 파일 시스템 접근 필요
- 배포 시 YAML 파일도 함께 포함해야 함
- 타입 안정성 부족
- 빌드 시점 검증 불가능

## 새로운 구조

### 1. 클래스 기반 프로바이더

각 프로바이더는 `BaseOAuthProvider`를 상속받아 구현:

```
src/
├── core/
│   └── base-provider.ts          # 추상 베이스 클래스
├── providers/
│   ├── google.provider.ts        # Google 구현
│   ├── kakao.provider.ts         # Kakao 구현
│   ├── naver.provider.ts         # Naver 구현
│   ├── github.provider.ts        # GitHub 구현
│   └── index.ts                  # Provider registry
```

### 2. Provider Registry 패턴

`src/providers/index.ts`에서 모든 프로바이더를 중앙 관리:

```typescript
export const PROVIDER_REGISTRY: Record<string, ProviderConstructor> = {
  google: GoogleProvider,
  kakao: KakaoProvider,
  naver: NaverProvider,
  github: GitHubProvider,
};

export function createProvider(name, credentials) {
  const ProviderClass = PROVIDER_REGISTRY[name];
  return new ProviderClass(credentials);
}
```

### 3. 타입 안정성

모든 프로바이더가 동일한 인터페이스 구현:
- `generateAuthUrl()`
- `handleCallback()`
- `exchangeCodeForToken()`
- `refreshToken()`
- `revokeToken()`
- `getUserInfo()`

## 장점

### ✅ 타입 안정성
- 컴파일 시점에 모든 오류 검출
- IDE 자동완성 지원
- 리팩토링 안전성 향상

### ✅ 성능 개선
- 런타임 파일 I/O 제거
- YAML 파싱 오버헤드 제거
- 메모리 효율성 향상

### ✅ 배포 간소화
- YAML 파일 배포 불필요
- 단일 JavaScript 번들
- 의존성 감소 (js-yaml 제거 가능)

### ✅ 개발 경험 향상
- 각 프로바이더의 로직이 명확히 분리
- 디버깅 용이
- 테스트 작성 쉬움

## 마이그레이션 가이드

### 기존 YAML 구조
```yaml
name: google
credential:
  - name: client_id
    required: true
token:
  request:
    url: https://accounts.google.com/o/oauth2/v2/auth
```

### 새로운 클래스 구조
```typescript
export class GoogleProvider extends BaseOAuthProvider {
  get name() {
    return 'google';
  }

  protected getRequiredCredentials() {
    return ['client_id', 'client_secret', 'redirect_uri'];
  }

  generateAuthUrl(options) {
    return this.buildUrl(
      'https://accounts.google.com/o/oauth2/v2/auth',
      params
    );
  }
}
```

## 새 프로바이더 추가 방법

### 1단계: Provider 클래스 생성
```typescript
// src/providers/newprovider.provider.ts
export class NewProvider extends BaseOAuthProvider {
  get name() { return 'newprovider'; }
  // ... 메서드 구현
}
```

### 2단계: Registry에 등록
```typescript
// src/providers/index.ts
import { NewProvider } from './newprovider.provider';

export const PROVIDER_REGISTRY = {
  // ...
  newprovider: NewProvider,
};
```

## 호환성

- ✅ 기존 API 완전 호환
- ✅ 사용자 코드 변경 불필요
- ✅ 동일한 환경변수 사용
- ✅ 동일한 메서드 시그니처

## 테스트 결과

- ✅ 25개 테스트 모두 통과
- ✅ 빌드 성공
- ✅ 타입 검사 통과
- ✅ Lint 경고만 존재 (의도된 `any` 사용)

## 향후 계획

1. ~~YAML 파일 및 로더 제거~~ ✅ 완료
2. ~~js-yaml 의존성 제거~~ (선택사항)
3. 추가 프로바이더 구현 (Facebook, X/Twitter)
4. Provider별 특화 타입 정의
5. 에러 처리 개선
