# NPM 배포 가이드

## 사전 준비

### 1. NPM 계정 확인

```bash
# NPM 로그인 상태 확인
npm whoami

# 로그인되어 있지 않다면
npm login
```

### 2. 패키지 이름 확인

```bash
# 패키지 이름이 사용 가능한지 확인
npm view nest-oauth-almighty

# 사용 불가능하다면 package.json의 name을 변경
```

## 배포 전 체크리스트

### 자동 검증

```bash
npm run publish:check
```

이 명령은 다음을 확인합니다:
- ✅ package.json 필수 필드
- ✅ 빌드 파일 존재
- ✅ 타입 정의 파일 (.d.ts)
- ✅ README.md, LICENSE 파일
- ✅ 테스트 통과
- ✅ Lint 오류 없음
- ✅ 패키지 크기 및 포함 파일

### 수동 확인 사항

#### 1. README.md 업데이트
- [ ] 설치 방법 확인
- [ ] 사용 예시 최신화
- [ ] API 문서 링크
- [ ] 지원하는 provider 목록

#### 2. CHANGELOG.md 작성
- [ ] 변경 사항 기록
- [ ] 버전별 히스토리

#### 3. 버전 확인
```bash
# 현재 버전 확인
npm version

# 버전 규칙:
# - patch: 버그 수정 (0.0.1 -> 0.0.2)
# - minor: 새 기능 추가 (0.0.1 -> 0.1.0)
# - major: 호환성 깨지는 변경 (0.0.1 -> 1.0.0)
```

## 배포 프로세스

### 1. 배포 전 검증

```bash
# 전체 체크
npm run publish:check

# 개별 체크
npm run build      # 빌드
npm test          # 테스트
npm run lint      # 린트
```

### 2. 버전 업데이트

```bash
# Patch 버전 (버그 수정)
npm version patch

# Minor 버전 (새 기능)
npm version minor

# Major 버전 (Breaking changes)
npm version major

# 또는 특정 버전 지정
npm version 1.0.0
```

이 명령은 자동으로:
- package.json의 version 업데이트
- Git commit 생성
- Git tag 생성

### 3. 배포

```bash
# 일반 배포
npm publish

# 베타/알파 배포
npm publish --tag beta
npm publish --tag alpha

# 특정 registry에 배포
npm publish --registry https://registry.npmjs.org/
```

### 4. Git Push

```bash
# 변경사항과 태그 모두 푸시
git push origin main --tags
```

## 원스텝 배포

모든 과정을 한 번에:

```bash
# Patch 버전으로 배포
npm version patch && npm publish && git push origin main --tags

# Minor 버전으로 배포
npm version minor && npm publish && git push origin main --tags
```

## 배포 후 확인

### 1. NPM 페이지 확인

```bash
# 브라우저에서 확인
open https://www.npmjs.com/package/nest-oauth-almighty

# 또는 CLI로 확인
npm view nest-oauth-almighty
```

### 2. 설치 테스트

```bash
# 임시 디렉토리에서 테스트
mkdir /tmp/test-install
cd /tmp/test-install
npm init -y
npm install nest-oauth-almighty

# 타입 정의 확인
ls node_modules/nest-oauth-almighty/build/*.d.ts
```

### 3. 문서 확인

- [ ] README가 NPM에서 올바르게 표시되는지
- [ ] 타입 정의가 포함되었는지
- [ ] 예제 코드가 작동하는지

## 배포 롤백

문제가 발견되면:

```bash
# 특정 버전 제거 (24시간 이내만 가능)
npm unpublish nest-oauth-almighty@1.0.0

# 전체 패키지 제거 (주의!)
npm unpublish nest-oauth-almighty --force

# 특정 버전을 deprecated로 표시
npm deprecate nest-oauth-almighty@1.0.0 "버전 1.0.1 사용을 권장합니다"
```

## 지속적 배포 (CI/CD)

### GitHub Actions 예시

`.github/workflows/publish.yml`:

```yaml
name: Publish to NPM

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
      - run: npm run publish:check

      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 트러블슈팅

### 문제: "You do not have permission to publish"

**해결책:**
```bash
# 로그인 확인
npm whoami

# 재로그인
npm logout
npm login
```

### 문제: "Package name already exists"

**해결책:**
1. package.json의 `name` 필드 변경
2. 또는 scoped package 사용: `@username/nest-oauth-almighty`

### 문제: "prepublishOnly script failed"

**해결책:**
```bash
# 개별 스크립트 실행하여 문제 파악
npm run clean
npm run build
npm test
```

### 문제: 빌드 파일이 누락됨

**해결책:**
1. package.json의 `files` 필드 확인
2. `.npmignore` 파일 확인
3. `npm pack --dry-run`으로 포함될 파일 미리보기

## 베스트 프랙티스

### 1. Semantic Versioning

- **Major (X.0.0)**: Breaking changes
- **Minor (0.X.0)**: 새 기능 (하위 호환)
- **Patch (0.0.X)**: 버그 수정

### 2. 배포 전 체크리스트

- [ ] 모든 테스트 통과
- [ ] Lint 오류 없음
- [ ] README 업데이트
- [ ] CHANGELOG 작성
- [ ] 로컬에서 설치 테스트
- [ ] 버전 번호 확인

### 3. 문서화

- README에 명확한 설치 및 사용 가이드
- TypeScript 타입 정의 포함
- 예제 코드 제공
- API 문서 링크

### 4. 유지보수

- 이슈에 빠르게 응답
- 정기적인 의존성 업데이트
- 보안 취약점 모니터링

## 유용한 명령어

```bash
# 패키지 정보 확인
npm view nest-oauth-almighty

# 다운로드 통계
npm view nest-oauth-almighty downloads

# 의존하는 패키지 확인
npm view nest-oauth-almighty dependencies

# 패키지 크기 확인
npm pack --dry-run

# 로컬에서 패키지 테스트
npm link
```

## 참고 자료

- [NPM 공식 문서](https://docs.npmjs.com/)
- [Semantic Versioning](https://semver.org/)
- [npm-publish 가이드](https://docs.npmjs.com/cli/v8/commands/npm-publish)
