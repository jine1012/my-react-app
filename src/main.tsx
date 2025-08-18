// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import Live from './pages/Live';
import Logs from './pages/Logs';
import Diary from './pages/Diary';
import CryAnalysis from './pages/CryAnalysis';
import SleepAnalysis from './pages/SleepAnalysis'; 
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
      { path: 'diary', element: <Diary /> },
      { path: 'analysis', element: <CryAnalysis /> },
      { path: '*', element: <div style={{ padding: 16 }}>Not Found</div> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);