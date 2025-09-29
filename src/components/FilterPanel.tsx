import React, { useState } from 'react';
import { Calendar, Clock, SortAsc, Filter, X } from 'lucide-react';
import './FilterPanel.css';

export interface FilterOptions {
  sortBy: 'relevance' | 'newest' | 'oldest';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year' | 'custom';
  customDateRange?: {
    from: string;
    to: string;
  };
  timeFrame?: 'last_hour' | 'last_24h' | 'last_week' | 'last_month';
}

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters
}) => {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);

  const handleSortChange = (sortBy: FilterOptions['sortBy']) => {
    setFilters(prev => ({ ...prev, sortBy }));
  };

  const handleDateRangeChange = (dateRange: FilterOptions['dateRange']) => {
    setFilters(prev => ({ 
      ...prev, 
      dateRange,
      customDateRange: dateRange === 'custom' ? prev.customDateRange : undefined
    }));
  };

  const handleCustomDateChange = (field: 'from' | 'to', value: string) => {
    setFilters(prev => ({
      ...prev,
      customDateRange: {
        ...prev.customDateRange,
        [field]: value
      } as FilterOptions['customDateRange']
    }));
  };

  const handleTimeFrameChange = (timeFrame: FilterOptions['timeFrame']) => {
    setFilters(prev => ({ ...prev, timeFrame }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    const defaultFilters: FilterOptions = {
      sortBy: 'relevance',
      dateRange: 'all'
    };
    setFilters(defaultFilters);
    onApplyFilters(defaultFilters);
  };

  if (!isOpen) return null;

  return (
    <div className="filter-overlay">
      <div className="filter-modal">
        <div className="filter-header">
          <div className="filter-title">
            <Filter size={20} />
            <h2>Search Filters</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="filter-content">
          {/* Sort Options */}
          <div className="filter-section">
            <h3>
              <SortAsc size={16} />
              Sort Results
            </h3>
            <div className="filter-options">
              <label className="filter-option">
                <input
                  type="radio"
                  name="sortBy"
                  value="relevance"
                  checked={filters.sortBy === 'relevance'}
                  onChange={() => handleSortChange('relevance')}
                />
                <span className="option-content">
                  <strong>Most Relevant</strong>
                  <small>Best match to your search terms</small>
                </span>
              </label>
              <label className="filter-option">
                <input
                  type="radio"
                  name="sortBy"
                  value="newest"
                  checked={filters.sortBy === 'newest'}
                  onChange={() => handleSortChange('newest')}
                />
                <span className="option-content">
                  <strong>Most Recent</strong>
                  <small>Newest documents first</small>
                </span>
              </label>
              <label className="filter-option">
                <input
                  type="radio"
                  name="sortBy"
                  value="oldest"
                  checked={filters.sortBy === 'oldest'}
                  onChange={() => handleSortChange('oldest')}
                />
                <span className="option-content">
                  <strong>Oldest First</strong>
                  <small>Oldest documents first</small>
                </span>
              </label>
            </div>
          </div>

          {/* Date Range */}
          <div className="filter-section">
            <h3>
              <Calendar size={16} />
              Date Range
            </h3>
            <div className="filter-options">
              <label className="filter-option">
                <input
                  type="radio"
                  name="dateRange"
                  value="all"
                  checked={filters.dateRange === 'all'}
                  onChange={() => handleDateRangeChange('all')}
                />
                <span className="option-content">
                  <strong>All Time</strong>
                  <small>No date restrictions</small>
                </span>
              </label>
              <label className="filter-option">
                <input
                  type="radio"
                  name="dateRange"
                  value="today"
                  checked={filters.dateRange === 'today'}
                  onChange={() => handleDateRangeChange('today')}
                />
                <span className="option-content">
                  <strong>Today Only</strong>
                  <small>Documents from today</small>
                </span>
              </label>
              <label className="filter-option">
                <input
                  type="radio"
                  name="dateRange"
                  value="week"
                  checked={filters.dateRange === 'week'}
                  onChange={() => handleDateRangeChange('week')}
                />
                <span className="option-content">
                  <strong>This Week</strong>
                  <small>Last 7 days</small>
                </span>
              </label>
              <label className="filter-option">
                <input
                  type="radio"
                  name="dateRange"
                  value="month"
                  checked={filters.dateRange === 'month'}
                  onChange={() => handleDateRangeChange('month')}
                />
                <span className="option-content">
                  <strong>This Month</strong>
                  <small>Last 30 days</small>
                </span>
              </label>
              <label className="filter-option">
                <input
                  type="radio"
                  name="dateRange"
                  value="year"
                  checked={filters.dateRange === 'year'}
                  onChange={() => handleDateRangeChange('year')}
                />
                <span className="option-content">
                  <strong>This Year</strong>
                  <small>Last 365 days</small>
                </span>
              </label>
              <label className="filter-option">
                <input
                  type="radio"
                  name="dateRange"
                  value="custom"
                  checked={filters.dateRange === 'custom'}
                  onChange={() => handleDateRangeChange('custom')}
                />
                <span className="option-content">
                  <strong>Custom Range</strong>
                  <small>Choose specific dates</small>
                </span>
              </label>
            </div>

            {filters.dateRange === 'custom' && (
              <div className="custom-date-range">
                <div className="date-inputs">
                  <div className="date-input-group">
                    <label>From:</label>
                    <input
                      type="date"
                      value={filters.customDateRange?.from || ''}
                      onChange={(e) => handleCustomDateChange('from', e.target.value)}
                    />
                  </div>
                  <div className="date-input-group">
                    <label>To:</label>
                    <input
                      type="date"
                      value={filters.customDateRange?.to || ''}
                      onChange={(e) => handleCustomDateChange('to', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Time Frame */}
          <div className="filter-section">
            <h3>
              <Clock size={16} />
              Time Frame
            </h3>
            <div className="filter-options">
              <label className="filter-option">
                <input
                  type="radio"
                  name="timeFrame"
                  value=""
                  checked={!filters.timeFrame}
                  onChange={() => handleTimeFrameChange(undefined)}
                />
                <span className="option-content">
                  <strong>Any Time</strong>
                  <small>No time restrictions</small>
                </span>
              </label>
              <label className="filter-option">
                <input
                  type="radio"
                  name="timeFrame"
                  value="last_hour"
                  checked={filters.timeFrame === 'last_hour'}
                  onChange={() => handleTimeFrameChange('last_hour')}
                />
                <span className="option-content">
                  <strong>Last Hour</strong>
                  <small>Past 60 minutes</small>
                </span>
              </label>
              <label className="filter-option">
                <input
                  type="radio"
                  name="timeFrame"
                  value="last_24h"
                  checked={filters.timeFrame === 'last_24h'}
                  onChange={() => handleTimeFrameChange('last_24h')}
                />
                <span className="option-content">
                  <strong>Last 24 Hours</strong>
                  <small>Past day</small>
                </span>
              </label>
              <label className="filter-option">
                <input
                  type="radio"
                  name="timeFrame"
                  value="last_week"
                  checked={filters.timeFrame === 'last_week'}
                  onChange={() => handleTimeFrameChange('last_week')}
                />
                <span className="option-content">
                  <strong>Last Week</strong>
                  <small>Past 7 days</small>
                </span>
              </label>
              <label className="filter-option">
                <input
                  type="radio"
                  name="timeFrame"
                  value="last_month"
                  checked={filters.timeFrame === 'last_month'}
                  onChange={() => handleTimeFrameChange('last_month')}
                />
                <span className="option-content">
                  <strong>Last Month</strong>
                  <small>Past 30 days</small>
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="filter-actions">
          <button className="reset-btn" onClick={handleReset}>
            Reset Filters
          </button>
          <button className="apply-btn" onClick={handleApply}>
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
