// src/App.tsx
import AppLayout from './components/AppLayout';
import { Outlet } from 'react-router-dom';

function App() {
  return (
    <AppLayout>
      <Outlet />   {/* RouterProvider에서 children이 들어올 자리 */}
    </AppLayout>
  );
}

export default App;
