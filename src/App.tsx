import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout/Layout';
import { DashboardPage } from './components/Dashboard/DashboardPage';
import { ConfigurationPage } from './components/TestConfiguration/ConfigurationPage';
import { MonitoringDashboard } from './components/Monitoring/MonitoringDashboard';
import { ChampionChallengeApp } from './components/ChampionChallenge/ChampionChallengeApp';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/configure" element={<ConfigurationPage />} />
            <Route path="/configure/:testId" element={<ConfigurationPage />} />
            <Route path="/monitor/:testId" element={<MonitoringDashboard />} />
            <Route path="/champion-challenge" element={<ChampionChallengeApp />} />
          </Route>
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
      </Router>
    </ThemeProvider>
  );
}

export default App;