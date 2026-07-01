import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Lock, Bell, Shield, Check, Trash2, Plus, Sparkles, Copy, Eye, EyeOff, Server, Info, AlertTriangle, Key, ChevronRight
} from 'lucide-react';
import { ApiKey } from '../types';

interface SettingsViewProps {
  apiKeys: ApiKey[];
  userProfile: { name: string; email: string } | null;
  isTrialMode: boolean;
  onAddApiKey: (name: string) => void;
  onDeleteApiKey: (id: string) => void;
  onUpgrade: () => void;
}

type ActiveTab = 'profile' | 'security' | 'keys' | 'notifications';

export default function SettingsView({ 
  apiKeys, 
  userProfile,
  isTrialMode,
  onAddApiKey, 
  onDeleteApiKey,
  onUpgrade
}: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('profile');
  
  // Local Profile Form State
  const [name, setName] = useState(userProfile?.name || 'Guest Explorer');
  const [email, setEmail] = useState(userProfile?.email || 'guest@trial.local');
  const [role, setRole] = useState(isTrialMode ? 'Trial Guest User' : 'Standard SaaS Member');
  
  // Local API Key State
  const [newKeyName, setNewKeyName] = useState('');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [visibleKeyId, setVisibleKeyId] = useState<string | null>(null);

  // Success banners
  const [successMsg, setSuccessMsg] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('Profile changes saved successfully (stored in browser state).');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleCreateApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    onAddApiKey(newKeyName.trim());
    setNewKeyName('');
    setSuccessMsg('API access token generated successfully.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleCopyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  return (
    <div id="settings-portal-view" className="grid grid-cols-1 md:grid-cols-4 gap-8">
      {/* Sidebar Tabs */}
      <div className="md:col-span-1 space-y-2">
        {[
          { id: 'profile', label: 'My Profile', icon: User },
          { id: 'security', label: 'Security & Password', icon: Shield },
          { id: 'keys', label: 'Developer API Keys', icon: Key },
          { id: 'notifications', label: 'System Alerts', icon: Bell },
        ].map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-[16px] text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-[0_4px_14px_rgba(37,99,235,0.25)]'
                  : 'bg-white hover:bg-gray-50 text-secondary-text border border-transparent hover:border-gray-100'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <IconComponent className="h-4 w-4" />
                {tab.label}
              </span>
              <ChevronRight className={`h-3 w-3 opacity-60 transition-transform ${activeTab === tab.id ? 'translate-x-1' : ''}`} />
            </button>
          );
        })}
      </div>

      {/* Main Settings Panel Area */}
      <div className="md:col-span-3 bg-white rounded-[28px] border border-[rgba(255,255,255,0.65)] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] min-h-[500px]">
        {successMsg && (
          <div className="mb-6 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-xl text-center">
            {successMsg}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* 1. Profile Panel */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold font-display text-heading">Public Profile</h3>
                  <p className="text-xs text-secondary-text mt-0.5">Manage your personal identities, brand names, and account credentials.</p>
                </div>

                <div className="flex items-center gap-6 p-4 bg-gray-50/50 rounded-[24px] border border-gray-100">
                  <div className="h-20 w-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center font-display text-2xl font-bold text-primary shadow-inner">
                    {name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-heading">{name}</h4>
                    <p className="text-xs text-secondary-text">
                      {isTrialMode ? 'Trial Account (Unregistered)' : 'SaaS Standard Administrator'}
                    </p>
                    <span className="text-[10px] text-muted-text">{email}</span>
                  </div>
                </div>

                {isTrialMode && (
                  <div className="p-5 bg-white rounded-[24px] border border-[#e8e8ed] shadow-sm space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#0071e3]" />
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#1d1d1f]">
                      <Sparkles className="h-4 w-4 text-[#0071e3]" />
                      Guest Trial Settings Active
                    </div>
                    <p className="text-[11px] text-[#86868b] leading-relaxed">
                      You are utilizing Shortify as a trial guest. You are limited to creating a maximum of 
                      <strong> 3 redirects</strong> and temporary configurations. 
                      Upgrade to a fully-registered free account to unlock unlimited high-speed dynamic routes!
                    </p>
                    <button
                      type="button"
                      onClick={onUpgrade}
                      className="bg-[#1d1d1f] hover:bg-[#2d2d2f] text-white text-xs font-medium px-4 py-2 rounded-full transition-all cursor-pointer shadow-sm"
                    >
                      Register Free Account Now
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-secondary-text">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-[14px] bg-gray-50 border border-gray-200 text-xs font-semibold outline-none text-heading focus:bg-white focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-secondary-text">Professional Role</label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-4 py-3 rounded-[14px] bg-gray-50 border border-gray-200 text-xs font-semibold outline-none text-heading focus:bg-white focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-secondary-text">Billing Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-[14px] bg-gray-50 border border-gray-200 text-xs font-semibold outline-none text-heading focus:bg-white focus:border-primary"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <button type="submit" className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-6 py-3 rounded-[14px] shadow-sm transition-all cursor-pointer">
                    Save Profile Changes
                  </button>
                </div>
              </form>
            )}

            {/* 2. Security Panel */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold font-display text-heading">Security Credentials</h3>
                  <p className="text-xs text-secondary-text mt-0.5">Secure your SaaS dashboard and change account passwords.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-secondary-text">Current Account Password</label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      className="w-full px-4 py-3 rounded-[14px] bg-gray-50 border border-gray-200 text-xs font-semibold outline-none text-heading focus:bg-white focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-secondary-text">New Credentials Password</label>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        className="w-full px-4 py-3 rounded-[14px] bg-gray-50 border border-gray-200 text-xs font-semibold outline-none text-heading focus:bg-white focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-secondary-text">Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        className="w-full px-4 py-3 rounded-[14px] bg-gray-50 border border-gray-200 text-xs font-semibold outline-none text-heading focus:bg-white focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <button className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-6 py-3 rounded-[14px] shadow-sm transition-all cursor-pointer">
                    Update Security Code
                  </button>
                </div>
              </div>
            )}

            {/* 3. Developer API Keys */}
            {activeTab === 'keys' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold font-display text-heading">Developer API Credentials</h3>
                  <p className="text-xs text-secondary-text mt-0.5">Integrate Shortify into your production infrastructure, backend microservices, or CMS workflows using standard Bearer authentication tokens.</p>
                </div>

                {/* Generate New Key form */}
                <form onSubmit={handleCreateApiKey} className="flex gap-3 bg-gray-50 p-4 rounded-[20px] border border-gray-100">
                  <input
                    type="text"
                    required
                    placeholder="Key name (e.g. Production Mobile App)"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-[12px] bg-white border border-gray-200 text-xs font-semibold text-heading outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2.5 rounded-[12px] transition-all cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    Generate Key
                  </button>
                </form>

                {/* API Key lists */}
                <div className="space-y-3">
                  {apiKeys.length === 0 ? (
                    <div className="text-center py-8 text-secondary-text text-xs">No active API keys found. Generate one above to access API routing!</div>
                  ) : (
                    apiKeys.map((key) => {
                      const isVisible = visibleKeyId === key.id;
                      const isCopied = copiedKeyId === key.id;
                      return (
                        <div key={key.id} className="p-4 border border-gray-100 rounded-[20px] flex items-center justify-between gap-4 bg-white shadow-sm">
                          <div className="space-y-1 max-w-[70%]">
                            <span className="text-xs font-bold text-heading block">{key.name}</span>
                            <span className="font-mono text-[11px] text-secondary-text truncate block">
                              {isVisible ? key.key : 'sh_••••••••••••••••••••••••••••••••'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setVisibleKeyId(isVisible ? null : key.id)}
                              className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-secondary-text cursor-pointer"
                              title={isVisible ? 'Hide Key' : 'Reveal Key'}
                            >
                              {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              whileHover={{ scale: 1.1 }}
                              onClick={() => handleCopyKey(key.key, key.id)}
                              className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-secondary-text cursor-pointer relative overflow-hidden flex items-center justify-center h-8.5 w-8.5"
                              title="Copy to Clipboard"
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
                                    <Check className="h-4 w-4 text-emerald-500 stroke-[2.5]" />
                                  </motion.div>
                                ) : (
                                  <motion.div
                                    key="copy"
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.5, opacity: 0 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.button>
                            <button
                              onClick={() => onDeleteApiKey(key.id)}
                              className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-danger cursor-pointer"
                              title="Delete Key"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* 4. System Alerts & Notifications */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold font-display text-heading">System Alerts</h3>
                  <p className="text-xs text-secondary-text mt-0.5">Define trigger points and automated emails regarding link traffic anomalies.</p>
                </div>

                <div className="space-y-4">
                  {[
                    { title: 'Weekly Performance Summaries', desc: 'Receive aggregated click analytics and traffic conversion logs every Monday morning.' },
                    { title: 'Link Expiration Reminders', desc: 'Alert via email 48 hours prior to any active links hitting their set expiration date.' },
                    { title: 'Traffic Anomaly Warning', desc: 'Notify instantly if a shortened link experiences over 200% traffic spikes in 15 minutes.' },
                    { title: 'API Account Rate limits', desc: 'Notify if programmatic scripts approach 90% of our API rate thresholds.' },
                  ].map((notif, index) => (
                    <label key={index} className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-[20px] border border-gray-100 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={index < 2}
                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary mt-1 cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-bold text-heading block">{notif.title}</span>
                        <span className="text-[11px] text-secondary-text block mt-0.5 leading-relaxed">{notif.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <button className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-6 py-3 rounded-[14px] shadow-sm transition-all cursor-pointer">
                    Save Notification Toggles
                  </button>
                </div>
              </div>
            )}


          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
