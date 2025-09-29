import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SearchPage from './components/SearchPage';
import ResultsPage from './components/ResultsPage';
import ContentViewer from './components/ContentViewer';
import { ThemeProvider } from './contexts/ThemeContext';
import './App.css';

function App() {
  // Removed dev-tools lockout to support open-source contributors
  
  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/search" element={<ResultsPage />} />
            <Route path="/content/:id" element={<ContentViewer />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;