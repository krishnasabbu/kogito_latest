import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { DashboardPage } from './components/Dashboard/DashboardPage';
import { ConfigurationPage } from './components/TestConfiguration/ConfigurationPage';
import { MonitoringDashboard } from './components/Monitoring/MonitoringDashboard';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/configure" element={<ConfigurationPage />} />
            <Route path="/configure/:testId" element={<ConfigurationPage />} />
            <Route path="/monitor/:testId" element={<MonitoringDashboard />} />
          </Routes>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#ffffff',
                color: '#1f2937',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              },
            }}
          />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;