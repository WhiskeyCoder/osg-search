import React from 'react';
import { Search, Image, Video, Newspaper, BookOpen, FileText, Globe } from 'lucide-react';
import './NoDataMessage.css';

interface NoDataMessageProps {
  tab: string;
  query: string;
}

const NoDataMessage: React.FC<NoDataMessageProps> = ({ tab, query }) => {
  const getTabInfo = () => {
    switch (tab) {
      case 'images':
        return {
          icon: Image,
          title: 'No Images Found',
          description: 'No images found for your search. Try different keywords or check back later.',
          suggestion: 'Try searching for: "photos", "pictures", "images"'
        };
      case 'videos':
        return {
          icon: Video,
          title: 'No Videos Found',
          description: 'No videos found for your search. Try different keywords or check back later.',
          suggestion: 'Try searching for: "video", "movie", "clip"'
        };
      case 'news':
        return {
          icon: Newspaper,
          title: 'No News Found',
          description: 'No news articles found for your search. Try different keywords or check back later.',
          suggestion: 'Try searching for: "news", "article", "report"'
        };
      case 'books':
        return {
          icon: BookOpen,
          title: 'No Books Found',
          description: 'No books found for your search. Try different keywords or check back later.',
          suggestion: 'Try searching for: "book", "ebook", "publication"'
        };
      case 'academic':
        return {
          icon: FileText,
          title: 'No Academic Papers Found',
          description: 'No academic papers found for your search. Try different keywords or check back later.',
          suggestion: 'Try searching for: "research", "study", "paper"'
        };
      case 'web':
        return {
          icon: Globe,
          title: 'No Web Results Found',
          description: 'No web pages found for your search. Try different keywords or check back later.',
          suggestion: 'Try searching for: "website", "page", "site"'
        };
      default:
        return {
          icon: Search,
          title: 'No Results Found',
          description: 'No results found for your search. Try different keywords or check back later.',
          suggestion: 'Try different search terms or check your spelling'
        };
    }
  };

  const tabInfo = getTabInfo();
  const Icon = tabInfo.icon;

  return (
    <div className="no-data-message">
      <div className="no-data-content">
        <div className="no-data-icon">
          <Icon size={64} />
        </div>
        <h3 className="no-data-title">{tabInfo.title}</h3>
        <p className="no-data-description">{tabInfo.description}</p>
        <div className="no-data-suggestion">
          <p className="suggestion-label">Suggestion:</p>
          <p className="suggestion-text">{tabInfo.suggestion}</p>
        </div>
        <div className="no-data-query">
          <p className="query-label">You searched for:</p>
          <p className="query-text">"{query}"</p>
        </div>
      </div>
    </div>
  );
};

export default NoDataMessage;
