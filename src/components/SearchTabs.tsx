import React from 'react';
import { Image, Video, Globe, BookOpen, Newspaper, Map, ShoppingCart } from 'lucide-react';
import './SearchTabs.css';

export type SearchTab = 'images' | 'videos' | 'news' | 'books' | 'net' | 'maps' | 'shopping';

interface SearchTabsProps {
  activeTab: SearchTab;
  onTabChange: (tab: SearchTab) => void;
  resultCounts?: {
    images?: number;
    videos?: number;
    news?: number;
    books?: number;
    net?: number;
    maps?: number;
    shopping?: number;
  };
}

const SearchTabs: React.FC<SearchTabsProps> = ({ activeTab, onTabChange, resultCounts = {} }) => {
  const tabs = [
    {
      id: 'net' as SearchTab,
      label: 'Net',
      icon: Globe,
      count: resultCounts.net
    },
    {
      id: 'images' as SearchTab,
      label: 'Images',
      icon: Image,
      count: resultCounts.images
    },
    {
      id: 'maps' as SearchTab,
      label: 'Maps',
      icon: Map,
      count: resultCounts.maps
    },
    {
      id: 'shopping' as SearchTab,
      label: 'Shopping',
      icon: ShoppingCart,
      count: resultCounts.shopping
    },
    {
      id: 'videos' as SearchTab,
      label: 'Videos',
      icon: Video,
      count: resultCounts.videos
    },
    {
      id: 'news' as SearchTab,
      label: 'News',
      icon: Newspaper,
      count: resultCounts.news
    },
    {
      id: 'books' as SearchTab,
      label: 'Books',
      icon: BookOpen,
      count: resultCounts.books
    },
    
  ];

  return (
    <div className="search-tabs">
      <div className="tabs-container">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <Icon size={16} />
              <span className="tab-label">{tab.label}</span>
              {tab.count !== undefined && (
                <span className="tab-count">({tab.count.toLocaleString()})</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SearchTabs;
