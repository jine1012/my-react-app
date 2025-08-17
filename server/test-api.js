// API 테스트를 위한 간단한 테스트 스크립트
// 서버가 실행 중일 때 이 파일을 실행하여 API를 테스트할 수 있습니다.

const BASE_URL = 'http://localhost:5000/api';

// API 테스트 함수들
const testHealthCheck = async () => {
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    console.log('✅ Health Check:', data);
  } catch (error) {
    console.error('❌ Health Check Failed:', error.message);
  }
};

const testBabyInfo = async () => {
  try {
    const response = await fetch(`${BASE_URL}/baby/info`);
    const data = await response.json();
    console.log('✅ Baby Info:', data);
  } catch (error) {
    console.error('❌ Baby Info Failed:', error.message);
  }
};

const testQuickQuestions = async () => {
  try {
    const response = await fetch(`${BASE_URL}/chat/quick-questions`);
    const data = await response.json();
    console.log('✅ Quick Questions:', data);
  } catch (error) {
    console.error('❌ Quick Questions Failed:', error.message);
  }
};

const testDiaryEntries = async () => {
  try {
    const response = await fetch(`${BASE_URL}/diary/entries?limit=5`);
    const data = await response.json();
    console.log('✅ Diary Entries:', data);
  } catch (error) {
    console.error('❌ Diary Entries Failed:', error.message);
  }
};

const testChatMessage = async () => {
  try {
    const response = await fetch(`${BASE_URL}/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: '아기가 밤에 자주 깨는데 어떻게 해야 할까요?',
        babyInfo: { age: '6개월' }
      })
    });
    const data = await response.json();
    console.log('✅ Chat Message:', data);
  } catch (error) {
    console.error('❌ Chat Message Failed:', error.message);
  }
};

const testGrowthRecord = async () => {
  try {
    const response = await fetch(`${BASE_URL}/baby/growth-record`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        weight: 6.5,
        height: 65,
        headCircumference: 41,
        notes: '정상적으로 성장하고 있습니다.'
      })
    });
    const data = await response.json();
    console.log('✅ Growth Record:', data);
  } catch (error) {
    console.error('❌ Growth Record Failed:', error.message);
  }
};

// 모든 테스트 실행
const runAllTests = async () => {
  console.log('🧪 Starting API Tests...\n');
  
  await testHealthCheck();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  await testBabyInfo();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  await testQuickQuestions();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  await testDiaryEntries();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  await testChatMessage();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  await testGrowthRecord();
  
  console.log('\n🎉 All tests completed!');
};

// 스크립트가 직접 실행될 때만 테스트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
}

export {
  testHealthCheck,
  testBabyInfo,
  testQuickQuestions,
  testDiaryEntries,
  testChatMessage,
  testGrowthRecord,
  runAllTests
};
