// server/index.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어 설정
app.use(helmet({
  contentSecurityPolicy: false, // React 개발 모드에서 필요
}));

app.use(morgan('combined'));

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'
  ],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 정적 파일 서빙 (React 빌드 파일)
app.use(express.static(path.join(__dirname, '../dist')));

// API 라우트 등록 - ES modules 방식으로 통일
import babyRoutes from './routes/baby.js';
import chatRoutes from './routes/chat.js';
import diaryRoutes from './routes/diary.js';
import cryDetectionRoutes from './routes/cry-detection.js';

app.use('/api/baby', babyRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/diary', diaryRoutes);
app.use('/api/cry-detection', cryDetectionRoutes);

// Health check 엔드포인트
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      nodejs: 'running',
      openai: process.env.OPENAI_API_KEY ? 'configured' : 'not configured',
      raspberryPi: process.env.RASPBERRY_PI_URL || 'http://192.168.0.94:5000'
    }
  });
});

// React 앱의 라우팅을 위한 catch-all 핸들러
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// 글로벌 에러 핸들러
app.use((err, req, res, next) => {
  console.error('서버 에러:', err.stack);
  res.status(500).json({
    success: false,
    message: '내부 서버 오류가 발생했습니다.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '요청한 리소스를 찾을 수 없습니다.',
    path: req.path
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`📱 프론트엔드: http://localhost:${PORT}`);
  console.log(`🔌 API: http://localhost:${PORT}/api`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  
  if (process.env.RASPBERRY_PI_URL) {
    console.log(`🥧 라즈베리파이: ${process.env.RASPBERRY_PI_URL}`);
  } else {
    console.log(`⚠️  라즈베리파이 URL이 설정되지 않았습니다. 환경변수 RASPBERRY_PI_URL을 설정하세요.`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('서버를 종료합니다...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('서버를 종료합니다...');
  process.exit(0);
});

export default app;