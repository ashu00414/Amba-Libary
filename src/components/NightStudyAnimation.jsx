import React from 'react';

export default function NightStudyAnimation() {
  return (
    <div className="relative w-full h-full min-h-[500px] lg:min-h-[580px] flex items-center justify-center overflow-hidden select-none">
      
      {/* Fallback to video if user has a custom video file in public/study_animation.mp4 */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="hidden" // Will remain fallback
        src="/study_animation.mp4"
      />

      {/* SVG Vector Art Scene */}
      <svg 
        viewBox="60 40 760 560" 
        className="w-full h-full object-cover"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Night Room Background Gradient */}
          <linearGradient id="nightBg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0B0D1B" />
            <stop offset="60%" stopColor="#121528" />
            <stop offset="100%" stopColor="#181C35" />
          </linearGradient>

          {/* Lamp Light Cone 1 (Warm Golden Amber) */}
          <radialGradient id="lampGlow1" cx="50%" cy="0%" r="90%">
            <stop offset="0%" stopColor="#FFE082" stopOpacity="0.85" />
            <stop offset="25%" stopColor="#FFCA28" stopOpacity="0.55" />
            <stop offset="65%" stopColor="#FFB300" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#FF8F00" stopOpacity="0" />
          </radialGradient>

          {/* Lamp Light Cone 2 (Cozy Warm White) */}
          <radialGradient id="lampGlow2" cx="50%" cy="0%" r="95%">
            <stop offset="0%" stopColor="#FFF9C4" stopOpacity="0.9" />
            <stop offset="30%" stopColor="#FFE082" stopOpacity="0.5" />
            <stop offset="70%" stopColor="#FFB74D" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#FF9800" stopOpacity="0" />
          </radialGradient>

          {/* Lamp Light Cone 3 (Emerald Banker's Warm Beam) */}
          <radialGradient id="lampGlow3" cx="50%" cy="0%" r="90%">
            <stop offset="0%" stopColor="#FFF3E0" stopOpacity="0.85" />
            <stop offset="35%" stopColor="#FFE0B2" stopOpacity="0.45" />
            <stop offset="75%" stopColor="#FFCC80" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#FFA726" stopOpacity="0" />
          </radialGradient>

          {/* Laptop Screen Cool Glow */}
          <radialGradient id="screenGlow" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#BAE6FD" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#7DD3FC" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
          </radialGradient>

          {/* Moon Glow */}
          <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="40%" stopColor="#E0F2FE" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
          </radialGradient>

          {/* Soft Blur Filter for Light Cones */}
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <style>{`
          @keyframes lampPulse {
            0%, 100% { opacity: 0.95; transform: scaleY(1); }
            50% { opacity: 0.85; transform: scaleY(0.98); }
          }
          @keyframes gentleBreathe {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-2px); }
          }
          @keyframes writingHand {
            0%, 100% { transform: translate(0, 0); }
            25% { transform: translate(2px, -1px); }
            50% { transform: translate(-1px, 1px); }
            75% { transform: translate(3px, 0px); }
          }
          @keyframes starTwinkle {
            0%, 100% { opacity: 0.2; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.2); }
          }
          @keyframes steamRise {
            0% { opacity: 0; transform: translateY(0) scaleX(0.8); }
            40% { opacity: 0.6; transform: translateY(-8px) scaleX(1.1); }
            100% { opacity: 0; transform: translateY(-20px) scaleX(1.4); }
          }
          @keyframes clockTick {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .anim-lamp-1 { animation: lampPulse 4s ease-in-out infinite; transform-origin: 220px 240px; }
          .anim-lamp-2 { animation: lampPulse 5s ease-in-out infinite 1s; transform-origin: 470px 220px; }
          .anim-lamp-3 { animation: lampPulse 4.5s ease-in-out infinite 2s; transform-origin: 720px 240px; }
          .anim-student-1 { animation: gentleBreathe 4s ease-in-out infinite; }
          .anim-student-2 { animation: gentleBreathe 5s ease-in-out infinite 0.5s; }
          .anim-student-3 { animation: gentleBreathe 4.2s ease-in-out infinite 1.2s; }
          .anim-hand { animation: writingHand 1.2s ease-in-out infinite; }
          .anim-star-1 { animation: starTwinkle 3s ease-in-out infinite; transform-origin: center; }
          .anim-star-2 { animation: starTwinkle 2.4s ease-in-out infinite 1s; transform-origin: center; }
          .anim-star-3 { animation: starTwinkle 3.6s ease-in-out infinite 1.8s; transform-origin: center; }
          .anim-steam-1 { animation: steamRise 3s ease-out infinite; transform-origin: bottom center; }
          .anim-steam-2 { animation: steamRise 3s ease-out infinite 1.5s; transform-origin: bottom center; }
        `}</style>

        {/* 1. ROOM BACKGROUND (Dim Lights Off Library) */}
        <rect width="900" height="650" fill="url(#nightBg)" />

        {/* 2. ARCHED LIBRARY WINDOW (Night Sky with Moon & Stars) */}
        <g id="window" transform="translate(360, 40)">
          {/* Window Frame Outer Arch */}
          <path d="M 0 140 L 0 60 Q 90 -20 180 60 L 180 140 Z" fill="#060814" stroke="#1A2035" strokeWidth="6" />
          
          {/* Glass Sky Background */}
          <path d="M 4 138 L 4 60 Q 90 -16 176 60 L 176 138 Z" fill="#0A0D1F" />

          {/* Twinkling Stars */}
          <circle cx="40" cy="40" r="1.5" fill="#FFFFFF" className="anim-star-1" />
          <circle cx="120" cy="30" r="2" fill="#BAE6FD" className="anim-star-2" />
          <circle cx="150" cy="70" r="1.5" fill="#FEF08A" className="anim-star-3" />
          <circle cx="65" cy="85" r="1.2" fill="#FFFFFF" className="anim-star-2" />
          <circle cx="95" cy="20" r="1.8" fill="#FFFFFF" className="anim-star-1" />

          {/* Glowing Crescent Moon */}
          <circle cx="130" cy="45" r="14" fill="url(#moonGlow)" opacity="0.9" />
          <path d="M 130 32 A 13 13 0 0 0 140 50 A 13 13 0 1 1 130 32 Z" fill="#FEF9C3" filter="drop-shadow(0 0 6px #FEF08A)" />

          {/* Distant City Skyline Silhouette */}
          <path d="M 10 138 L 25 105 L 45 105 L 50 115 L 75 95 L 90 95 L 100 120 L 130 110 L 145 110 L 170 138 Z" fill="#05060E" />

          {/* Window Panes & Mullions */}
          <line x1="90" y1="10" x2="90" y2="138" stroke="#1A2035" strokeWidth="4" />
          <line x1="4" y1="80" x2="176" y2="80" stroke="#1A2035" strokeWidth="4" />
        </g>

        {/* 3. WALL CLOCK (11:40 PM - Night Shift Study Vibe) */}
        <g id="wallClock" transform="translate(140, 70)">
          <circle cx="25" cy="25" r="22" fill="#141829" stroke="#2D3748" strokeWidth="3" />
          <circle cx="25" cy="25" r="19" fill="#0D1120" />
          {/* Clock Ticks */}
          <circle cx="25" cy="8" r="1.2" fill="#94A3B8" />
          <circle cx="25" cy="42" r="1.2" fill="#94A3B8" />
          <circle cx="8" cy="25" r="1.2" fill="#94A3B8" />
          <circle cx="42" cy="25" r="1.2" fill="#94A3B8" />
          {/* Hour & Minute Hands (Pointing to 11:45 PM) */}
          <line x1="25" y1="25" x2="17" y2="13" stroke="#FCAE76" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="25" y1="25" x2="10" y2="25" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="25" cy="25" r="2.5" fill="#FCAE76" />
        </g>

        {/* 4. SILENCE / MOTIVATIONAL FRAMED BANNER */}
        <g id="frame" transform="translate(680, 65)">
          <rect x="0" y="0" width="130" height="48" rx="6" fill="#141829" stroke="#334155" strokeWidth="3" />
          <text x="65" y="22" fill="#FCAE76" fontSize="10" fontWeight="bold" textAnchor="middle" letterSpacing="1.5">
            SILENT ZONE
          </text>
          <text x="65" y="37" fill="#94A3B8" fontSize="9" textAnchor="middle" letterSpacing="0.8">
            STUDY CABINS • NIGHT
          </text>
        </g>

        {/* 5. BACKGROUND TALL BOOKSHELVES (In Shadows) */}
        <g id="shadowBookshelves" opacity="0.35">
          {/* Left Tall Bookcase */}
          <rect x="20" y="120" width="80" height="500" fill="#080A14" />
          <line x1="20" y1="200" x2="100" y2="200" stroke="#1E2338" strokeWidth="5" />
          <line x1="20" y1="280" x2="100" y2="280" stroke="#1E2338" strokeWidth="5" />
          <line x1="20" y1="360" x2="100" y2="360" stroke="#1E2338" strokeWidth="5" />
          {/* Books in darkness */}
          <rect x="30" y="145" width="10" height="55" fill="#1E293B" />
          <rect x="42" y="135" width="14" height="65" fill="#334155" />
          <rect x="58" y="150" width="12" height="50" fill="#1E293B" />
          <rect x="72" y="140" width="15" height="60" fill="#475569" />

          {/* Right Tall Bookcase */}
          <rect x="800" y="120" width="80" height="500" fill="#080A14" />
          <line x1="800" y1="200" x2="880" y2="200" stroke="#1E2338" strokeWidth="5" />
          <line x1="800" y1="280" x2="880" y2="280" stroke="#1E2338" strokeWidth="5" />
          <line x1="800" y1="360" x2="880" y2="360" stroke="#1E2338" strokeWidth="5" />
          <rect x="815" y="140" width="12" height="60" fill="#334155" />
          <rect x="830" y="150" width="15" height="50" fill="#1E293B" />
          <rect x="848" y="135" width="14" height="65" fill="#475569" />
        </g>

        {/* 6. FLOOR & MAIN DESK COUNTER BARRIER */}
        <rect x="0" y="560" width="900" height="90" fill="#0A0C18" />
        <line x1="0" y1="560" x2="900" y2="560" stroke="#1A1F33" strokeWidth="4" />

        {/* =========================================================================
            STUDY SECTION 1 (LEFT DESK - STUDENT WITH LAPTOP & NOTES)
           ========================================================================= */}
        <g id="deskSection1">
          {/* Partition Wall */}
          <rect x="70" y="240" width="14" height="320" rx="3" fill="#15192D" stroke="#252C48" strokeWidth="2" />
          <rect x="330" y="240" width="14" height="320" rx="3" fill="#15192D" stroke="#252C48" strokeWidth="2" />
          {/* Desk Surface */}
          <rect x="84" y="440" width="246" height="18" rx="2" fill="#1E243D" stroke="#2C3555" strokeWidth="2" />
          <rect x="84" y="458" width="246" height="102" fill="#111526" />

          {/* Sticky Notes on Partition */}
          <rect x="100" y="280" width="28" height="28" fill="#F59E0B" opacity="0.6" rx="2" />
          <rect x="135" y="275" width="32" height="32" fill="#38BDF8" opacity="0.5" rx="2" />
          <rect x="105" y="315" width="30" height="26" fill="#A855F7" opacity="0.5" rx="2" />

          {/* Mini Shelf on Partition with Books */}
          <rect x="95" y="375" width="90" height="6" fill="#2C3555" />
          <rect x="105" y="340" width="8" height="35" fill="#E11D48" />
          <rect x="115" y="335" width="10" height="40" fill="#0D9488" />
          <rect x="127" y="345" width="9" height="30" fill="#D97706" />

          {/* Coffee Mug with Animated Steam */}
          <g transform="translate(110, 415)">
            <rect x="0" y="7" width="16" height="18" rx="3" fill="#E2E8F0" />
            <path d="M 16 11 Q 22 15 16 20" fill="none" stroke="#E2E8F0" strokeWidth="2.5" />
            {/* Steam Trails */}
            <path d="M 5 4 Q 8 0 5 -6" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" className="anim-steam-1" />
            <path d="M 11 4 Q 14 0 11 -7" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" className="anim-steam-2" />
          </g>

          {/* STUDY LAMP 1 (ON - GOOSENECK LAMP) */}
          <g id="lamp1">
            {/* Base */}
            <ellipse cx="230" cy="438" rx="14" ry="4" fill="#334155" />
            {/* Curved Arm */}
            <path d="M 230 436 Q 235 340 195 290 Q 185 275 165 285" fill="none" stroke="#475569" strokeWidth="5" strokeLinecap="round" />
            {/* Lamp Shade Head */}
            <path d="M 155 275 L 180 290 L 160 308 L 140 290 Z" fill="#F59E0B" />
            {/* Bright Bulb */}
            <ellipse cx="160" cy="295" rx="6" ry="4" fill="#FFFFFF" filter="url(#softGlow)" />

            {/* RADIANT LIGHT CONE 1 (Illuminating the desk & student) */}
            <polygon 
              points="160,295 40,540 310,540" 
              fill="url(#lampGlow1)" 
              className="anim-lamp-1"
              style={{ mixBlendMode: 'screen' }}
            />
          </g>

          {/* Student 1 (Girl Studying with Laptop & Notebook) */}
          <g id="student1" className="anim-student-1">
            {/* Ergonomic Chair Back */}
            <rect x="235" y="370" width="38" height="90" rx="8" fill="#0D111E" stroke="#1E2438" strokeWidth="2" />
            <line x1="254" y1="460" x2="254" y2="540" stroke="#1E2438" strokeWidth="6" />

            {/* Torso / Jacket */}
            <path d="M 220 420 Q 250 405 275 420 L 270 480 L 215 480 Z" fill="#3B82F6" />
            <path d="M 215 440 Q 200 460 185 450 L 195 440 Z" fill="#2563EB" /> {/* Left Arm on table */}

            {/* Head & Hair */}
            <circle cx="245" cy="380" r="16" fill="#FBD38D" /> {/* Face */}
            <path d="M 235 365 Q 255 355 260 375 Q 265 390 250 395 Q 230 390 235 365 Z" fill="#451A03" /> {/* Ponytail Hair */}
            <circle cx="265" cy="378" r="6" fill="#451A03" /> {/* Hair bun */}

            {/* Head tilting toward notebook */}
            <line x1="240" y1="382" x2="243" y2="384" stroke="#78350F" strokeWidth="2" strokeLinecap="round" /> {/* Focused Eye */}

            {/* Writing Hand & Pen */}
            <g className="anim-hand">
              <ellipse cx="185" cy="442" rx="5" ry="4" fill="#FBD38D" />
              <line x1="184" y1="442" x2="178" y2="435" stroke="#E2E8F0" strokeWidth="2" /> {/* Pen */}
            </g>

            {/* Open Study Notebook on Desk */}
            <rect x="145" y="435" width="45" height="12" rx="2" fill="#FEF3C7" stroke="#D97706" strokeWidth="1" />
            <line x1="167" y1="435" x2="167" y2="447" stroke="#B45309" strokeWidth="1" />

            {/* Laptop Open with Screen Glow */}
            <g transform="translate(195, 418)">
              {/* Keyboard Base */}
              <polygon points="0,22 45,22 40,26 -5,26" fill="#94A3B8" />
              {/* Screen Angled */}
              <polygon points="0,22 35,5 35,-12 0,5" fill="#334155" stroke="#64748B" strokeWidth="1" />
              {/* Glowing Display */}
              <polygon points="2,20 33,6 33,-9 2,7" fill="#E0F2FE" />
              {/* Screen Light Projection */}
              <ellipse cx="10" cy="15" rx="30" ry="20" fill="url(#screenGlow)" />
            </g>
          </g>

          {/* Seat Label Pill */}
          <rect x="180" y="525" width="60" height="20" rx="10" fill="#1E2438" stroke="#38BDF8" strokeWidth="1.5" />
          <text x="210" y="539" fill="#38BDF8" fontSize="10" fontWeight="bold" textAnchor="middle">SEAT 07</text>
        </g>


        {/* =========================================================================
            STUDY SECTION 2 (CENTER DESK - BOY WITH HEADPHONES & TEXTBOOK)
           ========================================================================= */}
        <g id="deskSection2">
          {/* Partition Wall */}
          <rect x="580" y="240" width="14" height="320" rx="3" fill="#15192D" stroke="#252C48" strokeWidth="2" />
          {/* Desk Surface */}
          <rect x="344" y="440" width="236" height="18" rx="2" fill="#1E243D" stroke="#2C3555" strokeWidth="2" />
          <rect x="344" y="458" width="236" height="102" fill="#111526" />

          {/* Potted Succulent Plant on partition corner */}
          <g transform="translate(355, 405)">
            <polygon points="4,25 24,25 20,35 8,35" fill="#D97706" />
            <circle cx="14" cy="22" r="7" fill="#10B981" />
            <circle cx="9" cy="18" r="5" fill="#059669" />
            <circle cx="19" cy="18" r="5" fill="#34D399" />
          </g>

          {/* Stack of Reference Books */}
          <rect x="380" y="426" width="38" height="6" fill="#DC2626" rx="1" />
          <rect x="382" y="420" width="34" height="6" fill="#2563EB" rx="1" />
          <rect x="384" y="414" width="30" height="6" fill="#16A34A" rx="1" />

          {/* Green Banker's Desk Lamp (Center Lamp ON) */}
          <g id="lamp2">
            <ellipse cx="510" cy="438" rx="16" ry="5" fill="#B45309" />
            <line x1="510" y1="438" x2="510" y2="340" stroke="#D97706" strokeWidth="5" />
            {/* Classic Banker's Emerald Green Shade */}
            <path d="M 480 340 Q 510 325 540 340 L 535 352 Q 510 342 485 352 Z" fill="#047857" stroke="#065F46" strokeWidth="1.5" />
            {/* Glowing Golden Bulb */}
            <ellipse cx="510" cy="347" rx="8" ry="4" fill="#FEF08A" filter="url(#softGlow)" />

            {/* RADIANT LIGHT CONE 2 (Golden Beam directly over thick book) */}
            <polygon 
              points="510,347 360,545 610,545" 
              fill="url(#lampGlow2)" 
              className="anim-lamp-2"
              style={{ mixBlendMode: 'screen' }}
            />
          </g>

          {/* Student 2 (Boy with Headphones Reading Thick Book) */}
          <g id="student2" className="anim-student-2">
            {/* Chair Back */}
            <rect x="445" y="360" width="40" height="95" rx="8" fill="#0D111E" stroke="#1E2438" strokeWidth="2" />
            <line x1="465" y1="455" x2="465" y2="540" stroke="#1E2438" strokeWidth="6" />

            {/* Boy Body / Hoodie */}
            <path d="M 430 415 Q 465 400 495 415 L 490 480 L 425 480 Z" fill="#059669" />
            <path d="M 425 440 Q 440 455 450 450" fill="none" stroke="#047857" strokeWidth="12" strokeLinecap="round" />

            {/* Head & Boy Haircut */}
            <circle cx="465" cy="375" r="17" fill="#FED7AA" />
            <path d="M 450 370 Q 465 350 482 368 Q 485 380 478 385 L 452 385 Z" fill="#1C1917" /> {/* Dark Hair */}

            {/* Study Headphones */}
            <path d="M 450 375 Q 465 358 480 375" fill="none" stroke="#F43F5E" strokeWidth="4" />
            <rect x="448" y="372" width="5" height="12" rx="2" fill="#F43F5E" />
            <rect x="477" y="372" width="5" height="12" rx="2" fill="#F43F5E" />

            {/* Focused Expression Reading */}
            <line x1="460" y1="378" x2="464" y2="381" stroke="#451A03" strokeWidth="2" strokeLinecap="round" />

            {/* Large Open Hardcover Textbook on Desk */}
            <g transform="translate(425, 432)">
              <polygon points="0,15 35,10 70,15 65,22 35,17 5,22" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />
              <line x1="35" y1="10" x2="35" y2="17" stroke="#94A3B8" strokeWidth="1.5" />
              {/* Text lines */}
              <line x1="8" y1="13" x2="30" y2="12" stroke="#64748B" strokeWidth="1" strokeDasharray="3,1" />
              <line x1="8" y1="16" x2="28" y2="15" stroke="#64748B" strokeWidth="1" strokeDasharray="3,1" />
              <line x1="40" y1="12" x2="62" y2="13" stroke="#64748B" strokeWidth="1" strokeDasharray="3,1" />
              <line x1="40" y1="15" x2="60" y2="16" stroke="#64748B" strokeWidth="1" strokeDasharray="3,1" />
            </g>
          </g>

          {/* Seat Label Pill */}
          <rect x="430" y="525" width="60" height="20" rx="10" fill="#1E2438" stroke="#10B981" strokeWidth="1.5" />
          <text x="460" y="539" fill="#10B981" fontSize="10" fontWeight="bold" textAnchor="middle">SEAT 12</text>
        </g>


        {/* =========================================================================
            STUDY SECTION 3 (RIGHT DESK - STUDENT WITH TABLET & STUDY LAMP)
           ========================================================================= */}
        <g id="deskSection3">
          {/* Desk Surface */}
          <rect x="594" y="440" width="226" height="18" rx="2" fill="#1E243D" stroke="#2C3555" strokeWidth="2" />
          <rect x="594" y="458" width="226" height="102" fill="#111526" />

          {/* Pinboard Notes on Right Partition */}
          <rect x="610" y="270" width="35" height="30" fill="#F472B6" opacity="0.6" rx="2" />
          <rect x="655" y="280" width="28" height="28" fill="#FBBF24" opacity="0.5" rx="2" />
          <rect x="615" y="315" width="40" height="25" fill="#34D399" opacity="0.5" rx="2" />

          {/* Water Bottle & Pen Stand */}
          <rect x="750" y="415" width="12" height="25" rx="3" fill="#38BDF8" opacity="0.7" />
          <rect x="768" y="425" width="14" height="15" rx="2" fill="#475569" />
          <line x1="772" y1="418" x2="772" y2="425" stroke="#EF4444" strokeWidth="2" />
          <line x1="776" y1="415" x2="776" y2="425" stroke="#3B82F6" strokeWidth="2" />

          {/* MODERN MINIMALIST ARCH LAMP (Right Lamp ON) */}
          <g id="lamp3">
            <ellipse cx="630" cy="438" rx="14" ry="4" fill="#334155" />
            <path d="M 630 436 Q 625 320 670 270 Q 690 250 715 260" fill="none" stroke="#64748B" strokeWidth="4.5" strokeLinecap="round" />
            {/* Lamp Head */}
            <rect x="710" y="255" width="25" height="10" rx="3" fill="#E2E8F0" />
            <ellipse cx="722" cy="265" rx="8" ry="4" fill="#FFFFFF" filter="url(#softGlow)" />

            {/* RADIANT LIGHT CONE 3 */}
            <polygon 
              points="722,265 600,545 830,545" 
              fill="url(#lampGlow3)" 
              className="anim-lamp-3"
              style={{ mixBlendMode: 'screen' }}
            />
          </g>

          {/* Student 3 (Girl Studying with Tablet & Stylus) */}
          <g id="student3" className="anim-student-3">
            {/* Chair Back */}
            <rect x="670" y="365" width="38" height="90" rx="8" fill="#0D111E" stroke="#1E2438" strokeWidth="2" />
            <line x1="689" y1="455" x2="689" y2="540" stroke="#1E2438" strokeWidth="6" />

            {/* Body */}
            <path d="M 655 420 Q 685 405 710 420 L 705 480 L 650 480 Z" fill="#9333EA" />

            {/* Head & Hair */}
            <circle cx="680" cy="378" r="16" fill="#FDE047" />
            <path d="M 665 375 Q 680 355 700 375 Q 695 405 665 400 Z" fill="#92400E" />

            {/* Tablet on Desk Glowing */}
            <rect x="695" y="434" width="38" height="26" rx="3" fill="#1E293B" stroke="#64748B" strokeWidth="1.5" />
            <rect x="698" y="437" width="32" height="20" rx="2" fill="#E0F2FE" opacity="0.9" />
            {/* Stylus in hand */}
            <ellipse cx="715" cy="442" rx="4" ry="4" fill="#FDE047" />
            <line x1="714" y1="442" x2="708" y2="445" stroke="#FFFFFF" strokeWidth="2" />
          </g>

          {/* Seat Label Pill */}
          <rect x="670" y="525" width="60" height="20" rx="10" fill="#1E2438" stroke="#A855F7" strokeWidth="1.5" />
          <text x="700" y="539" fill="#A855F7" fontSize="10" fontWeight="bold" textAnchor="middle">SEAT 18</text>
        </g>

        {/* 7. AMBIENT GLOWING DUST MOTES (Floating in Lamp Cones) */}
        <circle cx="170" cy="340" r="1" fill="#FEF08A" opacity="0.6" className="anim-star-1" />
        <circle cx="210" cy="380" r="1.5" fill="#FEF08A" opacity="0.8" className="anim-star-2" />
        <circle cx="150" cy="420" r="1.2" fill="#FEF08A" opacity="0.5" className="anim-star-3" />
        <circle cx="500" cy="390" r="1.5" fill="#FEF08A" opacity="0.7" className="anim-star-1" />
        <circle cx="525" cy="430" r="1.2" fill="#FEF08A" opacity="0.8" className="anim-star-3" />
        <circle cx="730" cy="320" r="1.4" fill="#FEF08A" opacity="0.7" className="anim-star-2" />
      </svg>

      {/* Floating Glassmorphism Badge: "Night Shift Active • 10 PM - 6 AM" */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#0F1223]/80 backdrop-blur-md px-5 py-2 rounded-full border border-slate-700/60 shadow-xl flex items-center space-x-2 text-white">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
        <span className="text-xs font-bold tracking-wide">
          🌙 Night Shift Study Zone • Lamps On & 100% Silence
        </span>
      </div>

    </div>
  );
}
