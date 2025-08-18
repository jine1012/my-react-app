// server/routes/sleep.js
import express from 'express';
import { dbConfig } from '../config/database.js';

const router = express.Router();

// 수면 데이터 저장소 초기화
if (!dbConfig.memory.sleepRecords) {
  dbConfig.memory.sleepRecords = new Map();
  
  // 샘플 데이터 추가
  const sampleData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const baseHours = 10 + (6 - i) * 0.5;
    const sleepHours = baseHours + (Math.random() - 0.5) * 2;
    
    const record = {
      id: `sleep_${Date.now()}_${i}`,
      babyId: 1,
      date: date.toISOString().split('T')[0],
      bedTime: '20:00',
      wakeTime: i < 3 ? '06:30' : '07:00',
      sleepHours: Math.max(8, Math.min(14, sleepHours)),
      sleepQuality: sleepHours > 11 ? 'good' : sleepHours > 9 ? 'fair' : 'poor',
      autoSoothings: Math.floor(Math.random() * 3),
      nightWakings: Math.floor(Math.random() * 4),
      temperature: 22 + Math.random() * 3,
      humidity: 45 + Math.random() * 15,
      noiseLevel: Math.random() * 30,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    dbConfig.memory.sleepRecords.set(record.id, record);
  }
  
  console.log('💤 Sample sleep data initialized');
}

// GET /api/sleep/records - 수면 기록 조회
router.get('/records', async (req, res) => {
  try {
    const { babyId = 1, startDate, endDate, limit = 30 } = req.query;
    
    let records = Array.from(dbConfig.memory.sleepRecords.values())
      .filter(record => record.babyId == babyId);
    
    // 날짜 필터링
    if (startDate) {
      records = records.filter(record => record.date >= startDate);
    }
    if (endDate) {
      records = records.filter(record => record.date <= endDate);
    }
    
    // 날짜순 정렬 (최신순)
    records.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // 제한
    records = records.slice(0, parseInt(limit));
    
    res.json({
      success: true,
      data: records,
      total: records.length
    });
  } catch (error) {
    console.error('수면 기록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '수면 기록을 가져오는데 실패했습니다.',
      error: error.message
    });
  }
});

// GET /api/sleep/statistics - 수면 통계
router.get('/statistics', async (req, res) => {
  try {
    const { babyId = 1, period = 7 } = req.query;
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));
    
    const records = Array.from(dbConfig.memory.sleepRecords.values())
      .filter(record => 
        record.babyId == babyId && 
        new Date(record.date) >= startDate &&
        new Date(record.date) <= endDate
      );
    
    if (records.length === 0) {
      return res.json({
        success: true,
        data: {
          totalRecords: 0,
          averageSleepHours: 0,
          averageBedTime: null,
          averageWakeTime: null,
          sleepQualityDistribution: { good: 0, fair: 0, poor: 0 },
          totalAutoSoothings: 0,
          averageNightWakings: 0,
          sleepTrend: 'stable'
        }
      });
    }
    
    // 통계 계산
    const totalSleepHours = records.reduce((sum, record) => sum + record.sleepHours, 0);
    const averageSleepHours = totalSleepHours / records.length;
    
    const sleepQualityDistribution = records.reduce((acc, record) => {
      acc[record.sleepQuality]++;
      return acc;
    }, { good: 0, fair: 0, poor: 0 });
    
    const totalAutoSoothings = records.reduce((sum, record) => sum + record.autoSoothings, 0);
    const totalNightWakings = records.reduce((sum, record) => sum + record.nightWakings, 0);
    const averageNightWakings = totalNightWakings / records.length;
    
    // 수면 트렌드 계산 (최근 3일 vs 이전 4일)
    const recentRecords = records.slice(0, 3);
    const olderRecords = records.slice(3);
    
    let sleepTrend = 'stable';
    if (recentRecords.length > 0 && olderRecords.length > 0) {
      const recentAvg = recentRecords.reduce((sum, r) => sum + r.sleepHours, 0) / recentRecords.length;
      const olderAvg = olderRecords.reduce((sum, r) => sum + r.sleepHours, 0) / olderRecords.length;
      
      if (recentAvg > olderAvg + 0.5) sleepTrend = 'improving';
      else if (recentAvg < olderAvg - 0.5) sleepTrend = 'declining';
    }
    
    res.json({
      success: true,
      data: {
        totalRecords: records.length,
        averageSleepHours: parseFloat(averageSleepHours.toFixed(1)),
        averageBedTime: '20:00', // 간소화
        averageWakeTime: '06:45', // 간소화
        sleepQualityDistribution,
        totalAutoSoothings,
        averageNightWakings: parseFloat(averageNightWakings.toFixed(1)),
        sleepTrend,
        period: parseInt(period)
      }
    });
  } catch (error) {
    console.error('수면 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '수면 통계를 가져오는데 실패했습니다.',
      error: error.message
    });
  }
});

