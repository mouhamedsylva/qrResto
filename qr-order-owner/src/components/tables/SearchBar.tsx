import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Rechercher...',
}) => {
  return (
    <div className="search-bar-container">
      <Search className="search-bar-icon" />
      
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="search-bar-input"
        placeholder={placeholder}
      />
      
      {value && (
        <button
          onClick={() => onChange('')}
          className="search-bar-clear"
        >
          <X />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
