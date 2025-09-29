import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Search, ExternalLink, Calendar, FileText, Clock, Tag } from 'lucide-react';
import OpenSearchService, { SearchResult } from '../services/opensearchService';
import ThemeToggle from './ThemeToggle';
import './ContentViewer.css';

const ContentViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Split text into sentences and group into paragraphs for readability
  const splitIntoSentences = (text: string): string[] => {
    // Split on . ! ? followed by space or end, while keeping abbreviations reasonably intact
    const parts = text
      .replace(/\s+/g, ' ')
      .split(/(?<=[\.\!\?])\s+(?=[A-Z0-9"'\(\[])/);
    return parts.filter(p => p && p.trim().length > 0);
  };

  const createParagraphNodes = (text: string, sentencesPerParagraph: number = 3): React.ReactNode => {
    const sentences = splitIntoSentences(text);
    if (sentences.length <= 1) {
      // Fallback to simple split by double newlines if sentences are not detected
      const paras = text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
      if (paras.length > 1) {
        return (
          <>
            {paras.map((p, i) => (<p key={i}>{p}</p>))}
          </>
        );
      }
      return <p>{text}</p>;
    }
    const paragraphs: string[] = [];
    for (let i = 0; i < sentences.length; i += sentencesPerParagraph) {
      const group = sentences.slice(i, i + sentencesPerParagraph).join(' ');
      paragraphs.push(group);
    }
    return (
      <>
        {paragraphs.map((p, i) => (<p key={i}>{p}</p>))}
      </>
    );
  };

  useEffect(() => {
    if (id) {
      loadDocument(id);
    }
  }, [id]);

  const loadDocument = async (documentId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const doc = await OpenSearchService.getDocument(documentId);
      if (doc) {
        setDocument(doc);
      } else {
        setError('Document not found');
      }
    } catch (err) {
      setError('Failed to load document');
      console.error('Document load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp?: string) => {
    if (!timestamp) return 'Unknown date';
    try {
      return new Date(timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown date';
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

  const getFileType = (source?: string) => {
    if (!source) return 'Unknown';
    const extension = source.split('.').pop()?.toLowerCase();
    const typeMap: { [key: string]: string } = {
      'pdf': 'PDF Document',
      'doc': 'Word Document',
      'docx': 'Word Document',
      'txt': 'Text File',
      'json': 'JSON File',
      'html': 'HTML File',
      'md': 'Markdown File',
      'xml': 'XML File'
    };
    return typeMap[extension || ''] || 'Document';
  };

  if (loading) {
    return (
      <div className="content-viewer">
        <div className="content-header">
          <div className="content-nav">
            <button 
              className="back-btn"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={20} />
              <span>Back to results</span>
            </button>
            <Link to="/" className="search-link">
              <Search size={20} />
              <span>New search</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading document...</p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="content-viewer">
        <div className="content-header">
          <div className="content-nav">
            <button 
              className="back-btn"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={20} />
              <span>Back to results</span>
            </button>
            <Link to="/" className="search-link">
              <Search size={20} />
              <span>New search</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
        <div className="error">
          <p>{error || 'Document not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="content-viewer">
      <div className="content-header">
        <div className="content-nav">
          <button 
            className="back-btn"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} />
            <span>Back to results</span>
          </button>
          <Link to="/" className="search-link">
            <Search size={20} />
            <span>New search</span>
          </Link>
          <ThemeToggle />
        </div>
      </div>

      <div className="content-container">
        <article className="document-content">
          <header className="document-header">
            <div className="document-title-section">
              <h1 className="document-title">{document.title}</h1>
              <div className="document-badges">
                <span className="file-type-badge">
                  <FileText size={14} />
                  {getFileType(document.source)}
                </span>
                {document.score > 0 && (
                  <span className="relevance-badge">
                    <Tag size={14} />
                    {Math.round(document.score * 100)}% match
                  </span>
                )}
              </div>
            </div>
            
            <div className="document-meta">
              <div className="meta-grid">
                <div className="meta-item">
                  <ExternalLink size={16} />
                  <div className="meta-content">
                    <span className="meta-label">Source URL</span>
                    <a 
                      href={document.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="document-url"
                    >
                      {formatUrl(document.url)}
                    </a>
                  </div>
                </div>
                
                {document.timestamp && (
                  <div className="meta-item">
                    <Calendar size={16} />
                    <div className="meta-content">
                      <span className="meta-label">Created</span>
                      <span className="document-date">
                        {formatDate(document.timestamp)}
                      </span>
                    </div>
                  </div>
                )}
                
                {document.source && (
                  <div className="meta-item">
                    <FileText size={16} />
                    <div className="meta-content">
                      <span className="meta-label">File Path</span>
                      <span className="document-source">
                        {document.source}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="document-body">
            {document.rawJson ? (
              <div className="content-wrapper">
                <div className="content-toolbar">
                  <div className="content-stats">
                    <Clock size={14} />
                    <span>Structured document</span>
                  </div>
                </div>
                <div className="document-text">
                  {(() => {
                    const sections: Array<{ title: string; content: React.ReactNode }> = [];
                    const data = document.rawJson || {};
                    const pushIf = (label: string, value: any) => {
                      if (!value) return;
                      if (typeof value === 'string') {
                        sections.push({ title: label, content: createParagraphNodes(value, 3) });
                      } else if (Array.isArray(value)) {
                        sections.push({ title: label, content: <ul>{value.map((v, i) => <li key={i}>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</li>)}</ul> });
                      } else if (typeof value === 'object') {
                        sections.push({ title: label, content: <pre>{JSON.stringify(value, null, 2)}</pre> });
                      }
                    };

                    // Common fields to render as sections
                    pushIf('Summary', data.summary || data.description || data.overview);
                    pushIf('Title', data.title);
                    pushIf('Author', data.author || data.byline);
                    pushIf('Published', data.published || data.date || data.created_at);
                    pushIf('Keywords', data.keywords || data.tags);
                    pushIf('Address', data.Address || data.address);
                    pushIf('Location', data.Location || data.location);
                    pushIf('Content', data.full_text || data.content);
                    pushIf('Images', data.images);

                    if (sections.length === 0) {
                      // Fallback to full JSON
                      return <pre>{JSON.stringify(data, null, 2)}</pre>;
                    }

                    return sections.map((sec, idx) => (
                      <section key={idx}>
                        <h2>{sec.title}</h2>
                        {sec.content}
                      </section>
                    ));
                  })()}
                </div>
              </div>
            ) : document.content ? (
              <div className="content-wrapper">
                <div className="content-toolbar">
                  <div className="content-stats">
                    <Clock size={14} />
                    <span>Estimated reading time: {Math.ceil((document.content.length / 1000) * 2)} min</span>
                  </div>
                </div>
                <div className="document-text">
                  {(() => {
                    const paras = document.content.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
                    if (paras.length > 1) {
                      return paras.map((p, idx) => (<p key={idx}>{p}</p>));
                    }
                    return createParagraphNodes(document.content, 3);
                  })()}
                </div>
              </div>
            ) : (
              <div className="document-text">
                <div className="snippet-preview">
                  <h3>Preview</h3>
                  <p>{document.snippet}</p>
                </div>
                <div className="no-content">
                  <p>Full content not available in this preview.</p>
                  <a 
                    href={document.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="external-link"
                  >
                    <ExternalLink size={16} />
                    View original document
                  </a>
                </div>
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
};

export default ContentViewer;