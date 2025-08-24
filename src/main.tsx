// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import Live from './pages/Live';
import Logs from './pages/Logs';

import CryAnalysis from './pages/CryAnalysis';
import SleepAnalysis from './pages/SleepAnalysis'; 
import { BabyChatbot } from './components/BabyChatbot';
import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,            // App → AppLayout + <Outlet />
    children: [
      { index: true, element: <Home /> },
      { path: 'live', element: <Live /> },
      { path: 'sleep', element: <SleepAnalysis /> }, 
      { path: 'logs', element: <Logs /> },
      { path: 'analysis', element: <CryAnalysis /> }, // 경로 변경: /diary → /analysis
      // { path: 'diary', element: <Diary /> }, // 필요시 주석 해제
      { path: 'chatbot', element: <BabyChatbot /* babyAgeInMonths={6} */ /> },
      { path: '*', element: <div style={{ padding: 16 }}>Not Found</div> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);