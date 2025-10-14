import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout/Layout';
import { ChampionChallengeApp } from './components/ChampionChallenge/ChampionChallengeApp';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-bolt-bg-primary transition-colors">
          <Routes>
            {/* Main Layout with Sidebar - Always show Layout */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/" replace />} />
             <Route path="champion-challenge" element={<ChampionChallengeApp />} />
            </Route>
          </Routes>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--toast-bg)',
                color: 'var(--toast-color)',
                border: '1px solid var(--toast-border)',
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