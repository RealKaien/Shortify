import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Mail, Lock, User, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile: { name: string; email: string; token: string }, isTrial: boolean) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSignUp && !name.trim()) {
      setError('Please provide your name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email ID.');
      return;
    }
    if (password.length < 5) {
      setError('Password must be at least 5 characters long.');
      return;
    }

    setLoading(true);

    try {
      const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
      const body = isSignUp ? { name, email, password } : { email, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      onSuccess({ name: data.user.name, email: data.user.email, token: data.token }, false);
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrial = () => {
    const randomGuestToken = `guest-${Math.random().toString(36).substring(2, 9)}`;
    onSuccess({ name: 'Guest Explorer', email: 'guest@trial.local', token: randomGuestToken }, true);
  };

  return (
    <div className="fixed inset-0 bg-[#0B0F19]/50 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        className="bg-white rounded-[28px] border border-[#e8e8ed] shadow-2xl max-w-md w-full overflow-hidden relative"
      >
        {/* Header decoration */}
        <div className="h-1 bg-[#1d1d1f]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-8">
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#2563EB] mb-2">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-2xl font-black font-display text-[#111827]">
              {isSignUp ? 'Create Branded Account' : 'Welcome Back'}
            </h3>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              Get detailed link performance analytics and unlimited URL redirects.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-[14px] text-xs font-semibold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    disabled={loading}
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50/70 border border-gray-200 rounded-[16px] text-xs font-semibold text-[#111827] focus:bg-white focus:border-[#2563EB] outline-none transition-all placeholder:text-gray-400 disabled:opacity-60"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Email ID</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  required
                  disabled={loading}
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50/70 border border-gray-200 rounded-[16px] text-xs font-semibold text-[#111827] focus:bg-white focus:border-[#2563EB] outline-none transition-all placeholder:text-gray-400 disabled:opacity-60"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  required
                  disabled={loading}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50/70 border border-gray-200 rounded-[16px] text-xs font-semibold text-[#111827] focus:bg-white focus:border-[#2563EB] outline-none transition-all placeholder:text-gray-400 disabled:opacity-60"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-[18px] shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{loading ? 'Processing...' : isSignUp ? 'Register & Unlock Account' : 'Sign In Now'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Toggle login modes */}
          <div className="text-center mt-4">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              disabled={loading}
              className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer disabled:opacity-50"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold text-gray-400">
              <span className="bg-white px-3">or try it instantly</span>
            </div>
          </div>

          {/* Guest Access Option */}
          <button
            onClick={handleTrial}
            disabled={loading}
            className="w-full py-3.5 bg-gray-50 hover:bg-gray-100 border border-gray-200/80 text-[#4B5563] text-xs font-bold rounded-[18px] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Continue as Guest (Trial Mode)</span>
          </button>
          <span className="text-[10px] text-gray-400 text-center block mt-2.5 font-medium">
            ⚠️ Trial mode limits creation to <strong className="text-gray-600">3 short links</strong>.
          </span>
        </div>
      </motion.div>
    </div>
  );
}