// POST /api/sleep/predict - AI 수면 예측
router.post('/predict', async (req, res) => {
  try {
    const { babyId = 1 } = req.body;
    
    // 최근 7일 데이터 조회
    const recentRecords = Array.from(dbConfig.memory.sleepRecords.values())
      .filter(record => record.babyId == babyId)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 7);
    
    if (recentRecords.length === 0) {
      return res.status(400).json({
        success: false,
        message: '예측을 위한 충분한 수면 데이터가 없습니다.'
      });
    }
    
    // 인공지능 예측 시뮬레이션
    const averageBedTimeHour = 20; // 8PM
    const averageSleepDuration = recentRecords.reduce((sum, r) => sum + r.sleepHours, 0) / recentRecords.length;
    
    // 현재 시간 기준으로 다음 수면 시간 계산
    const now = new Date();
    const nextSleep = new Date(now);
    nextSleep.setHours(averageBedTimeHour, 0, 0, 0);
    
    if (nextSleep <= now) {
      nextSleep.setDate(nextSleep.getDate() + 1);
    }
    
    // 예측 요인들
    const factors = [
      '최근 7일 평균 수면 패턴',
      '현재 활동량 수준',
      '마지막 수유 시간',
      '환경 온도 및 습도',
      '이전 낮잠 시간'
    ];
    
    // 신뢰도 계산 (데이터 일관성 기반)
    const sleepHourVariance = recentRecords.reduce((sum, record) => {
      return sum + Math.pow(record.sleepHours - averageSleepDuration, 2);
    }, 0) / recentRecords.length;
    
    const confidence = Math.max(60, Math.min(95, 90 - sleepHourVariance * 10));
    
    // 수면 환경 권장사항
    const recommendations = [];
    const avgTemp = recentRecords.reduce((sum, r) => sum + r.temperature, 0) / recentRecords.length;
    const avgHumidity = recentRecords.reduce((sum, r) => sum + r.humidity, 0) / recentRecords.length;
    
    if (avgTemp > 24) recommendations.push('방 온도를 22-24°C로 낮춰보세요');
    if (avgTemp < 20) recommendations.push('방 온도를 22-24°C로 높여보세요');
    if (avgHumidity < 40) recommendations.push('습도를 40-60%로 유지해보세요');
    if (avgHumidity > 70) recommendations.push('습도를 낮춰보세요');
    
    const avgNightWakings = recentRecords.reduce((sum, r) => sum + r.nightWakings, 0) / recentRecords.length;
    if (avgNightWakings > 2) {
      recommendations.push('취침 전 루틴을 일정하게 유지해보세요');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('현재 수면 환경이 양호합니다');
    }
    
    res.json({
      success: true,
      data: {
        nextSleepTime: nextSleep.toLocaleTimeString('ko-KR', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }),
        sleepDuration: parseFloat(averageSleepDuration.toFixed(1)),
        confidence: Math.round(confidence),
        factors,
        recommendations,
        analysisDate: new Date().toISOString(),
        basedOnDays: recentRecords.length
      }
    });
  } catch (error) {
    console.error('수면 예측 오류:', error);
    res.status(500).json({
      success: false,
      message: '수면 예측에 실패했습니다.',
      error: error.message
    });
  }
});

