// server/routes/cry-detection.js
import express from 'express';
import axios from 'axios';

const router = express.Router();

// 라즈베리파이 Flask 서버 설정
const PI_API_BASE = process.env.RASPBERRY_PI_URL || 'http://192.168.0.94:5000';

// 현재 울음 감지 상태를 메모리에 저장 (실제 환경에서는 데이터베이스 사용 권장)
let detectionState = {
  isActive: false,
  lastStartTime: null,
  lastStopTime: null,
  lastDetection: null,
  totalDetections: 0
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

    if (response.data.status === 'started') {
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

    if (response.data.status === 'stopped') {
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
    }

    res.status(500).json({
      success: false,
      status: 'error',
      message: errorMessage,
      error: error.message
    });
  }
});

// 현재 울음 감지 상태 조회
router.get('/status', async (req, res) => {
  try {
    // 라즈베리파이에서 실제 상태 확인 (선택사항)
    const response = await axios.get(`${PI_API_BASE}/status`, {
      timeout: 5000
    });
    
    // 라즈베리파이의 실제 상태와 동기화
    if (response.data.isActive !== undefined) {
      detectionState.isActive = response.data.isActive;
    }
    
    res.json({
      success: true,
      ...detectionState,
      raspberryPiStatus: response.data
    });

  } catch (error) {
    console.warn('⚠️ 라즈베리파이 상태 확인 실패, 로컬 상태 반환:', error.message);
    
    // 라즈베리파이 연결 실패 시 로컬 상태만 반환
    res.json({
      success: true,
      ...detectionState,
      warning: '라즈베리파이와의 연결을 확인할 수 없습니다.'
    });
  }
});

// 울음 감지 이벤트 수신 (라즈베리파이가 감지 시 호출)
router.post('/detection-event', (req, res) => {
  const { timestamp, confidence, audioData } = req.body;
  
  console.log(`🔔 울음 감지됨! 시간: ${timestamp}, 신뢰도: ${confidence}%`);
  
  // 감지 이벤트 기록
  detectionState.lastDetection = timestamp || new Date().toISOString();
  detectionState.totalDetections += 1;
  
  // 여기에 추가 로직 구현 가능:
  // - 데이터베이스에 기록 저장
  // - 부모에게 알림 전송 (푸시 알림, 이메일 등)
  // - 울음 분석 결과 저장
  
  res.json({
    success: true,
    message: '울음 감지 이벤트가 기록되었습니다.',
    detectionCount: detectionState.totalDetections
  });
});

// 울음 감지 기록 조회
router.get('/history', (req, res) => {
  // 실제 환경에서는 데이터베이스에서 조회
  res.json({
    success: true,
    data: {
      totalDetections: detectionState.totalDetections,
      lastDetection: detectionState.lastDetection,
      isCurrentlyActive: detectionState.isActive,
      lastStartTime: detectionState.lastStartTime,
      lastStopTime: detectionState.lastStopTime
    }
  });
});

// 라즈베리파이 연결 테스트
router.get('/test-connection', async (req, res) => {
  try {
    const response = await axios.get(`${PI_API_BASE}/health`, {
      timeout: 5000
    });
    
    res.json({
      success: true,
      message: '라즈베리파이 연결 성공',
      raspberryPi: {
        status: 'connected',
        url: PI_API_BASE,
        response: response.data
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '라즈베리파이 연결 실패',
      raspberryPi: {
        status: 'disconnected',
        url: PI_API_BASE,
        error: error.message
      }
    });
  }
});

export default router;