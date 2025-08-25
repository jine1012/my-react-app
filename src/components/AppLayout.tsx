// src/components/AppLayout.tsx
import '../App.css';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, Camera, Moon, List, BarChart3, Menu, Bell } from 'lucide-react';
import ScrollToTop from './ScrollToTop';
import ProfileBar from './ProfileBar';
// 🔥 PNG 로고 이미지 import (본인의 PNG 파일명으로 변경하세요)
import logoImage from '../assets/logo.png';

type AppLayoutProps = {
  children?: React.ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="mobile-app">
      <ScrollToTop />

      {/* 상단 안전영역 (상태바 공간) */}
      <div className="safe-area-top"></div>

      {/* 네비게이션 헤더 */}
      <header className="nav-header">
        <button className="nav-btn">
          <Menu className="w-6 h-6 text-slate-700" />
        </button>
        
        <div className="logo-container">
          {/* 🔥 네모박스 제거하고 PNG 이미지만 표시 */}
          <img 
            src={logoImage} 
            alt="로고" 
            className="header-logo-only"
            onError={(e) => {
              // 이미지 로드 실패 시 하트 아이콘으로 대체
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = document.createElement('div');
              fallback.innerHTML = '❤️';
              fallback.style.fontSize = '24px';
              target.parentElement?.appendChild(fallback);
            }}
          />
          <span className="logo-text">POMMONS</span>
        </div>
        
        <button className="nav-btn">
          <Bell className="w-6 h-6 text-slate-700" />
        </button>
      </header>

      {/* 프로필 바 */}
      <div className="profile-section">
        <ProfileBar onChange={(id) => console.log('selected:', id)} />
      </div>

      {/* 메인 콘텐츠 */}
      <main className="main-content">
        {children ?? <Outlet />}
      </main>

      {/* 하단 탭바 - 홈-실시간-수면-로그-분석 */}
      <nav className="bottom-tabbar">
        <NavLink to="/" end className="tab-item">
          {({ isActive }) => (
            <div className={`tab-content ${isActive ? 'active' : ''}`}>
              <Home size={20} />
              <span>홈</span>
            </div>
          )}
        </NavLink>
        
        <NavLink to="/live" className="tab-item">
          {({ isActive }) => (
            <div className={`tab-content ${isActive ? 'active' : ''}`}>
              <Camera size={20} />
              <span>실시간</span>
            </div>
          )}
        </NavLink>
        
        <NavLink to="/sleep" className="tab-item">
          {({ isActive }) => (
            <div className={`tab-content ${isActive ? 'active' : ''}`}>
              <Moon size={20} />
              <span>수면</span>
            </div>
          )}
        </NavLink>
        
        <NavLink to="/logs" className="tab-item">
          {({ isActive }) => (
            <div className={`tab-content ${isActive ? 'active' : ''}`}>
              <List size={20} />
              <span>로그</span>
            </div>
          )}
        </NavLink>
        
        <NavLink to="/analysis" className="tab-item">
          {({ isActive }) => (
            <div className={`tab-content ${isActive ? 'active' : ''}`}>
              <BarChart3 size={20} />
              <span>분석</span>
            </div>
          )}
        </NavLink>
      </nav>
    </div>
  );
}