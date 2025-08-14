import '../App.css';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, Camera, List, NotebookText, Brain, Menu, Bell, Heart } from 'lucide-react';
import ScrollToTop from './ScrollToTop';
import ProfileBar from './ProfileBar';

type AppLayoutProps = { children?: React.ReactNode };

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
          <div className="logo-icon">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <span className="logo-text">BabyLove</span>
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

      {/* 하단 탭바 */}
      <nav className="bottom-tabbar">
        <NavLink to="/" end className="tab-item">
          {({ isActive }) => (
            <div className={`tab-content ${isActive ? 'active' : ''}`}>
              <Home size={22} />
              <span>홈</span>
            </div>
          )}
        </NavLink>
        
        <NavLink to="/live" className="tab-item">
          {({ isActive }) => (
            <div className={`tab-content ${isActive ? 'active' : ''}`}>
              <Camera size={22} />
              <span>실시간</span>
            </div>
          )}
        </NavLink>
        
        <NavLink to="/logs" className="tab-item">
          {({ isActive }) => (
            <div className={`tab-content ${isActive ? 'active' : ''}`}>
              <List size={22} />
              <span>로그</span>
            </div>
          )}
        </NavLink>
        
        <NavLink to="/diary" className="tab-item">
          {({ isActive }) => (
            <div className={`tab-content ${isActive ? 'active' : ''}`}>
              <NotebookText size={22} />
              <span>일기</span>
            </div>
          )}
        </NavLink>
        
        <NavLink to="/analysis" className="tab-item">
          {({ isActive }) => (
            <div className={`tab-content ${isActive ? 'active' : ''}`}>
              <Brain size={22} />
              <span>분석</span>
            </div>
          )}
        </NavLink>
      </nav>
    </div>
  );
}