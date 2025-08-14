# OpenAI API 키 설정 가이드

## 문제 해결
현재 챗봇에서 에러가 발생하는 주요 원인은 OpenAI API 키가 설정되지 않았기 때문입니다.

## 해결 방법

### 1. .env.local 파일 생성
프로젝트 루트 디렉토리(`my-react-app/`)에 `.env.local` 파일을 생성하세요.

### 2. API 키 설정
`.env.local` 파일에 다음 내용을 추가하세요:

```env
VITE_OPENAI_API_KEY=your_actual_openai_api_key_here
```

**주의사항:**
- `your_actual_openai_api_key_here` 부분을 실제 OpenAI API 키로 교체하세요
- API 키는 `sk-`로 시작하는 긴 문자열입니다
- 이 파일은 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다

### 3. OpenAI API 키 발급 방법
1. [OpenAI 웹사이트](https://platform.openai.com/)에 로그인
2. API Keys 섹션으로 이동
3. "Create new secret key" 클릭
4. 키 이름을 입력하고 생성
5. 생성된 키를 복사하여 `.env.local` 파일에 붙여넣기

### 4. 애플리케이션 재시작
환경 변수를 설정한 후에는 개발 서버를 재시작해야 합니다:

```bash
npm run dev
```

## 디버깅
브라우저 개발자 도구의 콘솔에서 다음 로그를 확인할 수 있습니다:

- 🔑 ChatGPT Service 초기화: API 키 상태 확인
- 💬 사용자 메시지 전송: 메시지 전송 과정
- 🚀 ChatGPT API 요청 시작: API 호출 시작
- 📡 ChatGPT API 응답 상태: API 응답 상태
- ❌ ChatGPT API 호출 실패: 에러 발생 시 상세 정보

## 일반적인 에러 메시지

| 에러 메시지 | 원인 | 해결 방법 |
|------------|------|-----------|
| "OpenAI API 키가 설정되지 않았습니다" | .env.local 파일이 없거나 API 키가 설정되지 않음 | 위의 설정 방법 따라하기 |
| "API 키가 유효하지 않습니다" | API 키가 잘못되었거나 만료됨 | 새로운 API 키 발급 |
| "API 사용 한도를 초과했습니다" | OpenAI 계정의 사용량 한도 초과 | 다음 달까지 대기 또는 요금제 업그레이드 |
| "네트워크 연결을 확인해주세요" | 인터넷 연결 문제 | 인터넷 연결 상태 확인 |

## 보안 주의사항
- API 키를 절대 공개 저장소에 커밋하지 마세요
- API 키를 클라이언트 사이드 코드에 하드코딩하지 마세요
- 프로덕션 환경에서는 서버 사이드에서 API 호출을 처리하는 것이 좋습니다
