import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, AlertCircle, Info, X
} from 'lucide-react';
import { 
  initialLinks, 
  initialClickEvents, 
  initialApiKeys 
} from './data/mockData';
import { Link, ClickEvent, ApiKey } from './types';
import { toast } from './lib/toast';

// Import core modules
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import RedirectionHandler from './components/RedirectionHandler';
import AuthModal from './components/AuthModal';

export default function App() {
  // Sync states with localStorage so changes persist across reloads
  const [links, setLinks] = useState<Link[]>(() => {
    const saved = localStorage.getItem('shortify_links_v3');
    return saved ? JSON.parse(saved) : initialLinks;
  });

  const [clicks, setClicks] = useState<ClickEvent[]>(() => {
    const saved = localStorage.getItem('shortify_clicks_v3');
    return saved ? JSON.parse(saved) : initialClickEvents;
  });

  const [apiKeys, setApiKeys] = useState<ApiKey[]>(() => {
    const saved = localStorage.getItem('shortify_api_keys_v3');
    return saved ? JSON.parse(saved) : initialApiKeys;
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem('shortify_logged_in_v3');
    return saved ? saved === 'true' : false;
  });

  const [userProfile, setUserProfile] = useState<{ name: string; email: string } | null>(() => {
    const saved = localStorage.getItem('shortify_user_profile_v3');
    return saved ? JSON.parse(saved) : null;
  });

  const [isTrialMode, setIsTrialMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('shortify_is_trial_v3');
    return saved ? saved === 'true' : false;
  });

  // Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Client Routing state
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Toast Notification State
  const [activeToast, setActiveToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Listen to global toast events
  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type: 'success' | 'info' | 'error' }>;
      if (customEvent.detail) {
        setActiveToast(customEvent.detail);
      }
    };
    window.addEventListener('shortify-toast' as any, handleToastEvent);
    return () => window.removeEventListener('shortify-toast' as any, handleToastEvent);
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  // Sync state modifications to localStorage
  useEffect(() => {
    localStorage.setItem('shortify_links_v3', JSON.stringify(links));
  }, [links]);

  useEffect(() => {
    localStorage.setItem('shortify_clicks_v3', JSON.stringify(clicks));
  }, [clicks]);

  useEffect(() => {
    localStorage.setItem('shortify_api_keys_v3', JSON.stringify(apiKeys));
  }, [apiKeys]);

  useEffect(() => {
    localStorage.setItem('shortify_logged_in_v3', isLoggedIn ? 'true' : 'false');
  }, [isLoggedIn]);

  useEffect(() => {
    if (userProfile) {
      localStorage.setItem('shortify_user_profile_v3', JSON.stringify(userProfile));
    } else {
      localStorage.removeItem('shortify_user_profile_v3');
    }
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('shortify_is_trial_v3', isTrialMode ? 'true' : 'false');
  }, [isTrialMode]);

  // Intercept standard window navigation to update current path without full-page reloads
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // 1. Direct short link click logger (creates random realistic analytics on the fly!)
  const handleLogClick = (linkId: string) => {
    const countries = ['United States', 'United Kingdom', 'Germany', 'Japan', 'Canada', 'India', 'France', 'Australia'];
    const cities: Record<string, string[]> = {
      'United States': ['San Francisco', 'New York', 'Seattle', 'Austin'],
      'United Kingdom': ['London', 'Manchester'],
      'Germany': ['Berlin', 'Munich'],
      'Japan': ['Tokyo', 'Osaka'],
      'Canada': ['Toronto', 'Vancouver'],
      'India': ['Bangalore', 'Mumbai'],
      'France': ['Paris'],
      'Australia': ['Sydney'],
    };
    const devices = ['Desktop', 'Mobile', 'Tablet'];
    const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge'];
    const oss = ['macOS', 'iOS', 'Windows', 'Android', 'Linux'];
    const referrers = ['LinkedIn', 'Twitter/X', 'GitHub', 'Google', 'HackerNews', 'Direct', 'ProductHunt', 'Newsletter'];

    const country = countries[Math.floor(Math.random() * countries.length)];
    const countryCities = cities[country] || ['Generic City'];
    const city = countryCities[Math.floor(Math.random() * countryCities.length)];

    const newClick: ClickEvent = {
      id: `click-${Math.random().toString(36).substring(2, 9)}`,
      linkId,
      timestamp: new Date().toISOString(),
      country,
      city,
      device: devices[Math.floor(Math.random() * devices.length)],
      browser: browsers[Math.floor(Math.random() * browsers.length)],
      os: oss[Math.floor(Math.random() * oss.length)],
      referrer: referrers[Math.random() > 0.3 ? Math.floor(Math.random() * referrers.length) : 5],
    };

    // Append new click and increment target click stats
    setClicks(prev => [newClick, ...prev]);
    setLinks(prev => prev.map(l => l.id === linkId ? { ...l, clicks: l.clicks + 1 } : l));
  };

  // 2. Link generators action
  const handleAddLink = (newLinkData: Omit<Link, 'id' | 'clicks' | 'createdAt' | 'qrCodeUrl' | 'shortCode'>) => {
    // Prevent exceeding limits in trial mode
    if (isTrialMode && links.length >= 3) {
      toast.error('Limit reached! Trial mode is capped at 3 links. Register a free account to unlock unlimited creations.');
      return;
    }

    const shortCode = newLinkData.alias || Math.random().toString(36).substring(2, 8);
    
    const newLink: Link = {
      ...newLinkData,
      id: `link-${Math.random().toString(36).substring(2, 9)}`,
      shortCode,
      clicks: 0,
      createdAt: new Date().toISOString(),
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
        `${window.location.origin}/s/${newLinkData.alias || shortCode}`
      )}`
    };

    setLinks(prev => [newLink, ...prev]);
    toast.success(`Short link /${shortCode} generated successfully!`);
  };

  const handleUpdateLink = (linkId: string, updatedFields: Partial<Link>) => {
    setLinks(prev => prev.map(l => l.id === linkId ? { ...l, ...updatedFields } : l));
    toast.success('Link preferences updated.');
  };

  const handleDeleteLink = (linkId: string) => {
    setLinks(prev => prev.filter(l => l.id !== linkId));
    setClicks(prev => prev.filter(c => c.linkId !== linkId));
    toast.info('Link deleted successfully.');
  };

  // 3. API Credentials action
  const handleAddApiKey = (name: string) => {
    const hex = Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join('');
    const newKey: ApiKey = {
      id: `key-${Math.random().toString(36).substring(2, 9)}`,
      name,
      key: `sh_live_${hex}`,
      createdAt: new Date().toISOString()
    };
    setApiKeys(prev => [newKey, ...prev]);
    toast.success(`API Key "${name}" generated!`);
  };

  const handleDeleteApiKey = (id: string) => {
    setApiKeys(prev => prev.filter(k => k.id !== id));
    toast.info('API Key revoked.');
  };

  const handleAuthSuccess = (profile: { name: string; email: string }, isTrial: boolean) => {
    setUserProfile(profile);
    setIsTrialMode(isTrial);
    setIsLoggedIn(true);
    setIsAuthModalOpen(false);
    toast.success(`Welcome back, ${profile.name}!`);
  };

  const handleSignOut = () => {
    setIsLoggedIn(false);
    setUserProfile(null);
    setIsTrialMode(false);
    localStorage.removeItem('shortify_user_profile_v3');
    localStorage.removeItem('shortify_is_trial_v3');
    localStorage.removeItem('shortify_logged_in_v3');
    toast.info('Signed out successfully.');
  };

  // Scroll helper for landing page anchors
  const handleScrollToSection = (sectionId: string) => {
    navigateTo('/');
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // ROUTER SELECTION LOGIC
  const isShortLinkRoute = currentPath.startsWith('/s/');

  if (isShortLinkRoute) {
    return (
      <RedirectionHandler 
        links={links}
        currentPath={currentPath}
        onLogClick={handleLogClick}
        onGoHome={() => navigateTo('/')}
      />
    );
  }

  return (
    <div className="font-sans antialiased text-heading">
      <AnimatePresence mode="wait">
        {!isLoggedIn ? (
          /* Landing page mode with sticky header */
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Navbar 
              onLaunchDashboard={() => setIsAuthModalOpen(true)}
              onScrollToSection={handleScrollToSection}
            />
            <LandingPage onLaunchDashboard={() => setIsAuthModalOpen(true)} />
          </motion.div>
        ) : (
          /* SaaS Console Panel Mode */
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Dashboard 
              links={links}
              clicks={clicks}
              apiKeys={apiKeys}
              userProfile={userProfile}
              isTrialMode={isTrialMode}
              onAddLink={handleAddLink}
              onUpdateLink={handleUpdateLink}
              onDeleteLink={handleDeleteLink}
              onAddApiKey={handleAddApiKey}
              onDeleteApiKey={handleDeleteApiKey}
              onSignOut={handleSignOut}
              onUpgrade={() => setIsAuthModalOpen(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Toast Notification Hub */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(4px)' }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 bg-white/80 backdrop-blur-md border border-gray-200/50 p-4 rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.12)] max-w-sm"
          >
            <div className={`p-2 rounded-xl shrink-0 ${
              activeToast.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
              activeToast.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' :
              'bg-blue-50 text-blue-600 border border-blue-100'
            }`}>
              {activeToast.type === 'success' && <CheckCircle2 className="h-5 w-5" />}
              {activeToast.type === 'error' && <AlertCircle className="h-5 w-5" />}
              {activeToast.type === 'info' && <Info className="h-5 w-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-heading leading-tight">
                {activeToast.type === 'success' ? 'Action Completed' : activeToast.type === 'error' ? 'System Notice' : 'Information'}
              </p>
              <p className="text-[11px] text-secondary-text mt-1 leading-relaxed font-medium">
                {activeToast.message}
              </p>
            </div>
            <button
              onClick={() => setActiveToast(null)}
              className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
