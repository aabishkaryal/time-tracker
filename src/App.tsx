import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import Timer from './pages/Timer';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import { useTimerStore } from './store';
import { Toaster } from './components/ui/sonner';

function App() {
  const { applyTheme } = useTimerStore();

  // Apply theme on app startup
  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Timer />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
