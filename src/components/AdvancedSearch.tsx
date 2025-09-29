import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Calendar, FileText, Search } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import './AdvancedSearch.css';

interface AdvancedSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    allWords: '',
    exactPhrase: '',
    anyWords: '',
    noneWords: '',
    dateRange: {
      from: '',
      to: ''
    },
    source: ''
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build query from filters
    let query = '';
    
    if (filters.allWords) {
      query += filters.allWords;
    }
    
    if (filters.exactPhrase) {
      query += ` "${filters.exactPhrase}"`;
    }
    
    if (filters.anyWords) {
      const anyWords = filters.anyWords.split(' ').join(' OR ');
      query += ` (${anyWords})`;
    }
    
    if (filters.noneWords) {
      const noneWords = filters.noneWords.split(' ').map(word => `-${word}`).join(' ');
      query += ` ${noneWords}`;
    }
    
    if (query.trim()) {
      const searchParams = new URLSearchParams({
        q: query.trim(),
        advanced: 'true'
      });
      
      if (filters.dateRange.from) {
        searchParams.set('from', filters.dateRange.from);
      }
      if (filters.dateRange.to) {
        searchParams.set('to', filters.dateRange.to);
      }
      if (filters.source) {
        searchParams.set('source', filters.source);
      }
      
      navigate(`/search?${searchParams.toString()}`);
      onClose();
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (field: 'from' | 'to', value: string) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="advanced-search-overlay">
      <div className="advanced-search-modal">
        <div className="modal-header">
          <h2>Advanced Search</h2>
          <div className="modal-header-actions">
            <ThemeToggle />
            <button className="close-btn" onClick={onClose}>
              <X size={24} />
            </button>
          </div>
        </div>
        
        <form className="advanced-search-form" onSubmit={handleSearch}>
          <div className="search-fields">
            <div className="field-group">
              <label htmlFor="allWords">Find pages with...</label>
              <div className="field-row">
                <span className="field-label">all these words:</span>
                <input
                  type="text"
                  id="allWords"
                  value={filters.allWords}
                  onChange={(e) => handleInputChange('allWords', e.target.value)}
                  placeholder="Type the important words"
                  className="field-input"
                />
              </div>
            </div>

            <div className="field-group">
              <div className="field-row">
                <span className="field-label">this exact word or phrase:</span>
                <input
                  type="text"
                  id="exactPhrase"
                  value={filters.exactPhrase}
                  onChange={(e) => handleInputChange('exactPhrase', e.target.value)}
                  placeholder="Put exact words in quotes"
                  className="field-input"
                />
              </div>
            </div>

            <div className="field-group">
              <div className="field-row">
                <span className="field-label">any of these words:</span>
                <input
                  type="text"
                  id="anyWords"
                  value={filters.anyWords}
                  onChange={(e) => handleInputChange('anyWords', e.target.value)}
                  placeholder="Type OR between all the words"
                  className="field-input"
                />
              </div>
            </div>

            <div className="field-group">
              <div className="field-row">
                <span className="field-label">none of these words:</span>
                <input
                  type="text"
                  id="noneWords"
                  value={filters.noneWords}
                  onChange={(e) => handleInputChange('noneWords', e.target.value)}
                  placeholder="Put a minus sign just before words you don't want"
                  className="field-input"
                />
              </div>
            </div>
          </div>

          <div className="filter-sections">
            <div className="filter-section">
              <h3>
                <Calendar size={20} />
                Date Range
              </h3>
              <div className="date-fields">
                <div className="date-field">
                  <label htmlFor="fromDate">From:</label>
                  <input
                    type="date"
                    id="fromDate"
                    value={filters.dateRange.from}
                    onChange={(e) => handleDateChange('from', e.target.value)}
                    className="date-input"
                  />
                </div>
                <div className="date-field">
                  <label htmlFor="toDate">To:</label>
                  <input
                    type="date"
                    id="toDate"
                    value={filters.dateRange.to}
                    onChange={(e) => handleDateChange('to', e.target.value)}
                    className="date-input"
                  />
                </div>
              </div>
            </div>

            <div className="filter-section">
              <h3>
                <FileText size={20} />
                Source
              </h3>
              <input
                type="text"
                value={filters.source}
                onChange={(e) => handleInputChange('source', e.target.value)}
                placeholder="Enter source name"
                className="field-input"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="search-btn">
              <Search size={20} />
              Advanced Search
            </button>
            <button type="button" className="clear-btn" onClick={() => setFilters({
              allWords: '',
              exactPhrase: '',
              anyWords: '',
              noneWords: '',
              dateRange: { from: '', to: '' },
              source: ''
            })}>
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdvancedSearch;
