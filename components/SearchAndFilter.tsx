import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  searchQuery,
  onSearchChange,
  onClear,
  placeholder = "Search vocabulary...",
  className = ""
}: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onSearchChange('');
              onClear?.();
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X size={16} />
          </Button>
        )}
      </div>
    </div>
  );
}

interface FilterChipProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  onRemove?: () => void;
}

function FilterChip({ label, isActive, onClick, onRemove }: FilterChipProps) {
  return (
    <div
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
      }`}
      onClick={onClick}
    >
      <span>{label}</span>
      {isActive && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 hover:bg-primary-foreground/20 rounded-full p-0.5"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}

interface FilterBarProps {
  availableTags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onClearFilters: () => void;
  className?: string;
}

export function FilterBar({
  availableTags,
  selectedTags,
  onTagToggle,
  onClearFilters,
  className = ""
}: FilterBarProps) {
  const [showAllTags, setShowAllTags] = useState(false);
  
  if (availableTags.length === 0) return null;

  const displayTags = showAllTags ? availableTags : availableTags.slice(0, 8);

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={16} className="text-muted-foreground" />
          <span className="text-sm font-medium">Filter by Topic</span>
          {selectedTags.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-xs h-6 px-2"
            >
              Clear all
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {displayTags.map((tag) => (
            <FilterChip
              key={tag}
              label={tag}
              isActive={selectedTags.includes(tag)}
              onClick={() => onTagToggle(tag)}
              onRemove={
                selectedTags.includes(tag)
                  ? () => onTagToggle(tag)
                  : undefined
              }
            />
          ))}

          {availableTags.length > 8 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllTags(!showAllTags)}
              className="h-7 px-2 text-xs"
            >
              {showAllTags ? 'Show less' : `+${availableTags.length - 8} more`}
            </Button>
          )}
        </div>

        {selectedTags.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <div className="text-sm text-muted-foreground">
              Filtering: {selectedTags.length} {selectedTags.length === 1 ? 'topic' : 'topics'} selected
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}