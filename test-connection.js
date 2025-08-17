// test-connection.js
import axios from 'axios';

const NODEJS_SERVER = 'http://192.168.0.4:5000';
const FLASK_SERVER = 'http://192.168.0.94:5000';

async function testConnections() {
  console.log('🔍 서버 연결 테스트 시작...\n');

  // 1. Node.js 서버 연결 테스트
  console.log('1️⃣ Node.js 서버 연결 테스트...');
  try {
    const nodeResponse = await axios.get(`${NODEJS_SERVER}/api/health`, { timeout: 5000 });
    console.log('✅ Node.js 서버 연결 성공');
    console.log('   상태:', nodeResponse.data.status);
    console.log('   라즈베리파이 설정:', nodeResponse.data.services.raspberryPi);
  } catch (error) {
    console.log('❌ Node.js 서버 연결 실패:', error.message);
  }

  console.log('');

  // 2. Flask 서버 연결 테스트
  console.log('2️⃣ Flask 서버 연결 테스트...');
  try {
    const flaskResponse = await axios.get(`${FLASK_SERVER}/health`, { timeout: 5000 });
    console.log('✅ Flask 서버 연결 성공');
    console.log('   응답:', flaskResponse.data);
  } catch (error) {
    console.log('❌ Flask 서버 연결 실패:', error.message);
  }

  console.log('');

  // 3. Node.js에서 Flask로의 연결 테스트
  console.log('3️⃣ Node.js → Flask 연결 테스트...');
  try {
    const testResponse = await axios.get(`${NODEJS_SERVER}/api/cry-detection/test-connection`, { timeout: 10000 });
    console.log('✅ Node.js → Flask 연결 성공');
    console.log('   라즈베리파이 상태:', testResponse.data.raspberryPi.status);
    console.log('   연결 URL:', testResponse.data.raspberryPi.url);
  } catch (error) {
    console.log('❌ Node.js → Flask 연결 실패:', error.message);
  }

  console.log('\n🏁 연결 테스트 완료');
}

// 실행
testConnections().catch(console.error);
