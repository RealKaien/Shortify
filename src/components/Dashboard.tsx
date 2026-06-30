import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Link2, BarChart2, QrCode, Terminal, Settings, 
  Search, Filter, Plus, ShieldAlert, Sparkles, 
  ChevronRight, ArrowUpRight, Copy, Check, Eye, Trash2, LogOut, Info, Star, Menu, X,
  ChevronLeft, Share2, Calendar, Lock, Unlock, Globe
} from 'lucide-react';
import { Link, ClickEvent, ApiKey } from '../types';
import { toast } from '../lib/toast';

// Interactive Swipeable Physical Card Carousel inspired by the video
interface LinkCardCarouselProps {
  links: Link[];
  onCopy: (link: Link) => void;
  onInspect: (link: Link) => void;
  onDelete: (id: string) => void;
  copiedLinkId: string | null;
}

function LinkCardCarousel({ links, onCopy, onInspect, onDelete, copiedLinkId }: LinkCardCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (links.length === 0) return null;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? links.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === links.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full py-12 px-4 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-tr from-primary/5 via-slate-50/50 to-transparent rounded-[36px] border border-white/60 shadow-[0_16px_40px_rgba(15,23,42,0.03)] mb-8">
      {/* Abstract premium branding labels mirroring the video frame background details */}
      <div className="absolute top-4 left-6 flex items-center gap-1.5 opacity-40">
        <Sparkles className="h-3 w-3 text-primary" />
        <span className="text-[9px] uppercase font-mono tracking-widest font-black text-secondary-text">Redirect Deck Mode</span>
      </div>
      <div className="absolute top-4 right-6 text-[9px] font-mono font-black uppercase text-primary/60 bg-primary/10 px-2 py-0.5 rounded-full">
        {activeIndex + 1} / {links.length} endpoints
      </div>

      {/* Main card stack presentation stage */}
      <div className="relative w-full max-w-[340px] h-[320px] flex items-center justify-center">
        <AnimatePresence mode="popLayout">
          {links.map((link, idx) => {
            // Calculate stacking parameters
            const relativeIndex = (idx - activeIndex + links.length) % links.length;
            const isFront = relativeIndex === 0;

            // Render top 3 cards in stack
            if (relativeIndex > 2) return null;

            return (
              <motion.div
                key={link.id}
                style={{
                  zIndex: 30 - relativeIndex,
                  transformOrigin: "bottom center",
                }}
                initial={{ opacity: 0, scale: 0.85, y: 30 }}
                animate={{
                  opacity: 1 - relativeIndex * 0.25,
                  scale: 1 - relativeIndex * 0.06,
                  y: relativeIndex * 14,
                  rotate: relativeIndex * -1.5,
                  filter: `blur(${relativeIndex * 1}px)`,
                }}
                exit={{ opacity: 0, scale: 0.8, y: -40, rotate: -8 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className={`absolute w-full h-[280px] rounded-[28px] p-6 flex flex-col justify-between shadow-[0_16px_36px_rgba(31,25,47,0.06)] border ${
                  isFront 
                    ? "bg-white border-primary/25 cursor-grab active:cursor-grabbing" 
                    : "bg-white/90 border-gray-100"
                }`}
                drag={isFront ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(event, info) => {
                  if (info.offset.x > 100) {
                    handlePrev();
                  } else if (info.offset.x < -100) {
                    handleNext();
                  }
                }}
                whileHover={isFront ? { y: -2, scale: 1.01 } : {}}
              >
                {/* Header section with status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                      <Link2 className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-[14px] font-black tracking-tight text-heading truncate max-w-[150px]">
                        {link.title || 'SaaS Redirection'}
                      </h4>
                      <span className="text-[10px] text-muted-text flex items-center gap-1 font-semibold">
                        <Calendar className="h-3 w-3 shrink-0 text-muted-text" />
                        {new Date(link.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 ${
                    link.isProtected ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  }`}>
                    {link.isProtected ? <Lock className="h-2.5 w-2.5" /> : <Unlock className="h-2.5 w-2.5" />}
                    {link.isProtected ? 'Secured' : 'Public'}
                  </span>
                </div>

                {/* Body details display */}
                <div className="my-3 space-y-2">
                  <div className="bg-gray-50/80 rounded-2xl p-3 border border-gray-100/60 font-mono text-[11px] leading-tight text-secondary-text truncate max-w-full">
                    <span className="text-[9px] uppercase font-mono tracking-widest block text-muted-text mb-1">Target Endpoint URL</span>
                    {link.longUrl}
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold px-1">
                    <span className="text-secondary-text">Short Code Namespace:</span>
                    <span className="font-bold text-primary font-mono bg-primary/5 px-2 py-0.5 rounded-md">/{link.alias || link.shortCode}</span>
                  </div>
                </div>

                {/* Call to action & management row */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 font-mono font-black text-heading text-lg">
                    <Globe className="h-4 w-4 text-primary shrink-0 mr-1" />
                    {link.clicks} <span className="text-[10px] text-secondary-text font-sans font-bold ml-1">clicks</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => onCopy(link)}
                      className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-secondary-text cursor-pointer relative flex items-center justify-center h-9 w-9 border border-gray-200/50"
                      title="Copy short url"
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {copiedLinkId === link.id ? (
                          <motion.div
                            key="copied"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                          >
                            <Check className="h-4 w-4 text-emerald-600" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="copy"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                          >
                            <Copy className="h-4 w-4 text-primary" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>

                    <button
                      onClick={() => onInspect(link)}
                      className="p-2 rounded-xl bg-primary text-white hover:bg-primary-hover cursor-pointer flex items-center justify-center h-9 w-9"
                      title="Inspect detailed metrics"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm('Delete this shortened endpoint?')) {
                          onDelete(link.id);
                        }
                      }}
                      className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-danger cursor-pointer flex items-center justify-center h-9 w-9 border border-red-100/50"
                      title="Delete link"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Swipe Navigation Dots Controls */}
      <div className="flex items-center gap-4 mt-6">
        <button
          onClick={handlePrev}
          className="p-2 rounded-xl bg-white hover:bg-gray-50 text-secondary-text border border-gray-200/60 shadow-sm cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex gap-1.5">
          {links.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === activeIndex ? "w-6 bg-primary" : "w-2 bg-primary/20"
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="p-2 rounded-xl bg-white hover:bg-gray-50 text-secondary-text border border-gray-200/60 shadow-sm cursor-pointer"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Import subcomponents
import CreateLinkModal from './CreateLinkModal';
import AnalyticsView from './AnalyticsView';
import QRCodeManager from './QRCodeManager';
import LinkDetails from './LinkDetails';
import SettingsView from './SettingsView';
import APIExplorer from './APIExplorer';

interface DashboardProps {
  links: Link[];
  clicks: ClickEvent[];
  apiKeys: ApiKey[];
  userProfile: { name: string; email: string } | null;
  isTrialMode: boolean;
  onAddLink: (newLink: Omit<Link, 'id' | 'clicks' | 'createdAt' | 'qrCodeUrl' | 'shortCode'>) => void;
  onUpdateLink: (linkId: string, updated: Partial<Link>) => void;
  onDeleteLink: (linkId: string) => void;
  onAddApiKey: (name: string) => void;
  onDeleteApiKey: (id: string) => void;
  onSignOut: () => void;
  onUpgrade: () => void;
}

type SidebarTab = 'dashboard' | 'links' | 'analytics' | 'qrcodes' | 'api' | 'settings';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: 'spring',
      stiffness: 260,
      damping: 20
    } 
  }
};

interface EmptyStateProps {
  onCreateClick: () => void;
}

function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-white rounded-[32px] border border-[rgba(255,255,255,0.7)] p-8 sm:p-12 shadow-[0_8px_32px_rgba(0,0,0,0.02)] text-center relative overflow-hidden flex flex-col items-center justify-center max-w-2xl mx-auto"
    >
      {/* Decorative ambient glowing orbs */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Modern CSS/SVG Illustration */}
      <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
        {/* Animated outer dashed radar circles */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-2 border-dashed border-gray-100 rounded-full"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute inset-4 border border-dashed border-gray-200/60 rounded-full"
        />

        {/* Central visual canvas with floating elements */}
        <div className="relative z-10 w-28 h-28 bg-gradient-to-tr from-gray-50 to-white border border-gray-100 rounded-2xl shadow-inner flex items-center justify-center">
          
          {/* Main floating link chain icon */}
          <motion.div
            animate={{ 
              y: [-4, 4, -4],
              rotate: [-2, 2, -2]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="p-3.5 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 z-20"
          >
            <Link2 className="h-7 w-7" />
          </motion.div>

          {/* Sparkles / dynamic link particle elements */}
          <motion.div
            animate={{ 
              scale: [0.8, 1.2, 0.8],
              opacity: [0.6, 1, 0.6],
              x: [-15, -12, -15],
              y: [-15, -18, -15]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute p-1.5 bg-yellow-400 text-white rounded-lg shadow-sm"
          >
            <Sparkles className="h-3 w-3" />
          </motion.div>

          <motion.div
            animate={{ 
              scale: [1.1, 0.9, 1.1],
              opacity: [0.8, 0.5, 0.8],
              x: [22, 18, 22],
              y: [18, 22, 18]
            }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute text-primary bg-primary/10 px-2 py-0.5 rounded-full text-[9px] font-bold font-mono shadow-sm"
          >
            /active
          </motion.div>

          <motion.div
            animate={{ 
              scale: [0.9, 1.1, 0.9],
              opacity: [0.7, 1, 0.7],
              x: [-32, -28, -32],
              y: [22, 18, 22]
            }}
            transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute text-gray-500 bg-white border border-gray-100 px-1.5 py-0.5 rounded-md text-[8px] font-bold shadow-sm"
          >
            200 OK
          </motion.div>
        </div>
      </div>

      {/* Empty State Text */}
      <h3 className="text-xl font-black text-heading font-display tracking-tight mb-2">
        Ready, set, shorten!
      </h3>
      <p className="text-xs text-secondary-text max-w-md mx-auto leading-relaxed mb-6">
        Shortify transforms your long, bulky URLs into high-performance, branded, and secure namespace aliases. Create your first short link to unlock rich analytics, customizable access gates, and dynamic QR codes!
      </p>

      {/* Primary CTA Button */}
      <motion.button
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={onCreateClick}
        className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold px-6 py-3.5 rounded-[16px] shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 transition-all cursor-pointer mb-8"
      >
        <Plus className="h-4 w-4" />
        Shorten Your First Link
      </motion.button>

      {/* Suggested Starter Use Cases */}
      <div className="w-full pt-6 border-t border-gray-100">
        <span className="text-[10px] font-bold text-muted-text uppercase tracking-wider block mb-3">
          Quick inspiration to get you started
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
          {[
            { icon: "🎨", title: "Branded Portfolio", desc: "/my-work" },
            { icon: "📦", title: "Product Showcase", desc: "/new-release" },
            { icon: "📝", title: "Social Redirection", desc: "/connect" }
          ].map((item, idx) => (
            <div 
              key={idx}
              onClick={onCreateClick}
              className="bg-gray-50/50 hover:bg-gray-50 border border-gray-100 hover:border-primary/20 p-3 rounded-xl text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 font-bold text-heading text-[11px] mb-1">
                <span>{item.icon}</span>
                <span className="group-hover:text-primary transition-colors">{item.title}</span>
              </div>
              <span className="text-[9px] font-semibold font-mono text-muted-text bg-white px-1.5 py-0.5 rounded border border-gray-100 block w-fit">
                {item.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function Dashboard({
  links,
  clicks,
  apiKeys,
  userProfile,
  isTrialMode,
  onAddLink,
  onUpdateLink,
  onDeleteLink,
  onAddApiKey,
  onDeleteApiKey,
  onSignOut,
  onUpgrade
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>('dashboard');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedLinkDetails, setSelectedLinkDetails] = useState<Link | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'protected' | 'expired'>('all');
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const currentUserName = userProfile?.name || 'Guest Explorer';
  const currentUserEmail = userProfile?.email || 'guest@trial.local';

  // 1. Dynamic Overview Aggregate Stats
  const stats = useMemo(() => {
    const totalClicks = clicks.length;
    const activeLinksCount = links.filter(l => !l.expiryDate || new Date(l.expiryDate) > new Date()).length;
    const qrCount = links.length; // Each gets a dynamic QR

    return {
      totalClicks,
      activeLinksCount,
      qrCount
    };
  }, [links, clicks]);

  // 2. Filter and search links
  const processedLinks = useMemo(() => {
    return links.filter(link => {
      // Search Query Match
      const matchesSearch = 
        link.longUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.alias?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.shortCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (link.title && link.title.toLowerCase().includes(searchQuery.toLowerCase()));

      // Filter Type Match
      const isExpired = link.expiryDate ? new Date(link.expiryDate) < new Date() : false;
      const matchesFilter = 
        filterType === 'all' ||
        (filterType === 'protected' && link.isProtected) ||
        (filterType === 'expired' && isExpired);

      return matchesSearch && matchesFilter;
    });
  }, [links, searchQuery, filterType]);

  // Paginated links
  const paginatedLinks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedLinks.slice(startIndex, startIndex + itemsPerPage);
  }, [processedLinks, currentPage]);

  const totalPages = Math.ceil(processedLinks.length / itemsPerPage);

  const handleCopyLink = (link: Link) => {
    const url = `${window.location.origin}/s/${link.alias || link.shortCode}`;
    navigator.clipboard.writeText(url);
    setCopiedLinkId(link.id);
    setTimeout(() => setCopiedLinkId(null), 2000);
    toast.success('Short link copied to clipboard!');
  };

  const handleLinkUpdate = (updatedFields: Partial<Link>) => {
    if (selectedLinkDetails) {
      onUpdateLink(selectedLinkDetails.id, updatedFields);
      setSelectedLinkDetails(current => current ? { ...current, ...updatedFields } : null);
    }
  };

  const handleLinkDelete = (id: string) => {
    onDeleteLink(id);
    setSelectedLinkDetails(null);
  };

  const handleLinkCreateSubmit = (newLinkData: Omit<Link, 'id' | 'clicks' | 'createdAt' | 'qrCodeUrl' | 'shortCode'>) => {
    onAddLink(newLinkData);
    setIsCreateModalOpen(false);
  };

  const handleTabClick = (tabId: SidebarTab) => {
    setActiveTab(tabId);
    setSelectedLinkDetails(null);
    setIsMobileMenuOpen(false);
  };

  return (
    <div id="saas-dashboard-container" className="flex h-screen bg-[#F8FAFC] overflow-hidden text-heading">
      
      {/* SIDEBAR NAVIGATION PANEL (Hidden on Mobile) */}
      <aside id="saas-sidebar" className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-100 p-6 justify-between h-full">
        <div className="space-y-8">
          {/* Main Logo brand header */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-tr from-primary to-blue-500 rounded-2xl flex items-center justify-center text-white shadow-md shadow-blue-500/10">
              <Link2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight block font-display">Shortify</span>
              <span className="text-[10px] text-muted-text uppercase font-bold tracking-widest block">Dashboard v3</span>
            </div>
          </div>

          {/* Quick Stats Sidebar pill */}
          <div className="p-4 bg-gray-50/80 rounded-[20px] border border-gray-100 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-secondary-text">
              <span className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-amber-500" />
                Current Tier
              </span>
              <span className={isTrialMode ? 'text-amber-600' : 'text-primary'}>
                {isTrialMode ? 'Trial Guest' : 'Registered Pro'}
              </span>
            </div>
            {isTrialMode ? (
              <div className="space-y-1.5">
                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: `${(links.length / 3) * 100}%` }}></div>
                </div>
                <span className="text-[10px] text-muted-text block leading-snug">
                  Redirect Quota: <strong>{links.length}/3</strong>. Register to remove limit.
                </span>
                <button
                  onClick={onUpgrade}
                  className="w-full text-center py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                >
                  Register Free
                </button>
              </div>
            ) : (
              <span className="text-[10px] text-muted-text block leading-snug">
                Congratulations! You have unlimited link creation and full access enabled.
              </span>
            )}
          </div>

          {/* Nav groups */}
          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: 'Console Overview', icon: LayoutDashboard },
              { id: 'links', label: 'Redirect Directory', icon: Link2 },
              { id: 'analytics', label: 'Insights Reports', icon: BarChart2 },
              { id: 'qrcodes', label: 'Dynamic QR Engine', icon: QrCode },
              { id: 'api', label: 'Developer APIs', icon: Terminal },
              { id: 'settings', label: 'Account Settings', icon: Settings },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isSelected = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id as SidebarTab)}
                  className={`w-full relative flex items-center gap-3 px-4 py-3 rounded-[16px] text-xs font-bold transition-all text-left cursor-pointer ${
                    isSelected
                      ? 'text-primary'
                      : 'text-secondary-text hover:text-heading hover:bg-gray-50/50'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 bg-primary/10 rounded-[16px]"
                      style={{ zIndex: 0 }}
                      transition={{ type: 'spring', damping: 28, stiffness: 380 }}
                    />
                  )}
                  <TabIcon className="h-4 w-4 relative z-10" />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Account / Signout row */}
        <div className="border-t border-gray-100 pt-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-xs text-primary">
              {currentUserName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <div className="truncate max-w-[120px]">
              <span className="text-xs font-bold text-heading block truncate">{currentUserName}</span>
              <span className="text-[10px] text-secondary-text block truncate">{currentUserEmail}</span>
            </div>
          </div>
          
          <button
            onClick={onSignOut}
            className="w-full flex items-center justify-center gap-1.5 text-[10px] font-bold text-danger bg-red-50 hover:bg-red-100 py-2.5 rounded-[12px] transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out to Landing
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <main id="main-dashboard-canvas" className="flex-1 p-6 lg:p-10 overflow-y-auto h-screen max-w-[100vw]">
        
        {/* Top Mobile Bar (shows up when sidebar hidden) */}
        <div className="flex lg:hidden items-center justify-between pb-6 border-b border-gray-100 mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 bg-gray-100 text-heading rounded-xl hover:bg-gray-200 transition-colors"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="h-8 w-8 bg-primary rounded-lg text-white flex items-center justify-center"><Link2 className="h-4 w-4" /></div>
            <span className="text-base font-bold font-display">Shortify</span>
          </div>

          <div className="flex items-center gap-2">
            {isTrialMode && (
              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-1 rounded-lg font-bold">
                {links.length}/3 Links
              </span>
            )}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-primary hover:bg-primary-hover text-white p-2 rounded-xl"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              onClick={onSignOut}
              className="bg-red-50 text-danger p-2 rounded-xl"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mobile Slide-out Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Overlay Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black z-40 lg:hidden"
              />

              {/* Side Drawer */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 left-0 bottom-0 w-80 bg-white z-50 p-6 flex flex-col justify-between shadow-2xl lg:hidden"
              >
                <div className="space-y-8">
                  {/* Brand Header & Close */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-primary rounded-xl flex items-center justify-center text-white">
                        <Link2 className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <span className="text-sm font-black tracking-tight block font-display">Shortify</span>
                        <span className="text-[9px] text-muted-text uppercase font-bold tracking-widest block">Dashboard v3</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-2 bg-gray-100 text-heading rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Navigation Links */}
                  <nav className="space-y-1.5">
                    {[
                      { id: 'dashboard', label: 'Console Overview', icon: LayoutDashboard },
                      { id: 'links', label: 'Redirect Directory', icon: Link2 },
                      { id: 'analytics', label: 'Insights Reports', icon: BarChart2 },
                      { id: 'qrcodes', label: 'Dynamic QR Engine', icon: QrCode },
                      { id: 'api', label: 'Developer APIs', icon: Terminal },
                      { id: 'settings', label: 'Account Settings', icon: Settings },
                    ].map((tab) => {
                      const TabIcon = tab.icon;
                      const isSelected = activeTab === tab.id;

                      return (
                        <button
                          key={tab.id}
                          onClick={() => handleTabClick(tab.id as SidebarTab)}
                          className={`w-full relative flex items-center gap-3 px-4 py-3.5 rounded-[16px] text-xs font-bold transition-all text-left cursor-pointer ${
                            isSelected
                              ? 'text-primary'
                              : 'text-secondary-text hover:text-heading hover:bg-gray-50/50'
                          }`}
                        >
                          {isSelected && (
                            <motion.div
                              layoutId="activeTabIndicatorMobile"
                              className="absolute inset-0 bg-primary/10 rounded-[16px]"
                              style={{ zIndex: 0 }}
                              transition={{ type: 'spring', damping: 28, stiffness: 380 }}
                            />
                          )}
                          <TabIcon className="h-4 w-4 relative z-10" />
                          <span className="relative z-10">{tab.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Account details and sign out */}
                <div className="border-t border-gray-100 pt-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-xs text-primary">
                      {currentUserName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-heading block truncate max-w-[180px]">{currentUserName}</span>
                      <span className="text-[10px] text-secondary-text block truncate max-w-[180px]">{currentUserEmail}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={onSignOut}
                    className="w-full flex items-center justify-center gap-1.5 text-[10px] font-bold text-danger bg-red-50 hover:bg-red-100 py-3 rounded-[12px] transition-colors cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out to Landing
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Dynamic Route Content based on selected Tab and Link Detail inspection */}
        <div className="max-w-5xl mx-auto space-y-8">
          
          {selectedLinkDetails ? (
            /* Single Link Details Inspection takes over context */
            <LinkDetails 
              link={selectedLinkDetails}
              clicks={clicks}
              onBack={() => setSelectedLinkDetails(null)}
              onUpdateLink={handleLinkUpdate}
              onDeleteLink={handleLinkDelete}
            />
          ) : (
            /* Standard Workspace Pages */
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                {/* PAGE 1: OVERVIEW DASHBOARD */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-8">
                    {/* Welcome banner */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-2xl font-black text-heading font-display">SaaS Control Center</h1>
                        <p className="text-xs text-secondary-text mt-0.5">Welcome back, {currentUserName}. Here is your redirect performance snapshot today.</p>
                      </div>
                      
                      {/* Interactive Trigger in view */}
                      <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="hidden sm:flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2.5 rounded-[14px] shadow-sm transition-all cursor-pointer"
                      >
                        <Plus className="h-4 w-4" />
                        Shorten a Link
                      </button>
                    </div>

                    {/* Numeric Cards Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                      {[
                        { label: 'Redirection Clicks', value: stats.totalClicks, change: '+12.5%', type: 'clicks' },
                        { label: 'Active Short Links', value: stats.activeLinksCount, change: 'Stable', type: 'links' },
                        { label: 'Dynamic QR Codes', value: stats.qrCount, change: '100% active', type: 'qrs' },
                        { label: 'Account Authority', value: isTrialMode ? 'Guest Trial' : 'Registered Member', change: isTrialMode ? 'Limit: 3 links' : 'Unlimited', type: 'authority' }
                      ].map((card, i) => (
                        <div key={i} className="bg-white rounded-[24px] border border-[rgba(255,255,255,0.65)] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.03)] transition-all">
                          <span className="text-[10px] font-bold text-secondary-text uppercase tracking-wider">{card.label}</span>
                          <div className="flex items-baseline justify-between mt-2">
                            <span className="text-xl lg:text-2xl font-black text-heading font-display leading-tight truncate">{card.value}</span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              card.type === 'authority' && isTrialMode ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                            }`}>
                              {card.change}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Latest Links Catalog Quick Table or Empty State */}
                    {links.length === 0 ? (
                      <EmptyState onCreateClick={() => setIsCreateModalOpen(true)} />
                    ) : (
                      <>
                        {/* Interactive Physical Stacking Card Carousel inspired by the video */}
                        <LinkCardCarousel 
                          links={links}
                          onCopy={handleCopyLink}
                          onInspect={(link) => setSelectedLinkDetails(link)}
                          onDelete={handleLinkDelete}
                          copiedLinkId={copiedLinkId}
                        />

                        <div className="bg-white rounded-[28px] border border-[rgba(255,255,255,0.65)] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-bold text-heading font-display">Redirect Index Table</h3>
                            <p className="text-xs text-secondary-text">Live directory of active namespaces and tracking scopes.</p>
                          </div>

                          {/* Search Input inline */}
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-text" />
                            <input
                              type="text"
                              placeholder="Filter by keyword..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-9 pr-4 py-2.5 rounded-[14px] bg-gray-50 border border-gray-200 text-xs font-semibold text-heading outline-none focus:bg-white focus:border-primary transition-all w-full sm:w-64"
                            />
                          </div>
                        </div>

                        {/* Compact Directory List */}
                        <div className="overflow-x-auto rounded-[18px] border border-gray-100">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-gray-50/80 text-secondary-text text-[10px] uppercase font-bold border-b border-gray-100">
                              <tr>
                                <th className="px-6 py-4">Short Endpoint</th>
                                <th className="px-6 py-4">Destination Target</th>
                                <th className="px-6 py-4 text-center">Total Clicks</th>
                                <th className="px-6 py-4 text-center">Security</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                              </tr>
                            </thead>
                            <motion.tbody 
                              key={`overview-${searchQuery}-${currentPage}-${paginatedLinks.length}`}
                              variants={containerVariants}
                              initial="hidden"
                              animate="show"
                              className="divide-y divide-gray-100 font-semibold text-heading"
                            >
                              {paginatedLinks.length === 0 ? (
                                <motion.tr variants={itemVariants}>
                                  <td colSpan={5} className="px-6 py-10 text-center text-secondary-text">
                                    No short links found matching filters. Generate a new link to begin!
                                  </td>
                                </motion.tr>
                              ) : (
                                paginatedLinks.map((link) => {
                                  const isCopied = copiedLinkId === link.id;
                                  return (
                                    <motion.tr 
                                      variants={itemVariants}
                                      key={link.id} 
                                      className="hover:bg-gray-50/50 transition-colors"
                                    >
                                      <td className="px-6 py-4">
                                        <span className="font-bold text-primary font-mono block">/{link.alias || link.shortCode}</span>
                                        <span className="text-[10px] text-muted-text mt-0.5 block">{new Date(link.createdAt).toLocaleDateString()}</span>
                                      </td>
                                      <td className="px-6 py-4 max-w-[200px] truncate font-mono text-[11px] text-secondary-text">
                                        {link.longUrl}
                                      </td>
                                      <td className="px-6 py-4 text-center font-mono font-bold">
                                        {link.clicks}
                                      </td>
                                      <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                          link.isProtected ? 'bg-blue-50 text-primary' : 'bg-gray-100 text-muted-text'
                                        }`}>
                                          {link.isProtected ? 'Gate Active' : 'No password'}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                          <motion.button
                                            whileTap={{ scale: 0.85 }}
                                            whileHover={{ scale: 1.1 }}
                                            onClick={() => handleCopyLink(link)}
                                            className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-secondary-text cursor-pointer relative overflow-hidden flex items-center justify-center h-8 w-8"
                                            title="Copy link"
                                          >
                                            <AnimatePresence mode="wait" initial={false}>
                                              {isCopied ? (
                                                <motion.div
                                                  key="copied"
                                                  initial={{ scale: 0.5, rotate: -15, opacity: 0 }}
                                                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                                  exit={{ scale: 0.5, rotate: 15, opacity: 0 }}
                                                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                                >
                                                  <Check className="h-3.5 w-3.5 text-emerald-500 stroke-[2.5]" />
                                                </motion.div>
                                              ) : (
                                                <motion.div
                                                  key="copy"
                                                  initial={{ scale: 0.5, opacity: 0 }}
                                                  animate={{ scale: 1, opacity: 1 }}
                                                  exit={{ scale: 0.5, opacity: 0 }}
                                                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                                >
                                                  <Copy className="h-3.5 w-3.5" />
                                                </motion.div>
                                              )}
                                            </AnimatePresence>
                                          </motion.button>
                                          <button
                                            onClick={() => setSelectedLinkDetails(link)}
                                            className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-secondary-text cursor-pointer"
                                            title="View detailed Analytics"
                                          >
                                            <Eye className="h-3.5 w-3.5 text-primary" />
                                          </button>
                                          <button
                                            onClick={() => {
                                              if (confirm('Delete this shortened endpoint?')) {
                                                onDeleteLink(link.id);
                                              }
                                            }}
                                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-danger cursor-pointer"
                                            title="Delete"
                                          >
                                            <Trash2 className="h-3.5 w-3.5" />
                                          </button>
                                        </div>
                                      </td>
                                    </motion.tr>
                                  );
                                })
                              )}
                            </motion.tbody>
                          </table>
                        </div>

                        {/* Simple Custom Pagination */}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-between pt-4 text-xs font-semibold text-secondary-text">
                            <span>Showing page {currentPage} of {totalPages}</span>
                            <div className="flex gap-2">
                              <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 cursor-pointer disabled:opacity-40"
                              >
                                Prev
                              </button>
                              <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 cursor-pointer disabled:opacity-40"
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                    )}
                  </div>
                )}

                {/* PAGE 2: CATALOG LINKS */}
                {activeTab === 'links' && (
                  <div className="space-y-6">
                    {links.length === 0 ? (
                      <EmptyState onCreateClick={() => setIsCreateModalOpen(true)} />
                    ) : (
                      <>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-[24px] border border-[rgba(255,255,255,0.65)] shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                          <div>
                            <h2 className="text-xl font-bold text-heading font-display">Redirect Catalog</h2>
                            <p className="text-xs text-secondary-text">Filter and manage active endpoints, parameters, and redirects.</p>
                          </div>

                          {/* Filters */}
                          <div className="flex flex-wrap gap-2">
                            {[
                              { id: 'all', label: 'All links' },
                              { id: 'protected', label: 'Password secured' },
                              { id: 'expired', label: 'Expired links' }
                            ].map((filter) => (
                              <button
                                key={filter.id}
                                onClick={() => {
                                  setFilterType(filter.id as any);
                                  setCurrentPage(1);
                                }}
                                className={`px-3.5 py-1.5 rounded-[12px] text-xs font-semibold transition-all cursor-pointer ${
                                  filterType === filter.id 
                                    ? 'bg-primary text-white shadow-sm' 
                                    : 'bg-gray-100 text-secondary-text hover:text-heading'
                                }`}
                              >
                                {filter.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Renders main overview table with all items */}
                        <div className="bg-white rounded-[28px] border border-[rgba(255,255,255,0.65)] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                          <div className="overflow-x-auto rounded-[18px]">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-gray-50 text-secondary-text text-[10px] uppercase font-bold border-b border-gray-100">
                                <tr>
                                  <th className="px-6 py-4">Endpoint</th>
                                  <th className="px-6 py-4">Original Destination URL</th>
                                  <th className="px-6 py-4 text-center">Clicks</th>
                                  <th className="px-6 py-4 text-center">Status</th>
                                  <th className="px-6 py-4 text-right">Inspection Action</th>
                                </tr>
                              </thead>
                              <motion.tbody 
                                key={`catalog-${searchQuery}-${filterType}-${processedLinks.length}`}
                                variants={containerVariants}
                                initial="hidden"
                                animate="show"
                                className="divide-y divide-gray-100 font-semibold text-heading"
                              >
                                {processedLinks.map((link) => {
                                  const isExpired = link.expiryDate ? new Date(link.expiryDate) < new Date() : false;
                                  return (
                                    <motion.tr 
                                      variants={itemVariants}
                                      key={link.id} 
                                      className="hover:bg-gray-50/50"
                                    >
                                      <td className="px-6 py-4">
                                        <span className="font-bold text-primary font-mono">/{link.alias || link.shortCode}</span>
                                        <span className="text-[10px] text-muted-text block mt-0.5">{link.title || 'SaaS Redirection'}</span>
                                      </td>
                                      <td className="px-6 py-4 max-w-[200px] truncate font-mono text-[11px] text-secondary-text">
                                        {link.longUrl}
                                      </td>
                                      <td className="px-6 py-4 text-center font-mono">
                                        {link.clicks}
                                      </td>
                                      <td className="px-6 py-4 text-center">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                                          isExpired ? 'bg-red-50 text-danger' : 'bg-emerald-50 text-emerald-600'
                                        }`}>
                                          {isExpired ? 'Expired' : 'Active Routing'}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 text-right">
                                        <button
                                          onClick={() => setSelectedLinkDetails(link)}
                                          className="inline-flex items-center gap-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-[10px] text-secondary-text font-bold cursor-pointer transition-all text-[11px]"
                                        >
                                          Inspect Report
                                          <ArrowUpRight className="h-3 w-3 text-primary" />
                                        </button>
                                      </td>
                                    </motion.tr>
                                  );
                                })}
                              </motion.tbody>
                            </table>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* PAGE 3: ANALYTICS */}
                {activeTab === 'analytics' && (
                  <AnalyticsView links={links} clicks={clicks} />
                )}

                {/* PAGE 4: QR CODES */}
                {activeTab === 'qrcodes' && (
                  <QRCodeManager links={links} onSelectLink={(link) => setSelectedLinkDetails(link)} />
                )}

                {/* PAGE 5: DEVELOPER API */}
                {activeTab === 'api' && (
                  <APIExplorer apiKeys={apiKeys.map(k => k.key)} />
                )}

                {/* PAGE 6: SETTINGS (Includes Subsections inside) */}
                {activeTab === 'settings' && (
                  <SettingsView 
                    apiKeys={apiKeys}
                    userProfile={userProfile}
                    isTrialMode={isTrialMode}
                    onAddApiKey={onAddApiKey}
                    onDeleteApiKey={onDeleteApiKey}
                    onUpgrade={onUpgrade}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          )}

         </div>
      </main>

      {/* FLOATING MOBILE BOTTOM NAVIGATION (iOS / Redesign Video Style) */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-sm bg-[#1A1226]/95 backdrop-blur-md rounded-[32px] border border-white/10 px-5 py-2.5 flex items-center justify-between shadow-[0_24px_48px_rgba(31,25,47,0.4)]">
        {[
          { id: 'dashboard', label: 'Console', icon: LayoutDashboard },
          { id: 'links', label: 'Links', icon: Link2 },
        ].map((tab) => {
          const TabIcon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSelectedLinkDetails(null);
              }}
              className={`flex flex-col items-center gap-1.5 py-1 px-3.5 rounded-2xl transition-all cursor-pointer ${
                isSelected ? 'text-[#EAB308]' : 'text-gray-400 hover:text-white'
              }`}
            >
              <TabIcon className={`h-5 w-5 ${isSelected ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span className="text-[9px] font-bold font-sans tracking-wide">{tab.label}</span>
            </button>
          );
        })}

        {/* Central Action Plus Button (Pulsing Amber/Gold background with Indented Ring structure) */}
        <div className="relative -top-5">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsCreateModalOpen(true)}
            className="w-14 h-14 bg-gradient-to-tr from-[#EAB308] to-[#FACC15] text-[#1E152C] rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(234,179,8,0.45)] cursor-pointer relative z-50 border-[5px] border-[#1A1226]"
          >
            <Plus className="h-6 w-6 stroke-[3]" />
          </motion.button>
          {/* External golden pulsing signal ring */}
          <span className="absolute -inset-1 rounded-full bg-[#EAB308]/20 animate-ping pointer-events-none -z-10"></span>
        </div>

        {[
          { id: 'analytics', label: 'Insights', icon: BarChart2 },
          { id: 'settings', label: 'Account', icon: Settings },
        ].map((tab) => {
          const TabIcon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSelectedLinkDetails(null);
              }}
              className={`flex flex-col items-center gap-1.5 py-1 px-3.5 rounded-2xl transition-all cursor-pointer ${
                isSelected ? 'text-[#EAB308]' : 'text-gray-400 hover:text-white'
              }`}
            >
              <TabIcon className={`h-5 w-5 ${isSelected ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span className="text-[9px] font-bold font-sans tracking-wide">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* CREATE NEW LINK TRIGGER MODAL */}
      <CreateLinkModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateLink={handleLinkCreateSubmit}
        isTrialMode={isTrialMode}
        currentLinksCount={links.length}
        onUpgrade={onUpgrade}
      />

    </div>
  );
}
