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

// JSON과 파일 업로드를 위한 설정
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 정적 파일 서빙 (React 빌드 파일)
app.use(express.static(path.join(__dirname, '../dist')));

// API 라우트 등록
import babyRoutes from './routes/baby.js';
import chatRoutes from './routes/chat.js';
import diaryRoutes from './routes/diary.js';
import cryDetectionRoutes from './routes/cry-detection.js';
import sleepRoutes from './routes/sleep.js';
import babyMonitorRoutes from './routes/baby-monitor.js';
import sttTtsRoutes from './routes/stt-tts.js';
import babyCareRAGRoutes from './routes/baby-care-rag.js';

app.use('/api/baby', babyRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/diary', diaryRoutes);
app.use('/api/cry-detection', cryDetectionRoutes);
app.use('/api/sleep', sleepRoutes);
app.use('/api', babyMonitorRoutes);
app.use('/api/voice', sttTtsRoutes);
app.use('/api/baby-care-rag', babyCareRAGRoutes);

/// Health check 엔드포인트 업데이트
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      nodejs: 'running',
      openai: process.env.VITE_OPENAI_API_KEY ? 'configured' : 'not configured',
      sttTts: process.env.VITE_OPENAI_API_KEY ? 'available' : 'unavailable',
      jetsonNano: process.env.JETSON_NANO_URL || 'http://192.168.0.94:5000',
      ragChatbot: process.env.VITE_OPENAI_API_KEY ? 'active' : 'inactive' // 🔥 추가
    },
    features: {
      babyMonitoring: 'active',
      sleepAnalysis: 'active',
      cryDetection: 'active',
      chatbot: 'active',
      diary: 'active',
      voiceSTT: process.env.VITE_OPENAI_API_KEY ? 'active' : 'inactive',
      voiceTTS: process.env.VITE_OPENAI_API_KEY ? 'active' : 'inactive',
      ragBabyCare: process.env.VITE_OPENAI_API_KEY ? 'active' : 'inactive' // 🔥 추가
    },
    ragKnowledge: { // 🔥 RAG 지식베이스 정보 추가
      topics: ['vaccination', 'fever_medicine', 'safe_sleep'],
      totalCategories: 3,
      ageRange: '0-24개월'
    }
  });
});

// Jetson Nano 연동을 위한 프록시 엔드포인트들
app.get('/api/jetson/status', async (req, res) => {
  try {
    const jetsonUrl = process.env.JETSON_NANO_URL || 'http://192.168.0.94:5000';
    const response = await fetch(`${jetsonUrl}/status`);
    const data = await response.json();
    
    res.json({
      success: true,
      jetsonStatus: data,
      connectedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Jetson Nano 연결 오류:', error);
    res.status(503).json({
      success: false,
      message: 'Jetson Nano에 연결할 수 없습니다.',
      error: error.message
    });
  }
});

app.get('/api/jetson/camera/stream', async (req, res) => {
  try {
    const jetsonUrl = process.env.JETSON_NANO_URL || 'http://192.168.0.94:5000';
    const response = await fetch(`${jetsonUrl}/camera/stream`);
    
    res.setHeader('Content-Type', 'multipart/x-mixed-replace; boundary=frame');
    response.body.pipe(res);
  } catch (error) {
    console.error('카메라 스트림 오류:', error);
    res.status(503).json({
      success: false,
      message: '카메라 스트림을 가져올 수 없습니다.',
      error: error.message
    });
  }
});

app.get('/api/jetson/sensors', async (req, res) => {
  try {
    const jetsonUrl = process.env.JETSON_NANO_URL || 'http://192.168.0.94:5000';
    const response = await fetch(`${jetsonUrl}/sensors`);
    const data = await response.json();
    
    res.json({
      success: true,
      sensors: data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('센서 데이터 오류:', error);
    res.status(503).json({
      success: false,
      message: '센서 데이터를 가져올 수 없습니다.',
      error: error.message
    });
  }
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
  console.log(`🎤 STT API: http://localhost:${PORT}/api/voice/stt`);
  console.log(`🔊 TTS API: http://localhost:${PORT}/api/voice/tts`);
  
  if (process.env.OPENAI_API_KEY) {
    console.log(`✅ OpenAI API 키가 설정되었습니다.`);
  } else {
    console.log(`⚠️  OpenAI API 키가 설정되지 않았습니다. .env 파일을 확인하세요.`);
  }
  
  if (process.env.JETSON_NANO_URL) {
    console.log(`🤖 Jetson Nano: ${process.env.JETSON_NANO_URL}`);
  } else {
    console.log(`⚠️  Jetson Nano URL이 설정되지 않았습니다. 환경변수 JETSON_NANO_URL을 설정하세요.`);
  }

  // RAG 챗봇 상태 로그 
  if (process.env.VITE_OPENAI_API_KEY) {
    console.log(`🧠 RAG Baby Care Chatbot: ACTIVE`);
    console.log(`📚 Knowledge Base: 3 topics (vaccination, fever_medicine, safe_sleep)`);
  } else {
    console.log(`⚠️  RAG Baby Care Chatbot: INACTIVE (OpenAI API key required)`);
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