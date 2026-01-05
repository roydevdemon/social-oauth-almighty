# 배포 체크리스트

## 📋 사전 준비 (처음 한 번만)

### NPM 계정 설정
- [ ] NPM 계정 생성: https://www.npmjs.com/signup
- [ ] 이메일 인증 완료
- [ ] 로그인 테스트
  ```bash
  npm login
  npm whoami
  ```
- [ ] 2FA 설정 (강력 권장)
  ```bash
  npm profile enable-2fa auth-and-writes
  ```

### 패키지 이름 확인
- [ ] 패키지 이름 사용 가능 확인
  ```bash
  npm view nest-oauth-almighty
  ```
  - 이미 존재하면 package.json의 name 변경 필요

## 🚀 배포 전 체크리스트

### 1. 코드 품질 확인
- [ ] 모든 테스트 통과
  ```bash
  npm test
  ```
- [ ] Lint 오류 없음
  ```bash
  npm run lint
  ```
- [ ] 빌드 성공
  ```bash
  npm run build
  ```

### 2. 문서 업데이트
- [ ] README.md 최신화
  - [ ] 설치 방법
  - [ ] 사용 예시
  - [ ] API 문서
  - [ ] 지원 provider 목록
- [ ] CHANGELOG.md 업데이트
  - [ ] 새 버전 추가
  - [ ] 변경사항 기록
  - [ ] Breaking changes 명시

### 3. 버전 관리
- [ ] 적절한 버전 번호 선택
  - Patch (0.0.x): 버그 수정
  - Minor (0.x.0): 새 기능 (하위 호환)
  - Major (x.0.0): Breaking changes

### 4. 배포 검증
- [ ] 배포 전 체크 실행
  ```bash
  npm run publish:check
  ```
- [ ] 모든 체크 통과 확인

### 5. 로컬 테스트
- [ ] 로컬에서 패키지 생성
  ```bash
  npm pack
  ```
- [ ] 생성된 .tgz 파일 확인
- [ ] 임시 프로젝트에서 설치 테스트
  ```bash
  mkdir /tmp/test-install
  cd /tmp/test-install
  npm init -y
  npm install /path/to/nest-oauth-almighty-0.0.1.tgz
  ```

## 📦 배포 프로세스

### 단계별 배포

#### 1단계: 로그인 확인
```bash
npm whoami
```
- [ ] 올바른 계정으로 로그인되어 있는지 확인

#### 2단계: 최종 검증
```bash
npm run publish:check
```
- [ ] ✅ All checks passed! 확인

#### 3단계: 버전 업데이트
```bash
# Patch 버전
npm version patch

# Minor 버전
npm version minor

# Major 버전
npm version major
```
- [ ] Git commit과 tag가 생성되었는지 확인

#### 4단계: 배포
```bash
npm publish
```
- [ ] 2FA 코드 입력 (활성화 시)
- [ ] 배포 성공 메시지 확인

#### 5단계: Git Push
```bash
git push origin main --tags
```
- [ ] 코드와 태그가 모두 푸시되었는지 확인

## ✅ 배포 후 확인

### NPM 페이지 확인
- [ ] 패키지 페이지 접속
  ```bash
  open https://www.npmjs.com/package/nest-oauth-almighty
  ```
- [ ] README가 올바르게 표시되는지 확인
- [ ] 버전 정보 확인
- [ ] 다운로드 통계 확인 (시간 경과 후)

### 설치 테스트
- [ ] 새 프로젝트에서 설치
  ```bash
  npm install nest-oauth-almighty
  ```
- [ ] TypeScript 타입 정의 확인
  ```bash
  ls node_modules/nest-oauth-almighty/build/*.d.ts
  ```
- [ ] 기본 import 테스트
  ```typescript
  import { OAuthModule } from 'nest-oauth-almighty';
  ```

### GitHub 확인
- [ ] Release 페이지 확인
  ```bash
  open https://github.com/roydevdemon/social-oauth-almighty/releases
  ```
- [ ] Tag가 생성되었는지 확인
- [ ] Release 노트 작성 (선택)

## 🔄 원스텝 배포 (경험자용)

모든 단계를 한 번에:

```bash
# Patch 버전
npm run publish:check && \
npm version patch && \
npm publish && \
git push origin main --tags

# Minor 버전
npm run publish:check && \
npm version minor && \
npm publish && \
git push origin main --tags

# Major 버전
npm run publish:check && \
npm version major && \
npm publish && \
git push origin main --tags
```

## 🆘 문제 발생 시

### 배포 실패
1. [ ] 에러 메시지 확인
2. [ ] NPM_AUTH_GUIDE.md의 트러블슈팅 참고
3. [ ] 필요시 롤백
   ```bash
   npm unpublish nest-oauth-almighty@x.x.x
   # (24시간 이내만 가능)
   ```

### 잘못된 버전 배포
- [ ] Deprecated 표시
  ```bash
  npm deprecate nest-oauth-almighty@x.x.x "Use version x.x.y instead"
  ```
- [ ] 새 버전 배포

## 📝 배포 완료 후

### 커뮤니케이션
- [ ] Twitter/SNS 공유
- [ ] Discord/Slack 채널 공지
- [ ] 관련 커뮤니티 공지

### 모니터링
- [ ] NPM 다운로드 통계
  ```bash
  npm view nest-oauth-almighty downloads
  ```
- [ ] GitHub Issues 확인
- [ ] GitHub Discussions 확인

### 다음 릴리즈 준비
- [ ] CHANGELOG.md에 [Unreleased] 섹션 추가
- [ ] Roadmap 업데이트
- [ ] Issue 트리아지

## 🎯 참고 문서

- [NPM_AUTH_GUIDE.md](NPM_AUTH_GUIDE.md) - 인증 상세 가이드
- [PUBLISHING.md](PUBLISHING.md) - 배포 상세 가이드
- [NPM_SETUP_SUMMARY.md](NPM_SETUP_SUMMARY.md) - 설정 요약
- [CHANGELOG.md](CHANGELOG.md) - 변경 히스토리

---

## 빠른 참조

### 필수 명령어
```bash
# 로그인
npm login

# 검증
npm run publish:check

# 배포
npm version patch && npm publish

# Git push
git push origin main --tags
```

### 트러블슈팅
```bash
# 로그인 확인
npm whoami

# 로그아웃/재로그인
npm logout && npm login

# 패키지 정보 확인
npm view nest-oauth-almighty
```
