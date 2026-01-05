# 문서 가이드

## JSDoc/TypeDoc 확인 방법

이 프로젝트는 TypeScript 코드에 대한 JSDoc 주석을 사용하여 자동으로 API 문서를 생성합니다.

### 문서 생성 및 확인

#### 1. 문서 생성

```bash
npm run docs
```

이 명령은 TypeDoc을 사용하여 `./docs` 디렉토리에 HTML 문서를 생성합니다.

#### 2. 문서 보기 (브라우저)

```bash
npm run docs:serve
```

이 명령은 문서를 생성하고 브라우저에서 자동으로 엽니다 (http://localhost:8080).

#### 3. 문서 검증

```bash
npm run docs:check
```

또는 직접:

```bash
bash scripts/check-docs.sh
```

이 스크립트는:
- TypeDoc 문서 생성 확인
- JSDoc 주석 누락 및 오류 검사
- 통계 및 요약 제공

### JSDoc 검증 (ESLint 통합)

ESLint에 JSDoc 플러그인이 통합되어 있어 코드 린트 시 자동으로 검증됩니다:

```bash
npm run lint
```

JSDoc 관련 규칙:
- `jsdoc/check-alignment`: 주석 정렬 확인
- `jsdoc/check-param-names`: 파라미터 이름 일치 확인
- `jsdoc/check-types`: 타입 정확성 확인
- `jsdoc/require-param`: 파라미터 문서화 필요
- `jsdoc/require-returns`: 반환값 문서화 필요

## JSDoc 작성 가이드

### 기본 형식

```typescript
/**
 * 함수에 대한 간단한 설명
 * @param paramName - 파라미터 설명
 * @param optionalParam - 선택적 파라미터 설명
 * @returns 반환값 설명
 */
function example(paramName: string, optionalParam?: number): boolean {
  return true;
}
```

### 클래스 문서화

```typescript
/**
 * 클래스에 대한 설명
 */
export class MyClass {
  /**
   * 생성자 설명
   * @param config - 설정 객체
   */
  constructor(private readonly config: Config) {}

  /**
   * 메서드 설명
   * @param input - 입력값
   * @returns 처리 결과
   */
  public process(input: string): Result {
    // ...
  }
}
```

### 인터페이스 문서화

```typescript
/**
 * 사용자 정보 인터페이스
 */
export interface UserInfo {
  /** 사용자 ID */
  id: string;

  /** 사용자 이름 */
  name: string;

  /** 이메일 주소 (선택) */
  email?: string;
}
```

### 타입 별칭 문서화

```typescript
/**
 * HTTP 메서드 타입
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
```

## 현재 문서 상태

프로젝트의 JSDoc 상태를 확인하려면:

```bash
npm run docs:check
```

출력 예시:
```
================================================
JSDoc/TypeDoc Documentation Check
================================================

📝 Generating TypeDoc documentation...
✅ TypeDoc documentation generated successfully
   Location: ./docs/index.html

📋 Checking JSDoc comments with ESLint...

   JSDoc warnings: 49
   Total warnings: 87

⚠️  Found 49 JSDoc issues

Top JSDoc issues:
  4  warning  Missing JSDoc @returns declaration
  4  warning  Missing JSDoc @param "url" declaration
  ...

================================================
Documentation check complete!
================================================
```

## 주요 파일 문서화 상태

### ✅ 잘 문서화된 파일
- `src/utils/state-generator.ts` - 모든 함수에 JSDoc
- `src/types/provider.types.ts` - 모든 타입에 설명

### ⚠️  개선이 필요한 파일
- `src/utils/http-client.ts` - 파라미터 문서 추가 필요
- `src/core/base-provider.ts` - 반환값 문서 추가 필요

## 문서 개선 작업

문서화를 개선하려면:

1. JSDoc 경고가 있는 파일 확인:
   ```bash
   npm run lint | grep jsdoc
   ```

2. 해당 파일의 함수/클래스에 JSDoc 추가

3. 문서 재생성 및 검증:
   ```bash
   npm run docs:check
   ```

4. 브라우저에서 확인:
   ```bash
   npm run docs:serve
   ```

## 자동화된 검증

CI/CD 파이프라인에 문서 검증을 추가하려면:

```yaml
# .github/workflows/ci.yml
- name: Check documentation
  run: npm run docs:check
```

## 도구 정보

- **TypeDoc**: TypeScript용 문서 생성기
- **ESLint JSDoc Plugin**: JSDoc 주석 검증 도구
- **생성된 문서 위치**: `./docs/`
- **설정 파일**: `typedoc.json`, `eslint.config.mjs`

## 참고 자료

- [TypeDoc 공식 문서](https://typedoc.org/)
- [JSDoc 가이드](https://jsdoc.app/)
- [ESLint JSDoc Plugin](https://github.com/gajus/eslint-plugin-jsdoc)
