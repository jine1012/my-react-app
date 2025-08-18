// server/server.js (또는 app.js)
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 기존 라우트들
import chatRoutes from './routes/chat.js';
import diaryRoutes from './routes/diary.js';
import logRoutes from './routes/logs.js';
import growthRoutes from './routes/growth.js';

// 새로 추가된 Baby Monitor API
import babyMonitorRoutes from './routes/baby-monitor.js';

// 데이터베이스 설정
import { connectDatabase } from './config/database.js';

// 환경변수 로드
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// 데이터베이스 연결
await connectDatabase();

// API 라우트 설정
app.use('/api/chat', chatRoutes);
app.use('/api/diary', diaryRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/growth', growthRoutes);

// 🔥 새로 추가된 Baby Monitor API
app.use('/api', babyMonitorRoutes);

// 헬스 체크 엔드포인트
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    server: 'Baby App Server',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      openai: process.env.OPENAI_API_KEY ? 'configured' : 'not configured',
      jetsonNano: process.env.JETSON_NANO_URL || 'not configured',
      database: 'memory-based'
    }
  });
});

// React 앱 서빙 (모든 라우트를 React 라우터에 위임)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Baby Monitor API available at http://localhost:${PORT}/api/`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  
  if (process.env.JETSON_NANO_URL) {
    console.log(`🤖 Jetson Nano URL: ${process.env.JETSON_NANO_URL}`);
  } else {
    console.log(`⚠️  Jetson Nano URL not configured. Set JETSON_NANO_URL in .env file`);
  }
});

// 오류 처리
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});