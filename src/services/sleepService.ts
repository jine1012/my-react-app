// src/services/sleepService.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.MODE === 'production' 
  ? '/api' 
  : 'http://localhost:5000/api';

const sleepApi = axios.create({
  baseURL: `${API_BASE_URL}/sleep`,
  timeout: 10000,
});

export interface SleepRecord {
  id: string;
  babyId: number;
  date: string;
  bedTime: string;
  wakeTime: string;
  sleepHours: number;
  sleepQuality: 'good' | 'fair' | 'poor';
  autoSoothings: number;
  nightWakings: number;
  temperature?: number;
  humidity?: number;
  noiseLevel?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SleepStatistics {
  totalRecords: number;
  averageSleepHours: number;
  averageBedTime: string;
  averageWakeTime: string;
  sleepQualityDistribution: {
    good: number;
    fair: number;
    poor: number;
  };
  totalAutoSoothings: number;
  averageNightWakings: number;
  sleepTrend: 'improving' | 'stable' | 'declining';
  period: number;
}

export interface SleepPrediction {
  nextSleepTime: string;
  sleepDuration: number;
  confidence: number;
  factors: string[];
  recommendations: string[];
  analysisDate: string;
  basedOnDays: number;
}

export interface SleepInsights {
  insights: string[];
  patterns: string[];
  recommendations: string[];
  analysisDate: string;
  recordsAnalyzed: number;
}

// 수면 기록 조회
export const getSleepRecords = async (params?: {
  babyId?: number;
  startDate?: string;
  endDate?: string;
  limit?: number;
}): Promise<SleepRecord[]> => {
  try {
    const response = await sleepApi.get('/records', { params });
    return response.data.data;
  } catch (error) {
    console.error('수면 기록 조회 실패:', error);
    throw new Error('수면 기록을 가져오는데 실패했습니다.');
  }
};

// 수면 통계 조회
export const getSleepStatistics = async (params?: {
  babyId?: number;
  period?: number; // 일 단위
}): Promise<SleepStatistics> => {
  try {
    const response = await sleepApi.get('/statistics', { params });
    return response.data.data;
  } catch (error) {
    console.error('수면 통계 조회 실패:', error);
    throw new Error('수면 통계를 가져오는데 실패했습니다.');
  }
};

// AI 수면 예측
export const getSleepPrediction = async (babyId: number = 1): Promise<SleepPrediction> => {
  try {
    const response = await sleepApi.post('/predict', { babyId });
    return response.data.data;
  } catch (error) {
    console.error('수면 예측 실패:', error);
    throw new Error('수면 예측에 실패했습니다.');
  }
};

// 수면 기록 추가
export const addSleepRecord = async (record: Omit<SleepRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<SleepRecord> => {
  try {
    const response = await sleepApi.post('/record', record);
    return response.data.data;
  } catch (error) {
    console.error('수면 기록 추가 실패:', error);
    throw new Error('수면 기록 추가에 실패했습니다.');
  }
};

// 수면 기록 수정
export const updateSleepRecord = async (id: string, record: Partial<SleepRecord>): Promise<SleepRecord> => {
  try {
    const response = await sleepApi.put(`/record/${id}`, record);
    return response.data.data;
  } catch (error) {
    console.error('수면 기록 수정 실패:', error);
    throw new Error('수면 기록 수정에 실패했습니다.');
  }
};

// 수면 기록 삭제
export const deleteSleepRecord = async (id: string): Promise<void> => {
  try {
    await sleepApi.delete(`/record/${id}`);
  } catch (error) {
    console.error('수면 기록 삭제 실패:', error);
    throw new Error('수면 기록 삭제에 실패했습니다.');
  }
};

// 수면 인사이트 조회
export const getSleepInsights = async (babyId: number = 1): Promise<SleepInsights> => {
  try {
    const response = await sleepApi.get('/insights', { params: { babyId } });
    return response.data.data;
  } catch (error) {
    console.error('수면 인사이트 조회 실패:', error);
    throw new Error('수면 인사이트를 가져오는데 실패했습니다.');
  }
};

// 수면 품질 색상 헬퍼
export const getSleepQualityColor = (quality: 'good' | 'fair' | 'poor'): string => {
  switch (quality) {
    case 'good':
      return 'bg-green-100 text-green-700';
    case 'fair':
      return 'bg-yellow-100 text-yellow-700';
    case 'poor':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

// 수면 품질 텍스트 헬퍼
export const getSleepQualityText = (quality: 'good' | 'fair' | 'poor'): string => {
  switch (quality) {
    case 'good':
      return '좋음';
    case 'fair':
      return '보통';
    case 'poor':
      return '부족';
    default:
      return '알 수 없음';
  }
};

// 수면 트렌드 색상 헬퍼
export const getSleepTrendColor = (trend: 'improving' | 'stable' | 'declining'): string => {
  switch (trend) {
    case 'improving':
      return 'text-green-600';
    case 'stable':
      return 'text-blue-600';
    case 'declining':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

// 수면 트렌드 텍스트 헬퍼
export const getSleepTrendText = (trend: 'improving' | 'stable' | 'declining'): string => {
  switch (trend) {
    case 'improving':
      return '개선됨';
    case 'stable':
      return '안정적';
    case 'declining':
      return '감소됨';
    default:
      return '알 수 없음';
  }
};

// 시간 포맷 헬퍼
export const formatTime = (timeString: string): string => {
  try {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  } catch {
    return timeString;
  }
};

// 수면 시간 추천 헬퍼
export const getSleepRecommendation = (ageInMonths: number): { 
  minHours: number; 
  maxHours: number; 
  description: string; 
} => {
  if (ageInMonths <= 3) {
    return {
      minHours: 14,
      maxHours: 17,
      description: '신생아는 하루에 14-17시간의 수면이 필요합니다.'
    };
  } else if (ageInMonths <= 12) {
    return {
      minHours: 12,
      maxHours: 15,
      description: '영아는 하루에 12-15시간의 수면이 필요합니다.'
    };
  } else if (ageInMonths <= 24) {
    return {
      minHours: 11,
      maxHours: 14,
      description: '유아는 하루에 11-14시간의 수면이 필요합니다.'
    };
  } else {
    return {
      minHours: 10,
      maxHours: 13,
      description: '아이는 하루에 10-13시간의 수면이 필요합니다.'
    };
  }
};

export default {
  getSleepRecords,
  getSleepStatistics,
  getSleepPrediction,
  addSleepRecord,
  updateSleepRecord,
  deleteSleepRecord,
  getSleepInsights,
  getSleepQualityColor,
  getSleepQualityText,
  getSleepTrendColor,
  getSleepTrendText,
  formatTime,
  getSleepRecommendation
};