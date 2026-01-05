# NPM 인증 가이드

## 1. NPM 계정 생성

### 웹사이트에서 가입
1. https://www.npmjs.com/signup 방문
2. 계정 정보 입력
   - Username
   - Email
   - Password
3. 이메일 인증 완료

### CLI에서 계정 생성
```bash
npm adduser
```

## 2. NPM 로그인 방법

### 방법 1: Interactive 로그인 (권장)

```bash
npm login
```

프롬프트가 나타나면 입력:
- Username: `your-username`
- Password: `your-password`
- Email: `your-email@example.com`
- OTP (2FA 설정 시): `123456`

### 방법 2: 웹 브라우저 로그인

```bash
npm login --auth-type=web
```

브라우저가 자동으로 열리고 웹에서 로그인합니다.

### 방법 3: Legacy 방식 (구버전)

```bash
npm login --auth-type=legacy
```

## 3. 2FA (Two-Factor Authentication) 설정

### 2FA 활성화 (강력 권장)

```bash
# 2FA 상태 확인
npm profile get

# 2FA 활성화
npm profile enable-2fa auth-and-writes
```

옵션:
- `auth-only`: 로그인 시에만 2FA 필요
- `auth-and-writes`: 로그인 + 패키지 배포 시 2FA 필요 (권장)

### 2FA로 배포하기

```bash
# 배포 시 OTP 입력 요구됨
npm publish

# 또는 OTP를 직접 제공
npm publish --otp=123456
```

## 4. Access Token 사용 (CI/CD용)

### Token 생성

1. **웹에서 생성**
   - https://www.npmjs.com 로그인
   - Account Settings → Access Tokens
   - "Generate New Token" 클릭
   - Token 타입 선택:
     - `Publish`: 패키지 배포 가능
     - `Automation`: CI/CD용 (2FA 우회)
     - `Read-only`: 읽기 전용

2. **CLI에서 생성**
   ```bash
   npm token create

   # Read-only token
   npm token create --read-only

   # CI/CD용 (2FA 우회)
   npm token create --cidr=0.0.0.0/0
   ```

### Token 사용

#### 방법 1: .npmrc 파일 설정

```bash
# 홈 디렉토리에 .npmrc 생성
echo "//registry.npmjs.org/:_authToken=YOUR_TOKEN_HERE" > ~/.npmrc
```

#### 방법 2: 환경 변수

```bash
# Linux/Mac
export NPM_TOKEN=your-token-here
npm config set //registry.npmjs.org/:_authToken=${NPM_TOKEN}

# Windows (PowerShell)
$env:NPM_TOKEN="your-token-here"
npm config set //registry.npmjs.org/:_authToken=$env:NPM_TOKEN
```

#### 방법 3: 직접 명령어에 포함

```bash
npm publish --//registry.npmjs.org/:_authToken=YOUR_TOKEN
```

## 5. 로그인 확인

### 현재 사용자 확인
```bash
npm whoami
```

### 인증 정보 확인
```bash
# 현재 registry 확인
npm config get registry

# 저장된 인증 정보 확인
npm config get //registry.npmjs.org/:_authToken
```

## 6. CI/CD 환경 설정

### GitHub Actions

`.github/workflows/publish.yml`:

```yaml
name: Publish Package

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'

      - run: npm ci
      - run: npm run build
      - run: npm test

      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**GitHub Secrets 설정:**
1. Repository Settings → Secrets and variables → Actions
2. "New repository secret" 클릭
3. Name: `NPM_TOKEN`
4. Value: (npmjs.com에서 생성한 토큰)

### GitLab CI

`.gitlab-ci.yml`:

```yaml
publish:
  stage: deploy
  only:
    - tags
  script:
    - echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > .npmrc
    - npm ci
    - npm run build
    - npm test
    - npm publish
