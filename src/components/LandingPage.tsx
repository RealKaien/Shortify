import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Link2, ArrowRight, Sparkles, Check, Globe, Shield, BarChart2, 
  QrCode, Zap, ChevronDown, MessageSquare, Tag, Key, Lock, Copy,
  Clock, Pin, ArrowUpRight
} from 'lucide-react';
import { faqItems } from '../data/mockData';
import { toast } from '../lib/toast';
import { Link } from '../types';

interface LandingPageProps {
  onLaunchDashboard: () => void;
  token: string | null;
  onLinkCreated?: (link: Link) => void;
}

export default function LandingPage({ onLaunchDashboard, token, onLinkCreated }: LandingPageProps) {
  // Hero URL Shorten State
  const [heroInput, setHeroInput] = useState('');
  const [shortenedResult, setShortenedResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [landingShortenCount, setLandingShortenCount] = useState<number>(() => {
    const saved = localStorage.getItem('shortify_landing_shorten_count');
    return saved ? parseInt(saved, 10) : 0;
  });

  // FAQ Expanded State
  const [expandedFaqIdx, setExpandedFaqIdx] = useState<number | null>(null);

  const handleHeroShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroInput.trim()) return;

    if (landingShortenCount >= 1) {
      toast.info('You have reached the free limit of 1 short link without an account. Please log in or start your trial to continue.');
      onLaunchDashboard(); // Trigger AuthModal
      return;
    }

    // Strict URL validation regex
    const urlRegex = /^(https?:\/\/)(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{2,10}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/i;
    let finalUrl = heroInput.trim();
    if (!urlRegex.test(finalUrl)) {
      if (!/^https?:\/\//i.test(finalUrl)) {
        finalUrl = `https://${finalUrl}`;
      }
      if (!urlRegex.test(finalUrl)) {
        toast.error('Please enter a valid, well-formed URL with a protocol (e.g., https://example.com). Inputs like "a" or "domain.com" are not allowed.');
        return;
      }
    }

    setLoading(true);
    setShortenedResult(null);

    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          longUrl: finalUrl,
          title: `Landing Page Link`,
          description: 'Created anonymously from the landing page.'
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to create short link');
      }

      const createdLink = await response.json();
      const shortUrl = `${window.location.origin}/s/${createdLink.shortCode}`;
      setShortenedResult(shortUrl);
      
      const newCount = landingShortenCount + 1;
      setLandingShortenCount(newCount);
      localStorage.setItem('shortify_landing_shorten_count', newCount.toString());

      if (onLinkCreated) {
        onLinkCreated(createdLink);
      }

      toast.success('Your free short link was created successfully!');
    } catch (err: any) {
      toast.error(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!shortenedResult) return;
    navigator.clipboard.writeText(shortenedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Generated short link copied!');
  };

  return (
    <div id="saas-landing-container" className="relative min-h-screen bg-gradient-to-tr from-[#FAF8FF] via-[#F3E8FF] to-[#EEF2FF] font-sans text-heading overflow-x-hidden selection:bg-primary/20">
      
      {/* Background Floating Blurred Gradient Spheres (Aurora fluid design matching the video) */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] opacity-70 pointer-events-none -z-10 animate-pulse duration-10000" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] bg-[#ddd6fe] rounded-full blur-[120px] opacity-80 pointer-events-none -z-10" />
      <div className="absolute top-[800px] left-1/4 w-[700px] h-[700px] bg-primary/5 rounded-full blur-[160px] pointer-events-none -z-10" />
 
      {/* 1. HERO SECTION */}
      <section id="hero" className="relative pt-40 pb-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Section (5 Columns layout) with premium staggered entrance */}
          <motion.div 
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.12,
                  delayChildren: 0.15
                }
              }
            }}
            className="lg:col-span-5 flex flex-col justify-center text-left"
          >
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 15 },
                show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 14 } }
              }}
              className="inline-flex items-center gap-2 px-3.5 py-1 bg-primary/10 border border-primary/20 rounded-full w-fit mb-6"
            >
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              <span className="text-[11px] font-extrabold text-primary uppercase tracking-widest font-sans">v2.0 is now live</span>
            </motion.div>
            
            <motion.h1 
              variants={{
                hidden: { opacity: 0, y: 25 },
                show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 12 } }
              }}
              className="text-[44px] sm:text-[64px] font-black leading-[1.05] tracking-tight mb-6 font-display text-heading"
            >
              Shorten Links.<br/>
              <span className="text-primary bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">Share Anywhere.</span>
            </motion.h1>
            
            <motion.p 
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
              }}
              className="text-[17px] sm:text-[19px] text-secondary-text leading-relaxed mb-8 pr-4"
            >
              The premium URL shortener for creators and teams. Track your audience with real-time analytics and stunning visual report metrics.
            </motion.p>
 
            {/* URL Input Area matching Design HTML precisely */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, scale: 0.95 },
                show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 110, damping: 13 } }
              }}
              whileHover={{ scale: 1.01, boxShadow: "0 24px 48px rgba(27,115,232,0.08)" }}
              className="p-2 bg-white/80 backdrop-blur-md rounded-[28px] shadow-xl border border-white flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
            >
              <form onSubmit={handleHeroShorten} className="w-full flex items-center gap-2">
                <div className="pl-3 text-muted-text shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                </div>
                <input 
                  type="text" 
                  required
                  placeholder="Paste your long URL here..." 
                  value={heroInput}
                  onChange={(e) => setHeroInput(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-[15px] sm:text-[16px] text-heading placeholder:text-muted-text min-w-0" 
                />
                <button 
                  type="submit" 
                  className="px-6 py-3.5 sm:px-8 bg-primary hover:bg-primary-hover hover:scale-[1.02] active:scale-[0.98] text-white font-bold rounded-[20px] transition-all cursor-pointer whitespace-nowrap text-xs sm:text-sm shadow-md shadow-primary/20 font-sans"
                >
                  Shorten Now
                </button>
              </form>
            </motion.div>
 
            {/* Interactive Live Generator Result Block */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-start gap-2 text-xs font-semibold text-[#4B5563] font-sans"
                >
                  <Zap className="h-4 w-4 animate-spin text-[#2563EB]" />
                  Encrypting redirect routes...
                </motion.div>
              )}

              {shortenedResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: 10, height: 0 }}
                  className="mt-4 pt-4 border-t border-gray-100 font-sans"
                >
                  <div className="bg-[#2563EB]/5 border border-[#2563EB]/10 rounded-[18px] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="text-left min-w-0">
                      <span className="text-[10px] uppercase font-black tracking-widest text-[#2563EB] block font-display">Your shortened URL</span>
                      <span className="text-xs sm:text-sm font-bold text-[#111827] break-all block">{shortenedResult}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={handleCopy}
                        className="relative flex items-center justify-center gap-1.5 bg-white hover:bg-gray-50 text-[#4B5563] text-xs font-bold px-4 py-2.5 rounded-[12px] border border-gray-200 transition-all cursor-pointer shadow-sm overflow-hidden min-w-[90px]"
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          {copied ? (
                            <motion.span
                              key="copied"
                              initial={{ y: 12, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              exit={{ y: -12, opacity: 0 }}
                              transition={{ type: "spring", stiffness: 350, damping: 15 }}
                              className="flex items-center gap-1 text-emerald-600 font-bold"
                            >
                              <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                              Copied!
                            </motion.span>
                          ) : (
                            <motion.span
                              key="copy"
                              initial={{ y: -12, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              exit={{ y: 12, opacity: 0 }}
                              transition={{ type: "spring", stiffness: 350, damping: 15 }}
                              className="flex items-center gap-1 font-bold"
                            >
                              <Copy className="h-3.5 w-3.5" />
                              Copy
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.button>
                      <button
                        onClick={onLaunchDashboard}
                        className="flex items-center gap-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold px-3.5 py-2.5 rounded-[12px] transition-all cursor-pointer shadow-sm"
                      >
                        Track Clicks
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Creator overlap list trust badge */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 15 },
                show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
              }}
              className="mt-8 flex items-center gap-6 font-sans"
            >
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-[#F4F7FF] bg-blue-200"></div>
                <div className="w-10 h-10 rounded-full border-2 border-[#F4F7FF] bg-orange-200"></div>
                <div className="w-10 h-10 rounded-full border-2 border-[#F4F7FF] bg-purple-200"></div>
                <div className="w-10 h-10 rounded-full border-2 border-[#F4F7FF] bg-[#111827] flex items-center justify-center text-[10px] text-white font-bold">+10k</div>
              </div>
              <p className="text-[14px] text-[#9CA3AF] font-medium">
                Trusted by <span className="text-[#4B5563] font-bold">10,000+</span> creators worldwide
              </p>
            </motion.div>
          </motion.div>

          {/* Right Hero Section - High Fidelity ChronoTask Mockups */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 60, damping: 15, delay: 0.3 }}
            className="lg:col-span-7 flex items-center justify-center lg:justify-end relative min-h-[500px] sm:min-h-[580px] w-full"
          >
            {/* Background grid dots matching the mockup design pattern */}
            <div className="absolute inset-0 bg-grid-dots opacity-75 rounded-[40px] -z-10" />

            {/* Central Main Dashboard Widget */}
            <motion.div 
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="w-full max-w-[420px] bg-white rounded-[32px] shadow-2xl shadow-blue-900/5 border border-slate-100 overflow-hidden flex flex-col font-sans relative z-10"
            >
              <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
                {/* Logo with 4 dots inspired by ChronoTask */}
                <div className="flex items-center gap-1.5">
                  <div className="grid grid-cols-2 gap-1 w-3.5 h-3.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-800 tracking-wider">Shortify</span>
                </div>
                <div className="text-[9px] font-bold text-muted-text bg-slate-100 px-2 py-0.5 rounded-full uppercase">Workspace Preview</div>
              </div>

              <div className="p-6">
                {/* Simulated Good morning header */}
                <div className="text-left mb-6">
                  <span className="text-[9px] uppercase font-black tracking-widest text-primary font-display block mb-1">Redirect Cloud</span>
                  <h3 className="text-lg font-black tracking-tight text-heading">Good morning, Amanda</h3>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-100/50 text-left">
                    <div className="text-[9px] font-extrabold text-primary uppercase mb-1">Total Redirects</div>
                    <div className="text-xl font-black text-heading">42,891</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100/50 text-left">
                    <div className="text-[9px] font-extrabold text-emerald-600 uppercase mb-1">Active Links</div>
                    <div className="text-xl font-black text-heading">156</div>
                  </div>
                </div>

                {/* Graph mockup */}
                <div className="h-28 w-full flex items-end gap-2 bg-slate-50/30 p-3 rounded-2xl border border-slate-100/60 mb-6">
                  <div className="flex-1 bg-blue-100 rounded-t-lg h-[40%]" />
                  <div className="flex-1 bg-blue-200 rounded-t-lg h-[60%]" />
                  <div className="flex-1 bg-blue-300 rounded-t-lg h-[80%]" />
                  <div className="flex-1 bg-primary rounded-t-lg h-[100%]" />
                  <div className="flex-1 bg-blue-300 rounded-t-lg h-[70%]" />
                  <div className="flex-1 bg-blue-200 rounded-t-lg h-[50%]" />
                  <div className="flex-1 bg-blue-100 rounded-t-lg h-[30%]" />
                </div>

                {/* Recent Items */}
                <div className="space-y-3 text-left">
                  <span className="text-[10px] uppercase font-black tracking-widest text-muted-text">Live Redirect Index</span>
                  <div className="flex items-center justify-between text-[11px] font-semibold border-b border-slate-50 pb-2.5">
                    <span className="text-secondary-text truncate max-w-[150px]">stripe.com/billing/portal/auth</span>
                    <span className="font-extrabold text-primary">/stripe-pay</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span className="text-secondary-text truncate max-w-[150px]">linear.app/feature/project-board</span>
                    <span className="font-extrabold text-primary">/roadmap</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* FLOATING WIDGET 1: Yellow Sticky Note (Top Left) */}
            <motion.div
              whileHover={{ y: -6, rotate: -1, scale: 1.02 }}
              className="absolute -top-12 -left-4 xl:-left-12 w-52 bg-[#FEF9C3] rounded-[24px] p-4 shadow-xl border border-yellow-200/60 z-20 text-left font-sans text-heading rotate-[-4deg] hidden sm:block"
            >
              <div className="absolute top-2 right-4 text-red-500">
                <Pin className="h-4.5 w-4.5 fill-red-500 stroke-[1.5]" />
              </div>
              <p className="text-[11px] font-bold text-amber-900 leading-relaxed font-sans pr-4">
                Take notes to keep track of crucial details, and accomplish more redirects with ease.
              </p>
              <div className="mt-3.5 space-y-1 text-[10px] font-bold text-amber-800">
                <div className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 stroke-[2.5]" /> Set secure codes
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 stroke-[2.5]" /> Setup domain fallbacks
                </div>
              </div>
            </motion.div>

            {/* FLOATING WIDGET 2: Reminders Widget & Analog Clock (Top Right) */}
            <motion.div
              whileHover={{ y: -6, rotate: 1, scale: 1.02 }}
              className="absolute -top-10 -right-4 xl:-right-12 w-52 bg-white rounded-[24px] p-4 shadow-xl border border-slate-100 z-20 text-left font-sans text-heading rotate-[3deg] hidden md:block"
            >
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-50">
                <span className="text-[9px] uppercase font-black tracking-wider text-muted-text">Reminders</span>
                <span className="text-[9px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Meetings</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-primary relative shrink-0">
                  <Clock className="h-4 w-4" />
                  <span className="absolute w-1.5 h-1.5 bg-emerald-500 rounded-full top-0 right-0 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[11px] font-extrabold truncate text-heading">Today's Meeting</h4>
                  <span className="text-[9px] text-muted-text block truncate">Call with marketing team</span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 bg-primary/5 text-primary text-[9px] font-bold px-2 py-1 rounded-lg w-fit">
                <Clock className="h-3 w-3" />
                13:00 - 13:45
              </div>
            </motion.div>

            {/* FLOATING WIDGET 3: Today's Tasks Progress (Bottom Left) */}
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              className="absolute -bottom-10 -left-6 xl:-left-16 w-56 bg-white rounded-[24px] p-4 shadow-xl border border-slate-100 z-20 text-left hidden xl:block"
            >
              <span className="text-[9px] uppercase font-black tracking-wider text-muted-text block mb-3.5">Today's metrics</span>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-[10px] font-extrabold mb-1">
                    <span className="text-heading">Campaign redirects</span>
                    <span className="text-primary">60%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: '60%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-[10px] font-extrabold mb-1">
                    <span className="text-heading">Design PPT #4</span>
                    <span className="text-emerald-600">112%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* FLOATING WIDGET 4: Integrations (Bottom Right) */}
            <motion.div
              whileHover={{ y: -4, rotate: -1, scale: 1.02 }}
              className="absolute -bottom-10 -right-6 xl:-right-12 w-48 bg-white rounded-[24px] p-4 shadow-xl border border-slate-100 z-20 text-left rotate-[-2deg] hidden sm:block"
            >
              <span className="text-[9px] uppercase font-black tracking-wider text-muted-text block mb-2.5">100+ Integrations</span>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 font-extrabold font-display text-[12px] shadow-sm">
                  M
                </div>
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 font-extrabold font-display text-[12px] shadow-sm">
                  S
                </div>
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-primary font-extrabold font-display text-[12px] shadow-sm">
                  31
                </div>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* Brand Logos banner */}
      <div className="py-10 bg-white/30 border-y border-white/40 backdrop-blur-md text-center text-xs font-bold text-muted-text uppercase tracking-widest">
        Trusted by link builders at 
        <span className="text-heading font-extrabold ml-3">STRIPE</span> • 
        <span className="text-heading font-extrabold ml-3">NOTION</span> • 
        <span className="text-heading font-extrabold ml-3">LINEAR</span> • 
        <span className="text-heading font-extrabold ml-3">VERCEL</span>
      </div>

      {/* 2. FEATURES GRID SECTION */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">Enterprise Architecture</span>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-heading mt-2">Everything You Need To Build Branded Link Networks</h2>
          <p className="text-sm text-secondary-text mt-4 leading-relaxed">Explore top features crafted for modern engineering, product marketing, and visual campaigns.</p>
        </div>

        <motion.div 
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.05
              }
            }
          }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {[
            { icon: Globe, title: 'Branded Domains', desc: 'Point your domain to our redirect proxy for perfect brand layouts.' },
            { icon: BarChart2, title: 'Real-time Metrics', desc: 'Track cities, device specs, referrals, and operating systems instantly.' },
            { icon: QrCode, title: 'Dynamic QR Codes', desc: 'Create SVG vector QR codes. Update long targets without reprintings.' },
            { icon: Lock, title: 'Access Code Protection', desc: 'Lock sensitive files, code reviews, or downloads behind an access code.' },
            { icon: Tag, title: 'UTM Campaign Tagging', desc: 'Build campaign strings programmatically before shortening.' },
            { icon: Zap, title: 'Zero Delay Proxy', desc: 'Enjoy lightning fast, ultra-low-latency edge-node routing.' },
            { icon: Key, title: 'Developer-First APIs', desc: 'Generate keys, sandboxes, and integrate links on any stack.' },
            { icon: MessageSquare, title: 'Detailed Support', desc: 'Direct chat and engineering consultation to help you deploy.' }
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 25 },
                  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
                }}
                whileHover={{ y: -6, boxShadow: "0 12px 40px rgba(37,99,235,0.08)" }}
                className="bg-white rounded-[24px] border border-[rgba(255,255,255,0.65)] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_32px_rgba(37,99,235,0.05)] transition-all"
              >
                <div className="h-12 w-12 rounded-[16px] bg-primary/10 text-primary flex items-center justify-center mb-5">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-heading font-display">{feature.title}</h3>
                <p className="text-xs text-secondary-text mt-2.5 leading-relaxed">{feature.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* 3. DOCK / PREVIEW SHOWCASE */}
      <section id="analytics" className="py-20 px-6 bg-gradient-to-b from-[#F4F7FF] to-white">
        <div className="max-w-7xl mx-auto rounded-[28px] border border-white/60 bg-white/40 p-8 md:p-12 shadow-inner backdrop-blur-md">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            
            <div className="lg:col-span-2 space-y-6">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Premium Visualizer</span>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold text-heading">Breathtaking Visual Dashboards</h2>
              <p className="text-sm text-secondary-text leading-relaxed">
                Say goodbye to dry data logs. Shortify offers a state-of-the-art interactive analytics engine built for speed. Toggle periods, filter down to individual custom domains, and inspect OS distributions.
              </p>
              
              <div className="space-y-3.5 text-xs font-semibold text-heading">
                {['Direct live conversion mapping', 'Export metrics to CSV or database hooks', 'Instant pixel-perfect vector graphs'].map((feat, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><Check className="h-3 w-3" /></span>
                    {feat}
                  </div>
                ))}
              </div>

              <button
                onClick={onLaunchDashboard}
                className="inline-flex items-center gap-1.5 bg-heading hover:bg-black text-white text-xs font-bold px-5 py-3 rounded-[16px] transition-all cursor-pointer shadow-md"
              >
                Interactive Console Preview
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Simulated Glassmorphic Dashboard Showcase Graphic */}
            <div className="lg:col-span-3 bg-white rounded-[28px] border border-gray-200/60 p-6 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-[10px] font-mono text-muted-text font-bold uppercase ml-2">Console / shortify.co</span>
                </div>
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">LIVE PREVIEW</span>
              </div>

              {/* Graphic stats panels */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-[20px]">
                  <span className="text-[9px] uppercase font-bold text-muted-text">Click Traffic</span>
                  <span className="text-xl font-black block text-heading">4,964 clicks</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-[20px]">
                  <span className="text-[9px] uppercase font-bold text-muted-text">Redirection Velocity</span>
                  <span className="text-xl font-black block text-primary">8.4ms avg</span>
                </div>
              </div>

              {/* Glowing mini wave chart placeholder */}
              <div className="h-28 bg-gray-50/70 border border-gray-100 rounded-[20px] p-2 flex items-end justify-between relative overflow-hidden">
                <svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none" className="overflow-visible absolute inset-0 opacity-80">
                  <path d="M 0 40 Q 25 15, 50 30 T 100 10 L 100 40 Z" fill="rgba(37,99,235,0.06)" />
                  <path d="M 0 40 Q 25 15, 50 30 T 100 10" fill="none" stroke="#2563EB" strokeWidth="2" />
                </svg>
                <span className="text-[9px] font-mono font-bold text-secondary-text m-2 absolute bottom-1 right-1">Traffic Wave (30d)</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. FAQ SECTION */}
      <section id="faq" className="py-24 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">Help Desk</span>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-[#111827] mt-2">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, idx) => {
            const isExpanded = expandedFaqIdx === idx;
            return (
              <div 
                key={idx} 
                className="bg-white rounded-[20px] border border-gray-200/60 shadow-sm overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setExpandedFaqIdx(isExpanded ? null : idx)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left text-sm font-bold text-[#111827] cursor-pointer hover:bg-gray-50/50"
                >
                  {item.question}
                  <ChevronDown className={`h-4 w-4 text-primary transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`} />
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-6 pb-5 text-xs text-secondary-text leading-relaxed border-t border-gray-100 pt-3"
                    >
                      {item.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Bottom bar */}
      <section className="py-20 px-6 text-center max-w-5xl mx-auto">
        <div className="bg-primary rounded-[28px] p-10 md:p-14 text-white shadow-[0_12px_40px_rgba(37,99,235,0.25)] relative overflow-hidden">
          {/* Decorative graphic details */}
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-white/5 rounded-full blur-[40px] pointer-events-none" />
          
          <span className="text-[10px] uppercase font-black tracking-widest text-blue-100">Ready to route?</span>
          <h2 className="font-display text-3xl md:text-5xl font-black mt-2 leading-tight">Manage your custom links instantly</h2>
          <p className="text-sm text-blue-100 max-w-2xl mx-auto mt-4 leading-relaxed">
            Launch the dashboard, register custom domains, construct trackable UTM tags, and inspect demographic click streams programmatically.
          </p>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onLaunchDashboard}
            className="bg-white hover:bg-gray-50 text-primary text-xs font-black px-8 py-4 rounded-[18px] shadow-lg mt-8 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            Launch Dashboard Now
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="bg-heading text-gray-400 py-16 px-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & description */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-primary text-white">
                <Link2 className="h-4.5 w-4.5" />
              </div>
              <span className="font-display text-lg font-bold text-white tracking-tight">Shortify</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Branded, highly-clickable custom redirects equipped with dynamic vectors and edge geolocation trackers.
            </p>
          </div>

          {/* Links columns */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">Product</h4>
            <ul className="space-y-2.5 text-xs">
              <li><button onClick={() => window.scrollTo({top:0, behavior:'smooth'})} className="hover:text-white transition-colors cursor-pointer">URL Shortener</button></li>
              <li><button onClick={onLaunchDashboard} className="hover:text-white transition-colors cursor-pointer">Dynamic QR Codes</button></li>
              <li><button onClick={onLaunchDashboard} className="hover:text-white transition-colors cursor-pointer">Branded Domains</button></li>
              <li><button onClick={onLaunchDashboard} className="hover:text-white transition-colors cursor-pointer">Developer API Docs</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">Legal</h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Use</a></li>
              <li><a href="#" className="hover:text-white transition-colors">SLA Agreement</a></li>
              <li><a href="#" className="hover:text-white transition-colors">DPA Policy</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">Contact</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="text-gray-500">Support Email:</li>
              <li className="text-white font-semibold">support@shortify.co</li>
              <li className="text-gray-500 mt-2">API Server status:</li>
              <li className="text-emerald-400 font-semibold flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> All Systems Operational</li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-gray-800 mt-12 pt-8 text-center text-xs text-gray-600 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <span>© 2026 Shortify Inc. All rights reserved. Built with Apple-tier premium designs.</span>
          <div className="flex gap-6 justify-center">
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
