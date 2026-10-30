import React from 'react';
import { User, ArrowRight } from 'lucide-react';
import NightStudyAnimation from './NightStudyAnimation';

export default function Hero({ onOpenStudentLogin }) {
  return (
    <section className="relative w-full min-h-[calc(100vh-80px)] flex items-center justify-between overflow-hidden bg-white">
      
      {/* Background container for the large round shape extending to right edge */}
      <div 
        className="absolute right-0 top-0 bottom-0 w-[56%] hidden lg:block overflow-hidden"
        aria-hidden="true"
      >
        <div 
          className="w-[140%] h-[120%] -translate-y-[10%] translate-x-[4%] rounded-l-[1000px] overflow-hidden shadow-2xl border-l-4 border-slate-800/50 bg-[#0B0D1B] relative"
        >
          {/* Night Study Animation inside the desktop round shape */}
          <NightStudyAnimation />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 w-full py-8 lg:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          
          {/* Left Column: AMBA LIBRARY Branding, Quotes, and ONLY Student Login */}
          <div className="lg:col-span-5 z-10 space-y-7 text-left">
            
            {/* Title: AMBA LIBRARY */}
            <div className="space-y-1">
              <h1 className="text-6xl sm:text-7xl lg:text-[84px] font-black text-[#1C1935] tracking-tight leading-[0.98] font-heading">
                AMBA<br />
                LIBRARY
              </h1>
            </div>

            {/* Inspiring Quote on Good Environment, Clean Space */}
            <div className="space-y-3 max-w-md">
              <p className="text-[#2C2B4B] text-lg sm:text-xl font-semibold leading-snug italic">
                “Good Environment, Clean Space & Peaceful Ambiance for Your Deep Focus.”
              </p>
              <p className="text-[#55596E] text-sm sm:text-base leading-relaxed font-normal">
                A calm, air-conditioned silent study hub equipped with high-speed internet, dedicated desks, and positive vibes to fuel your success.
              </p>
            </div>

            {/* ONLY Student Login Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={onOpenStudentLogin}
                className="bg-[#FCAE76] hover:bg-[#f39857] text-[#1C1935] px-10 py-4 rounded-full font-bold text-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center space-x-3 group"
              >
                <div className="w-8 h-8 rounded-full bg-white/40 flex items-center justify-center">
                  <User className="w-4 h-4 text-[#1C1935]" />
                </div>
                <span>Student Login</span>
                <ArrowRight className="w-5 h-5 text-[#1C1935] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>

          {/* Right Column: For Mobile / Tablet screens where absolute right is hidden */}
          <div className="lg:col-span-7 lg:hidden relative flex justify-center items-center py-6">
            <div className="w-full max-w-[480px] h-[380px] sm:h-[440px] rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-800 bg-[#0B0D1B]">
              <NightStudyAnimation />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