// POST /api/sleep/record - 수면 기록 추가
router.post('/record', async (req, res) => {
  try {
    const {
      babyId = 1,
      date,
      bedTime,
      wakeTime,
      sleepHours,
      sleepQuality,
      autoSoothings = 0,
      nightWakings = 0,
      temperature,
      humidity,
      noiseLevel,
      notes
    } = req.body;
    
    // 필수 필드 검증
    if (!date || !bedTime || !wakeTime || !sleepHours) {
      return res.status(400).json({
        success: false,
        message: '필수 필드가 누락되었습니다. (date, bedTime, wakeTime, sleepHours)'
      });
    }
    
    const recordId = `sleep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newRecord = {
      id: recordId,
      babyId: parseInt(babyId),
      date,
      bedTime,
      wakeTime,
      sleepHours: parseFloat(sleepHours),
      sleepQuality: sleepQuality || 'fair',
      autoSoothings: parseInt(autoSoothings),
      nightWakings: parseInt(nightWakings),
      temperature: temperature ? parseFloat(temperature) : null,
      humidity: humidity ? parseFloat(humidity) : null,
      noiseLevel: noiseLevel ? parseFloat(noiseLevel) : null,
      notes: notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    dbConfig.memory.sleepRecords.set(recordId, newRecord);
    
    console.log(`💤 새 수면 기록 추가됨: ${recordId}`);
    
    res.status(201).json({
      success: true,
      message: '수면 기록이 성공적으로 추가되었습니다.',
      data: newRecord
    });
  } catch (error) {
    console.error('수면 기록 추가 오류:', error);
    res.status(500).json({
      success: false,
      message: '수면 기록 추가에 실패했습니다.',
      error: error.message
    });
  }
});

// PUT /api/sleep/record/:id - 수면 기록 수정
router.put('/record/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const existingRecord = dbConfig.memory.sleepRecords.get(id);
    if (!existingRecord) {
      return res.status(404).json({
        success: false,
        message: '수면 기록을 찾을 수 없습니다.'
      });
    }
    
    const updatedRecord = {
      ...existingRecord,
      ...updateData,
      id, // ID는 변경되지 않도록
      updatedAt: new Date().toISOString()
    };
    
    dbConfig.memory.sleepRecords.set(id, updatedRecord);
    
    res.json({
      success: true,
      message: '수면 기록이 성공적으로 수정되었습니다.',
      data: updatedRecord
    });
  } catch (error) {
    console.error('수면 기록 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: '수면 기록 수정에 실패했습니다.',
      error: error.message
    });
  }
});

// DELETE /api/sleep/record/:id - 수면 기록 삭제
router.delete('/record/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const existed = dbConfig.memory.sleepRecords.has(id);
    if (!existed) {
      return res.status(404).json({
        success: false,
        message: '수면 기록을 찾을 수 없습니다.'
      });
    }
    
    dbConfig.memory.sleepRecords.delete(id);
    
    res.json({
      success: true,
      message: '수면 기록이 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('수면 기록 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '수면 기록 삭제에 실패했습니다.',
      error: error.message
    });
  }
});

// GET /api/sleep/insights - 수면 인사이트
router.get('/insights', async (req, res) => {
  try {
    const { babyId = 1 } = req.query;
    
    const records = Array.from(dbConfig.memory.sleepRecords.values())
      .filter(record => record.babyId == babyId)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 30); // 최근 30일
    
    if (records.length < 3) {
      return res.json({
        success: true,
        data: {
          insights: ['충분한 데이터가 수집되면 더 정확한 인사이트를 제공할 수 있습니다.'],
          patterns: [],
          recommendations: ['꾸준히 수면 기록을 작성해 주세요.']
        }
      });
    }
    
    const insights = [];
    const patterns = [];
    const recommendations = [];
    
    // 수면 시간 트렌드 분석
    const recentWeek = records.slice(0, 7);
    const previousWeek = records.slice(7, 14);
    
    if (recentWeek.length >= 5 && previousWeek.length >= 5) {
      const recentAvg = recentWeek.reduce((sum, r) => sum + r.sleepHours, 0) / recentWeek.length;
      const previousAvg = previousWeek.reduce((sum, r) => sum + r.sleepHours, 0) / previousWeek.length;
      
      if (recentAvg > previousAvg + 0.5) {
        insights.push('지난주 대비 수면 시간이 개선되었습니다! 👍');
        patterns.push('수면 시간 증가 트렌드');
      } else if (recentAvg < previousAvg - 0.5) {
        insights.push('지난주 대비 수면 시간이 감소했습니다.');
        recommendations.push('수면 환경과 루틴을 다시 점검해보세요.');
      }
    }
    
    // 수면 품질 분석
    const goodSleepDays = records.filter(r => r.sleepQuality === 'good').length;
    const goodSleepRatio = goodSleepDays / records.length;
    
    if (goodSleepRatio > 0.7) {
      insights.push('전반적으로 좋은 수면 품질을 유지하고 있습니다! 🌙');
    } else if (goodSleepRatio < 0.4) {
      recommendations.push('수면 품질 개선을 위한 환경 조정이 필요할 수 있습니다.');
    }
    
    // 자동 진정 시스템 효과성
    const autoSoothingData = records.filter(r => r.autoSoothings > 0);
    if (autoSoothingData.length > 0) {
      const avgSoothings = autoSoothingData.reduce((sum, r) => sum + r.autoSoothings, 0) / autoSoothingData.length;
      
      if (avgSoothings < 2) {
        insights.push('자동 진정 시스템이 효과적으로 작동하고 있습니다.');
        patterns.push('낮은 야간 깨움 빈도');
      } else {
        recommendations.push('자동 진정 설정을 조정하거나 수면 환경을 개선해보세요.');
      }
    }
    
    // 환경 요인 분석
    const tempData = records.filter(r => r.temperature).map(r => r.temperature);
    if (tempData.length > 0) {
      const avgTemp = tempData.reduce((sum, t) => sum + t, 0) / tempData.length;
      
      if (avgTemp > 25) {
        recommendations.push('방 온도가 높을 수 있습니다. 22-24°C가 적정 온도입니다.');
      } else if (avgTemp < 20) {
        recommendations.push('방 온도가 낮을 수 있습니다. 22-24°C가 적정 온도입니다.');
      }
    }
    
    res.json({
      success: true,
      data: {
        insights,
        patterns,
        recommendations,
        analysisDate: new Date().toISOString(),
        recordsAnalyzed: records.length
      }
    });
  } catch (error) {
    console.error('수면 인사이트 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '수면 인사이트를 가져오는데 실패했습니다.',
      error: error.message
    });
  }
});

export default router;