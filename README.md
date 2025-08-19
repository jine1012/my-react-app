# My React App - Baby Care Application

아기 양육을 위한 React 기반 웹 애플리케이션입니다. Express.js 백엔드와 OpenAI 통합을 통해 아기 울음 분석, 양육 상담, 일기 작성 등의 기능을 제공합니다.

## 🚀 Features

- **아기 울음 분석**: OpenAI를 활용한 울음 소리 분석
- **양육 상담**: AI 챗봇을 통한 전문적인 양육 조언
- **성장 기록**: 아기의 성장 과정을 체계적으로 기록
- **일기 작성**: 양육 일기를 작성하고 관리
- **PWA 지원**: 모바일 앱과 같은 사용자 경험
- **반응형 디자인**: 모든 디바이스에서 최적화된 UI

## 🛠️ Tech Stack

### Frontend
- **React 19** - 최신 React 기능 활용
- **TypeScript** - 타입 안전성 보장
- **Tailwind CSS** - 모던한 UI 디자인
- **Vite** - 빠른 개발 환경
- **React Router** - SPA 라우팅

### Backend
- **Express.js** - Node.js 웹 프레임워크
- **OpenAI API** - AI 기반 울음 분석 및 상담
- **CORS** - 크로스 오리진 요청 지원
- **Helmet** - 보안 헤더 설정
- **Morgan** - HTTP 요청 로깅

## 📁 Project Structure

```
my-react-app/
├── src/                    # React 프론트엔드
│   ├── components/         # 재사용 가능한 컴포넌트
│   ├── pages/             # 페이지 컴포넌트
│   ├── chatbot/           # 챗봇 관련 컴포넌트
│   ├── hooks/             # 커스텀 훅
│   └── services/          # API 서비스
├── server/                 # Express.js 백엔드
│   ├── routes/            # API 라우트
│   │   ├── baby.js        # 아기 관련 API
│   │   ├── chat.js        # 채팅 관련 API
│   │   └── diary.js       # 일기 관련 API
│   ├── config/            # 설정 파일
│   └── index.js           # 서버 메인 파일
└── public/                 # 정적 파일
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm 또는 yarn

### Installation

1. **의존성 설치**
   ```bash
   cd my-react-app
   npm install
   ```

2. **환경변수 설정**
   ```bash
   cp env.example .env
   ```
   
   `.env` 파일에서 OpenAI API 키를 설정하세요:
   ```
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **개발 서버 실행**

   **프론트엔드만 실행:**
   ```bash
   npm run dev
   ```

   **백엔드만 실행:**
   ```bash
   npm run server:dev
   ```

   **프론트엔드 + 백엔드 동시 실행:**
   ```bash
   npm run dev:full
   ```

### Available Scripts

- `npm run dev` - Vite 개발 서버 실행 (포트 5173)
- `npm run server` - Express 서버 실행 (포트 5000)
- `npm run server:dev` - nodemon으로 Express 서버 실행
- `npm run dev:full` - 프론트엔드와 백엔드를 동시에 실행
- `npm run build` - 프로덕션 빌드
- `npm run preview` - 빌드된 앱 미리보기

## 🌐 API Endpoints

### Baby API (`/api/baby`)
- `POST /analyze-cry` - 아기 울음 분석
- `POST /growth-record` - 성장 기록 저장
- `GET /info` - 아기 정보 조회

### Chat API (`/api/chat`)
- `POST /message` - 채팅 메시지 전송
- `GET /history` - 채팅 히스토리 조회
- `GET /quick-questions` - 빠른 질문 템플릿

### Diary API (`/api/diary`)
- `POST /entry` - 일기 작성
- `GET /entries` - 일기 목록 조회
- `GET /entry/:id` - 특정 일기 조회
- `PUT /entry/:id` - 일기 수정
- `DELETE /entry/:id` - 일기 삭제
- `GET /stats` - 일기 통계

### Health Check
- `GET /api/health` - 서버 상태 확인

## 🔧 Configuration

### Environment Variables
- `PORT` - 서버 포트 (기본값: 5000)
- `NODE_ENV` - 실행 환경 (development/production)
- `VITE_OPENAI_API_KEY` - OpenAI API 키

### CORS 설정
개발 환경에서는 `http://localhost:3000`과 `http://localhost:5173`에서의 요청을 허용합니다.

## 📱 PWA Features

- **Service Worker** - 오프라인 지원
- **Web App Manifest** - 홈 화면 추가
- **Responsive Design** - 모바일 최적화

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Server Deployment
프로덕션 환경에서는 환경변수를 적절히 설정하고, 데이터베이스를 연결하세요.

## 🔮 Future Enhancements

- [ ] 실제 데이터베이스 연결 (PostgreSQL/MongoDB)
- [ ] 사용자 인증 및 권한 관리
- [ ] 파일 업로드 (사진, 오디오)
- [ ] 실시간 알림
- [ ] 다국어 지원
- [ ] 백업 및 복원 기능

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

문제가 발생하거나 질문이 있으시면 이슈를 생성해 주세요.

---

**Happy Parenting! 👶✨**
