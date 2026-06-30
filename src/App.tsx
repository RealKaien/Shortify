import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, AlertCircle, Info, X
} from 'lucide-react';
import { Link, ClickEvent, ApiKey } from './types';
import { toast } from './lib/toast';

// Import core modules
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import RedirectionHandler from './components/RedirectionHandler';
import AuthModal from './components/AuthModal';

export default function App() {
  const [links, setLinks] = useState<Link[]>([]);
  const [clicks, setClicks] = useState<ClickEvent[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('shortify_token_v3') || null;
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
    return saved ? saved === 'true' : true;
  });

  // Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Client Routing state
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Toast Notification State
  const [activeToast, setActiveToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Initialize/sync guest token if no token exists on first load
  useEffect(() => {
    if (!token) {
      const existing = localStorage.getItem('shortify_token_v3');
      if (existing) {
        setToken(existing);
      } else {
        const guestToken = `guest-${Math.random().toString(36).substring(2, 9)}`;
        setToken(guestToken);
        setIsTrialMode(true);
        localStorage.setItem('shortify_token_v3', guestToken);
        localStorage.setItem('shortify_is_trial_v3', 'true');
      }
    }
  }, [token]);

  // Sync state modifications to localStorage
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

  // Load user data from the server whenever token or trial state changes
  useEffect(() => {
    if (!token) return;

    const headers = { 'Authorization': `Bearer ${token}` };

    fetch('/api/links', { headers })
      .then(res => {
        if (!res.ok) throw new Error("Failed to load links");
        return res.json();
      })
      .then(data => setLinks(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error fetching links:", err));

    fetch('/api/clicks', { headers })
      .then(res => {
        if (!res.ok) throw new Error("Failed to load clicks");
        return res.json();
      })
      .then(data => setClicks(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error fetching clicks:", err));

    fetch('/api/api-keys', { headers })
      .then(res => {
        if (!res.ok) return []; // Fallback for guest profiles
        return res.json();
      })
      .then(data => setApiKeys(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error fetching API keys:", err));
  }, [token, isTrialMode]);

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

  // Sync dashboard data after redirects
  const handleLogClick = (linkId: string) => {
    if (!token) return;
    const headers = { 'Authorization': `Bearer ${token}` };
    
    // Refetch links & clicks
    fetch('/api/links', { headers })
      .then(res => res.json())
      .then(data => setLinks(Array.isArray(data) ? data : []));
    
    fetch('/api/clicks', { headers })
      .then(res => res.json())
      .then(data => setClicks(Array.isArray(data) ? data : []));
  };

  // Create a shortened link on the server
  const handleAddLink = async (newLinkData: Omit<Link, 'id' | 'clicks' | 'createdAt' | 'qrCodeUrl' | 'shortCode'>) => {
    if (isTrialMode && links.length >= 3) {
      toast.error('Limit reached! Guest mode is capped at 3 links. Register a free account to unlock unlimited creations.');
      return;
    }

    // Strict URL validation regex
    const urlRegex = /^(https?:\/\/)(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{2,10}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/i;
    if (!urlRegex.test(newLinkData.longUrl)) {
      toast.error('Please enter a valid, well-formed URL with a protocol (e.g., https://example.com). Inputs like "a" or "domain.com" are not allowed.');
      return;
    }

    // Check if custom alias already exists in links state
    if (newLinkData.alias) {
      const aliasLower = newLinkData.alias.toLowerCase();
      const conflict = links.some(
        link => (link.alias && link.alias.toLowerCase() === aliasLower) || 
                (link.shortCode && link.shortCode.toLowerCase() === aliasLower)
      );
      if (conflict) {
        toast.error(`The custom alias "${newLinkData.alias}" is already taken.`);
        return;
      }
    }

    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newLinkData)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to create short link');
      }

      const createdLink = await response.json();
      setLinks(prev => [createdLink, ...prev]);
      toast.success(`Short link /${createdLink.shortCode} generated successfully!`);
    } catch (error: any) {
      toast.error(error.message || 'An error occurred.');
    }
  };

  // Update a link on the server
  const handleUpdateLink = async (linkId: string, updatedFields: Partial<Link>) => {
    try {
      const response = await fetch(`/api/links/${linkId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedFields)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to update link preferences');
      }

      const updatedLink = await response.json();
      setLinks(prev => prev.map(l => l.id === linkId ? updatedLink : l));
      toast.success('Link preferences updated.');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Delete a link on the server
  const handleDeleteLink = async (linkId: string) => {
    try {
      const response = await fetch(`/api/links/${linkId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to delete link');
      }

      setLinks(prev => prev.filter(l => l.id !== linkId));
      setClicks(prev => prev.filter(c => c.linkId !== linkId));
      toast.info('Link deleted successfully.');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Generate an API credential on the server
  const handleAddApiKey = async (name: string) => {
    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to generate API credential');
      }

      const createdKey = await response.json();
      setApiKeys(prev => [createdKey, ...prev]);
      toast.success(`API Key "${name}" generated!`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Revoke an API credential on the server
  const handleDeleteApiKey = async (id: string) => {
    try {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to revoke API credential');
      }

      setApiKeys(prev => prev.filter(k => k.id !== id));
      toast.info('API Key revoked.');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleAuthSuccess = (profile: { name: string; email: string; token: string }, isTrial: boolean) => {
    setToken(profile.token);
    setUserProfile({ name: profile.name, email: profile.email });
    setIsTrialMode(isTrial);
    setIsLoggedIn(true);
    setIsAuthModalOpen(false);

    localStorage.setItem('shortify_token_v3', profile.token);
    localStorage.setItem('shortify_logged_in_v3', 'true');
    localStorage.setItem('shortify_user_profile_v3', JSON.stringify({ name: profile.name, email: profile.email }));
    localStorage.setItem('shortify_is_trial_v3', isTrial ? 'true' : 'false');

    toast.success(`Welcome back, ${profile.name}!`);
  };

  const handleSignOut = () => {
    // Revert back to a clean Guest/Trial mode with a fresh guest token
    const guestToken = `guest-${Math.random().toString(36).substring(2, 9)}`;
    setToken(guestToken);
    setUserProfile(null);
    setIsTrialMode(true);
    setIsLoggedIn(false);

    localStorage.setItem('shortify_token_v3', guestToken);
    localStorage.setItem('shortify_logged_in_v3', 'false');
    localStorage.removeItem('shortify_user_profile_v3');
    localStorage.setItem('shortify_is_trial_v3', 'true');

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
            <LandingPage 
              onLaunchDashboard={() => setIsAuthModalOpen(true)} 
              token={token}
              onLinkCreated={(newLink) => setLinks(prev => [newLink, ...prev])}
            />
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
