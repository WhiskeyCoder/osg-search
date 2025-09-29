import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calculator } from 'lucide-react';
import AdvancedSearch from './AdvancedSearch';
import ThemeToggle from './ThemeToggle';
import { testOpenSearchConnection } from '../utils/testOpenSearch';
import { CalculatorService } from '../services/calculatorService';
import './SearchPage.css';

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing connection...');
  const [calculatorResult, setCalculatorResult] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Test OpenSearch connection on component mount
    const testConnection = async () => {
      try {
        const isConnected = await testOpenSearchConnection();
        setConnectionStatus(isConnected ? '✅ OpenSearch Connected' : '❌ OpenSearch Connection Failed');
      } catch (error) {
        setConnectionStatus('❌ OpenSearch Connection Error');
        console.error('Connection test error:', error);
      }
    };
    
    testConnection();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Check if it's a math expression
      const calcResult = CalculatorService.calculate(query.trim());
      if (calcResult.isMath) {
        setCalculatorResult(calcResult.result || '');
        return;
      }
      
      // Regular search
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    
    // Check for calculator result
    const calcResult = CalculatorService.calculate(value);
    if (calcResult.isMath) {
      setCalculatorResult(calcResult.result || '');
    } else {
      setCalculatorResult(null);
    }
  };


  return (
    <div className="search-page">
      <div className="search-header">
        <ThemeToggle />
      </div>
      <div className="search-container">
        <div className="logo">
          <h1 className="logo-colored"><span className="g-blue">O</span><span className="g-red">S</span><span className="g-yellow">G</span> <span className="g-green">Search</span></h1>
        </div>
        
        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-box">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search the web"
              className="search-input"
              autoFocus
            />
            {calculatorResult && (
              <div className="calculator-result">
                <Calculator size={16} />
                <span>{calculatorResult}</span>
              </div>
            )}
          </div>
          
        </form>

        <div className="search-options">
          <button 
            className="option-link"
            onClick={() => setShowAdvanced(true)}
          >
            Advanced Search
          </button>
        </div>
        
        <div className="connection-status">
          {connectionStatus}
        </div>
      </div>
      
      <AdvancedSearch 
        isOpen={showAdvanced} 
        onClose={() => setShowAdvanced(false)} 
      />
      <footer className="site-footer">
        <div className="footer-inner">
          <span>Made by </span>
          <a href="https://github.com/WhiskeyCoder" target="_blank" rel="noreferrer">@WhiskeyCoder</a>
        </div>
      </footer>
    </div>
  );
};

export default SearchPage;
