import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import Timer from './pages/Timer';
import Activities from './pages/Activities';
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
    <Router basename={import.meta.env.PROD ? "/time-tracker/" : "/"}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Timer />} />
          <Route path="activities" element={<Activities />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
