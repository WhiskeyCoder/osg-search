import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, Filter, Wrench } from 'lucide-react';
import OpenSearchService, { SearchResponse, FilterOptions } from '../services/opensearchService';
import ThemeToggle from './ThemeToggle';
import FilterPanel from './FilterPanel';
import SearchTabs, { SearchTab } from './SearchTabs';
import SearchTools, { SearchToolsOptions } from './SearchTools';
import NoDataMessage from './NoDataMessage';
import './ResultsPage.css';
import { useTheme } from '../contexts/ThemeContext';

const ResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [activeTab, setActiveTab] = useState<SearchTab>('net');
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: 'relevance',
    dateRange: 'all'
  });
  const [searchTools, setSearchTools] = useState<SearchToolsOptions>({
    dateRange: 'any',
    language: 'any',
    region: 'any',
    safeSearch: 'moderate',
    fileType: 'any',
    usageRights: 'any'
  });

  const performSearch = async (searchQuery: string, page: number, lucky: boolean = false, searchFilters?: FilterOptions) => {
    setLoading(true);
    setError(null);
    
    try {
      const pageSize = activeTab === 'images' ? 50 : 10;
      const response = await OpenSearchService.search(searchQuery, page, pageSize, searchFilters || filters, activeTab);
      setSearchResponse(response);
      
      // If "I'm Feeling Lucky" was clicked, redirect to first result
      if (lucky && response.results.length > 0) {
        navigate(`/content/${response.results[0].id}`);
        return;
      }
    } catch (err) {
      setError('Failed to search. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const searchQuery = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const lucky = searchParams.get('lucky') === 'true';
    
    setQuery(searchQuery);
    setCurrentPage(page);
    
    if (searchQuery) {
      performSearch(searchQuery, page, lucky);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initialize Leaflet map when on maps tab
  useEffect(() => {
    if (activeTab !== 'maps') return;
    // @ts-ignore
    const Lref = (window as any).L;
    if (!Lref) return;
    let map: any;
    try {
      map = Lref.map('leaflet-map');
      // Default world view
      map.setView([20, 0], 2);
      const lightUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      const darkUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      Lref.tileLayer(isDarkMode ? darkUrl : lightUrl, {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      const locs = (searchResponse?.results || []).filter(r => (typeof r.latitude === 'number' && typeof r.longitude === 'number'));
      if (locs.length > 0) {
        const markers: any[] = [];
        locs.slice(0, 200).forEach(r => {
          const m = Lref.marker([r.latitude as number, r.longitude as number]).addTo(map);
          m.bindPopup(`<strong>${(r.title || '').replace(/</g, '&lt;')}</strong><br/>${(r.address || r.country || '')}`);
          markers.push(m);
        });
        try {
          const group = Lref.featureGroup(markers);
          map.fitBounds(group.getBounds().pad(0.2));
        } catch {}
      }
    } catch (e) {
      // Swallow errors; map remains default
    }
    return () => {
      try { map && map.remove && map.remove(); } catch {}
    };
  }, [activeTab, searchResponse, isDarkMode]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (searchResponse?.totalPages || 1)) {
      setCurrentPage(newPage);
      navigate(`/search?q=${encodeURIComponent(query)}&page=${newPage}`);
    }
  };

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    performSearch(query, 1, false, newFilters);
  };

  const handleApplyTools = (newTools: SearchToolsOptions) => {
    setSearchTools(newTools);
    // In a real implementation, you would apply these tools to the search
    console.log('Search tools applied:', newTools);
  };

  const handleTabChange = (tab: SearchTab) => {
    setActiveTab(tab);
    // Trigger a new search with the new tab
    if (query.trim()) {
      performSearch(query, 1, false);
    }
  };

  const getFilterSummary = () => {
    const parts = [];
    if (filters.sortBy !== 'relevance') {
      parts.push(filters.sortBy === 'newest' ? 'Most Recent' : 'Oldest First');
    }
    if (filters.dateRange !== 'all') {
      parts.push(filters.dateRange === 'custom' ? 'Custom Range' : 
        filters.dateRange === 'today' ? 'Today' :
        filters.dateRange === 'week' ? 'This Week' :
        filters.dateRange === 'month' ? 'This Month' : 'This Year');
    }
    if (filters.timeFrame) {
      parts.push(filters.timeFrame === 'last_hour' ? 'Last Hour' :
        filters.timeFrame === 'last_24h' ? 'Last 24h' :
        filters.timeFrame === 'last_week' ? 'Last Week' : 'Last Month');
    }
    return parts.length > 0 ? parts.join(' • ') : 'All Results';
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const formatUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  };

  const formatDate = (timestamp?: string) => {
    if (!timestamp) return '';
    try {
      return new Date(timestamp).toLocaleDateString();
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="results-page">
        <div className="search-header">
          <div className="search-container">
            <Link to="/" className="logo-link">
              <h1>OSG Search</h1>
            </Link>
            <form className="search-form" onSubmit={handleSearch}>
              <div className="search-box">
                <Search className="search-icon" size={20} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="search-input"
                />
              </div>
            </form>
          </div>
        </div>
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Searching...</p>
        </div>
      </div>
    );
  }

  // Do not hard-fail the page; show content area with empty states

  return (
    <div className="results-page">
      <div className="search-header">
        <div className="search-container">
          <Link to="/" className="logo-link">
            <h1 className="logo-colored"><span className="g-blue">O</span><span className="g-red">S</span><span className="g-yellow">G</span> <span className="g-green">Search</span></h1>
          </Link>
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-box">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </form>
          <div className="search-options">
            <button 
              className="filter-btn"
              onClick={() => setShowFilters(true)}
            >
              <Filter size={20} />
              <span>Filters</span>
            </button>
            <button 
              className="tools-btn"
              onClick={() => setShowTools(true)}
            >
              <Wrench size={20} />
              <span>Tools</span>
            </button>
            <ThemeToggle />
          </div>
        </div>
        <SearchTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          resultCounts={{
            net: searchResponse?.total || 0,
            images: searchResponse ? searchResponse.results.filter(r => r.imageBase64 || r.imageUrl || r.thumbnailUrl).length : 0,
            maps: searchResponse ? searchResponse.results.filter(r => (typeof r.latitude === 'number' && typeof r.longitude === 'number') || r.address || r.country).length : 0,
            shopping: searchResponse ? searchResponse.results.filter(r => typeof r.price === 'number').length : 0,
            videos: activeTab === 'videos' ? (searchResponse?.total || 0) : 0,
            news: activeTab === 'news' ? (searchResponse?.total || 0) : 0,
            books: searchResponse ? searchResponse.results.filter(r => (r.source?.toLowerCase().endsWith('.pdf') || r.source?.toLowerCase().endsWith('.epub'))).length : 0
          }}
        />
      </div>

      <div className={`results-container ${activeTab === 'maps' ? 'maps-mode' : ''}`}>
        <div className="results-info">
          <div className="results-stats">
            <p>
              About {searchResponse?.total.toLocaleString()} results 
              ({searchResponse?.took}ms)
            </p>
            <div className="filter-summary">
              <span className="filter-label">Filtered by:</span>
              <span className="filter-value">{getFilterSummary()}</span>
            </div>
          </div>
        </div>

        <div className="results-list">
          {searchResponse && searchResponse.results.length > 0 ? (
            activeTab === 'images' ? (
              // Image grid
              <div className="image-grid">
                {searchResponse.results
                  .filter(r => r.imageBase64 || r.imageUrl || r.thumbnailUrl)
                  .slice(0, 20)
                  .map((r) => (
                    <Link key={r.id} to={`/content/${r.id}`} className="image-card">
                      <img
                        src={r.imageBase64 ? `data:image/*;base64,${r.imageBase64}` : (r.thumbnailUrl || r.imageUrl) as string}
                        alt={r.title}
                      />
                      <div className="image-meta">
                        <span className="image-title">{r.title}</span>
                      </div>
                    </Link>
                ))}
              </div>
            ) : activeTab === 'maps' ? (
              <div className="map-container" id="leaflet-map" style={{ height: 'calc(100vh - 180px)', width: '100%' }}></div>
            ) : activeTab === 'shopping' ? (
              // Shopping grid
              <div className="shopping-grid">
                {(() => {
                  const items = searchResponse.results.filter(r => typeof r.price === 'number');
                  if (items.length === 0) {
                    return <div className="map-item-country">Nothing for sale</div>;
                  }
                  return items.map((r) => (
                    <a key={r.id} href={r.url !== '#' ? r.url : undefined} className="shopping-card" target="_blank" rel="noreferrer">
                      { (r.imageBase64 || r.thumbnailUrl || r.imageUrl) && (
                        <img
                          src={r.imageBase64 ? `data:image/*;base64,${r.imageBase64}` : (r.thumbnailUrl || r.imageUrl) as string}
                          alt={r.title}
                        />
                      )}
                      <div className="shopping-meta">
                        <div className="shopping-title">{r.title}</div>
                        <div className="shopping-price">{r.currency ? `${r.currency} ` : ''}{(r.price as number).toLocaleString()}</div>
                      </div>
                    </a>
                  ));
                })()}
              </div>
            ) : activeTab === 'books' ? (
              <div className="results-list">
                {(() => {
                  const books = searchResponse.results.filter(r => (r.source?.toLowerCase().endsWith('.pdf') || r.source?.toLowerCase().endsWith('.epub')));
                  if (books.length === 0) {
                    return <div className="map-item-country">No books</div>;
                  }
                  return books.map((result) => (
                    <div key={result.id} className="result-item">
                      <div className="result-header">
                        <h3>
                          <Link to={`/content/${result.id}`} className="result-title">
                            {result.title}
                          </Link>
                        </h3>
                        <div className="result-url">
                          <span className="url">{formatUrl(result.url)}</span>
                          {result.timestamp && (
                            <span className="date">{formatDate(result.timestamp)}</span>
                          )}
                        </div>
                      </div>
                      <p className="result-snippet">{(result.snippet || '').slice(0, 150)}{(result.snippet || '').length > 150 ? '...' : ''}</p>
                    </div>
                  ));
                })()}
              </div>
            ) : (
              // Default list
              searchResponse.results.map((result) => (
                <div key={result.id} className="result-item">
                  <div className="result-header">
                    <h3>
                      <Link to={`/content/${result.id}`} className="result-title">
                        {result.title}
                      </Link>
                    </h3>
                    <div className="result-url">
                      <span className="url">{formatUrl(result.url)}</span>
                      {result.timestamp && (
                        <span className="date">{formatDate(result.timestamp)}</span>
                      )}
                    </div>
                  </div>
                  <p className="result-snippet">{(result.snippet || '').slice(0, 150)}{(result.snippet || '').length > 150 ? '...' : ''}</p>
                  {result.source && (
                    <div className="result-source">
                      <span className="source-label">Source:</span>
                      <span className="source-value">{result.source}</span>
                    </div>
                  )}
                </div>
              ))
            )
          ) : searchResponse && searchResponse.results.length === 0 ? (
            <NoDataMessage tab={activeTab} query={query} />
          ) : null}
        </div>

        {activeTab !== 'maps' && searchResponse && searchResponse.totalPages > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={20} />
              <span>Previous</span>
            </button>
            
            <div className="page-numbers">
              {Array.from({ length: Math.min(5, searchResponse.totalPages) }, (_, i) => {
                const pageNum = Math.max(1, currentPage - 2) + i;
                if (pageNum > searchResponse.totalPages) return null;
                
                return (
                  <button
                    key={pageNum}
                    className={`page-number ${pageNum === currentPage ? 'active' : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              className="page-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === searchResponse.totalPages}
            >
              <span>Next</span>
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      <FilterPanel
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
      />

      <SearchTools
        isOpen={showTools}
        onClose={() => setShowTools(false)}
        onApplyTools={handleApplyTools}
        currentTools={searchTools}
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

export default ResultsPage;
