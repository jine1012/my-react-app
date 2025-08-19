# 환경변수 설정 가이드

## 필수 환경변수

이 프로젝트를 실행하기 위해서는 다음 환경변수들을 설정해야 합니다.

### 1. .env 파일 생성

프로젝트 루트 디렉토리에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# OpenAI Configuration
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Raspberry Pi Flask Server Configuration
RASPBERRY_PI_URL=http://192.168.0.94:5000
```

### 2. OpenAI API 키 설정

1. [OpenAI 웹사이트](https://platform.openai.com/)에 로그인
2. API Keys 섹션에서 새 API 키 생성
3. 생성된 키를 `.env` 파일의 `VITE_OPENAI_API_KEY`에 설정

**⚠️ 주의사항:**
- API 키는 절대 공개 저장소에 커밋하지 마세요
- `.env` 파일은 `.gitignore`에 포함되어 있어야 합니다

### 3. 환경변수 확인

서버 시작 후 다음 엔드포인트로 환경변수 설정 상태를 확인할 수 있습니다:

```bash
curl http://localhost:5000/api/health
```

응답에서 `openai` 상태를 확인하세요:
- `configured`: API 키가 정상적으로 설정됨
- `not configured`: API 키가 설정되지 않음

### 4. 서버 재시작

`.env` 파일을 수정한 후에는 서버를 재시작해야 합니다:

```bash
# 서버 중지 (Ctrl+C)
# 서버 재시작
cd server
npm start
```

## 문제 해결

### OpenAI API 키 오류 시

1. `.env` 파일이 올바른 위치에 있는지 확인
2. API 키가 정확하게 입력되었는지 확인
3. API 키에 충분한 크레딧이 있는지 확인
4. 서버를 재시작했는지 확인

### 환경변수가 로드되지 않는 경우

1. `dotenv` 패키지가 설치되어 있는지 확인
2. `.env` 파일의 형식이 올바른지 확인 (공백이나 따옴표 없이)
3. 파일 인코딩이 UTF-8인지 확인

## 개발 환경 vs 프로덕션 환경

- **개발 환경**: `.env` 파일 사용
- **프로덕션 환경**: 시스템 환경변수 또는 클라우드 서비스의 환경변수 설정 사용
