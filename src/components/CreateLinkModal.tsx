import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Globe, Link2, ShieldAlert, Key, Calendar, QrCode, Tag, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from '../types';
import { toast } from '../lib/toast';
import { isValidUrl } from '../lib/validation';

interface CreateLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateLink: (newLink: Omit<Link, 'id' | 'clicks' | 'createdAt' | 'qrCodeUrl' | 'shortCode'>) => void;
  isTrialMode: boolean;
  currentLinksCount: number;
  onUpgrade: () => void;
}

export default function CreateLinkModal({ 
  isOpen, 
  onClose, 
  onCreateLink,
  isTrialMode,
  currentLinksCount,
  onUpgrade
}: CreateLinkModalProps) {
  const [longUrl, setLongUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [password, setPassword] = useState('');
  const [isProtected, setIsProtected] = useState(false);
  const [generateQR, setGenerateQR] = useState(true);
  const [isSuggesting, setIsSuggesting] = useState(false);
  
  // UTM Builder State
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [showUTM, setShowUTM] = useState(false);

  if (!isOpen) return null;

  const isLimitReached = isTrialMode && currentLinksCount >= 3;

  const getUtmAppendedUrl = (url: string) => {
    if (!url) return '';
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      if (utmSource) urlObj.searchParams.set('utm_source', utmSource);
      if (utmMedium) urlObj.searchParams.set('utm_medium', utmMedium);
      if (utmCampaign) urlObj.searchParams.set('utm_campaign', utmCampaign);
      return urlObj.toString();
    } catch {
      let appended = url;
      const params = [];
      if (utmSource) params.push(`utm_source=${utmSource}`);
      if (utmMedium) params.push(`utm_medium=${utmMedium}`);
      if (utmCampaign) params.push(`utm_campaign=${utmCampaign}`);
      if (params.length > 0) {
        appended += (url.includes('?') ? '&' : '?') + params.join('&');
      }
      return appended;
    }
  };

  const handleGeminiSuggest = async () => {
    if (!longUrl) {
      toast.info("Please enter a destination URL first!");
      return;
    }

    setIsSuggesting(true);
    toast.info("Gemini is analyzing the destination link...");

    try {
      let finalLongUrl = longUrl.trim();
      if (!/^https?:\/\//i.test(finalLongUrl)) {
        finalLongUrl = `https://${finalLongUrl}`;
      }

      const response = await fetch('/api/gemini/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ longUrl: finalLongUrl }),
      });

      if (!response.ok) throw new Error("Gemini suggestions failed");
      const data = await response.json();

      if (data.aliases && data.aliases.length > 0) {
        setAlias(data.aliases[0]);
      }
      if (data.title) {
        setTitle(data.title);
      }
      if (data.description) {
        setDescription(data.description);
      }

      toast.success("Gemini generated smart link suggestions!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch suggestions from Gemini.");
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!longUrl) return;

    if (!isValidUrl(longUrl)) {
      toast.error('Please enter a valid, well-formed URL with a protocol (e.g., https://example.com). Inputs like "a" or "domain.com" are not allowed.');
      return;
    }

    let finalLongUrl = longUrl.trim();

    if (utmSource || utmMedium || utmCampaign) {
      finalLongUrl = getUtmAppendedUrl(finalLongUrl);
    }

    onCreateLink({
      longUrl: finalLongUrl,
      alias: alias.trim() || undefined,
      title: title.trim() || undefined,
      description: description.trim() || undefined,
      expiryDate: expiryDate || undefined,
      password: isProtected ? password : undefined,
      isProtected: isProtected && !!password,
      utmSource: utmSource || undefined,
      utmMedium: utmMedium || undefined,
      utmCampaign: utmCampaign || undefined,
    });

    setLongUrl('');
    setAlias('');
    setTitle('');
    setDescription('');
    setExpiryDate('');
    setPassword('');
    setIsProtected(false);
    setGenerateQR(true);
    setUtmSource('');
    setUtmMedium('');
    setUtmCampaign('');
    setShowUTM(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-heading/40 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="relative w-full max-w-lg overflow-hidden rounded-[28px] border border-[rgba(255,255,255,0.7)] bg-white p-8 shadow-[0_20px_50px_rgba(0,0,0,0.12)] z-10 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-gray-100 mb-6">
            <div>
              <h2 className="text-xl font-bold font-display text-heading">Create Shortened Link</h2>
              <p className="text-xs text-secondary-text mt-0.5">Configure redirects, UTM parameters, and security settings.</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 text-muted-text hover:text-heading transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form Content / Limit reached check */}
          {isLimitReached ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 space-y-6">
              <div className="p-4 bg-slate-50 text-slate-800 rounded-[24px] border border-slate-200 flex items-center justify-center">
                <ShieldAlert className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-heading font-display">Guest Trial Limit Reached</h3>
                <p className="text-xs text-secondary-text max-w-sm leading-relaxed">
                  Trial mode allows you to create up to <strong className="text-heading">3 shortened links</strong>. 
                  Unlock a free registered account to access unlimited links, custom URL routing aliases, and full performance reports.
                </p>
              </div>

              <div className="w-full flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-[18px] bg-gray-50 border border-gray-200 hover:bg-gray-100 text-xs font-bold text-secondary-text transition-all cursor-pointer"
                >
                  Close Window
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onUpgrade();
                  }}
                  className="flex-1 py-3.5 rounded-[18px] bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-blue-500/10 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Register Free Account</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 overflow-y-auto pr-2 flex-1 scrollbar-thin">
              {/* Long URL */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-heading flex items-center gap-1.5">
                    <Globe className="h-4 w-4 text-primary" />
                    Destination URL
                  </label>
                  
                  {/* Gemini Magic Auto-complete Button */}
                  <button
                    type="button"
                    onClick={handleGeminiSuggest}
                    disabled={!longUrl || isSuggesting}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-[12px] text-[10px] font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3 animate-pulse" />
                    <span>{isSuggesting ? 'Analyzing...' : 'Gemini Smart Fill'}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="https://example.com/very-long-utm-campaign-link"
                    value={longUrl}
                    onChange={(e) => setLongUrl(e.target.value)}
                    className="w-full pl-5 pr-5 py-3.5 rounded-[18px] bg-gray-50 border border-gray-200 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-sm outline-none placeholder:text-muted-text text-heading"
                  />
                </div>
              </div>

              {/* Custom Alias */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-heading flex items-center gap-1.5">
                  <Link2 className="h-4 w-4 text-primary" />
                  Custom Alias <span className="text-xs font-normal text-muted-text">(Optional)</span>
                </label>
                <div className="flex items-center">
                  <span className="bg-gray-100 border border-r-0 border-gray-200 px-4 py-3.5 rounded-l-[18px] text-sm text-secondary-text font-mono">
                    {window.location.host}/s/
                  </span>
                  <input
                    type="text"
                    placeholder="summer-promo"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
                    className="w-full px-4 py-3.5 rounded-r-[18px] bg-gray-50 border border-gray-200 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-sm outline-none placeholder:text-muted-text text-heading"
                  />
                </div>
              </div>

              {/* Title & Description Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Link Title (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Product Page"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-[16px] bg-gray-50 border border-gray-200 focus:border-primary focus:bg-white transition-all text-xs outline-none text-heading"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Description (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Ads campaign redirect"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-[16px] bg-gray-50 border border-gray-200 focus:border-primary focus:bg-white transition-all text-xs outline-none text-heading"
                  />
                </div>
              </div>

              {/* UTM Parameters Toggle Panel */}
              <div className="border border-gray-100 rounded-[20px] overflow-hidden bg-gray-50/50">
                <button
                  type="button"
                  onClick={() => setShowUTM(!showUTM)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50/80 hover:bg-gray-100/60 transition-colors text-sm font-semibold text-heading"
                >
                  <span className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    UTM Campaign Builder
                  </span>
                  <span className="text-xs text-primary font-medium">
                    {showUTM ? 'Hide' : 'Show UTM Builder'}
                  </span>
                </button>

                <AnimatePresence>
                  {showUTM && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="p-4 border-t border-gray-100 space-y-3.5"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-secondary-text">UTM Source</label>
                          <input
                            type="text"
                            placeholder="google, newsletter"
                            value={utmSource}
                            onChange={(e) => setUtmSource(e.target.value)}
                            className="w-full px-3 py-2 rounded-[12px] border border-gray-200 bg-white text-xs text-heading outline-none focus:border-primary"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-secondary-text">UTM Medium</label>
                          <input
                            type="text"
                            placeholder="cpc, email, social"
                            value={utmMedium}
                            onChange={(e) => setUtmMedium(e.target.value)}
                            className="w-full px-3 py-2 rounded-[12px] border border-gray-200 bg-white text-xs text-heading outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-secondary-text">Campaign Name</label>
                        <input
                          type="text"
                          placeholder="summer_sale_2026"
                          value={utmCampaign}
                          onChange={(e) => setUtmCampaign(e.target.value)}
                          className="w-full px-3 py-2 rounded-[12px] border border-gray-200 bg-white text-xs text-heading outline-none focus:border-primary"
                        />
                      </div>
                      
                      {/* Live Preview */}
                      {longUrl && (utmSource || utmMedium || utmCampaign) && (
                        <div className="bg-primary/5 p-3 rounded-[12px] border border-primary/10">
                          <span className="text-[10px] font-bold text-primary uppercase block tracking-wider mb-1">Generated URL Preview</span>
                          <p className="text-[11px] font-mono text-secondary-text break-all">
                            {getUtmAppendedUrl(longUrl)}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Advanced Settings Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Expiry Date */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-heading flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-primary" />
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-[18px] bg-gray-50 border border-gray-200 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-sm outline-none text-heading cursor-pointer"
                  />
                </div>

                {/* Password Toggle Card */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-heading flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Key className="h-4 w-4 text-primary" />
                      Security Key
                    </span>
                    <input
                      type="checkbox"
                      checked={isProtected}
                      onChange={(e) => setIsProtected(e.target.checked)}
                      className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                    />
                  </label>
                  <input
                    type="password"
                    disabled={!isProtected}
                    placeholder="Enter access code"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-4 py-3 rounded-[18px] border transition-all text-sm outline-none text-heading ${
                      isProtected 
                        ? 'bg-gray-50 border-gray-200 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10' 
                        : 'bg-gray-100/50 border-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>

              {/* Dynamic QR Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-[20px] border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-[12px] shadow-sm border border-gray-100">
                    <QrCode className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-heading">Generate Dynamic QR Code</h4>
                    <p className="text-[11px] text-secondary-text">Instantly create a high-res SVG download for print media.</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generateQR}
                    onChange={(e) => setGenerateQR(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* Submit & Cancel Buttons */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-[18px] bg-gray-50 border border-gray-200 hover:bg-gray-100 text-sm font-semibold text-heading transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="flex-1 py-3.5 rounded-[18px] bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-[0_4px_14px_rgba(37,99,235,0.3)] transition-all cursor-pointer"
                >
                  Generate Link
                </motion.button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
