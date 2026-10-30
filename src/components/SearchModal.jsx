import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Book, ArrowRight, Tag, Bookmark } from 'lucide-react';

const POPULAR_SEARCHES = [
  'Fiction', 'Machine Learning', 'World History', 'Science Fiction', 'Poetry', 'Economics'
];

export default function SearchModal({ isOpen, onClose, onSelectResult }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-slate-900/60 backdrop-blur-sm">
      <div 
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Box */}
        <div className="p-4 border-b border-slate-100 flex items-center space-x-3 bg-white">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search books, authors, ISBN, or subjects..."
            className="w-full text-base outline-none text-slate-800 placeholder-slate-400 font-medium"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-lg"
          >
            ESC
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-96 overflow-y-auto">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            Popular Topics
          </div>
          <div className="flex flex-wrap gap-2 mb-5">
            {POPULAR_SEARCHES.map(item => (
              <button
                key={item}
                onClick={() => {
                  setQuery(item);
                  onSelectResult(item);
                }}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-[#FCAE76]/20 hover:text-[#1C1935] text-slate-600 text-xs font-medium transition-colors"
              >
                <Tag className="w-3 h-3 text-[#FCAE76]" />
                <span>{item}</span>
              </button>
            ))}
          </div>

          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            Quick Actions
          </div>
          <div className="space-y-1">
            <button 
              onClick={() => onSelectResult('all')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-left transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 rounded-lg bg-orange-100 text-[#FCAE76] flex items-center justify-center">
                  <Book className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-slate-700">Browse Full Catalog</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-right text-xs text-slate-400">
          Press <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">Enter</span> to search
        </div>
      </div>
    </div>
  );
}
