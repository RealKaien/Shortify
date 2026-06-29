import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Link2, BarChart2, QrCode, Terminal, Settings, 
  Search, Filter, Plus, ShieldAlert, Sparkles, 
  ChevronRight, ArrowUpRight, Copy, Check, Eye, Trash2, LogOut, Info, Star, Menu, X
} from 'lucide-react';
import { Link, ClickEvent, ApiKey } from '../types';
import { toast } from '../lib/toast';

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

                    {/* Latest Links Catalog Quick Table */}
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
                          <tbody className="divide-y divide-gray-100 font-semibold text-heading">
                            {paginatedLinks.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-secondary-text">
                                  No short links found matching filters. Generate a new link to begin!
                                </td>
                              </tr>
                            ) : (
                              paginatedLinks.map((link) => {
                                const isCopied = copiedLinkId === link.id;
                                return (
                                  <tr key={link.id} className="hover:bg-gray-50/50 transition-colors">
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
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
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
                  </div>
                )}

                {/* PAGE 2: CATALOG LINKS */}
                {activeTab === 'links' && (
                  <div className="space-y-6">
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
                          <tbody className="divide-y divide-gray-100 font-semibold text-heading">
                            {processedLinks.map((link) => {
                              const isExpired = link.expiryDate ? new Date(link.expiryDate) < new Date() : false;
                              return (
                                <tr key={link.id} className="hover:bg-gray-50/50">
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
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
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
