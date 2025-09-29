import React, { useState } from 'react';
import { Settings, Calendar, Globe, Shield, Languages, Clock, FileText } from 'lucide-react';
import './SearchTools.css';

export interface SearchToolsOptions {
  dateRange: 'any' | 'past_hour' | 'past_day' | 'past_week' | 'past_month' | 'past_year';
  language: 'any' | 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'zh' | 'ja' | 'ko';
  region: 'any' | 'us' | 'uk' | 'ca' | 'au' | 'de' | 'fr' | 'it' | 'es' | 'br' | 'mx' | 'in' | 'jp' | 'kr' | 'cn';
  safeSearch: 'off' | 'moderate' | 'strict';
  fileType: 'any' | 'pdf' | 'doc' | 'docx' | 'ppt' | 'pptx' | 'xls' | 'xlsx' | 'txt' | 'rtf';
  usageRights: 'any' | 'free_to_use' | 'free_to_use_commercially' | 'free_to_use_modify' | 'free_to_use_modify_commercially';
}

interface SearchToolsProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTools: (tools: SearchToolsOptions) => void;
  currentTools: SearchToolsOptions;
}

const SearchTools: React.FC<SearchToolsProps> = ({
  isOpen,
  onClose,
  onApplyTools,
  currentTools
}) => {
  const [tools, setTools] = useState<SearchToolsOptions>(currentTools);

  const handleApply = () => {
    onApplyTools(tools);
    onClose();
  };

  const handleReset = () => {
    const defaultTools: SearchToolsOptions = {
      dateRange: 'any',
      language: 'any',
      region: 'any',
      safeSearch: 'moderate',
      fileType: 'any',
      usageRights: 'any'
    };
    setTools(defaultTools);
    onApplyTools(defaultTools);
  };

  const updateTool = <K extends keyof SearchToolsOptions>(
    key: K,
    value: SearchToolsOptions[K]
  ) => {
    setTools(prev => ({ ...prev, [key]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="search-tools-overlay">
      <div className="search-tools-modal">
        <div className="tools-header">
          <div className="tools-title">
            <Settings size={20} />
            <h2>Search Tools</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="tools-content">
          {/* Date Range */}
          <div className="tool-section">
            <h3>
              <Calendar size={16} />
              Any time
            </h3>
            <div className="tool-options">
              {[
                { value: 'any', label: 'Any time' },
                { value: 'past_hour', label: 'Past hour' },
                { value: 'past_day', label: 'Past 24 hours' },
                { value: 'past_week', label: 'Past week' },
                { value: 'past_month', label: 'Past month' },
                { value: 'past_year', label: 'Past year' }
              ].map(option => (
                <label key={option.value} className="tool-option">
                  <input
                    type="radio"
                    name="dateRange"
                    value={option.value}
                    checked={tools.dateRange === option.value}
                    onChange={() => updateTool('dateRange', option.value as SearchToolsOptions['dateRange'])}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Language */}
          <div className="tool-section">
            <h3>
              <Languages size={16} />
              Language
            </h3>
            <div className="tool-options">
              {[
                { value: 'any', label: 'Any language' },
                { value: 'en', label: 'English' },
                { value: 'es', label: 'Spanish' },
                { value: 'fr', label: 'French' },
                { value: 'de', label: 'German' },
                { value: 'it', label: 'Italian' },
                { value: 'pt', label: 'Portuguese' },
                { value: 'ru', label: 'Russian' },
                { value: 'zh', label: 'Chinese' },
                { value: 'ja', label: 'Japanese' },
                { value: 'ko', label: 'Korean' }
              ].map(option => (
                <label key={option.value} className="tool-option">
                  <input
                    type="radio"
                    name="language"
                    value={option.value}
                    checked={tools.language === option.value}
                    onChange={() => updateTool('language', option.value as SearchToolsOptions['language'])}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Region */}
          <div className="tool-section">
            <h3>
              <Globe size={16} />
              Region
            </h3>
            <div className="tool-options">
              {[
                { value: 'any', label: 'Any region' },
                { value: 'us', label: 'United States' },
                { value: 'uk', label: 'United Kingdom' },
                { value: 'ca', label: 'Canada' },
                { value: 'au', label: 'Australia' },
                { value: 'de', label: 'Germany' },
                { value: 'fr', label: 'France' },
                { value: 'it', label: 'Italy' },
                { value: 'es', label: 'Spain' },
                { value: 'br', label: 'Brazil' },
                { value: 'mx', label: 'Mexico' },
                { value: 'in', label: 'India' },
                { value: 'jp', label: 'Japan' },
                { value: 'kr', label: 'South Korea' },
                { value: 'cn', label: 'China' }
              ].map(option => (
                <label key={option.value} className="tool-option">
                  <input
                    type="radio"
                    name="region"
                    value={option.value}
                    checked={tools.region === option.value}
                    onChange={() => updateTool('region', option.value as SearchToolsOptions['region'])}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Safe Search */}
          <div className="tool-section">
            <h3>
              <Shield size={16} />
              Safe Search
            </h3>
            <div className="tool-options">
              {[
                { value: 'off', label: 'Off' },
                { value: 'moderate', label: 'Moderate' },
                { value: 'strict', label: 'Strict' }
              ].map(option => (
                <label key={option.value} className="tool-option">
                  <input
                    type="radio"
                    name="safeSearch"
                    value={option.value}
                    checked={tools.safeSearch === option.value}
                    onChange={() => updateTool('safeSearch', option.value as SearchToolsOptions['safeSearch'])}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* File Type */}
          <div className="tool-section">
            <h3>
              <FileText size={16} />
              File type
            </h3>
            <div className="tool-options">
              {[
                { value: 'any', label: 'Any format' },
                { value: 'pdf', label: 'Adobe Acrobat PDF (.pdf)' },
                { value: 'doc', label: 'Microsoft Word (.doc)' },
                { value: 'docx', label: 'Microsoft Word (.docx)' },
                { value: 'ppt', label: 'Microsoft PowerPoint (.ppt)' },
                { value: 'pptx', label: 'Microsoft PowerPoint (.pptx)' },
                { value: 'xls', label: 'Microsoft Excel (.xls)' },
                { value: 'xlsx', label: 'Microsoft Excel (.xlsx)' },
                { value: 'txt', label: 'Plain text (.txt)' },
                { value: 'rtf', label: 'Rich Text Format (.rtf)' }
              ].map(option => (
                <label key={option.value} className="tool-option">
                  <input
                    type="radio"
                    name="fileType"
                    value={option.value}
                    checked={tools.fileType === option.value}
                    onChange={() => updateTool('fileType', option.value as SearchToolsOptions['fileType'])}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Usage Rights */}
          <div className="tool-section">
            <h3>
              <Clock size={16} />
              Usage rights
            </h3>
            <div className="tool-options">
              {[
                { value: 'any', label: 'Not filtered by license' },
                { value: 'free_to_use', label: 'Free to use' },
                { value: 'free_to_use_commercially', label: 'Free to use commercially' },
                { value: 'free_to_use_modify', label: 'Free to use or share' },
                { value: 'free_to_use_modify_commercially', label: 'Free to use, share or modify' }
              ].map(option => (
                <label key={option.value} className="tool-option">
                  <input
                    type="radio"
                    name="usageRights"
                    value={option.value}
                    checked={tools.usageRights === option.value}
                    onChange={() => updateTool('usageRights', option.value as SearchToolsOptions['usageRights'])}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="tools-actions">
          <button className="reset-btn" onClick={handleReset}>
            Reset
          </button>
          <button className="apply-btn" onClick={handleApply}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchTools;
