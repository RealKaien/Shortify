import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, Key, AlertTriangle, ArrowRight, Compass, Home, HelpCircle, Lock } from 'lucide-react';
import { Link, ClickEvent } from '../types';

interface RedirectionHandlerProps {
  links: Link[];
  currentPath: string;
  onLogClick: (linkId: string, geoData?: Partial<ClickEvent>) => void;
  onGoHome: () => void;
}

export default function RedirectionHandler({ links, currentPath, onLogClick, onGoHome }: RedirectionHandlerProps) {
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [countdown, setCountdown] = useState(2); // 2 second premium loading countdown

  // Parse code from path: e.g. /s/react19 -> react19
  const code = currentPath.replace('/s/', '').split('?')[0];

  // Find corresponding link
  const link = links.find(l => l.alias === code || l.shortCode === code);

  // Check Expiration Status
  const isExpired = link?.expiryDate ? new Date(link.expiryDate) < new Date() : false;

  useEffect(() => {
    // If the link is valid, not expired, and not password protected, begin automatic countdown redirection
    if (link && !isExpired && !link.isProtected) {
      setRedirecting(true);
      
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            handleFinalRedirect();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [link, isExpired]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!link) return;

    if (passwordInput === link.password) {
      setPasswordError(false);
      setRedirecting(true);
      
      // Countdown for password approved
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            handleFinalRedirect();
            return 0;
          }
          return prev - 1;
        });
      }, 800);
    } else {
      setPasswordError(true);
      setPasswordInput('');
    }
  };

  const handleFinalRedirect = () => {
    if (!link) return;
    
    // Log the click event (simulate randomized geolocations/devices for metrics)
    onLogClick(link.id);

    // Perform native window redirection
    window.location.replace(link.longUrl);
  };

  // 1. Case: Link Not Found
  if (!link) {
    return (
      <div className="min-h-screen bg-[#F4F7FF] flex items-center justify-center p-6 text-center relative font-sans">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rose-400/10 rounded-full blur-3xl -z-10" />

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white rounded-[28px] border border-[rgba(255,255,255,0.65)] p-8 shadow-xl space-y-6"
        >
          <div className="h-16 w-16 bg-red-50 text-danger rounded-full flex items-center justify-center mx-auto border border-red-100">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black font-display text-heading">404 - Link Not Found</h1>
            <p className="text-xs text-secondary-text leading-relaxed">
              We searched our global SaaS routing tables but couldn't locate code <strong className="font-mono text-primary">/{code}</strong>.
            </p>
          </div>
          
          <button
            onClick={onGoHome}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold py-3.5 rounded-[18px] shadow-md transition-all cursor-pointer"
          >
            <Home className="h-4 w-4" />
            Go to Landing Page
          </button>
        </motion.div>
      </div>
    );
  }

  // 2. Case: Link Expired
  if (isExpired) {
    return (
      <div className="min-h-screen bg-[#F4F7FF] flex items-center justify-center p-6 text-center relative font-sans">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl -z-10" />

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white rounded-[28px] border border-[rgba(255,255,255,0.65)] p-8 shadow-xl space-y-6"
        >
          <div className="h-16 w-16 bg-amber-50 text-warning rounded-full flex items-center justify-center mx-auto border border-amber-100">
            <AlertTriangle className="h-8 w-8 animate-bounce" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black font-display text-heading">Link Route Expired</h1>
            <p className="text-xs text-secondary-text leading-relaxed">
              The redirection route for <strong className="font-mono text-primary">/{code}</strong> expired on {new Date(link.expiryDate!).toLocaleDateString()}. Contact the brand owner for an updated routing path.
            </p>
          </div>
          
          <button
            onClick={onGoHome}
            className="w-full flex items-center justify-center gap-2 bg-heading hover:bg-black text-white text-xs font-bold py-3.5 rounded-[18px] shadow-md transition-all cursor-pointer"
          >
            Return Home
          </button>
        </motion.div>
      </div>
    );
  }

  // 3. Case: Password Protected Input
  if (link.isProtected && !redirecting) {
    return (
      <div className="min-h-screen bg-[#F4F7FF] flex items-center justify-center p-6 relative font-sans">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white rounded-[28px] border border-[rgba(255,255,255,0.65)] p-8 shadow-xl space-y-6"
        >
          <div className="text-center space-y-3">
            <div className="h-14 w-14 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto border border-blue-100 shadow-sm">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display text-heading">Enter Access Code</h1>
              <p className="text-xs text-secondary-text mt-1 leading-relaxed">
                Redirection target is password protected by the brand administrator.
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-secondary-text">Authorization Code</label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-text" />
                <input
                  type="password"
                  required
                  placeholder="Enter security access code"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-[18px] bg-gray-50 border border-gray-200 outline-none text-sm text-heading focus:bg-white focus:border-primary transition-all"
                />
              </div>
              {passwordError && <p className="text-[10px] font-bold text-danger pl-1">Incorrect access code. Please try again.</p>}
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold py-3.5 rounded-[18px] shadow-md transition-all cursor-pointer"
            >
              Verify & Proceed
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="text-center pt-2">
            <button onClick={onGoHome} className="text-xs font-bold text-secondary-text hover:text-primary transition-colors cursor-pointer">
              Go back home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // 4. Case: Redirecting Loading
  return (
    <div className="min-h-screen bg-[#F4F7FF] flex items-center justify-center p-6 text-center relative font-sans">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full bg-white rounded-[28px] border border-[rgba(255,255,255,0.65)] p-8 shadow-xl space-y-6"
      >
        <div className="relative flex items-center justify-center h-20 w-20 mx-auto">
          {/* Pulsing ring */}
          <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          <div className="h-16 w-16 bg-primary text-white rounded-full flex items-center justify-center border border-primary/20 shadow-md">
            <Compass className="h-8 w-8 animate-spin" />
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono font-black text-primary uppercase tracking-widest block">SECURE REDIRECTION EN ROUTE</span>
          <h1 className="text-xl font-bold font-display text-heading">Navigating to target</h1>
          <p className="text-xs text-secondary-text leading-relaxed">
            Shortify is securely routing you to:
          </p>
          <div className="p-3 bg-gray-50 rounded-[14px] border border-gray-100 font-mono text-xs text-heading break-all font-semibold">
            {link.longUrl}
          </div>
        </div>

        <div className="text-xs text-muted-text">
          Automatic redirection executing in <strong className="text-primary font-bold">{countdown}s</strong>...
        </div>
      </motion.div>
    </div>
  );
}
