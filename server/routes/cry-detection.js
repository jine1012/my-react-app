// server/routes/cry-detection.js
import express from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// 라즈베리파이 Flask 서버 설정
const PI_API_BASE = process.env.RASPBERRY_PI_URL || 'http://192.168.0.94:5000';

// 현재 울음 감지 상태를 메모리에 저장 (실제 환경에서는 데이터베이스 사용 권장)
let detectionState = {
  isActive: false,
  lastStartTime: null,
  lastStopTime: null,
  lastDetection: null,
  totalDetections: 0,
  audioFiles: []  // 오디오 파일 목록 추가
};

// 울음 감지 시작
router.post('/start', async (req, res) => {
  try {
    console.log('🚀 울음 감지 시작 요청 - 라즈베리파이로 전송 중...');
    
    // 라즈베리파이 Flask 서버의 /start 엔드포인트로 요청
    const response = await axios.post(`${PI_API_BASE}/start`, {}, {
      timeout: 10000, // 10초 타임아웃
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.status === 'started' || response.data.status === 'already_running') {
      // 상태 업데이트
      detectionState.isActive = true;
      detectionState.lastStartTime = new Date().toISOString();
      
      console.log('✅ 울음 감지 시작 성공');
      res.json({
        success: true,
        status: 'started',
        message: '울음 감지가 시작되었습니다.',
        timestamp: detectionState.lastStartTime
      });
    } else {
      throw new Error('라즈베리파이에서 예상하지 못한 응답을 받았습니다.');
    }

  } catch (error) {
    console.error('❌ 울음 감지 시작 실패:', error.message);
    
    // 에러 타입에 따른 상세 메시지
    let errorMessage = '울음 감지 시작에 실패했습니다.';
    if (error.code === 'ECONNREFUSED') {
      errorMessage = '라즈베리파이에 연결할 수 없습니다. 네트워크를 확인해주세요.';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = '라즈베리파이 주소를 찾을 수 없습니다.';
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = '라즈베리파이 응답 시간이 초과되었습니다.';
    }

    res.status(500).json({
      success: false,
      status: 'error',
      message: errorMessage,
      error: error.message
    });
  }
});

// 울음 감지 중지
router.post('/stop', async (req, res) => {
  try {
    console.log('🛑 울음 감지 중지 요청 - 라즈베리파이로 전송 중...');
    
    // 라즈베리파이 Flask 서버의 /stop 엔드포인트로 요청
    const response = await axios.post(`${PI_API_BASE}/stop`, {}, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.status === 'stopped' || response.data.status === 'not_running') {
      // 상태 업데이트
      detectionState.isActive = false;
      detectionState.lastStopTime = new Date().toISOString();
      
      console.log('✅ 울음 감지 중지 성공');
      res.json({
        success: true,
        status: 'stopped',
        message: '울음 감지가 중지되었습니다.',
        timestamp: detectionState.lastStopTime
      });
    } else {
      throw new Error('라즈베리파이에서 예상하지 못한 응답을 받았습니다.');
    }

  } catch (error) {
    console.error('❌ 울음 감지 중지 실패:', error.message);
    
    let errorMessage = '울음 감지 중지에 실패했습니다.';
    if (error.code === 'ECONNREFUSED') {
      errorMessage = '라즈베리파이에 연결할 수 없습니다.';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = '라즈베리파이 주소를 찾을 수 없습니다.';
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = '라즈베리파이 응답 시간이 초과되었습니다.';
    }

    res.status(500).json({
      success: false,
      status: 'error',
      message: errorMessage,
      error: error.message
    });
  }
});

// 울음 감지 상태 조회
router.get('/status', async (req, res) => {
  try {
    console.log('📊 울음 감지 상태 조회...');
    
    // 라즈베리파이에서 실제 상태 확인
    try {
      const response = await axios.get(`${PI_API_BASE}/status`, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // 라즈베리파이 응답을 기반으로 상태 동기화
      detectionState.isActive = response.data.active || false;
      
    } catch (piError) {
      console.warn('⚠️ 라즈베리파이 상태 조회 실패, 로컬 상태 사용:', piError.message);
    }
    
    res.json({
      success: true,
      isActive: detectionState.isActive,
      lastStartTime: detectionState.lastStartTime,
      lastStopTime: detectionState.lastStopTime,
      lastDetection: detectionState.lastDetection,
      totalDetections: detectionState.totalDetections,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ 상태 조회 실패:', error.message);
    res.status(500).json({
      success: false,
      message: '상태 조회에 실패했습니다.',
      error: error.message
    });
  }
});

// 라즈베리파이 연결 테스트
router.get('/test-connection', async (req, res) => {
  try {
    console.log('🔍 라즈베리파이 연결 테스트...');
    
    const response = await axios.get(`${PI_API_BASE}/health`, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    res.json({
      success: true,
      message: '라즈베리파이 연결이 정상입니다.',
      raspberryPi: {
        status: 'connected',
        url: PI_API_BASE,
        response: response.data,
        latency: response.headers['x-response-time'] || 'unknown'
      }
    });

  } catch (error) {
    console.error('❌ 라즈베리파이 연결 테스트 실패:', error.message);
    
    let errorMessage = '라즈베리파이 연결에 실패했습니다.';
    if (error.code === 'ECONNREFUSED') {
      errorMessage = '라즈베리파이가 실행되지 않거나 네트워크에 연결되지 않았습니다.';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = '라즈베리파이 주소를 찾을 수 없습니다.';
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = '라즈베리파이 응답 시간이 초과되었습니다.';
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      raspberryPi: {
        status: 'disconnected',
        url: PI_API_BASE,
        error: error.message
      }
    });
  }
});

// 울음 감지 이벤트 수신 (라즈베리파이에서 호출) - 오디오 파일 정보 포함
router.post('/detection-event', (req, res) => {
  try {
    const { timestamp, confidence, audioData, source, audio_file_path } = req.body;
    
    // 감지 이벤트 처리
    detectionState.lastDetection = timestamp;
    detectionState.totalDetections += 1;
    
    // 오디오 파일 정보 저장
    if (audio_file_path) {
      const audioFileInfo = {
        id: `audio_${Date.now()}`,
        filePath: audio_file_path,
        timestamp: timestamp,
        confidence: confidence,
        source: source,
        size: null, // 파일 크기는 추후 계산 가능
        duration: null // 오디오 길이는 추후 계산 가능
      };
      
      detectionState.audioFiles.unshift(audioFileInfo); // 최신 파일이 앞에 오도록
      
      // 최대 100개 파일 정보만 메모리에 유지
      if (detectionState.audioFiles.length > 100) {
        detectionState.audioFiles = detectionState.audioFiles.slice(0, 100);
      }
      
      console.log(`🔔 울음 감지 이벤트 수신: ${confidence}% (${source})`);
      console.log(`📁 오디오 파일: ${audio_file_path}`);
    } else {
      console.log(`🔔 울음 감지 이벤트 수신: ${confidence}% (${source}) - 파일 저장 없음`);
    }
    
    // 여기서 추가적인 처리 (예: 알림 전송, 데이터베이스 저장 등)를 할 수 있습니다
    
    res.json({
      success: true,
      message: '울음 감지 이벤트가 성공적으로 처리되었습니다.',
      eventId: `event_${Date.now()}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ 울음 감지 이벤트 처리 실패:', error.message);
    res.status(500).json({
      success: false,
      message: '울음 감지 이벤트 처리에 실패했습니다.',
      error: error.message
    });
  }
});

// 저장된 오디오 파일 목록 조회
router.get('/audio-files', (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    const files = detectionState.audioFiles.slice(
      parseInt(offset), 
      parseInt(offset) + parseInt(limit)
    );
    
    res.json({
      success: true,
      files: files,
      total: detectionState.audioFiles.length,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: detectionState.audioFiles.length > parseInt(offset) + parseInt(limit)
      }
    });

  } catch (error) {
    console.error('❌ 오디오 파일 목록 조회 실패:', error.message);
    res.status(500).json({
      success: false,
      message: '오디오 파일 목록 조회에 실패했습니다.',
      error: error.message
    });
  }
});

// 특정 오디오 파일 다운로드 (라즈베리파이에서 프록시)
router.get('/audio-file/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    
    // 파일 정보 찾기
    const fileInfo = detectionState.audioFiles.find(f => f.id === fileId);
    if (!fileInfo) {
      return res.status(404).json({
        success: false,
        message: '파일을 찾을 수 없습니다.'
      });
    }
    
    // 라즈베리파이에서 파일 가져오기
    const response = await axios.get(`${PI_API_BASE}/download-audio`, {
      params: { filePath: fileInfo.filePath },
      responseType: 'stream',
      timeout: 30000
    });
    
    // 파일 스트림 전달
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(fileInfo.filePath)}"`);
    
    response.data.pipe(res);

  } catch (error) {
    console.error('❌ 오디오 파일 다운로드 실패:', error.message);
    res.status(500).json({
      success: false,
      message: '오디오 파일 다운로드에 실패했습니다.',
      error: error.message
    });
  }
});

// 오디오 파일 통계
router.get('/audio-stats', (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const todayFiles = detectionState.audioFiles.filter(f => 
      new Date(f.timestamp) >= today
    );
    
    const yesterdayFiles = detectionState.audioFiles.filter(f => 
      new Date(f.timestamp) >= yesterday && new Date(f.timestamp) < today
    );
    
    const weekFiles = detectionState.audioFiles.filter(f => 
      new Date(f.timestamp) >= thisWeek
    );
    
    res.json({
      success: true,
      stats: {
        total: detectionState.audioFiles.length,
        today: todayFiles.length,
        yesterday: yesterdayFiles.length,
        thisWeek: weekFiles.length,
        averageConfidence: detectionState.audioFiles.length > 0 
          ? (detectionState.audioFiles.reduce((sum, f) => sum + f.confidence, 0) / detectionState.audioFiles.length).toFixed(2)
          : 0,
        lastDetection: detectionState.lastDetection
      }
    });

  } catch (error) {
    console.error('❌ 오디오 통계 조회 실패:', error.message);
    res.status(500).json({
      success: false,
      message: '오디오 통계 조회에 실패했습니다.',
      error: error.message
    });
  }
});

// 울음 감지 설정 조회
router.get('/settings', (req, res) => {
  try {
    res.json({
      success: true,
      settings: {
        raspberryPiUrl: PI_API_BASE,
        confidenceThreshold: 0.8, // 기본값
        isAudioSavingEnabled: false, // 라즈베리파이에서 확인 필요
        sampleRate: 16000,
        chunkSize: 8192
      }
    });
  } catch (error) {
    console.error('❌ 설정 조회 실패:', error.message);
    res.status(500).json({
      success: false,
      message: '설정 조회에 실패했습니다.',
      error: error.message
    });
  }
});

// 울음 감지 설정 업데이트
router.post('/settings', async (req, res) => {
  try {
    const { confidenceThreshold, audioSaving } = req.body;
    
    // 라즈베리파이에 설정 전송 (필요한 경우)
    const response = await axios.post(`${PI_API_BASE}/update-settings`, {
      confidenceThreshold,
      audioSaving
    }, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    res.json({
      success: true,
      message: '설정이 업데이트되었습니다.',
      settings: response.data
    });

  } catch (error) {
    console.error('❌ 설정 업데이트 실패:', error.message);
    res.status(500).json({
      success: false,
      message: '설정 업데이트에 실패했습니다.',
      error: error.message
    });
  }
});

// 시스템 상태 종합 조회
router.get('/system-status', async (req, res) => {
  try {
    let raspberryPiStatus = 'disconnected';
    let raspberryPiInfo = null;
    
    try {
      const piResponse = await axios.get(`${PI_API_BASE}/health`, { timeout: 3000 });
      raspberryPiStatus = 'connected';
      raspberryPiInfo = piResponse.data;
    } catch (piError) {
      console.warn('라즈베리파이 상태 확인 실패:', piError.message);
    }
    
    res.json({
      success: true,
      system: {
        nodejs: {
          status: 'running',
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          version: process.version
        },
        raspberryPi: {
          status: raspberryPiStatus,
          url: PI_API_BASE,
          info: raspberryPiInfo
        },
        detection: {
          isActive: detectionState.isActive,
          totalDetections: detectionState.totalDetections,
          lastDetection: detectionState.lastDetection,
          audioFilesCount: detectionState.audioFiles.length
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ 시스템 상태 조회 실패:', error.message);
    res.status(500).json({
      success: false,
      message: '시스템 상태 조회에 실패했습니다.',
      error: error.message
    });
  }
});

export default router;