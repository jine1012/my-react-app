// src/App.tsx
import { Outlet } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import "./App.css";

export default function App() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
