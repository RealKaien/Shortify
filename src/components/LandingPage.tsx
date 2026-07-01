import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'motion/react';
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

  // Apple-like 3D Tilt Hover effect for Laptop Mockup
  const laptopX = useMotionValue(0);
  const laptopY = useMotionValue(0);
  const springConfig = { damping: 22, stiffness: 140 };
  const laptopRotateX = useSpring(useTransform(laptopY, [-0.5, 0.5], [8, -8]), springConfig);
  const laptopRotateY = useSpring(useTransform(laptopX, [-0.5, 0.5], [-10, 10]), springConfig);

  // Apple-like 3D Tilt Hover effect for Mobile Mockup
  const mobileX = useMotionValue(0);
  const mobileY = useMotionValue(0);
  const mobileRotateX = useSpring(useTransform(mobileY, [-0.5, 0.5], [12, -12]), springConfig);
  const mobileRotateY = useSpring(useTransform(mobileX, [-0.5, 0.5], [-15, 15]), springConfig);

  const handleMouseMoveLaptop = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    laptopX.set(mouseX / width);
    laptopY.set(mouseY / height);
  };

  const handleMouseLeaveLaptop = () => {
    laptopX.set(0);
    laptopY.set(0);
  };

  const handleMouseMoveMobile = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    mobileX.set(mouseX / width);
    mobileY.set(mouseY / height);
  };

  const handleMouseLeaveMobile = () => {
    mobileX.set(0);
    mobileY.set(0);
  };

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
    <div id="saas-landing-container" className="relative min-h-screen bg-[#f5f5f7] font-sans text-[#1d1d1f] overflow-hidden selection:bg-primary/20 selection:text-primary">
      
      {/* Background Ambient Lighting (Elegantly diffuse and soft, like Apple's marketing pages) */}
      <div className="absolute top-[-5%] right-[-5%] w-[550px] h-[550px] bg-primary/5 rounded-full blur-[120px] opacity-60 pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] left-[-5%] w-[450px] h-[450px] bg-emerald-500/5 rounded-full blur-[100px] opacity-40 pointer-events-none -z-10" />
      <div className="absolute top-[600px] left-1/4 w-[600px] h-[600px] bg-slate-500/5 rounded-full blur-[140px] pointer-events-none -z-10" />
 
      {/* 1. HERO SECTION */}
      <section id="hero" className="relative pt-36 pb-16 px-6 max-w-7xl mx-auto">
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
                  delayChildren: 0.1
                }
              }
            }}
            className="lg:col-span-5 flex flex-col justify-center text-left"
          >
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 10 },
                show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 14 } }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 border border-slate-200/50 rounded-full w-fit mb-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
            >
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
              <span className="text-[10px] font-semibold text-[#1d1d1f]/80 uppercase tracking-widest font-sans">v2.0 is live</span>
            </motion.div>
            
            <motion.h1 
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 14 } }
              }}
              className="text-[42px] sm:text-[62px] font-semibold leading-[1.08] tracking-tighter mb-6 text-[#1d1d1f] font-sans"
            >
              Shorten links.<br/>
              <span className="text-primary bg-gradient-to-r from-primary via-[#0077ed] to-blue-600 bg-clip-text text-transparent">Share beautifully.</span>
            </motion.h1>
            
            <motion.p 
              variants={{
                hidden: { opacity: 0, y: 15 },
                show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
              }}
              className="text-[17px] sm:text-[19px] text-[#86868b] leading-snug mb-8 pr-4"
            >
              The intuitive URL shortener designed for builders. Deliver lightning-fast redirects, build gorgeous campaign tags, and analyze click metrics in real time.
            </motion.p>
 
            {/* Apple Pill URL Input Area */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, scale: 0.98 },
                show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 110, damping: 13 } }
              }}
              className="p-1.5 bg-white rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-[#e8e8ed] flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
            >
              <form onSubmit={handleHeroShorten} className="w-full flex items-center gap-2">
                <div className="pl-3.5 text-[#86868b] shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                </div>
                <input 
                  type="text" 
                  required
                  placeholder="Paste long URL..." 
                  value={heroInput}
                  onChange={(e) => setHeroInput(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-[15px] text-[#1d1d1f] placeholder:text-[#a1a1a6] min-w-0" 
                />
                <button 
                  type="submit" 
                  className="px-6 py-2.5 bg-primary hover:bg-[#0077ed] active:scale-[0.98] text-white font-medium rounded-full transition-all cursor-pointer whitespace-nowrap text-xs sm:text-[13px] shadow-[0_2px_8px_rgba(0,113,227,0.2)] font-sans"
                >
                  Shorten
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
                  className="mt-4 pt-3 border-t border-slate-200/50 flex items-center justify-start gap-2 text-xs font-medium text-[#86868b] font-sans"
                >
                  <Zap className="h-3.5 w-3.5 animate-spin text-primary" />
                  Routing safe redirect pathways...
                </motion.div>
              )}

              {shortenedResult && (
                <motion.div
                  initial={{ opacity: 0, y: 8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: 8, height: 0 }}
                  className="mt-4 pt-3 border-t border-slate-200/50 font-sans"
                >
                  <div className="bg-white border border-[#e8e8ed] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                    <div className="text-left min-w-0">
                      <span className="text-[9px] uppercase font-semibold tracking-wider text-primary block">Short Link</span>
                      <span className="text-xs sm:text-[13px] font-medium text-[#1d1d1f] break-all block mt-0.5">{shortenedResult}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.01 }}
                        onClick={handleCopy}
                        className="relative flex items-center justify-center gap-1.5 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] text-xs font-medium px-4 py-2 rounded-full border border-slate-200/40 transition-all cursor-pointer shadow-sm overflow-hidden min-w-[85px]"
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          {copied ? (
                            <motion.span
                              key="copied"
                              initial={{ y: 10, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              exit={{ y: -10, opacity: 0 }}
                              transition={{ type: "spring", stiffness: 350, damping: 15 }}
                              className="flex items-center gap-1 text-emerald-600 font-semibold"
                            >
                              <Check className="h-3 w-3 stroke-[2.5]" />
                              Copied
                            </motion.span>
                          ) : (
                            <motion.span
                              key="copy"
                              initial={{ y: -10, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              exit={{ y: 10, opacity: 0 }}
                              transition={{ type: "spring", stiffness: 350, damping: 15 }}
                              className="flex items-center gap-1 font-semibold"
                            >
                              <Copy className="h-3 w-3" />
                              Copy
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.button>
                      <button
                        onClick={onLaunchDashboard}
                        className="flex items-center gap-1 bg-primary hover:bg-[#0077ed] text-white text-xs font-medium px-4 py-2 rounded-full transition-all cursor-pointer shadow-sm"
                      >
                        Track
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Minimalist Trust Badge */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 10 },
                show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
              }}
              className="mt-8 flex items-center gap-4 font-sans border-t border-[#e8e8ed]/60 pt-6"
            >
              <div className="flex -space-x-2">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" 
                  alt="Creator" 
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full border border-white object-cover bg-slate-100" 
                />
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" 
                  alt="Creator" 
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full border border-white object-cover bg-slate-100" 
                />
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" 
                  alt="Creator" 
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full border border-white object-cover bg-slate-100" 
                />
              </div>
              <p className="text-[13px] text-[#86868b] font-normal">
                Loved by <span className="text-[#1d1d1f] font-medium">10,000+</span> creators and link managers.
              </p>
            </motion.div>
          </motion.div>

          {/* Right Hero Section - High Fidelity Interactive Apple Devices */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 50, damping: 15, delay: 0.2 }}
            className="lg:col-span-7 flex flex-col sm:flex-row items-center justify-center lg:justify-end relative min-h-[500px] sm:min-h-[580px] w-full px-4 sm:px-0"
            style={{ perspective: 1200 }}
          >
            {/* Background grid dots matching the mockup design pattern */}
            <div className="absolute inset-0 bg-grid-dots opacity-[0.25] rounded-[40px] -z-10" />

            {/* Apple MacBook Pro Mockup (The Laptop Frame) */}
            <motion.div
              style={{
                rotateX: laptopRotateX,
                rotateY: laptopRotateY,
                transformStyle: "preserve-3d",
              }}
              onMouseMove={handleMouseMoveLaptop}
              onMouseLeave={handleMouseLeaveLaptop}
              initial={{ opacity: 0, y: 30, rotate: -1 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ type: "spring", stiffness: 85, damping: 18, delay: 0.3 }}
              className="relative w-full max-w-[440px] z-10 select-none group cursor-grab active:cursor-grabbing mb-8 sm:mb-0 sm:-mr-8"
            >
              {/* Outer Laptop aluminum shadow lid frame */}
              <div className="bg-[#1e1e1f] rounded-[24px] p-2 pb-0 shadow-[0_24px_50px_rgba(0,0,0,0.12)] border border-slate-700/50 backdrop-blur-md">
                {/* Internal black screen bezel */}
                <div className="bg-[#0c0c0d] rounded-t-[20px] p-1 pb-0 relative overflow-hidden">
                  {/* Laptop camera notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-3 bg-black rounded-b-md z-30 flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-[#1e293b] mr-1" />
                    <div className="w-0.5 h-0.5 rounded-full bg-[#0284c7]" />
                  </div>

                  {/* Reflected glare glass gradient */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/8 pointer-events-none z-20" />
                  
                  {/* Screen Content: Live Dashboard Interface */}
                  <div className="bg-[#f5f5f7] rounded-t-[10px] overflow-hidden flex flex-col font-sans h-[250px]">
                    {/* Inner mock browser header */}
                    <div className="px-4 py-1.5 border-b border-[#e8e8ed] flex items-center justify-between bg-white shrink-0 select-none">
                      <div className="flex items-center gap-1.5">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                        </div>
                        <span className="text-[9px] font-medium text-[#86868b] tracking-tight ml-1 font-mono">console.shortify.co</span>
                      </div>
                      <div className="text-[8px] font-semibold text-primary bg-[#0071e3]/10 px-2 py-0.5 rounded-full tracking-wider">Console</div>
                    </div>

                    {/* Dashboard Screen Content */}
                    <div className="p-3.5 overflow-y-auto text-left flex-1 space-y-3 scrollbar-thin scrollbar-thumb-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[7.5px] uppercase font-semibold tracking-wider text-primary font-sans block">Workspace Overview</span>
                          <h3 className="text-xs font-semibold tracking-tight text-[#1d1d1f]">Marketing Redirects</h3>
                        </div>
                        <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[8px] text-emerald-700 font-medium">99.9% Uptime</span>
                        </div>
                      </div>

                      {/* Small Metric grid */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2 rounded-xl bg-white border border-[#e8e8ed]">
                          <div className="text-[7px] font-semibold text-[#86868b] uppercase">Total Hits</div>
                          <div className="text-xs font-semibold text-[#1d1d1f] mt-0.5">42,891</div>
                        </div>
                        <div className="p-2 rounded-xl bg-white border border-[#e8e8ed]">
                          <div className="text-[7px] font-semibold text-[#86868b] uppercase">Short Links</div>
                          <div className="text-xs font-semibold text-[#1d1d1f] mt-0.5">156</div>
                        </div>
                        <div className="p-2 rounded-xl bg-white border border-[#e8e8ed]">
                          <div className="text-[7px] font-semibold text-[#86868b] uppercase">Success Rate</div>
                          <div className="text-xs font-semibold text-emerald-600 mt-0.5">100%</div>
                        </div>
                      </div>

                      {/* Live Redirect Index Mock Table */}
                      <div className="space-y-1">
                        <div className="p-1.5 rounded-lg bg-white border border-[#e8e8ed] flex items-center justify-between text-[8.5px] font-sans">
                          <span className="text-[#86868b] truncate max-w-[150px]">stripe.com/checkout/pay-portal</span>
                          <span className="font-semibold text-primary font-mono">/stripe-pay</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-white border border-[#e8e8ed] flex items-center justify-between text-[8.5px] font-sans">
                          <span className="text-[#86868b] truncate max-w-[150px]">linear.app/board/sprint-planning</span>
                          <span className="font-semibold text-primary font-mono">/sprint</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Laptop Keyboard bottom base representation (MacBook aluminum keyboard deck) */}
              <div className="relative">
                {/* Aluminum desk tray */}
                <div className="h-3 bg-[#d1d5db] rounded-b-[12px] border-t border-slate-300 shadow-md flex justify-center relative">
                  {/* Keyboard center indentation */}
                  <div className="w-20 h-1 bg-slate-400/30 rounded-b-md" />
                </div>
                {/* Lower soft shadow lift */}
                <div className="absolute -bottom-2 left-4 right-4 h-2 bg-black/5 blur-md rounded-full -z-10" />
              </div>
            </motion.div>

            {/* Apple iPhone 15 Pro Mockup (The Mobile Frame) overlapping beautifully */}
            <motion.div
              style={{
                rotateX: mobileRotateX,
                rotateY: mobileRotateY,
                transformStyle: "preserve-3d",
              }}
              onMouseMove={handleMouseMoveMobile}
              onMouseLeave={handleMouseLeaveMobile}
              initial={{ opacity: 0, y: 60, rotate: 3, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, rotate: 1.5, scale: 1 }}
              transition={{ type: "spring", stiffness: 90, damping: 18, delay: 0.4 }}
              className="relative w-[190px] h-[370px] z-30 select-none group cursor-grab active:cursor-grabbing shrink-0"
            >
              {/* Matte black chassis with thin outline */}
              <div className="absolute inset-0 bg-[#171717] rounded-[34px] shadow-[0_20px_40px_rgba(0,0,0,0.15)] border-[4.5px] border-slate-800/90 overflow-hidden flex flex-col p-2 justify-between">
                
                {/* Screen glass glossy reflection layer */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/8 pointer-events-none z-30" />

                {/* iPhone Dynamic Island */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-3.5 bg-black rounded-full z-40 flex items-center justify-between px-2 cursor-pointer group" />

                {/* Mobile screen background */}
                <div className="bg-[#f5f5f7] h-full rounded-[26px] overflow-hidden flex flex-col text-left font-sans pt-6 px-2.5 pb-2.5 relative">
                  
                  {/* Status Bar */}
                  <div className="flex items-center justify-between px-1.5 py-0.5 select-none text-[8px] font-semibold text-slate-800 tracking-tight shrink-0">
                    <span>9:41</span>
                    <div className="flex items-center gap-0.5">
                      <span className="w-3 h-1.5 bg-slate-800 rounded-sm inline-block" />
                    </div>
                  </div>

                  {/* Mobile App Header */}
                  <div className="mt-2 text-center shrink-0">
                    <span className="text-[7px] uppercase font-semibold tracking-wider text-primary font-sans">Branded Redirect</span>
                    <h4 className="text-[11px] font-semibold text-[#1d1d1f] mt-0.5 tracking-tight font-sans">Link Shortener</h4>
                  </div>

                  {/* Input form mockup inside phone */}
                  <div className="mt-3 p-1.5 bg-white rounded-xl border border-slate-200/60 shadow-[0_1px_4px_rgba(0,0,0,0.02)] space-y-1.5 shrink-0">
                    <div className="border border-slate-100 rounded-lg px-2 py-1 bg-[#f5f5f7]">
                      <span className="text-[6.5px] font-semibold text-[#86868b] block uppercase">Link target</span>
                      <span className="text-[8px] font-medium text-[#1d1d1f] block truncate">figma.com/file/rE8vK...</span>
                    </div>
                    <button className="w-full bg-primary hover:bg-[#0077ed] text-white text-[8px] font-medium py-1 rounded-lg flex items-center justify-center gap-1 transition-all">
                      Shorten Now
                      <ArrowRight className="h-2 w-2" />
                    </button>
                  </div>

                  {/* Small analytic cards block */}
                  <div className="mt-3 flex-1 overflow-hidden flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <span className="text-[7px] uppercase font-semibold text-[#86868b] block">Live Hits</span>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[8px]">
                          <span className="text-[#86868b] w-7 truncate font-mono">/figma</span>
                          <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: '75%' }} />
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-[8px]">
                          <span className="text-[#86868b] w-7 truncate font-mono">/pay</span>
                          <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '45%' }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom safety seal indicator */}
                    <div className="text-center pt-1.5 border-t border-slate-200/50 select-none">
                      <span className="text-[6.5px] text-[#a1a1a6] font-medium block">✓ SSL ROUTING ENCRYPTED</span>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>


            {/* FLOATING WIDGET 1: Yellow Sticky Note (Top Left) styled like iOS Widget */}
            <div className="absolute -top-10 -left-4 xl:-left-12 z-20 hidden sm:block">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
              >
                <motion.div
                  whileHover={{ y: -4, rotate: -1, scale: 1.02, boxShadow: "0 12px 30px rgba(0,0,0,0.03)" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-48 bg-white rounded-3xl p-4 shadow-[0_10px_25px_rgba(0,0,0,0.02)] border border-[#e8e8ed] text-left font-sans text-[#1d1d1f] rotate-[-2deg] cursor-grab active:cursor-grabbing"
                >
                  <div className="absolute top-3 right-4 text-primary">
                    <Pin className="h-3.5 w-3.5 fill-primary/10" />
                  </div>
                  <p className="text-[11px] font-medium text-[#1d1d1f] leading-snug pr-4">
                    Branded redirects keep your communications elegant, recognizable, and high-converting.
                  </p>
                  <div className="mt-3.5 space-y-1 text-[9.5px] font-medium text-[#86868b]">
                    <div className="flex items-center gap-1.5">
                      <Check className="h-3 w-3 text-primary" /> Dynamic target codes
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="h-3 w-3 text-primary" /> Domain fallback nodes
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* FLOATING WIDGET 2: Reminders Widget (Top Right) */}
            <div className="absolute -top-8 -right-4 xl:-right-12 z-20 hidden md:block">
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut" }}
              >
                <motion.div
                  whileHover={{ y: -4, rotate: 1, scale: 1.02, boxShadow: "0 12px 30px rgba(0,0,0,0.03)" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-48 bg-white rounded-3xl p-4 shadow-[0_10px_25px_rgba(0,0,0,0.02)] border border-[#e8e8ed] text-left font-sans text-[#1d1d1f] rotate-[2deg] cursor-grab active:cursor-grabbing"
                >
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
                    <span className="text-[8px] uppercase font-semibold text-[#86868b]">Schedule</span>
                    <span className="text-[8px] font-medium text-[#0071e3] bg-[#0071e3]/10 px-2 py-0.5 rounded-full">System</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#f5f5f7] border border-slate-100 flex items-center justify-center text-primary shrink-0">
                      <Clock className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[10px] font-semibold truncate text-[#1d1d1f]">Metrics sync</h4>
                      <span className="text-[8.5px] text-[#86868b] block truncate">Scheduled report push</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1 bg-slate-100 text-[#1d1d1f] text-[8.5px] font-medium px-2 py-0.5 rounded-md w-fit">
                    13:00 UTC
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* FLOATING WIDGET 3: Today's Tasks Progress (Bottom Left) */}
            <div className="absolute -bottom-8 -left-6 xl:-left-14 z-20 hidden xl:block">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
              >
                <motion.div
                  whileHover={{ y: -4, scale: 1.02, boxShadow: "0 12px 30px rgba(0,0,0,0.03)" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-52 bg-white rounded-3xl p-4 shadow-[0_10px_25px_rgba(0,0,0,0.02)] border border-[#e8e8ed] text-left cursor-grab active:cursor-grabbing"
                >
                  <span className="text-[8px] uppercase font-semibold text-[#86868b] block mb-2.5">Platform Status</span>
                  <div className="space-y-2.5">
                    <div>
                      <div className="flex items-center justify-between text-[9.5px] font-medium mb-1">
                        <span className="text-[#1d1d1f]">Proxy Node Latency</span>
                        <span className="text-primary">9ms</span>
                      </div>
                      <div className="h-1 bg-[#f5f5f7] rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: '85%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-[9.5px] font-medium mb-1">
                        <span className="text-[#1d1d1f]">SSL Deployment Uptime</span>
                        <span className="text-emerald-500">100%</span>
                      </div>
                      <div className="h-1 bg-[#f5f5f7] rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* FLOATING WIDGET 4: Integrations (Bottom Right) */}
            <div className="absolute -bottom-8 -right-4 xl:-right-12 z-20 hidden sm:block">
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 5.1, repeat: Infinity, ease: "easeInOut" }}
              >
                <motion.div
                  whileHover={{ y: -4, rotate: -2, scale: 1.02, boxShadow: "0 12px 30px rgba(0,0,0,0.03)" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-44 bg-white rounded-3xl p-4 shadow-[0_10px_25px_rgba(0,0,0,0.02)] border border-[#e8e8ed] text-left rotate-[-1deg] cursor-grab active:cursor-grabbing"
                >
                  <span className="text-[8px] uppercase font-semibold text-[#86868b] block mb-2">Connects with</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-8 h-8 rounded-lg bg-[#f5f5f7] flex items-center justify-center text-[#1d1d1f] font-semibold text-[11px]">
                      Stripe
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-[#f5f5f7] flex items-center justify-center text-[#1d1d1f] font-semibold text-[11px]">
                      Notion
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-[#f5f5f7] flex items-center justify-center text-[#1d1d1f] font-semibold text-[11px]">
                      Linear
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Brand Logos banner */}
      <div className="py-8 bg-white border-y border-[#e8e8ed]/60 text-center text-[11px] font-medium text-[#86868b] uppercase tracking-widest select-none">
        Trusted by link builders at 
        <span className="text-[#1d1d1f] font-semibold ml-4">STRIPE</span> • 
        <span className="text-[#1d1d1f] font-semibold ml-4">NOTION</span> • 
        <span className="text-[#1d1d1f] font-semibold ml-4">LINEAR</span> • 
        <span className="text-[#1d1d1f] font-semibold ml-4">VERCEL</span>
      </div>

      {/* 2. APPLE BENTO FEATURES GRID SECTION */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Features Overview</span>
          <h2 className="font-sans text-3xl md:text-5xl font-semibold tracking-tight text-[#1d1d1f] mt-2">Designed to make every link count.</h2>
          <p className="text-base text-[#86868b] mt-3 leading-relaxed">Experience a redirection pipeline engineered with security, analytics, and speed at its foundation.</p>
        </div>

        {/* Apple Bento Box Layout */}
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
          className="grid grid-cols-1 md:grid-cols-6 gap-6"
        >
          {/* Card 1: 3 Columns Wide - Real-time metrics */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 15 },
              show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
            }}
            whileHover={{ y: -4 }}
            className="md:col-span-3 bg-white rounded-3xl border border-[#e8e8ed] p-8 shadow-sm flex flex-col justify-between overflow-hidden relative group"
          >
            <div>
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
                <BarChart2 className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-lg font-semibold text-[#1d1d1f]">Real-time Click Metrics</h3>
              <p className="text-sm text-[#86868b] mt-2 leading-snug">Track cities, browser types, referral paths, and device profiles of your audience instantly with precise charts.</p>
            </div>
            
            {/* Visualizer element */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex gap-2">
              {[60, 40, 90, 70, 100, 80, 110, 50].map((h, i) => (
                <div key={i} className="flex-1 bg-slate-100 rounded-md h-12 flex items-end overflow-hidden">
                  <motion.div 
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    transition={{ delay: i * 0.05, duration: 0.8 }}
                    className="w-full bg-primary/80 group-hover:bg-primary transition-colors" 
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Card 2: 3 Columns Wide - Custom Branded Domains */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 15 },
              show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
            }}
            whileHover={{ y: -4 }}
            className="md:col-span-3 bg-white rounded-3xl border border-[#e8e8ed] p-8 shadow-sm flex flex-col justify-between overflow-hidden group"
          >
            <div>
              <div className="h-10 w-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                <Globe className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-lg font-semibold text-[#1d1d1f]">Branded Custom Domains</h3>
              <p className="text-sm text-[#86868b] mt-2 leading-snug">Replace default domains with your own custom branded web domains. Build trust, drive higher open ratios, and project professional security.</p>
            </div>

            {/* Mock custom domain connector widget */}
            <div className="mt-8 p-3 bg-[#f5f5f7] rounded-2xl border border-slate-100 flex items-center justify-between text-xs font-mono text-[#1d1d1f]">
              <span className="text-[#86868b]">CNAME pointing</span>
              <span className="font-semibold text-primary">dns.shortify.co</span>
            </div>
          </motion.div>

          {/* Card 3: 2 Columns Wide - Access Codes */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 15 },
              show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
            }}
            whileHover={{ y: -4 }}
            className="md:col-span-2 bg-white rounded-3xl border border-[#e8e8ed] p-6 shadow-sm flex flex-col justify-between group"
          >
            <div>
              <div className="h-9 w-9 rounded-full bg-slate-100 text-[#1d1d1f] flex items-center justify-center mb-5 border border-slate-200/50">
                <Lock className="h-4 w-4" />
              </div>
              <h3 className="text-base font-semibold text-[#1d1d1f]">Access Protection</h3>
              <p className="text-xs text-[#86868b] mt-2 leading-relaxed">Lock sensitive links or pre-release prototypes behind solid access passcodes for perfect privacy controls.</p>
            </div>
          </motion.div>

          {/* Card 4: 2 Columns Wide - Dynamic QR Codes */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 15 },
              show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
            }}
            whileHover={{ y: -4 }}
            className="md:col-span-2 bg-white rounded-3xl border border-[#e8e8ed] p-6 shadow-sm flex flex-col justify-between group"
          >
            <div>
              <div className="h-9 w-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
                <QrCode className="h-4 w-4" />
              </div>
              <h3 className="text-base font-semibold text-[#1d1d1f]">Vector QR Codes</h3>
              <p className="text-xs text-[#86868b] mt-2 leading-relaxed">Generate high-fidelity vector SVG QR codes for offline campaigns, printed cards, or dynamic screens.</p>
            </div>
          </motion.div>

          {/* Card 5: 2 Columns Wide - zero delay proxy */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 15 },
              show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
            }}
            whileHover={{ y: -4 }}
            className="md:col-span-2 bg-white rounded-3xl border border-[#e8e8ed] p-6 shadow-sm flex flex-col justify-between group"
          >
            <div>
              <div className="h-9 w-9 rounded-full bg-[#00c7be]/10 text-[#00c7be] flex items-center justify-center mb-5">
                <Zap className="h-4 w-4" />
              </div>
              <h3 className="text-base font-semibold text-[#1d1d1f]">Zero Latency Routing</h3>
              <p className="text-xs text-[#86868b] mt-2 leading-relaxed">Never keep your audience waiting. Enjoy blazing-fast redirection speeds of under 10ms worldwide.</p>
            </div>
          </motion.div>

        </motion.div>
      </section>

      {/* 3. PREMIUM VISUALIZER SHOWCASE */}
      <section id="analytics" className="py-20 px-6 bg-gradient-to-b from-[#f5f5f7] to-white">
        <div className="max-w-7xl mx-auto rounded-[32px] border border-[#e8e8ed] bg-[#ffffff]/70 p-8 md:p-12 shadow-sm backdrop-blur-md">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            
            <div className="lg:col-span-2 space-y-6">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Console Design</span>
              <h2 className="font-sans text-3xl md:text-4xl font-semibold tracking-tight text-[#1d1d1f]">Stunning layout visualizers.</h2>
              <p className="text-sm text-[#86868b] leading-relaxed">
                Shortify offers a state-of-the-art interactive analytics console. Say goodbye to messy, cluttered text logs. Drill down to specific campaigns, toggle date ranges, and view beautiful charts.
              </p>
              
              <div className="space-y-3 text-xs font-semibold text-[#1d1d1f]">
                {['Direct live geolocated hit metrics', 'Export details in clean formats', 'Zero overhead setup with no code requirements'].map((feat, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <span className="h-5 w-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><Check className="h-3 w-3" /></span>
                    {feat}
                  </div>
                ))}
              </div>

              <button
                onClick={onLaunchDashboard}
                className="inline-flex items-center gap-1.5 bg-[#1d1d1f] hover:bg-[#2d2d2f] text-white text-xs font-medium px-5 py-2.5 rounded-full transition-all cursor-pointer shadow-sm"
              >
                Launch Console View
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Glassmorphic Showcase Graphic */}
            <div className="lg:col-span-3 bg-white rounded-3xl border border-[#e8e8ed] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] relative overflow-hidden">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  <span className="text-[9px] font-mono text-[#86868b] uppercase ml-2">Console / shortify.co</span>
                </div>
                <span className="text-[9px] font-semibold text-primary bg-[#0071e3]/10 px-2.5 py-0.5 rounded-full">ACTIVE NODE</span>
              </div>

              {/* Graphic stats panels */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-[#f5f5f7] rounded-2xl">
                  <span className="text-[9px] uppercase font-semibold text-[#86868b]">Redirection traffic</span>
                  <span className="text-xl font-semibold block text-[#1d1d1f] mt-1">4,964 hits</span>
                </div>
                <div className="p-4 bg-[#f5f5f7] rounded-2xl">
                  <span className="text-[9px] uppercase font-semibold text-[#86868b]">Response Latency</span>
                  <span className="text-xl font-semibold block text-primary mt-1">8.4ms avg</span>
                </div>
              </div>

              {/* Glowing mini wave chart placeholder */}
              <div className="h-28 bg-[#f5f5f7]/50 border border-[#e8e8ed] rounded-2xl p-2 flex items-end justify-between relative overflow-hidden">
                <svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none" className="overflow-visible absolute inset-0 opacity-60">
                  <path d="M 0 40 Q 25 15, 50 30 T 100 10 L 100 40 Z" fill="rgba(0,113,227,0.04)" />
                  <path d="M 0 40 Q 25 15, 50 30 T 100 10" fill="none" stroke="#0071e3" strokeWidth="1.5" />
                </svg>
                <span className="text-[9px] font-mono font-medium text-[#86868b] m-2 absolute bottom-1 right-1">Redirection wave (30d)</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. FAQ SECTION */}
      <section id="faq" className="py-24 px-6 max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">FAQ</span>
          <h2 className="font-sans text-3xl md:text-4xl font-semibold tracking-tight text-[#1d1d1f] mt-1">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqItems.map((item, idx) => {
            const isExpanded = expandedFaqIdx === idx;
            return (
              <div 
                key={idx} 
                className="bg-white rounded-2xl border border-[#e8e8ed] shadow-sm overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setExpandedFaqIdx(isExpanded ? null : idx)}
                  className="w-full flex items-center justify-between px-6 py-4.5 text-left text-sm font-semibold text-[#1d1d1f] cursor-pointer hover:bg-slate-50/50"
                >
                  {item.question}
                  <ChevronDown className={`h-4 w-4 text-[#86868b] transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`} />
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-6 pb-4.5 text-xs text-[#86868b] leading-relaxed border-t border-slate-100 pt-3"
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
        <div className="bg-[#1d1d1f] rounded-[32px] p-10 md:p-14 text-white shadow-xl relative overflow-hidden">
          {/* Decorative graphic details */}
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-white/5 rounded-full blur-[40px] pointer-events-none" />
          
          <span className="text-[10px] uppercase font-semibold tracking-widest text-slate-400">Deploy Custom Links</span>
          <h2 className="font-sans text-3xl md:text-5xl font-semibold mt-2 tracking-tight leading-tight">Brilliant. Simple. Secure.</h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto mt-4 leading-relaxed font-sans">
            Launch the console, link your branded domains, configure custom path extensions, and inspect detailed visual traffic reports instantly.
          </p>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onLaunchDashboard}
            className="bg-primary hover:bg-[#0077ed] text-white text-xs font-semibold px-8 py-3.5 rounded-full shadow-lg mt-8 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            Launch Free Console
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="bg-white text-[#86868b] py-16 px-6 border-t border-[#e8e8ed]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & description */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                <Link2 className="h-4 w-4" />
              </div>
              <span className="font-sans text-base font-semibold text-[#1d1d1f] tracking-tight">Shortify</span>
            </div>
            <p className="text-xs text-[#86868b] leading-relaxed">
              Clean redirection pipelines equipped with custom domain integrations, access code guards, and deep analytical reports.
            </p>
          </div>

          {/* Links columns */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1d1d1f] mb-4">Product</h4>
            <ul className="space-y-2.5 text-xs">
              <li><button onClick={() => window.scrollTo({top:0, behavior:'smooth'})} className="hover:text-[#1d1d1f] transition-colors cursor-pointer text-left">URL Shortener</button></li>
              <li><button onClick={onLaunchDashboard} className="hover:text-[#1d1d1f] transition-colors cursor-pointer text-left">Dynamic QR Codes</button></li>
              <li><button onClick={onLaunchDashboard} className="hover:text-[#1d1d1f] transition-colors cursor-pointer text-left">Branded Domains</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1d1d1f] mb-4">Legal</h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#" className="hover:text-[#1d1d1f] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#1d1d1f] transition-colors">Terms of Use</a></li>
              <li><a href="#" className="hover:text-[#1d1d1f] transition-colors">SLA Agreement</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1d1d1f] mb-4">Contact</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="text-[#86868b]">Support Email:</li>
              <li className="text-[#1d1d1f] font-medium">support@shortify.co</li>
              <li className="text-[#86868b] mt-2">API Server status:</li>
              <li className="text-emerald-500 font-medium flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> All Systems Operational</li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-[#e8e8ed] mt-12 pt-8 text-center text-xs text-[#86868b] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <span>© 2026 Shortify Inc. All rights reserved. Redesigned with premium Apple guidelines.</span>
          <div className="flex gap-6 justify-center">
            <a href="#" className="hover:text-[#1d1d1f] transition-colors">Twitter</a>
            <a href="#" className="hover:text-[#1d1d1f] transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-[#1d1d1f] transition-colors">GitHub</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
