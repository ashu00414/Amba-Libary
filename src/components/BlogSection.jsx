import React, { useState } from 'react';
import { 
  BookOpen, 
  Clock, 
  Calendar, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  X, 
  Share2, 
  Bookmark, 
  User, 
  Search,
  Brain,
  Moon,
  Activity,
  Award
} from 'lucide-react';
import logoImg from '../assets/logo.png';

const BLOG_POSTS = [
  {
    id: 'deep-work-protocol',
    category: 'Productivity & Focus',
    icon: Brain,
    tag: 'Deep Work',
    readTime: '5 min read',
    date: 'October 24, 2026',
    author: {
      name: 'Dr. Vivek Sharma',
      role: 'Cognitive Science Mentor & UPSC Educator',
      initials: 'VS'
    },
    title: 'The 4-Hour Deep Focus Protocol: Why 4 Pure Hours Beat a 12-Hour Casual Grind',
    excerpt: 'Cognitive fatigue builds fastest not from challenging books, but from micro-interruptions. Learn how acoustic silence and single-task desk blocks double retention for competitive exams.',
    quote: 'Attention is a finite biological currency. One single phone notification drains 23 minutes of deep cognitive immersion.',
    takeaways: [
      'The 90-Minute Ultradian Rhythm: Divide study into 3 focused sprints rather than endless sitting.',
      'Acoustic Isolation: A silent hall eliminates background speech processing in the auditory cortex.',
      'Single-Task Rule: Keep only one subject material on your desk at any given moment.'
    ],
    content: [
      {
        heading: 'The Cost of Fragmented Attention',
        text: 'Most aspirants count hours instead of focus density. In modern psychology, studying with intermittent WhatsApp pings, casual room chatter, or background television creates "attention residue". When you shift attention between a complex organic chemistry mechanism and a 5-second message, your brain takes over 20 minutes to re-enter high-order conceptual processing.'
      },
      {
        heading: 'Why Amba Library Eliminates the Willpower Drain',
        text: 'At home, you are constantly spending mental energy deciding whether to check your phone, grab a snack, or lie down. At Amba Library, the environment makes that decision for you. The collective silence of 50 dedicated desks provides an immediate psychological anchor: your brain recognizes that this physical space is reserved exclusively for deep work.'
      },
      {
        heading: 'The 3-Sprint Daily Execution',
        text: 'Sprint 1 (Morning 8:00 AM - 10:30 AM): Reserved for the most difficult conceptual topics (e.g. Physics derivations, GS Paper analytical answers). Sprint 2 (Post-Break 11:30 AM - 1:30 PM): Active problem-solving and numerical exercises. Sprint 3 (Evening 4:00 PM - 6:30 PM): Revision, flashcards, and mock answer writing. Completing these three blocks delivers superior retention compared to a distracted 12-hour bedroom study session.'
      }
    ]
  },
  {
    id: 'circadian-shifts-timing',
    category: 'Study Strategy',
    icon: Moon,
    tag: 'Circadian Rhythm',
    readTime: '6 min read',
    date: 'October 21, 2026',
    author: {
      name: 'Pooja Iyer',
      role: 'NEET AIR 14 Mentor & Bio-Chronobiology Researcher',
      initials: 'PI'
    },
    title: 'Morning Shifts vs. Night Owl Batches: Syncing Your Library Slot with Your Brain',
    excerpt: 'Should you book the 6 AM - 12 PM slot or the 10 PM - 6 AM night shift? Discover how cortisol curves, memory consolidation, and circadian timing govern exam scores.',
    quote: 'Aligning high-difficulty tasks with your biological peak yields a 30% jump in analytical problem-solving accuracy.',
    takeaways: [
      'Morning Shift (6 AM - 12 PM): Best for high-cortisol analytical synthesis, physics, and maths.',
      'Evening Shift (12 PM - 6 PM): Ideal for active recall, syllabus coverage, and mock exam simulations.',
      'Night Shift (10 PM - 6 AM): Absolute zero ambient noise, maximum uninterrupted flow for revision.'
    ],
    content: [
      {
        heading: 'Understanding Your Chronotype',
        text: 'Every student has a distinct biological circadian rhythm. While societal conventions praise 5:00 AM risers, research shows roughly 35% of competitive aspirants achieve their highest working memory throughput during late-night hours when external stimuli hit absolute zero.'
      },
      {
        heading: 'Morning Shift: The Cortisol Advantage',
        text: 'Between 7:00 AM and 11:00 AM, natural cortisol secretion sharpens executive decision making in the prefrontal cortex. This is your prime window for grappling with dense theorems, heavy mathematical calculations, and logic-heavy mock papers.'
      },
      {
        heading: 'Night Shift: The Zero-Distraction Sanctuary',
        text: 'For night batch students at Amba Library (10 PM to 6 AM), the world is asleep. There are no phone calls from family, no errands to run, and no traffic hum. This 8-hour stretch allows aspirants to finish entire chapters and complete full syllabus revisions in an unbroken, zen-like state.'
      }
    ]
  },
  {
    id: 'desk-ergonomics-stamina',
    category: 'Ergonomics & Health',
    icon: Activity,
    tag: 'Ergonomics',
    readTime: '4 min read',
    date: 'October 17, 2026',
    author: {
      name: 'Dr. Rajesh Deshmukh',
      role: 'Physiotherapist & Ergonomics Consultant',
      initials: 'RD'
    },
    title: 'Desk Ergonomics & Eye Strain: Maintaining 8+ Hour Stamina Without Burnout',
    excerpt: 'Lower back stiffness, neck strain, and screen headaches can cut your study day short by 3 hours. Key tips on lumbar support, lighting angles, and the 20-20-20 rule.',
    quote: 'Physical stamina precedes mental focus. You cannot achieve deep cognitive absorption if your spine is in continuous compression.',
    takeaways: [
      'The 90-90-90 Rule: Hips, knees, and elbows at 90-degree angles to minimize spinal pressure.',
      'Neutral 4000K Lighting: Avoid yellow flickers or harsh blue glares to prevent eye fatigue.',
      'Micro-Breaks: Stand up, stretch, and hydrate for 3 minutes after every 60 minutes of seated study.'
    ],
    content: [
      {
        heading: 'Why Cheap Seating Sabotages Ranks',
        text: 'Studying in a soft bed or on an unsupportive plastic chair creates an anterior pelvic tilt and cervical spine compression. After just 2 hours, your brain diverts significant neural energy away from working memory to process physical discomfort and pain signals.'
      },
      {
        heading: 'Amba Library Ergonomic Standards',
        text: 'Our reading hall desks are built at the recommended 29.5-inch height paired with high-density foam lumbar chairs. This setup allows your forearms to rest naturally without shrugging your shoulders, keeping blood circulation optimal to the upper torso and head.'
      },
      {
        heading: 'Protecting Your Vision During Digital Reading',
        text: 'If you study via tablets or laptops, elevate your screen so the top third is at eye level. Practice the ophthalmologist-recommended 20-20-20 rule: every 20 minutes, look at an object 20 feet away for 20 seconds to relax your ciliary muscles.'
      }
    ]
  },
  {
    id: 'psychology-shared-silence',
    category: 'Mindset & Psychology',
    icon: Award,
    tag: 'Peer Momentum',
    readTime: '5 min read',
    date: 'October 12, 2026',
    author: {
      name: 'Aditi Sen',
      role: 'Educational Psychologist & Academic Coach',
      initials: 'AS'
    },
    title: 'The Psychology of Shared Silence: Why Social Facilitation Multiplies Willpower',
    excerpt: 'Studying alone in a bedroom invites procrastination. Witnessing 49 peers quietly absorbed in their notes activates the brain’s social facilitation circuit, keeping you locked in.',
    quote: 'In an environment where everyone around you is relentlessly focused, discipline stops being an effort and becomes the default norm.',
    takeaways: [
      'Social Facilitation Theory: Observing hard work in peers naturally elevates personal endurance.',
      'Elimination of FOMO: When everyone is reading, there is no fear of missing out on social chatter.',
      'The Ritual of Arrival: Packing your bag and checking into your assigned desk primes your brain for serious work.'
    ],
    content: [
      {
        heading: 'The Power of Collective Focus',
        text: 'Norman Triplett first documented social facilitation in 1898: human beings naturally exert higher performance when surrounded by others engaged in the same constructive pursuit. At Amba Library, the sight of a fellow aspirant quietly solving mock questions at 2:00 AM acts as an immediate psychological boost when you feel tempted to surrender to sleep.'
      },
      {
        heading: 'Physical Separation of Work and Rest',
        text: 'When you study in your bedroom, your brain struggles with conflicting environmental cues: is this a place to sleep, scroll Instagram, or study Constitution law? By dedicating Amba Library strictly as your study sanctuary, you develop an unbreakable stimulus-response pattern: entering the hall means 100% focused study.'
      },
      {
        heading: 'Accountability Without Social Distraction',
        text: 'Unlike noisy coffee shops or casual college canteens, Amba Library enforces strict pin-drop silence. You enjoy the emotional comfort of not being alone in your arduous exam journey, without the conversational friction that destroys study hours.'
      }
    ]
  }
];

