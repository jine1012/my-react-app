import React from "react";

// ====== 타입 정의 ======
export interface SensorData {
  temperature: number;
  humidity: number;
  bodyTemperature: number;
  humidifierState: boolean;
  actuatorState: boolean;
  timestamp: string;
}

export interface ConnectionStatus {
  connected: boolean;
  reconnectAttempts: number;
  baseUrl: string;
}

export interface CurrentState {
  sleep_state?: string;
  safety_state?: string;
}

export interface SystemStatus {
  status: string;
  modules: Record<string, unknown>;  // 구체적인 구조 알면 수정 가능
  currentState: CurrentState;
  sensorData: SensorData;
  timestamp: string;
}

export interface AudioStatus {
  monitoring: boolean;
  lastClassification: string;
  timestamp: string;
}

// ====== JetsonService 클래스 ======
class JetsonService {
  baseUrl: string;
  isConnected: boolean;
  sensorDataCallbacks: Set<(data: SensorData) => void>;
  sensorInterval: ReturnType<typeof setInterval> | null;
  reconnectAttempts: number;
  maxReconnectAttempts: number;

  constructor() {
    this.baseUrl = import.meta.env.VITE_JETSON_URL || "http://192.168.0.105:5000";
    this.isConnected = false;
    this.sensorDataCallbacks = new Set();
    this.sensorInterval = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  // 연결 상태 확인
  async checkConnection(): Promise<SystemStatus> {
    const response = await fetch(`${this.baseUrl}/status`, { method: "GET" });
    if (!response.ok) throw new Error("연결 실패");
    this.isConnected = true;
    this.reconnectAttempts = 0;
    return await response.json();
  }

  // 센서 데이터 실시간 수신 시작
  startSensorMonitoring(callback?: (data: SensorData) => void, interval = 1000) {
    if (callback) this.sensorDataCallbacks.add(callback);

    if (!this.sensorInterval) {
      this.sensorInterval = setInterval(async () => {
        try {
          const sensorData = await this.getSensorData();
          this.sensorDataCallbacks.forEach((cb) => cb(sensorData));
        } catch {
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => this.checkConnection(), 2000);
          }
        }
      }, interval);
    }
  }

  // 센서 모니터링 중지
  stopSensorMonitoring(callback?: (data: SensorData) => void) {
    if (callback) this.sensorDataCallbacks.delete(callback);
    if (this.sensorDataCallbacks.size === 0 && this.sensorInterval) {
      clearInterval(this.sensorInterval);
      this.sensorInterval = null;
    }
  }

  // 센서 데이터 가져오기
  async getSensorData(): Promise<SensorData> {
    const response = await fetch(`${this.baseUrl}/sensors`);
    const data = await response.json();
    if (!data.success) throw new Error("센서 데이터 오류");

    return {
      temperature: data.data.temperature,
      humidity: data.data.humidity,
      bodyTemperature: data.data.body_temperature,
      humidifierState: data.data.humidifier_state,
      actuatorState: data.data.actuator_state,
      timestamp: data.timestamp,
    };
  }

  // 카메라 제어
  async startCamera(): Promise<Record<string, unknown>> {
    const res = await fetch(`${this.baseUrl}/camera/start`, { method: "POST" });
    return await res.json();
  }

  async stopCamera(): Promise<Record<string, unknown>> {
    const res = await fetch(`${this.baseUrl}/camera/stop`, { method: "POST" });
    return await res.json();
  }

  getCameraStreamUrl(): string {
    return `${this.baseUrl}/camera/stream`;
  }

  // 오디오 상태
  async getAudioStatus(): Promise<AudioStatus> {
    const res = await fetch(`${this.baseUrl}/audio/status`);
    const data = await res.json();
    if (!data.success) throw new Error("오디오 상태 오류");

    return {
      monitoring: data.monitoring,
      lastClassification: data.last_classification,
      timestamp: data.timestamp,
    };
  }

  // ✅ 오디오 울음 감지 제어 추가
  async startAudioMonitoring(): Promise<Record<string, unknown>> {
    const res = await fetch(`${this.baseUrl}/audio/start`, { method: "POST" });
    return await res.json();
  }

  async stopAudioMonitoring(): Promise<Record<string, unknown>> {
    const res = await fetch(`${this.baseUrl}/audio/stop`, { method: "POST" });
    return await res.json();
  }

  // 액추에이터
  async controlActuator(
    action: "on" | "off" | "toggle" = "toggle",
    duration = 30
  ): Promise<Record<string, unknown>> {
    const res = await fetch(`${this.baseUrl}/control/actuator`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, duration }),
    });
    return await res.json();
  }

  // 가습기
  async controlHumidifier(
    action: "on" | "off" | "toggle" = "toggle"
  ): Promise<Record<string, unknown>> {
    const res = await fetch(`${this.baseUrl}/control/humidifier`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    return await res.json();
  }

  // 연결 상태
  getConnectionStatus(): ConnectionStatus {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      baseUrl: this.baseUrl,
    };
  }

  // 시스템 상태
  async getSystemStatus(): Promise<SystemStatus> {
    const res = await fetch(`${this.baseUrl}/status`);
    return await res.json();
  }

  // 모델 제어
  async toggleModel(active: boolean): Promise<Record<string, unknown>> {
  const res = await fetch(`${this.baseUrl}/model/toggle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ active }),
  });
  return await res.json();
}



}




// ====== 싱글톤 ======
const jetsonService = new JetsonService();
export default jetsonService;

// ====== React Hook ======
export const useJetsonService = () => {
  const [connectionStatus, setConnectionStatus] = React.useState<ConnectionStatus>(
    jetsonService.getConnectionStatus()
  );
  const [systemStatus, setSystemStatus] = React.useState<SystemStatus | null>(null);
  const [sensorData, setSensorData] = React.useState<SensorData | null>(null);
  const [audioStatus, setAudioStatus] = React.useState<AudioStatus | null>(null);

  React.useEffect(() => {
    const checkConnection = async () => {
      try {
        await jetsonService.checkConnection();
        setConnectionStatus(jetsonService.getConnectionStatus());
      } catch {
        setConnectionStatus(jetsonService.getConnectionStatus());
      }
    };

    const updateSystemStatus = async () => {
      try {
        const status = await jetsonService.getSystemStatus();
        setSystemStatus(status);
        setSensorData(status.sensorData);
      } catch (err) {
        console.error("시스템 상태 오류:", err);
      }
    };

    const updateAudioStatus = async () => {
      try {
        const status = await jetsonService.getAudioStatus();
        setAudioStatus(status);
      } catch (err) {
        console.error("오디오 상태 오류:", err);
      }
    };

    checkConnection();
    const statusInterval = setInterval(() => {
      updateSystemStatus();
      updateAudioStatus();
    }, 5000);

    const handleSensorData = (data: SensorData) => setSensorData(data);
    jetsonService.startSensorMonitoring(handleSensorData);

    return () => {
      clearInterval(statusInterval);
      jetsonService.stopSensorMonitoring(handleSensorData);
    };
  }, []);

  return {
    jetsonService,
    connectionStatus,
    systemStatus,
    sensorData,
    audioStatus,
    isConnected: connectionStatus.connected,
  };
};
