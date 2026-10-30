import React, { useState } from 'react';
import { X, Search, BookOpen, Star, BookmarkCheck, Filter, ArrowUpRight } from 'lucide-react';

const SAMPLE_BOOKS = [
  {
    id: 1,
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    genre: 'Classic Fiction',
    rating: 4.8,
    status: 'Available',
    copies: 5,
    coverColor: 'bg-indigo-600',
    description: 'A story of ambition, love, and the disillusionment of the American dream in the roaring 1920s.'
  },
  {
    id: 2,
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    genre: 'Historical Fiction',
    rating: 4.9,
    status: 'Available',
    copies: 3,
    coverColor: 'bg-emerald-600',
    description: 'A compassionate, dramatic, and deeply moving look at human nature and racial injustice.'
  },
  {
    id: 3,
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    genre: 'Science & Physics',
    rating: 4.7,
    status: 'Borrowed',
    copies: 0,
    coverColor: 'bg-purple-600',
    description: 'An exploration of the universe, black holes, time travel, and the nature of space-time.'
  },
  {
    id: 4,
    title: 'Clean Code: Agile Software',
    author: 'Robert C. Martin',
    genre: 'Computer Science',
    rating: 4.9,
    status: 'Available',
    copies: 7,
    coverColor: 'bg-sky-600',
    description: 'Best practices, principles, and patterns for writing clean, maintainable, high quality software.'
  },
  {
    id: 5,
    title: 'The Little Prince',
    author: 'Antoine de Saint-Exupéry',
    genre: 'Children & Philosophy',
    rating: 4.9,
    status: 'Available',
    copies: 12,
    coverColor: 'bg-amber-500',
    description: 'A poetic tale of love, loneliness, and friendship through the eyes of a young prince.'
  },
  {
    id: 6,
    title: 'Sapiens: A Brief History',
    author: 'Yuval Noah Harari',
    genre: 'Anthropology',
    rating: 4.8,
    status: 'Available',
    copies: 4,
    coverColor: 'bg-rose-600',
    description: 'A groundbreaking survey of the history of human species from Stone Age to modern age.'
  }
];

export default function CatalogDrawer({ isOpen, onClose, onBorrowBook, currentUser, onOpenLogin }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  if (!isOpen) return null;

  const genres = ['All', 'Classic Fiction', 'Historical Fiction', 'Science & Physics', 'Computer Science', 'Children & Philosophy', 'Anthropology'];

  const filteredBooks = SAMPLE_BOOKS.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === 'All' || book.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const handleAction = (book) => {
    if (!currentUser) {
      alert('Please log in with your Student account to borrow books.');
      onOpenLogin('student');
      return;
    }
    if (currentUser.role === 'admin') {
      alert(`[Admin Action]: Book "${book.title}" selected for Inventory & Barcode updates.`);
    } else {
      alert(`[Student Success]: "${book.title}" has been reserved for pickup under ID ${currentUser.id}!`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300">
      <div 
        className="w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-[#1C1935]">Library Book Catalog</h2>
            <p className="text-xs text-slate-500">Explore and issue books online</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-300/80 flex items-center justify-center text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-6 border-b border-slate-100 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by book title, author, or keyword..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FCAE76] focus:bg-white transition-all text-slate-800"
            />
          </div>

          {/* Genre chips */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs no-scrollbar">
            {genres.map(g => (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors font-medium ${
                  selectedGenre === g
                    ? 'bg-[#1C1935] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Book List Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filteredBooks.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="font-semibold text-slate-600">No books found</p>
              <p className="text-xs">Try adjusting your search keywords or filter.</p>
            </div>
          ) : (
            filteredBooks.map(book => (
              <div 
                key={book.id} 
                className="p-4 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white"
              >
                <div className="flex items-center space-x-4">
                  {/* Mock Book spine */}
                  <div className={`w-14 h-20 rounded-lg ${book.coverColor} flex flex-col justify-between p-2 text-white shadow-sm shrink-0`}>
                    <div className="text-[9px] font-mono tracking-tight font-bold opacity-80 uppercase">Amba Lib</div>
                    <div className="text-[10px] font-bold leading-tight line-clamp-2">{book.title}</div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                        {book.genre}
                      </span>
                      <span className="flex items-center text-[11px] text-slate-500 font-medium">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400 mr-1" />
                        {book.rating}
                      </span>
                    </div>
                    <h3 className="font-bold text-[#1C1935] text-base mt-1 leading-snug">{book.title}</h3>
                    <p className="text-xs text-slate-500">by {book.author}</p>
                    <p className="text-xs text-slate-600 line-clamp-1 mt-1 max-w-sm">{book.description}</p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-right">
                    <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      book.status === 'Available' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {book.status === 'Available' ? `${book.copies} Copies Left` : 'All Issued'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAction(book)}
                    disabled={book.status !== 'Available' && currentUser?.role !== 'admin'}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                      currentUser?.role === 'admin'
                        ? 'bg-[#1C1935] hover:bg-slate-800 text-white'
                        : book.status === 'Available'
                        ? 'bg-[#FCAE76] hover:bg-[#eb9664] text-[#1C1935]'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span>{currentUser?.role === 'admin' ? 'Manage Book' : 'Borrow Book'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-500">
          Showing {filteredBooks.length} titles available in the Amba University Central Library.
        </div>
      </div>
    </div>
  );
}