export default function BlogSection({ onOpenStudentLogin }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArticle, setActiveArticle] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const categories = ['All', 'Productivity & Focus', 'Study Strategy', 'Ergonomics & Health', 'Mindset & Psychology'];

  const filteredPosts = BLOG_POSTS.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesQuery = searchQuery.trim() === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const handleShare = (post) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin + '#blog-' + post.id);
      setCopiedId(post.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <section id="blog" className="w-full py-20 bg-slate-50/70 border-t border-slate-200/70 relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#1C1935] text-white text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-[#FCAE76]" />
              <span>ACADEMIC EDITORIAL &amp; STUDY PROTOCOLS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-[#1C1935] tracking-tight leading-tight font-heading">
              Library Insights &amp; Study Protocols
            </h2>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              Curated masterclasses and research-backed methodologies to help competitive exam aspirants achieve maximum retention, mental clarity, and consistent study hours.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center space-x-6 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs self-start md:self-auto">
            <div>
              <div className="text-2xl font-black text-[#1C1935]">50+</div>
              <div className="text-xs text-slate-500 font-medium">Silent Desks</div>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div>
              <div className="text-2xl font-black text-amber-600">24/7</div>
              <div className="text-xs text-slate-500 font-medium">Day &amp; Night Slots</div>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div>
              <div className="text-2xl font-black text-emerald-600">100%</div>
              <div className="text-xs text-slate-500 font-medium">Pin-Drop Silence</div>
            </div>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 pb-5 border-b border-slate-200/80">
          
          {/* Category Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#1C1935] text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/70'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search articles, topics, tips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FCAE76] focus:border-transparent transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {filteredPosts.map((post) => {
            const IconComponent = post.icon;
            return (
              <article
                key={post.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group hover:border-slate-300"
              >
                <div className="p-6 sm:p-8 space-y-5">
                  
                  {/* Top Meta: Category & Reading Time */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200/60">
                      <IconComponent className="w-3.5 h-3.5 text-amber-700" />
                      <span>{post.tag}</span>
                    </span>

                    <div className="flex items-center space-x-3 text-xs text-slate-500 font-medium">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{post.readTime}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{post.date}</span>
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 
                    onClick={() => setActiveArticle(post)}
                    className="text-xl sm:text-2xl font-bold text-[#1C1935] tracking-tight leading-snug cursor-pointer group-hover:text-[#da7731] transition-colors"
                  >
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-slate-600 text-sm sm:text-[15px] leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Key Takeaways Snapshot */}
                  <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100 space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Core Takeaway</span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium italic">
                      "{post.quote}"
                    </p>
                  </div>
                </div>

                {/* Card Footer: Author & Read CTA */}
                <div className="px-6 sm:px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-[#1C1935] text-amber-300 flex items-center justify-center text-xs font-bold shrink-0">
                      {post.author.initials}
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-[#1C1935] leading-none">
                        {post.author.name}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[150px] sm:max-w-[200px]">
                        {post.author.role}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleShare(post)}
                      title="Copy Article Link"
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    {copiedId === post.id && (
                      <span className="text-[10px] font-semibold text-emerald-600 animate-in fade-in">
                        Copied!
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => setActiveArticle(post)}
                      className="inline-flex items-center space-x-1.5 text-xs sm:text-sm font-bold text-[#1C1935] hover:text-[#da7731] transition-colors cursor-pointer"
                    >
                      <span>Read Article</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Bottom Banner: Join Amba Library */}
        <div className="mt-16 bg-[#0B0D1B] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl border border-slate-800">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-amber-500/10 via-transparent to-transparent pointer-events-none" />
          
          <div className="max-w-2xl space-y-4 relative z-10 text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 text-xs font-semibold border border-amber-400/20">
              <BookOpen className="w-3.5 h-3.5" />
              <span>EXPERIENCE THE DIFFERENCE</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight font-heading">
              Ready to Upgrade from Casual Study to Absolute Focus?
            </h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Join serious aspirants at Amba Library. Choose your preferred batch (Morning, Afternoon, Evening, or 24/7 Full Day) and experience dedicated desks with high-speed internet and pin-drop silence.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onOpenStudentLogin}
                className="bg-[#FCAE76] hover:bg-[#f39857] text-[#1C1935] px-8 py-3.5 rounded-full font-bold text-sm shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center space-x-2"
              >
                <span>Access Student Portal</span>
                <ArrowRight className="w-4 h-4 text-[#1C1935]" />
              </button>
              <a
                href="#home"
                className="text-slate-300 hover:text-white text-sm font-semibold px-4 py-3 rounded-full hover:bg-white/5 transition-colors"
              >
                Back to Top ↑
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* FULL ARTICLE MODAL */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div 
            className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Bar */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-white p-0.5 flex items-center justify-center overflow-hidden">
                  <img src={logoImg} alt="Amba Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <div className="font-bold text-sm tracking-tight text-white font-heading">
                    AMBA LIBRARY ACADEMIC REVIEW
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    Published by Amba Academic Editorial Desk
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveArticle(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Scrollable Article */}
            <div className="p-6 sm:p-10 overflow-y-auto space-y-8 text-slate-800 font-sans">
              
              {/* Meta */}
              <div className="space-y-3 pb-6 border-b border-slate-200">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-3 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-900">
                    {activeArticle.category}
                  </span>
                  <span className="text-xs text-slate-500 font-medium flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{activeArticle.readTime}</span>
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500 font-medium flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{activeArticle.date}</span>
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1C1935] tracking-tight leading-snug font-heading">
                  {activeArticle.title}
                </h1>

                {/* Author Info */}
                <div className="flex items-center space-x-3 pt-2">
                  <div className="w-10 h-10 rounded-full bg-[#1C1935] text-amber-300 flex items-center justify-center text-sm font-bold">
                    {activeArticle.author.initials}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#1C1935]">
                      {activeArticle.author.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {activeArticle.author.role}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quote Highlight Box */}
              <div className="p-5 bg-amber-50/70 border-l-4 border-amber-500 rounded-r-xl text-amber-950 font-serif italic text-base sm:text-lg leading-relaxed shadow-2xs">
                "{activeArticle.quote}"
              </div>

              {/* Core Takeaways */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/80 space-y-2.5">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Key Insights Summary
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                  {activeArticle.takeaways.map((point, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Article Content Sections */}
              <div className="space-y-6 text-slate-700 text-sm sm:text-base leading-relaxed">
                {activeArticle.content.map((sec, idx) => (
                  <div key={idx} className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-bold text-[#1C1935]">
                      {sec.heading}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {sec.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Call to action at end of article */}
              <div className="p-6 bg-slate-900 rounded-2xl text-white space-y-3 mt-8">
                <h4 className="font-bold text-lg text-amber-400">
                  Study with Dedicated Focus at Amba Library
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Join hundreds of successful candidates who have disciplined their daily routines at Amba Library's silent reading hall.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setActiveArticle(null);
                      onOpenStudentLogin();
                    }}
                    className="bg-[#FCAE76] hover:bg-[#f39857] text-[#1C1935] px-6 py-2.5 rounded-full font-bold text-xs shadow-sm transition-all cursor-pointer"
                  >
                    Open Student Portal
                  </button>
                </div>
              </div>

            </div>

            {/* Modal Bottom Close */}
            <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setActiveArticle(null)}
                className="px-5 py-2 bg-white hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 transition-colors cursor-pointer"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