```

**GitLab CI/CD Variables 설정:**
1. Settings → CI/CD → Variables
2. Add variable:
   - Key: `NPM_TOKEN`
   - Value: (토큰)
   - Protected: ✓
   - Masked: ✓

### Travis CI

`.travis.yml`:

```yaml
language: node_js
node_js:
  - '18'

script:
  - npm run build
  - npm test

deploy:
  provider: npm
  email: your-email@example.com
  api_token:
    secure: $NPM_TOKEN
  on:
    tags: true
```

## 7. 로그아웃

```bash
npm logout
```

이 명령은:
- 로컬 인증 정보 삭제
- ~/.npmrc에서 토큰 제거

## 8. 트러블슈팅

### "You must be logged in to publish packages"

**해결:**
```bash
npm logout
npm login
npm whoami  # 확인
```

### "Unable to authenticate"

**원인:**
- 잘못된 자격증명
- 2FA 코드 오류
- 만료된 토큰

**해결:**
```bash
# 1. 로그인 정보 삭제
npm logout

# 2. 재로그인
npm login

# 3. 토큰 재생성 (필요시)
npm token create
```

### "402 Payment Required"

**원인:** Private package를 publish하려 할 때 (유료)

**해결:**
```bash
# Public으로 배포
npm publish --access public
```

### "403 Forbidden"

**원인:**
- 패키지 이름이 이미 존재
- 권한 없음
- 토큰 권한 부족

**해결:**
```bash
# 1. 패키지 이름 확인
npm view nest-oauth-almighty

# 2. 패키지 이름 변경
# package.json의 name 필드 수정

# 3. 또는 scoped package 사용
# "@username/nest-oauth-almighty"
```

### "ENEEDAUTH"

**원인:** 인증 정보가 없거나 만료됨

**해결:**
```bash
npm login
```

## 9. 보안 Best Practices

### ✅ DO (권장)

1. **2FA 활성화**
   ```bash
   npm profile enable-2fa auth-and-writes
   ```

2. **Token 사용 시 최소 권한 부여**
   - CI/CD: Automation token
   - 읽기만: Read-only token

3. **Token 주기적 갱신**
   ```bash
   npm token list
   npm token revoke <token-id>
   ```

4. **환경 변수 사용**
   - `.npmrc`에 토큰 하드코딩 금지
   - Git에 커밋하지 않기

5. **Organization 사용**
   - 팀 단위 패키지 관리
   - 세밀한 권한 제어

### ❌ DON'T (금지)

1. **토큰을 Git에 커밋하지 않기**
   ```bash
   # .gitignore에 추가
   .npmrc
   ```

2. **Public 저장소에 토큰 노출 금지**

3. **만료되지 않는 토큰 사용 금지**

4. **과도한 권한 부여 금지**
   - Publish token을 읽기용으로 사용하지 않기

## 10. 빠른 시작 가이드

### 로컬 개발자용

```bash
# 1. NPM 계정 생성/로그인
npm login

# 2. 2FA 설정 (선택, 권장)
npm profile enable-2fa auth-and-writes

# 3. 배포
npm publish

# 4. 2FA 코드 입력 (활성화 시)
# Enter OTP: 123456
```

### CI/CD 환경용

```bash
# 1. Automation token 생성
npm token create

# 2. Token을 CI/CD secrets에 저장
# NPM_TOKEN=npm_xxx...

# 3. CI/CD 스크립트에서 사용
echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > .npmrc
npm publish
```

## 11. 유용한 명령어

```bash
# 현재 사용자 확인
npm whoami

# 토큰 목록
npm token list

# 토큰 삭제
npm token revoke <token-id>

# 프로필 확인
npm profile get

# 2FA 비활성화
npm profile disable-2fa

# 패키지 소유자 확인
npm owner ls nest-oauth-almighty

# 패키지 소유자 추가
npm owner add username nest-oauth-almighty
```

## 12. 문의 및 지원

- NPM 문서: https://docs.npmjs.com/
- NPM 지원: https://www.npmjs.com/support
- 토큰 관리: https://www.npmjs.com/settings/~/tokens
