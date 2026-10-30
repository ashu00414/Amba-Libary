import React, { useState } from 'react';
import { Shield, User, LogOut, Menu, X, MessageSquareQuote } from 'lucide-react';
import logoImg from '../assets/logo.png';

export default function Navbar({ 
  onOpenAdminLogin, 
  currentUser, 
  onLogout,
  onOpenAbout,
  onOpenContact
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 w-full z-40 bg-white/95 backdrop-blur-md transition-all duration-200 border-b border-slate-100 shadow-2xs">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 h-20 flex items-center justify-between">
        
        {/* Brand / Logo on Left with Official Image */}
        <a href="#home" className="flex items-center space-x-3 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center p-1 group-hover:border-slate-300 transition-colors">
            <img 
              src={logoImg} 
              alt="Amba Library Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="font-black text-[#1C1935] tracking-tight text-xl font-heading leading-tight group-hover:text-black transition-colors">
              AMBA LIBRARY
            </div>
            <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase block">
              Silent Study Space
            </span>
          </div>
        </a>

        {/* Right Side: Home, About Us, Feedback, Contact grouped to the LEFT of Admin Login */}
        <div className="hidden md:flex items-center space-x-8">
          <nav className="flex items-center space-x-8 text-[15px] font-medium text-[#4A4E69]">
            <a 
              href="#home" 
              className="text-[#1C1935] font-semibold hover:text-black transition-colors"
            >
              Home
            </a>
            <button 
              type="button"
              onClick={onOpenAbout}
              className="hover:text-[#1C1935] transition-colors cursor-pointer text-[15px]"
            >
              About Us
            </button>
            <a 
              href="#feedback" 
              className="hover:text-[#1C1935] transition-colors cursor-pointer text-[15px] flex items-center space-x-1.5"
            >
              <MessageSquareQuote className="w-4 h-4 text-[#FCAE76]" />
              <span>Feedback</span>
            </a>
            <button 
              type="button"
              onClick={onOpenContact}
              className="hover:text-[#1C1935] transition-colors cursor-pointer text-[15px]"
            >
              Contact
            </button>
          </nav>

          {/* Admin Login Button right next to Contact */}
          <div>
            {currentUser ? (
              /* Logged in state */
              <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 py-1.5 px-3.5 rounded-full shadow-2xs">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentUser.role === 'admin' ? 'bg-[#1C1935] text-amber-300' : 'bg-[#FCAE76] text-[#1C1935]'
                }`}>
                  {currentUser.role === 'admin' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div className="text-left text-xs pr-1">
                  <p className="font-bold text-[#1C1935] leading-none">{currentUser.name}</p>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                    {currentUser.role === 'admin' ? '🛡️ Admin' : '🎓 Student'}
                  </span>
                </div>
                <button 
                  onClick={onLogout} 
                  title="Log Out"
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-full hover:bg-white transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Pure Admin Login Button */
              <button
                type="button"
                onClick={onOpenAdminLogin}
                className="flex items-center space-x-2 text-sm font-bold text-white bg-[#1C1935] hover:bg-[#2b2752] px-5 py-2.5 rounded-full transition-all shadow-sm hover:shadow-md cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Admin Login</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu trigger */}
        <div className="md:hidden flex items-center space-x-3">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:text-black cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-6 py-4 space-y-3 animate-in slide-in-from-top-2">
          <a 
            href="#home" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-800 font-semibold py-1"
          >
            Home
          </a>
          <button 
            onClick={() => { setMobileMenuOpen(false); onOpenAbout(); }} 
            className="block text-left w-full text-slate-600 py-1 cursor-pointer"
          >
            About Us
          </button>
          <a 
            href="#feedback" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-600 py-1 cursor-pointer flex items-center space-x-2"
          >
            <MessageSquareQuote className="w-4 h-4 text-[#FCAE76]" />
            <span>Feedback</span>
          </a>
          <button 
            onClick={() => { setMobileMenuOpen(false); onOpenContact(); }} 
            className="block text-left w-full text-slate-600 py-1 cursor-pointer"
          >
            Contact
          </button>
          <div className="pt-2 border-t border-slate-100">
            <button 
              onClick={() => { setMobileMenuOpen(false); onOpenAdminLogin(); }}
              className="w-full bg-[#1C1935] text-white py-2.5 text-xs font-bold rounded-xl text-center flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Admin Login</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
