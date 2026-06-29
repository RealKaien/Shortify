import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Link2, ArrowRight, Sparkles, Check, Globe, Shield, BarChart2, 
  QrCode, Zap, ChevronDown, MessageSquare, Tag, Key, Lock, Copy
} from 'lucide-react';
import { faqItems } from '../data/mockData';
import { toast } from '../lib/toast';

interface LandingPageProps {
  onLaunchDashboard: () => void;
}

export default function LandingPage({ onLaunchDashboard }: LandingPageProps) {
  // Hero URL Shorten State
  const [heroInput, setHeroInput] = useState('');
  const [shortenedResult, setShortenedResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // FAQ Expanded State
  const [expandedFaqIdx, setExpandedFaqIdx] = useState<number | null>(null);

  const handleHeroShorten = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroInput.trim()) return;

    setLoading(true);
    setShortenedResult(null);

    // Simulate link generation delay
    setTimeout(() => {
      setLoading(false);
      const randomCode = Math.random().toString(36).substring(2, 7);
      setShortenedResult(`${window.location.origin}/s/${randomCode}`);
    }, 1000);
  };

  const handleCopy = () => {
    if (!shortenedResult) return;
    navigator.clipboard.writeText(shortenedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Generated short link copied!');
  };

  return (
    <div id="saas-landing-container" className="relative min-h-screen bg-[#F4F7FF] font-sans text-heading overflow-x-hidden selection:bg-blue-100">
      
      {/* Background Floating Blurred Gradient Spheres */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#FFF7F4] rounded-full blur-[120px] opacity-60 pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-[#EEF3FF] rounded-full blur-[100px] opacity-80 pointer-events-none -z-10" />
      <div className="absolute top-[1200px] left-1/3 w-[600px] h-[600px] bg-indigo-300/10 rounded-full blur-[140px] pointer-events-none -z-10" />

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
              className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full w-fit mb-6"
            >
              <span className="w-2 h-2 bg-[#2563EB] rounded-full animate-pulse"></span>
              <span className="text-[12px] font-bold text-[#2563EB] uppercase tracking-wider font-sans">v2.0 is now live</span>
            </motion.div>
            
            <motion.h1 
              variants={{
                hidden: { opacity: 0, y: 25 },
                show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 12 } }
              }}
              className="text-[44px] sm:text-[64px] font-bold leading-[1.05] tracking-tight mb-6 font-display text-[#111827]"
            >
              Shorten Links.<br/>
              <span className="text-[#2563EB]">Share Anywhere.</span>
            </motion.h1>
            
            <motion.p 
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
              }}
              className="text-[18px] sm:text-[20px] text-[#4B5563] leading-relaxed mb-8 pr-4"
            >
              The premium URL shortener for creators and teams. Track your audience with real-time analytics.
            </motion.p>

            {/* URL Input Area matching Design HTML precisely */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, scale: 0.95 },
                show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 110, damping: 13 } }
              }}
              whileHover={{ scale: 1.01, boxShadow: "0 20px 40px rgba(37,99,235,0.06)" }}
              className="p-2 bg-white rounded-[24px] shadow-xl shadow-blue-500/5 border border-white flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
            >
              <form onSubmit={handleHeroShorten} className="w-full flex items-center gap-2">
                <div className="pl-3 text-[#9CA3AF] shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                </div>
                <input 
                  type="text" 
                  required
                  placeholder="Paste your long URL here..." 
                  value={heroInput}
                  onChange={(e) => setHeroInput(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-[15px] sm:text-[16px] text-[#111827] placeholder:text-[#9CA3AF] min-w-0" 
                />
                <button 
                  type="submit" 
                  className="px-6 py-3.5 sm:px-8 bg-[#2563EB] hover:bg-[#1D4ED8] hover:scale-[1.02] active:scale-[0.98] text-white font-bold rounded-[18px] transition-all cursor-pointer whitespace-nowrap text-xs sm:text-sm shadow-md shadow-blue-500/10 font-sans"
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

          {/* Right Hero Section - Mockup Dashboard from Design HTML */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 60, damping: 15, delay: 0.3 }}
            className="lg:col-span-7 flex items-center justify-end relative"
          >
            
            {/* Main Mockup Card */}
            <motion.div 
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="w-full max-w-[600px] bg-white rounded-[28px] shadow-2xl shadow-blue-900/10 border border-white overflow-hidden flex flex-col font-sans"
            >
              <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="text-[11px] font-bold text-[#9CA3AF] tracking-widest uppercase font-display">DASHBOARD PREVIEW</div>
                <div className="w-12"></div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-8">
                  <div className="p-3 sm:p-4 rounded-[20px] bg-blue-50 border border-blue-100">
                    <div className="text-[10px] sm:text-[12px] font-bold text-[#2563EB] uppercase mb-1">Total Clicks</div>
                    <div className="text-[18px] sm:text-[24px] font-bold text-[#111827]">42,891</div>
                  </div>
                  <div className="p-3 sm:p-4 rounded-[20px] bg-green-50 border border-green-100">
                    <div className="text-[10px] sm:text-[12px] font-bold text-emerald-600 uppercase mb-1">Avg. CTR</div>
                    <div className="text-[18px] sm:text-[24px] font-bold text-[#111827]">12.4%</div>
                  </div>
                  <div className="p-3 sm:p-4 rounded-[20px] bg-purple-50 border border-purple-100">
                    <div className="text-[10px] sm:text-[12px] font-bold text-purple-600 uppercase mb-1">Active Links</div>
                    <div className="text-[18px] sm:text-[24px] font-bold text-[#111827]">156</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-[14px] font-bold text-[#111827]">Recent Performance</div>
                  
                  {/* Mock Chart Area */}
                  <div className="h-32 w-full flex items-end gap-2 bg-gray-50/50 p-4 rounded-[20px]">
                    <div className="flex-1 bg-blue-100 rounded-t-lg h-[40%]"></div>
                    <div className="flex-1 bg-blue-200 rounded-t-lg h-[60%]"></div>
                    <div className="flex-1 bg-blue-300 rounded-t-lg h-[80%]"></div>
                    <div className="flex-1 bg-[#2563EB] rounded-t-lg h-[100%]"></div>
                    <div className="flex-1 bg-blue-300 rounded-t-lg h-[70%]"></div>
                    <div className="flex-1 bg-blue-200 rounded-t-lg h-[50%]"></div>
                    <div className="flex-1 bg-blue-100 rounded-t-lg h-[30%]"></div>
                  </div>

                  {/* Recent Links Table */}
                  <div className="mt-8 overflow-hidden">
                     <table className="w-full text-left">
                       <thead className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#9CA3AF] border-b border-gray-100">
                         <tr>
                           <th className="pb-2 font-bold">Original Link</th>
                           <th className="pb-2 font-bold">Shortened</th>
                           <th className="pb-2 font-bold text-right">Clicks</th>
                         </tr>
                       </thead>
                       <tbody className="text-[12px] sm:text-[13px]">
                         <tr className="border-b border-gray-50">
                           <td className="py-3 text-[#4B5563] truncate max-w-[120px] sm:max-w-[200px]">stripe.com/billing/portal/auth</td>
                           <td className="py-3 font-semibold text-[#2563EB]">shorti.fy/stripe-pay</td>
                           <td className="py-3 font-bold text-[#111827] text-right">2,410</td>
                         </tr>
                         <tr className="border-b border-gray-50">
                           <td className="py-3 text-[#4B5563] truncate max-w-[120px] sm:max-w-[200px]">linear.app/feature/project-board</td>
                           <td className="py-3 font-semibold text-[#2563EB]">shorti.fy/roadmap</td>
                           <td className="py-3 font-bold text-[#111827] text-right">1,822</td>
                         </tr>
                       </tbody>
                     </table>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Overlay Floating Badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 80, damping: 12, delay: 0.6 }}
              className="absolute -bottom-4 -left-12 p-5 bg-white rounded-[24px] shadow-xl border border-white flex items-center gap-3 z-10 hidden xl:flex"
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/></svg>
              </div>
              <div className="text-left">
                <div className="text-[10px] font-bold text-[#9CA3AF] uppercase">Growth</div>
                <div className="text-[16px] font-bold text-[#111827]">+28% <span className="text-[12px] font-medium text-[#9CA3AF] ml-0.5">this week</span></div>
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
