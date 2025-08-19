// src/App.tsx
import { Outlet } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import GlobalChatbot from './components/GlobalChatbot';
import Splash from "./components/Splash";
import "./App.css";



export default function App() {
  return (
    <AppLayout>
      <Splash />
      <Outlet />
      <GlobalChatbot /> {/* ← 전역 플로팅 챗봇 */}
    </AppLayout>
  );
}