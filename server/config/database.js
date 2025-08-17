// 데이터베이스 설정 파일
// 현재는 메모리 기반으로 구현되어 있지만, 향후 실제 데이터베이스 연결을 위한 구조

export const dbConfig = {
  // 메모리 기반 임시 저장소
  memory: {
    babies: new Map(),
    diaries: new Map(),
    chatHistory: new Map(),
    growthRecords: new Map()
  },
  
  // 향후 실제 데이터베이스 연결을 위한 설정
  // postgres: {
  //   host: process.env.DB_HOST || 'localhost',
  //   port: process.env.DB_PORT || 5432,
  //   database: process.env.DB_NAME || 'baby_app',
  //   user: process.env.DB_USER || 'username',
  //   password: process.env.DB_PASSWORD || 'password',
  // },
  
  // mongodb: {
  //   uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/baby_app',
  //   options: {
  //     useNewUrlParser: true,
  //     useUnifiedTopology: true,
  //   }
  // }
};

// 메모리 데이터 초기화
export const initializeMemoryDB = () => {
  // 샘플 데이터 추가
  dbConfig.memory.babies.set(1, {
    id: 1,
    name: "아기",
    birthDate: "2024-01-01",
    gender: "여자",
    currentAge: "3개월",
    weight: 6.2,
    height: 62,
    headCircumference: 40
  });

  dbConfig.memory.diaries.set(1, {
    id: 1,
    title: "오늘 아기가 처음으로 뒤집기를 했어요!",
    content: "아기가 처음으로 뒤집기를 성공했어요. 정말 기뻤습니다...",
    mood: "행복",
    activities: ["뒤집기 연습", "장난감 놀이"],
    babyMood: "활발",
    date: new Date().toISOString(),
    tags: ["첫발달", "뒤집기"],
    createdAt: new Date().toISOString()
  });

  console.log('📊 Memory database initialized with sample data');
};

// 데이터베이스 연결 함수 (향후 확장용)
export const connectDatabase = async () => {
  try {
    // 현재는 메모리 기반이므로 즉시 성공
    initializeMemoryDB();
    
    // 향후 실제 데이터베이스 연결 시:
    // const client = await pool.connect();
    // console.log('✅ Database connected successfully');
    // return client;
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

// 데이터베이스 연결 해제 함수 (향후 확장용)
export const disconnectDatabase = async () => {
  try {
    // 메모리 정리
    dbConfig.memory.babies.clear();
    dbConfig.memory.diaries.clear();
    dbConfig.memory.chatHistory.clear();
    dbConfig.memory.growthRecords.clear();
    
    console.log('📊 Memory database cleared');
    
    // 향후 실제 데이터베이스 연결 해제 시:
    // await pool.end();
    // console.log('✅ Database disconnected successfully');
    
    return true;
  } catch (error) {
    console.error('❌ Database disconnection failed:', error);
    throw error;
  }
};
