import '../App.css';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, Camera, List, NotebookText, Settings } from 'lucide-react'; // ← 추가
import ScrollToTop from './ScrollToTop';
import ProfileBar from './ProfileBar';

type AppLayoutProps = { children?: React.ReactNode };

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="ui-app">
      <ScrollToTop />

      <header className="ui-header">
        <div className="ui-header-inner">
          <h1 className="ui-title">Baby Monitor</h1>
        </div>
        <ProfileBar onChange={(id) => console.log('selected:', id)} />
      </header>

      <main className="ui-main">{children ?? <Outlet />}</main>

      <nav className="ui-tabbar">
        <NavLink to="/" end className="ui-tab">
          {({ isActive }) => (
            <span className={`ui-tab-inner ${isActive ? 'active' : ''}`}>
              <Home size={18} /> <span>Home</span>
            </span>
          )}
        </NavLink>
        <NavLink to="/live" className="ui-tab">
          {({ isActive }) => (
            <span className={`ui-tab-inner ${isActive ? 'active' : ''}`}>
              <Camera size={18} /> <span>Live</span>
            </span>
          )}
        </NavLink>
        <NavLink to="/logs" className="ui-tab">
          {({ isActive }) => (
            <span className={`ui-tab-inner ${isActive ? 'active' : ''}`}>
              <List size={18} /> <span>Logs</span>
            </span>
          )}
        </NavLink>
        <NavLink to="/diary" className="ui-tab">
          {({ isActive }) => (
            <span className={`ui-tab-inner ${isActive ? 'active' : ''}`}>
              <NotebookText size={18} /> <span>Diary</span>
            </span>
          )}
        </NavLink>


        <NavLink to="/settings" className="ui-tab">
          {({ isActive }) => (
            <span className={`ui-tab-inner ${isActive ? 'active' : ''}`}>
              <Settings size={18} /> <span>Settings</span>
            </span>
          )}
        </NavLink>
      </nav>
    </div>
  );
}
