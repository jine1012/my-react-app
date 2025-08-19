// server/routes/stt-tts.js
import express from 'express';
import multer from 'multer';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 파일 업로드 설정
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB 제한
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    // 오디오 파일만 허용
    const allowedMimes = [
      'audio/wav',
      'audio/mpeg',
      'audio/mp3',
      'audio/mp4',
      'audio/ogg',
      'audio/webm',
      'audio/flac'
    ];
    
    if (allowedMimes.includes(file.mimetype) || file.originalname.endsWith('.wav')) {
      cb(null, true);
    } else {
      cb(new Error('오디오 파일만 업로드 가능합니다.'));
    }
  }
});

// uploads 디렉토리가 없으면 생성
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// STT (Speech-to-Text) 엔드포인트
router.post('/stt', upload.single('audio'), async (req, res) => {
  console.log('STT 요청 수신:', {
    file: req.file ? req.file.filename : 'none',
    originalName: req.file ? req.file.originalname : 'none',
    size: req.file ? req.file.size : 0
  });

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: '오디오 파일이 필요합니다.'
      });
    }

    // OpenAI API 키 확인
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'OpenAI API 키가 설정되지 않았습니다.'
      });
    }

    console.log('OpenAI Whisper API 호출 시작...');
    
    // 파일 스트림 생성
    const audioFile = fs.createReadStream(req.file.path);
    audioFile.path = req.file.originalname; // OpenAI API를 위한 파일명 설정

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "ko", // 한국어 설정
      response_format: "json",
      temperature: 0.2, // 더 정확한 전사를 위해 낮은 temperature
    });

    console.log('STT 변환 성공:', transcription.text);

    // 임시 파일 삭제
    try {
      fs.unlinkSync(req.file.path);
    } catch (unlinkError) {
      console.warn('임시 파일 삭제 실패:', unlinkError.message);
    }

    res.json({
      success: true,
      text: transcription.text,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('STT 처리 오류:', error);
    
    // 임시 파일 정리
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.warn('오류 발생 시 임시 파일 삭제 실패:', unlinkError.message);
      }
    }

    // 오류 유형에 따른 상세 메시지
    let errorMessage = 'STT 처리 중 오류가 발생했습니다.';
    
    if (error.message.includes('API key')) {
      errorMessage = 'OpenAI API 키를 확인해주세요.';
    } else if (error.message.includes('rate limit')) {
      errorMessage = 'API 사용량 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
    } else if (error.message.includes('network') || error.message.includes('timeout')) {
      errorMessage = '네트워크 연결을 확인해주세요.';
    }

    res.status(500).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// TTS (Text-to-Speech) 엔드포인트
router.post('/tts', async (req, res) => {
  try {
    const { text, voice = 'nova', speed = 1.0 } = req.body;

    console.log('TTS 요청 수신:', { text: text?.substring(0, 50) + '...', voice, speed });

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: '변환할 텍스트가 필요합니다.'
      });
    }

    if (text.length > 4096) {
      return res.status(400).json({
        success: false,
        error: '텍스트가 너무 깁니다. (최대 4096자)'
      });
    }

    // OpenAI API 키 확인
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'OpenAI API 키가 설정되지 않았습니다.'
      });
    }

    console.log('OpenAI TTS API 호출 시작...');

    const mp3 = await openai.audio.speech.create({
      model: "tts-1", // 또는 "tts-1-hd" (고품질)
      voice: voice, // alloy, echo, fable, onyx, nova, shimmer
      input: text,
      speed: Math.max(0.25, Math.min(4.0, speed)), // 0.25 ~ 4.0 사이로 제한
      response_format: "mp3"
    });

    console.log('TTS 변환 성공');

    // 오디오 데이터를 Buffer로 변환
    const buffer = Buffer.from(await mp3.arrayBuffer());

    // 응답 헤더 설정
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': buffer.length,
      'Content-Disposition': 'inline; filename="speech.mp3"',
      'Cache-Control': 'no-cache'
    });

    res.send(buffer);

  } catch (error) {
    console.error('TTS 처리 오류:', error);
    
    // 오류 유형에 따른 상세 메시지
    let errorMessage = 'TTS 처리 중 오류가 발생했습니다.';
    
    if (error.message.includes('API key')) {
      errorMessage = 'OpenAI API 키를 확인해주세요.';
    } else if (error.message.includes('rate limit')) {
      errorMessage = 'API 사용량 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
    } else if (error.message.includes('network') || error.message.includes('timeout')) {
      errorMessage = '네트워크 연결을 확인해주세요.';
    }

    res.status(500).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 지원되는 TTS 음성 목록 조회
router.get('/tts/voices', (req, res) => {
  const voices = [
    { id: 'alloy', name: 'Alloy', gender: 'neutral', description: '중성적인 목소리' },
    { id: 'echo', name: 'Echo', gender: 'male', description: '남성적인 목소리' },
    { id: 'fable', name: 'Fable', gender: 'neutral', description: '영국식 액센트' },
    { id: 'onyx', name: 'Onyx', gender: 'male', description: '깊고 진중한 남성 목소리' },
    { id: 'nova', name: 'Nova', gender: 'female', description: '여성적이고 부드러운 목소리' },
    { id: 'shimmer', name: 'Shimmer', gender: 'female', description: '밝고 경쾌한 여성 목소리' }
  ];

  res.json({
    success: true,
    voices,
    default: 'nova'
  });
});

// STT 지원 언어 목록 조회
router.get('/stt/languages', (req, res) => {
  const languages = [
    { code: 'ko', name: '한국어', default: true },
    { code: 'en', name: 'English' },
    { code: 'ja', name: '日本語' },
    { code: 'zh', name: '中文' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' }
  ];

  res.json({
    success: true,
    languages,
    default: 'ko'
  });
});

// API 상태 확인
router.get('/status', (req, res) => {
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    services: {
      openai: !!process.env.OPENAI_API_KEY,
      stt: 'whisper-1',
      tts: 'tts-1',
      uploadsDir: fs.existsSync(uploadsDir)
    },
    limits: {
      fileSize: '25MB',
      textLength: '4096 characters',
      supportedFormats: ['wav', 'mp3', 'mp4', 'mpeg', 'ogg', 'webm', 'flac']
    }
  });
});

export default router;