// server/routes/baby-monitor.js
import express from 'express';
import { dbConfig } from '../config/database.js';

const router = express.Router();

// Jetson Nano 서버 URL (환경변수에서 가져오기)
const JETSON_URL = process.env.JETSON_NANO_URL || 'http://192.168.0.100:5000';

// 센서 데이터 저장용 메모리 스토리지
let currentSensorData = {
  roomTemperature: 23.2,
  humidity: 48,
  babyTemperature: 36.8,
  timestamp: new Date().toISOString()
};

// 센서 데이터 히스토리 (최근 100개 데이터 포인트)
const sensorDataHistory = [];

// Jetson Nano 연결 상태 확인
router.get('/jetson/status', async (req, res) => {
  try {
    // 실제 Jetson Nano와 연결 시도 (시뮬레이션)
    // const response = await fetch(`${JETSON_URL}/health`, { timeout: 5000 });
    
    // 현재는 시뮬레이션으로 랜덤 연결 상태
    const isConnected = Math.random() > 0.3; // 70% 확률로 연결됨
    
    res.json({ 
      connected: isConnected,
      jetsonUrl: JETSON_URL,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Jetson Nano 연결 확인 실패:', error.message);
    res.json({ 
      connected: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 센서 데이터 조회
router.get('/sensors/data', async (req, res) => {
  try {
    // Jetson Nano에서 실제 센서 데이터 가져오기 시도
    // const response = await fetch(`${JETSON_URL}/sensors/all`, { timeout: 3000 });
    
    // 시뮬레이션 데이터 생성
    const newSensorData = {
      roomTemperature: parseFloat((20 + Math.random() * 6).toFixed(1)),
      humidity: Math.floor(40 + Math.random() * 30),
      babyTemperature: parseFloat((36.0 + Math.random() * 2.5).toFixed(1)),
      timestamp: new Date().toISOString()
    };
    
    currentSensorData = newSensorData;
    
    // 히스토리에 저장 (최근 100개만 유지)
    sensorDataHistory.push({ ...currentSensorData });
    if (sensorDataHistory.length > 100) {
      sensorDataHistory.shift();
    }
    
    // 메모리 DB에도 저장
    if (!dbConfig.memory.sensorData) {
      dbConfig.memory.sensorData = new Map();
    }
    dbConfig.memory.sensorData.set(Date.now(), currentSensorData);
    
    res.json(currentSensorData);
  } catch (error) {
    console.error('센서 데이터 가져오기 실패:', error.message);
    res.status(500).json({ 
      error: '센서 데이터를 가져올 수 없습니다.',
      details: error.message 
    });
  }
});

// 센서 데이터 히스토리 조회
router.get('/sensors/history', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const hours = parseInt(req.query.hours) || 24;
  
  const cutoffTime = new Date();
  cutoffTime.setHours(cutoffTime.getHours() - hours);
  
  const filteredData = sensorDataHistory
    .filter(data => new Date(data.timestamp) >= cutoffTime)
    .slice(-limit);
    
  res.json(filteredData);
});

// 체온 알림 임계값 설정
router.post('/sensors/temperature/threshold', (req, res) => {
  const { lowThreshold, highThreshold } = req.body;
  
  if (!lowThreshold || !highThreshold || lowThreshold >= highThreshold) {
    return res.status(400).json({ 
      error: '유효하지 않은 임계값입니다.' 
    });
  }
  
  // 메모리 DB에 설정 저장
  if (!dbConfig.memory.settings) {
    dbConfig.memory.settings = new Map();
  }
  
  dbConfig.memory.settings.set('temperatureThreshold', {
    low: lowThreshold,
    high: highThreshold,
    updatedAt: new Date().toISOString()
  });
  
  res.json({ 
    success: true, 
    threshold: { low: lowThreshold, high: highThreshold }
  });
});

// 체온 알림 임계값 조회
router.get('/sensors/temperature/threshold', (req, res) => {
  const threshold = dbConfig.memory.settings?.get('temperatureThreshold') || {
    low: 36.0,
    high: 38.0,
    updatedAt: new Date().toISOString()
  };
  
  res.json(threshold);
});

// 카메라 전환 (Jetson Nano 연동)
router.post('/camera/switch', async (req, res) => {
  const { cameraType } = req.body;
  
  if (!['normal', 'infrared'].includes(cameraType)) {
    return res.status(400).json({ error: '유효하지 않은 카메라 타입입니다.' });
  }
  
  try {
    // Jetson Nano에 카메라 전환 명령 전송
    // const response = await fetch(`${JETSON_URL}/camera/switch`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ cameraType })
    // });
    
    // 시뮬레이션: 성공 응답
    const logEntry = {
      id: Date.now(),
      action: 'camera_switch',
      cameraType,
      timestamp: new Date().toISOString(),
      success: true
    };
    
    // 메모리 DB에 로그 저장
    if (!dbConfig.memory.cameraLogs) {
      dbConfig.memory.cameraLogs = new Map();
    }
    dbConfig.memory.cameraLogs.set(logEntry.id, logEntry);
    
    res.json({ 
      success: true, 
      cameraType,
      message: `${cameraType === 'normal' ? '일반' : '적외선'} 카메라로 전환되었습니다.`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('카메라 전환 실패:', error.message);
    res.status(500).json({ 
      error: '카메라 전환에 실패했습니다.',
      details: error.message 
    });
  }
});

// 녹화 시작
router.post('/recording/start', async (req, res) => {
  try {
    // Jetson Nano에 녹화 시작 명령 전송
    // const response = await fetch(`${JETSON_URL}/recording/start`, { method: 'POST' });
    
    const recordingLog = {
      id: Date.now(),
      action: 'recording_started',
      timestamp: new Date().toISOString(),
      filename: `baby_recording_${Date.now()}.mp4`
    };
    
    // 메모리 DB에 저장
    if (!dbConfig.memory.recordings) {
      dbConfig.memory.recordings = new Map();
    }
    dbConfig.memory.recordings.set(recordingLog.id, recordingLog);
    
    res.json({ 
      success: true, 
      message: '녹화가 시작되었습니다.',
      recordingId: recordingLog.id,
      filename: recordingLog.filename,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('녹화 시작 실패:', error.message);
    res.status(500).json({ 
      error: '녹화 시작에 실패했습니다.',
      details: error.message 
    });
  }
});

// 녹화 중지
router.post('/recording/stop', async (req, res) => {
  try {
    // Jetson Nano에 녹화 중지 명령 전송
    // const response = await fetch(`${JETSON_URL}/recording/stop`, { method: 'POST' });
    
    const recordingLog = {
      id: Date.now(),
      action: 'recording_stopped',
      timestamp: new Date().toISOString()
    };
    
    if (!dbConfig.memory.recordings) {
      dbConfig.memory.recordings = new Map();
    }
    dbConfig.memory.recordings.set(recordingLog.id, recordingLog);
    
    res.json({ 
      success: true, 
      message: '녹화가 중지되었습니다.',
      recordingId: recordingLog.id,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('녹화 중지 실패:', error.message);
    res.status(500).json({ 
      error: '녹화 중지에 실패했습니다.',
      details: error.message 
    });
  }
});

// 녹화 목록 조회
router.get('/recordings', (req, res) => {
  if (!dbConfig.memory.recordings) {
    return res.json([]);
  }
  
  const recordings = Array.from(dbConfig.memory.recordings.values())
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 20); // 최근 20개만
    
  res.json(recordings);
});

// 비디오 스트림 프록시 (Jetson Nano 스트림을 클라이언트로 전달)
router.get('/video/stream/:type', async (req, res) => {
  const { type } = req.params; // 'normal' 또는 'infrared'
  
  if (!['normal', 'infrared'].includes(type)) {
    return res.status(400).json({ error: '유효하지 않은 스트림 타입입니다.' });
  }
  
  try {
    // 실제 Jetson Nano 스트림 연결
    // const streamResponse = await fetch(`${JETSON_URL}/video/stream/${type}`, {
    //   headers: { 'Accept': 'multipart/x-mixed-replace' }
    // });
    
    // 현재는 시뮬레이션 응답
    res.writeHead(200, {
      'Content-Type': 'multipart/x-mixed-replace; boundary=frame',
      'Cache-Control': 'no-cache',
      'Connection': 'close',
      'Pragma': 'no-cache'
    });
    
    // 시뮬레이션 스트림 (실제로는 Jetson Nano에서 받은 데이터를 전달)
    res.write(`--frame\r\nContent-Type: text/plain\r\n\r\n${type} camera stream simulation\r\n`);
    
  } catch (error) {
    console.error('비디오 스트림 실패:', error.message);
    res.status(500).json({ 
      error: '비디오 스트림에 실패했습니다.',
      details: error.message 
    });
  }
});

// 온습도 센서 개별 조회
router.get('/sensors/temperature', (req, res) => {
  res.json({
    roomTemperature: currentSensorData.roomTemperature,
    timestamp: currentSensorData.timestamp
  });
});

router.get('/sensors/humidity', (req, res) => {
  res.json({
    humidity: currentSensorData.humidity,
    timestamp: currentSensorData.timestamp
  });
});

router.get('/sensors/baby-temperature', (req, res) => {
  res.json({
    babyTemperature: currentSensorData.babyTemperature,
    timestamp: currentSensorData.timestamp
  });
});

// 알림 로그 생성
router.post('/alerts', (req, res) => {
  const { message, type, priority } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: '알림 메시지가 필요합니다.' });
  }
  
  const alert = {
    id: Date.now(),
    message,
    type: type || 'info', // info, warning, error
    priority: priority || 'normal', // low, normal, high
    timestamp: new Date().toISOString(),
    read: false
  };
  
  // 메모리 DB에 저장
  if (!dbConfig.memory.alerts) {
    dbConfig.memory.alerts = new Map();
  }
  dbConfig.memory.alerts.set(alert.id, alert);
  
  res.json({ success: true, alert });
});

// 알림 목록 조회
router.get('/alerts', (req, res) => {
  if (!dbConfig.memory.alerts) {
    return res.json([]);
  }
  
  const limit = parseInt(req.query.limit) || 20;
  const unreadOnly = req.query.unread === 'true';
  
  let alerts = Array.from(dbConfig.memory.alerts.values());
  
  if (unreadOnly) {
    alerts = alerts.filter(alert => !alert.read);
  }
  
  alerts = alerts
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit);
    
  res.json(alerts);
});

// 알림 읽음 처리
router.patch('/alerts/:id/read', (req, res) => {
  const alertId = parseInt(req.params.id);
  
  if (!dbConfig.memory.alerts?.has(alertId)) {
    return res.status(404).json({ error: '알림을 찾을 수 없습니다.' });
  }
  
  const alert = dbConfig.memory.alerts.get(alertId);
  alert.read = true;
  alert.readAt = new Date().toISOString();
  
  dbConfig.memory.alerts.set(alertId, alert);
  
  res.json({ success: true, alert });
});

// 건강 체크 엔드포인트
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      sensorData: currentSensorData ? 'active' : 'inactive',
      jetsonConnection: 'simulated', // 실제로는 Jetson Nano 연결 상태
      database: 'memory-based'
    },
    dataPoints: {
      sensorHistory: sensorDataHistory.length,
      alerts: dbConfig.memory.alerts?.size || 0,
      recordings: dbConfig.memory.recordings?.size || 0
    }
  });
});

export default router;