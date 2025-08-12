import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import Live from './pages/Live';
import Logs from './pages/Logs';
import Diary from './pages/Diary';
import Settings from './pages/Settings';
import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,            // App → AppLayout + <Outlet />
    children: [
      { index: true, element: <Home /> },
      { path: 'live', element: <Live /> },
      { path: 'logs', element: <Logs /> },
      { path: 'diary', element: <Diary /> },
      { path: 'settings', element: <Settings /> },
      { path: '*', element: <div style={{ padding: 16 }}>Not Found</div> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
