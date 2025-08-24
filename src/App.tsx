// src/App.tsx
import AppLayout from './components/AppLayout';
import { Outlet } from 'react-router-dom';
// import { BabyChatbot } from './components/BabyChatbot';
import  GlobalChatbot  from './components/GlobalChatbot'; // 추가

function App() {
  return (
    <AppLayout>
      <Outlet />   {/* RouterProvider에서 children이 들어올 자리 */}
      <GlobalChatbot /> {/* 전역 챗봇 추가 */}
    </AppLayout>
  );
}

export default App;
