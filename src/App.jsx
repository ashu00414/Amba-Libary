import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeedbackSection from './components/FeedbackSection';
import AdminLoginModal from './components/AdminLoginModal';
import StudentLoginModal from './components/StudentLoginModal';
import RoleBanner from './components/RoleBanner';
import AdminSeatManagement from './components/AdminSeatManagement';
import StudentDashboard from './components/StudentDashboard';
import { getStoredSession, saveStoredSession, clearStoredSession } from './data/libraryStore';
import { X, MapPin, Phone, Mail, Clock, CheckCircle2, BookOpen, PhoneCall } from 'lucide-react';
import logoImg from './assets/logo.png';

export default function App() {
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isStudentLoginOpen, setIsStudentLoginOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Persistent User Session (Survives browser refresh F5)
  const [session] = useState(() => getStoredSession());
  const [currentUser, setCurrentUser] = useState(session.user);
  const [currentView, setCurrentView] = useState(session.view);

  const handleLoginSuccess = (user) => {
    const nextView = user.role === 'admin' ? 'admin_console' : 'student_portal';
    setCurrentUser(user);
    setCurrentView(nextView);
    saveStoredSession(user, nextView);
  };

  const handleLogout = () => {
    clearStoredSession();
    setCurrentUser(null);
    setCurrentView('landing');
  };

  // If in Admin Console view
  if (currentView === 'admin_console' && currentUser?.role === 'admin') {
    return (
      <AdminSeatManagement
        currentUser={currentUser}
        onLogout={handleLogout}
      />
    );
  }

  // If in Student Portal view
  if (currentView === 'student_portal' && currentUser?.role === 'student') {
    return (
      <StudentDashboard
        studentUser={currentUser}
        onLogout={handleLogout}
      />
    );
  }

  // Default: Exact Landing Page with clean requirements
  return (
    <div id="home" className="min-h-screen flex flex-col bg-white text-slate-800 antialiased font-sans select-none relative">
      
      {/* Role Banner if logged in */}
      {currentUser && (
        <RoleBanner 
          currentUser={currentUser} 
          onLogout={handleLogout} 
          onOpenCatalog={() => {
            const nextView = currentUser.role === 'admin' ? 'admin_console' : 'student_portal';
            setCurrentView(nextView);
            saveStoredSession(currentUser, nextView);
          }}
        />
      )}

      {/* Top Navbar: Official Logo, Home, About Us, Feedback, Contact grouped to the left of Admin Login */}
      <Navbar
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
      />

      {/* Main Hero Section: AMBA LIBRARY, quotes on good environment, and ONLY Student Login */}
      <main className="flex-1 flex flex-col justify-center">
        <Hero 
          onOpenStudentLogin={() => setIsStudentLoginOpen(true)}
        />
      </main>

      {/* Feedback / Get in Touch Section matching user's reference screenshot */}
      <FeedbackSection />

      {/* Clean & Sleek Footer (No bulky Portals box) */}
      <footer className="w-full bg-[#080A15] text-slate-400 border-t border-slate-800 py-12 px-6 sm:px-10 lg:px-16 text-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 mb-10">
          
          {/* Brand Info */}
          <div className="md:col-span-6 space-y-4 text-left">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center border border-slate-700 shadow-sm overflow-hidden">
                <img src={logoImg} alt="Amba Library Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-black text-xl text-white tracking-tight font-heading">
                AMBA LIBRARY
              </span>
            </div>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              Premium silent study space designed for competitive exam aspirants. Dedicated desks, optical fiber Wi-Fi, fully air-conditioned halls, and 24x7 flexible shift schedules.
            </p>
            <div className="text-xs text-slate-500 font-medium">
              “Good Environment, Clean Space &amp; Peaceful Ambiance for Your Deep Focus.”
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="md:col-span-3 space-y-3 text-left">
            <div className="text-xs font-bold text-white uppercase tracking-wider">Quick Navigation</div>
            <ul className="space-y-2 text-xs">
              <li><a href="#home" className="hover:text-blue-400 transition-colors">Home</a></li>
              <li><button onClick={() => setIsAboutOpen(true)} className="hover:text-blue-400 transition-colors cursor-pointer">About Us</button></li>
              <li><a href="#feedback" className="hover:text-blue-400 transition-colors">Get in Touch / Feedback</a></li>
              <li><button onClick={() => setIsContactOpen(true)} className="hover:text-blue-400 transition-colors cursor-pointer">Contact Desk</button></li>
            </ul>
          </div>

          {/* Direct Support & Contact */}
          <div className="md:col-span-3 space-y-3 text-left">
            <div className="text-xs font-bold text-white uppercase tracking-wider">Direct Support</div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <a href="mailto:amba00414@gmail.com" className="text-blue-400 hover:underline">
                  amba00414@gmail.com
                </a>
              </div>
              <div className="flex items-center space-x-2 text-slate-400">
                <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <a href="tel:+918292002249" className="hover:text-white transition-colors">
                  +91 82920 02249
                </a>
              </div>
              <div className="flex items-center space-x-2 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>24x7 Open (Day &amp; Night)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Strip */}
        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} Amba Library. All rights reserved.
          </div>
          <div className="flex items-center space-x-6">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-400">Live Reading Hall Active</span>
            </span>
            <span>50 Dedicated Desks</span>
          </div>
        </div>
      </footer>

      {/* Pure Admin Login Modal (NO Student Login tab, NO '50 seats' subtitle) */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Pure Student Login Modal (NO Admin Login tab) */}
      <StudentLoginModal
        isOpen={isStudentLoginOpen}
        onClose={() => setIsStudentLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* About Us Modal */}
      {isAboutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/60 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-amber-700" />
                </div>
                <h3 className="font-extrabold text-xl text-[#1C1935]">About Amba Library</h3>
              </div>
              <button onClick={() => setIsAboutOpen(false)} className="p-1 text-slate-400 hover:text-black cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
              <p className="font-semibold text-slate-800 text-base">
                “Good Environment, Clean Space &amp; Peaceful Ambiance for Your Deep Focus.”
              </p>
              <p>
                Amba Library provides a premium, calm, and disciplined sanctuary for students and competitive exam aspirants. Equipped with ergonomic study desks, high-speed Wi-Fi, and fully air-conditioned silence zones.
              </p>
              
              <div className="space-y-2 pt-2">
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>100% Noise-Free &amp; Fully Air-Conditioned Silent Zone</span>
                </div>
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Individual Charging Ports &amp; High-Speed Optical Fiber Wi-Fi</span>
                </div>
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Flexible Daily Shifts + Full Night Overnight Study Slots</span>
                </div>
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Purified RO Water, CCTV Surveillance &amp; Clean Restrooms</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-right">
              <button
                onClick={() => setIsAboutOpen(false)}
                className="bg-[#1C1935] hover:bg-[#2b2752] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {isContactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200/60 flex items-center justify-center">
                  <PhoneCall className="w-4 h-4 text-emerald-700" />
                </div>
                <h3 className="font-extrabold text-xl text-[#1C1935]">Contact Amba Library</h3>
              </div>
              <button onClick={() => setIsContactOpen(false)} className="p-1 text-slate-400 hover:text-black cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4 text-sm text-slate-700">
              <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <MapPin className="w-5 h-5 text-[#FCAE76] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">Address</div>
                  <div className="text-xs text-slate-600">Amba Digital Library, 2nd Floor, Main Commercial Complex, Near University Metro Station.</div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <Phone className="w-5 h-5 text-[#FCAE76] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">Phone / WhatsApp</div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    +91 82920 02249
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <Mail className="w-5 h-5 text-[#FCAE76] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">Direct Support Email</div>
                  <div className="text-xs text-blue-600 font-semibold">
                    <a href="mailto:amba00414@gmail.com" className="hover:underline">
                      amba00414@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <Clock className="w-5 h-5 text-[#FCAE76] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">Opening Hours</div>
                  <div className="text-xs text-slate-600">24x7 Open (Day &amp; Night Shifts)</div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-right">
              <button
                onClick={() => setIsContactOpen(false)}
                className="bg-[#1C1935] hover:bg-[#2b2752] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
