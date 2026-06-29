import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  QrCode, Search, Download, ExternalLink, RefreshCw, Palette, 
  Filter, Eye, Grid, List, Share2, Plus, Check, Copy, Trash2, ArrowRight,
  Loader2, X
} from 'lucide-react';
import { Link } from '../types';
import { toast } from '../lib/toast';

interface QRCodeManagerProps {
  links: Link[];
  onSelectLink: (link: Link) => void;
}

interface CustomQR {
  id: string;
  name: string;
  data: string;
  color: string;
  createdAt: string;
}

export default function QRCodeManager({ links, onSelectLink }: QRCodeManagerProps) {
  const [activeSubTab, setActiveSubTab] = useState<'short' | 'custom'>('short');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColor, setSelectedColor] = useState<Record<string, string>>({}); // linkId -> colorHex
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
  const [downloadingIds, setDownloadingIds] = useState<Record<string, boolean>>({});

  // Preview Modal States
  const [previewQr, setPreviewQr] = useState<{
    name: string;
    data: string;
    id: string;
    color: string;
    bgColor: string;
  } | null>(null);

  const [modalColor, setModalColor] = useState('#2563EB');
  const [modalBgColor, setModalBgColor] = useState('#ffffff');
  const [modalSize, setModalSize] = useState(500);

  const handleOpenPreview = (name: string, data: string, id: string, defaultColor: string, defaultBgColor = '#ffffff') => {
    setPreviewQr({
      name,
      data,
      id,
      color: defaultColor,
      bgColor: defaultBgColor
    });
    setModalColor(defaultColor);
    setModalBgColor(defaultBgColor);
    setModalSize(500); // Default size in Customization Studio
  };

  const handleDownloadQR = async (url: string, filename: string, id: string) => {
    setDownloadingIds(prev => ({ ...prev, [id]: true }));
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
      toast.success('QR Code downloaded successfully!');
    } catch (error) {
      console.error('Direct download failed, falling back to open in new tab:', error);
      window.open(url, '_blank');
      toast.info('Opening QR image in a new tab.');
    } finally {
      setDownloadingIds(prev => ({ ...prev, [id]: false }));
    }
  };

  // Custom QR Generator State
  const [customQrName, setCustomQrName] = useState('');
  const [customQrData, setCustomQrData] = useState('');
  const [customQrColor, setCustomQrColor] = useState('#2563EB');
  const [customQrs, setCustomQrs] = useState<CustomQR[]>(() => {
    const saved = localStorage.getItem('shortify_custom_qrs');
    return saved ? JSON.parse(saved) : [];
  });

  // Copied indicator state for sharing
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('shortify_custom_qrs', JSON.stringify(customQrs));
  }, [customQrs]);

  const colors = [
    { name: 'Primary Blue', hex: '#2563EB' },
    { name: 'Dark Slate', hex: '#111827' },
    { name: 'Eco Green', hex: '#16A34A' },
    { name: 'Vibrant Red', hex: '#DC2626' },
    { name: 'Warm Amber', hex: '#D97706' },
    { name: 'Royal Purple', hex: '#7C3AED' },
  ];

  const getQRUrl = (dataStr: string, colorHex?: string, bgcolorHex?: string, size = 300) => {
    const rawColor = colorHex || '#2563EB';
    const cleanColor = rawColor.replace('#', '');
    const rawBgColor = bgcolorHex || '#ffffff';
    const cleanBgColor = rawBgColor.replace('#', '');
    const dataUrl = encodeURIComponent(dataStr);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${dataUrl}&color=${cleanColor}&bgcolor=${cleanBgColor}`;
  };

  const handleColorChange = (linkId: string, hex: string) => {
    setSelectedColor(prev => ({
      ...prev,
      [linkId]: hex
    }));
    toast.success('QR Code theme color updated.');
  };

  const handleCreateCustomQr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQrData.trim()) return;

    const newCustomQr: CustomQR = {
      id: `cqr-${Math.random().toString(36).substring(2, 9)}`,
      name: customQrName.trim() || 'Untitled QR Asset',
      data: customQrData.trim(),
      color: customQrColor,
      createdAt: new Date().toISOString()
    };

    setCustomQrs(prev => [newCustomQr, ...prev]);
    setCustomQrName('');
    setCustomQrData('');
    toast.success('Custom branded QR generated successfully!');
  };

  const handleDeleteCustomQr = (id: string) => {
    setCustomQrs(prev => prev.filter(q => q.id !== id));
    toast.info('Custom QR asset removed.');
  };

  const handleShareLink = (id: string, textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Shortened redirect URL copied to clipboard!');
  };

  const filteredLinks = links.filter(l => 
    l.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.alias?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.shortCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.longUrl.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="qr-manager-panel" className="space-y-6">
      {/* Upper Selector Dashboard Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-[24px] border border-[rgba(255,255,255,0.65)] shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 text-primary rounded-[14px]">
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-heading font-display">Dynamic QR Engine</h2>
            <p className="text-xs text-secondary-text">Deploy and track scan parameters with brand customization controls.</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-gray-50 border border-gray-100 p-1 rounded-[16px] self-start md:self-auto">
          <button
            onClick={() => setActiveSubTab('short')}
            className={`px-4 py-2 rounded-[12px] text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'short'
                ? 'bg-white text-primary shadow-sm'
                : 'text-secondary-text hover:text-heading'
            }`}
          >
            Shortened Link QRs
          </button>
          <button
            onClick={() => setActiveSubTab('custom')}
            className={`px-4 py-2 rounded-[12px] text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'custom'
                ? 'bg-white text-primary shadow-sm'
                : 'text-secondary-text hover:text-heading'
            }`}
          >
            Custom QR Studio
          </button>
        </div>
      </div>

      {activeSubTab === 'short' ? (
        <div className="space-y-6">
          {/* Filters and search layout controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-left">
              <h3 className="text-sm font-bold text-heading uppercase tracking-wider">Short Link Target Directories</h3>
              <p className="text-xs text-secondary-text">Manage the dynamic vector QR assets generated automatically for your redirects.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-text" />
                <input
                  type="text"
                  placeholder="Filter endpoints..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-[14px] border border-gray-200 bg-white text-xs text-heading outline-none focus:border-primary transition-all w-48 sm:w-60 font-semibold"
                />
              </div>

              <div className="flex border border-gray-200 rounded-[14px] p-0.5 bg-gray-50">
                <button
                  onClick={() => setLayoutMode('grid')}
                  className={`p-1.5 rounded-[10px] transition-all cursor-pointer ${layoutMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-secondary-text'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setLayoutMode('list')}
                  className={`p-1.5 rounded-[10px] transition-all cursor-pointer ${layoutMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-secondary-text'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {filteredLinks.length === 0 ? (
            <div className="bg-white rounded-[28px] border border-gray-100 p-12 text-center">
              <QrCode className="h-10 w-10 text-muted-text mx-auto mb-4" />
              <h4 className="text-sm font-bold text-heading font-display">No Short Links Found</h4>
              <p className="text-xs text-secondary-text mt-1 max-w-sm mx-auto">Generate a shortened URL first, and we will automatically map its dynamic QR vector asset here.</p>
            </div>
          ) : layoutMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLinks.map((link) => {
                const currentColor = selectedColor[link.id] || '#2563EB';
                const shortUrl = `${window.location.origin}/s/${link.alias || link.shortCode}`;
                const qrUrl = getQRUrl(shortUrl, currentColor);
                const isCopied = copiedId === link.id;

                return (
                  <motion.div
                    key={link.id}
                    layout
                    className="bg-white rounded-[28px] border border-[rgba(255,255,255,0.65)] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.04)] transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <span className="text-[10px] font-mono font-bold text-primary uppercase block">/{link.alias || link.shortCode}</span>
                      <h4 className="text-sm font-bold text-heading font-display mt-0.5 truncate">{link.title || 'Untitled Redirect'}</h4>
                      <p className="text-[11px] text-muted-text truncate font-mono mt-0.5">{link.longUrl}</p>
                    </div>

                    <div 
                      onClick={() => handleOpenPreview(link.title || 'Untitled Redirect', shortUrl, link.id, currentColor, '#ffffff')}
                      className="bg-gray-50 p-4 rounded-[20px] border border-gray-100/70 flex items-center justify-center relative group cursor-pointer overflow-hidden"
                      title="Click to customize & preview"
                    >
                      <img
                        src={qrUrl}
                        alt="Shortified QR Code"
                        className="w-32 h-32 rounded-[12px] shadow-sm transition-transform duration-300 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1.5 rounded-[20px]">
                        <Palette className="h-5 w-5" />
                        <span className="text-[10px] font-bold">Customize & Preview</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-bold text-muted-text block">QR Fill Accent Color</span>
                      <div className="flex items-center gap-1.5">
                        {colors.map((c) => (
                          <button
                            key={c.hex}
                            onClick={() => handleColorChange(link.id, c.hex)}
                            className={`w-5.5 h-5.5 rounded-full border transition-all cursor-pointer ${
                              currentColor === c.hex ? 'border-primary scale-110 shadow-sm' : 'border-transparent scale-100'
                            }`}
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4 flex items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-muted-text font-semibold uppercase block">Aggregate Scans</span>
                        <span className="font-bold text-heading">{Math.round(link.clicks * 0.45)} scans</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => handleShareLink(link.id, shortUrl)}
                          className="relative h-8.5 min-w-[100px] rounded-xl bg-gray-50 hover:bg-gray-100 text-secondary-text transition-colors cursor-pointer flex items-center justify-center overflow-hidden"
                          title="Copy/Share Shortened QR URL"
                        >
                          <AnimatePresence mode="wait" initial={false}>
                            {isCopied ? (
                              <motion.span
                                key="copied"
                                initial={{ y: 12, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -12, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 350, damping: 15 }}
                                className="flex items-center gap-1 text-emerald-600 font-bold px-2 text-[10px]"
                              >
                                <Check className="h-4 w-4 stroke-[2.5]" />
                                Copied
                              </motion.span>
                            ) : (
                              <motion.span
                                key="share"
                                initial={{ y: -12, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 12, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 350, damping: 15 }}
                                className="flex items-center gap-1 text-primary font-bold px-2 text-[10px]"
                              >
                                <Share2 className="h-4 w-4" />
                                Share URL
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </motion.button>
                        <button
                          onClick={() => handleOpenPreview(link.title || 'Untitled Redirect', shortUrl, link.id, currentColor, '#ffffff')}
                          className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-secondary-text transition-colors cursor-pointer flex items-center gap-1"
                          title="Design and customize QR code colors"
                        >
                          <Palette className="h-4 w-4 text-primary" />
                          <span className="text-[10px] font-bold">Design</span>
                        </button>
                        <button
                          onClick={() => handleDownloadQR(qrUrl, `qr_shortify_${link.alias || link.shortCode}.png`, link.id)}
                          disabled={!!downloadingIds[link.id]}
                          className="flex items-center gap-1 bg-primary hover:bg-primary-hover text-white text-[11px] font-bold px-3 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                        >
                          {downloadingIds[link.id] ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Download className="h-3.5 w-3.5" />
                          )}
                          Download
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* List Layout Mode */
            <div className="bg-white rounded-[28px] border border-gray-100 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-secondary-text font-bold uppercase border-b border-gray-100 text-[10px]">
                  <tr>
                    <th className="px-6 py-4">Short Code / Alias</th>
                    <th className="px-6 py-4">Dynamic Vector Preview</th>
                    <th className="px-6 py-4">Custom Color Schema</th>
                    <th className="px-6 py-4 text-center">Estimated Scans</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filteredLinks.map((link) => {
                    const currentColor = selectedColor[link.id] || '#2563EB';
                    const shortUrl = `${window.location.origin}/s/${link.alias || link.shortCode}`;
                    const qrUrl = getQRUrl(shortUrl, currentColor);
                    const isCopied = copiedId === link.id;

                    return (
                      <tr key={link.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4">
                          <span className="font-bold text-heading font-mono block">/{link.alias || link.shortCode}</span>
                          <span className="text-[11px] text-muted-text truncate max-w-[200px] block mt-0.5">{link.title || 'Untitled Link'}</span>
                        </td>
                        <td className="px-6 py-2">
                          <div 
                            onClick={() => handleOpenPreview(link.title || 'Untitled Link', shortUrl, link.id, currentColor, '#ffffff')}
                            className="relative w-11 h-11 rounded-lg border border-gray-100 cursor-pointer overflow-hidden group"
                            title="Click to design & preview"
                          >
                            <img
                              src={qrUrl}
                              alt="Shortify QR List"
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white rounded-lg">
                              <Palette className="h-3.5 w-3.5" />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-1.5">
                            {colors.map((c) => (
                              <button
                                key={c.hex}
                                onClick={() => handleColorChange(link.id, c.hex)}
                                className={`w-4 h-4 rounded-full transition-transform ${currentColor === c.hex ? 'scale-125 border border-primary' : 'scale-100 opacity-60'}`}
                                style={{ backgroundColor: c.hex }}
                              />
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center font-bold font-mono text-heading">
                          {Math.round(link.clicks * 0.45)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              whileHover={{ scale: 1.1 }}
                              onClick={() => handleShareLink(link.id, shortUrl)}
                              className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-secondary-text cursor-pointer flex items-center justify-center relative overflow-hidden h-8 w-8"
                              title="Share Link"
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
                                    <Check className="h-4 w-4 text-emerald-600 stroke-[2.5]" />
                                  </motion.div>
                                ) : (
                                  <motion.div
                                    key="share"
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.5, opacity: 0 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                  >
                                    <Share2 className="h-4 w-4 text-primary" />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.button>
                            <button
                              onClick={() => handleOpenPreview(link.title || 'Untitled Link', shortUrl, link.id, currentColor, '#ffffff')}
                              className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-secondary-text cursor-pointer"
                              title="Design & Customize QR"
                            >
                              <Palette className="h-4 w-4 text-primary" />
                            </button>
                            <button
                              onClick={() => onSelectLink(link)}
                              className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-secondary-text cursor-pointer"
                              title="Inspect Stats"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDownloadQR(qrUrl, `qr_shortify_${link.alias || link.shortCode}.png`, link.id)}
                              disabled={!!downloadingIds[link.id]}
                              className="flex items-center gap-1 bg-primary hover:bg-primary-hover text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer disabled:opacity-50"
                            >
                              {downloadingIds[link.id] ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Download className="h-3.5 w-3.5" />
                              )}
                              PNG
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Custom QR Code Creator Studio Section */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Creator form (Left 5 Columns) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-[24px] border border-gray-100 space-y-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
            <div>
              <h3 className="text-base font-bold text-heading font-display">Generate New Custom QR</h3>
              <p className="text-xs text-secondary-text mt-0.5">Input any external URL, email, phone number, or simple text string.</p>
            </div>

            <form onSubmit={handleCreateCustomQr} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">QR Asset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Company Wifi Guest access, App store QR"
                  value={customQrName}
                  onChange={(e) => setCustomQrName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50/70 border border-gray-200 rounded-[16px] text-xs font-semibold text-[#111827] focus:bg-white focus:border-[#2563EB] outline-none transition-all placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Target Payload (URL / Text)</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g., https://my-portfolio-or-menu.com"
                  value={customQrData}
                  onChange={(e) => setCustomQrData(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50/70 border border-gray-200 rounded-[16px] text-xs font-semibold text-[#111827] focus:bg-white focus:border-[#2563EB] outline-none transition-all placeholder:text-gray-400 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Color Tone Accent</label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setCustomQrColor(c.hex)}
                      className={`w-7 h-7 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                        customQrColor === c.hex ? 'ring-2 ring-[#2563EB]/40 border-white scale-110' : 'border-transparent scale-100'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {customQrColor === c.hex && <Check className="h-3.5 w-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-[18px] transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                <span>Save QR Code to Inventory</span>
              </button>
            </form>

            {/* Instant Creator Preview container */}
            {customQrData.trim() && (
              <div className="p-4 bg-gray-50 rounded-[20px] border border-gray-150/70 flex flex-col items-center justify-center space-y-3">
                <span className="text-[9px] uppercase font-bold text-primary tracking-wider">Live Generation Preview</span>
                <img
                  src={getQRUrl(customQrData, customQrColor)}
                  alt="Live Custom QR Preview"
                  className="w-32 h-32 rounded-lg bg-white p-2 border border-gray-100"
                  referrerPolicy="no-referrer"
                />
                <span className="text-[10px] text-muted-text font-mono max-w-full truncate">{customQrData}</span>
              </div>
            )}
          </div>

          {/* List inventory of custom generated codes (Right 7 columns) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="text-left">
              <h3 className="text-sm font-bold text-heading uppercase tracking-wider">Custom QR Inventory</h3>
              <p className="text-xs text-secondary-text">Created standalone static QR assets for flysheets, posters, and print campaigns.</p>
            </div>

            {customQrs.length === 0 ? (
              <div className="bg-white rounded-[24px] border border-gray-100 p-12 text-center">
                <QrCode className="h-8 w-8 text-muted-text mx-auto mb-3" />
                <h4 className="text-xs font-bold text-heading">Inventory is empty</h4>
                <p className="text-[11px] text-secondary-text mt-0.5">Use the generator on the left to bootstrap custom print assets.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {customQrs.map((qr) => {
                  const qrUrl = getQRUrl(qr.data, qr.color);
                  const isCopied = copiedId === qr.id;
                  return (
                    <div 
                      key={qr.id} 
                      className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm flex flex-col justify-between space-y-3.5 relative"
                    >
                      <button
                        onClick={() => handleDeleteCustomQr(qr.id)}
                        className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-danger rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete custom QR"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>

                      <div>
                        <h4 className="text-xs font-bold text-heading font-display pr-6 truncate">{qr.name}</h4>
                        <p className="text-[10px] text-muted-text font-mono truncate mt-0.5" title={qr.data}>{qr.data}</p>
                      </div>

                      <div 
                        onClick={() => handleOpenPreview(qr.name, qr.data, qr.id, qr.color, '#ffffff')}
                        className="bg-gray-50/50 p-3 rounded-[16px] border border-gray-100 flex items-center justify-center relative group cursor-pointer overflow-hidden"
                        title="Click to design & preview"
                      >
                        <img
                          src={qrUrl}
                          alt={qr.name}
                          className="w-24 h-24 p-1.5 bg-white rounded-lg transition-transform duration-300 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1 rounded-[16px]">
                          <Palette className="h-4 w-4" />
                          <span className="text-[9px] font-bold">Customize</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => handleShareLink(qr.id, qr.data)}
                          className="relative flex-1 h-8 rounded-xl bg-gray-50 hover:bg-gray-100 text-secondary-text text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center overflow-hidden"
                        >
                          <AnimatePresence mode="wait" initial={false}>
                            {isCopied ? (
                              <motion.span
                                key="copied"
                                initial={{ y: 12, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -12, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 350, damping: 15 }}
                                className="flex items-center gap-1 text-emerald-600 font-bold px-2"
                              >
                                <Check className="h-3 w-3 stroke-[2.5]" />
                                Copied
                              </motion.span>
                            ) : (
                              <motion.span
                                key="copy"
                                initial={{ y: -12, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 12, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 350, damping: 15 }}
                                className="flex items-center gap-1 text-primary font-bold px-2"
                              >
                                <Share2 className="h-3 w-3" />
                                Copy Data
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </motion.button>
                        <button
                          onClick={() => handleOpenPreview(qr.name, qr.data, qr.id, qr.color, '#ffffff')}
                          className="py-2 px-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-secondary-text transition-colors cursor-pointer"
                          title="Design and customize QR code colors"
                        >
                          <Palette className="h-3.5 w-3.5 text-primary" />
                        </button>
                        <button
                          onClick={() => handleDownloadQR(qrUrl, `custom_qr_${qr.name.replace(/\s+/g, '_')}.png`, qr.id)}
                          disabled={!!downloadingIds[qr.id]}
                          className="flex-1 py-2 bg-primary hover:bg-primary-hover text-white text-[10px] font-bold rounded-xl text-center transition-all cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50"
                        >
                          {downloadingIds[qr.id] ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Download className="h-3 w-3" />
                          )}
                          <span>PNG</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* INTERACTIVE DESIGN & PREVIEW MODAL */}
      <AnimatePresence>
      {previewQr && (
        <div 
          id="qr-preview-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
          onClick={() => setPreviewQr(null)}
        >
          {/* Modal Card */}
          <motion.div
            id="qr-preview-modal-card"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="bg-white rounded-[32px] border border-gray-100 shadow-2xl max-w-3xl w-full p-6 md:p-8 space-y-6 relative overflow-hidden text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                  <Palette className="h-4 w-4" />
                  QR Customization Studio
                </div>
                <h3 className="text-xl font-extrabold text-heading font-display mt-1">
                  {previewQr.name}
                </h3>
                <p className="text-xs text-secondary-text mt-0.5 max-w-[90%] truncate font-mono">
                  Target URL: {previewQr.data}
                </p>
              </div>
              
              <button
                id="btn-close-qr-preview"
                onClick={() => setPreviewQr(null)}
                className="p-2 text-gray-400 hover:text-heading hover:bg-gray-50 rounded-xl transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Grid Content */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              
              {/* Left Side: Large Dynamic Live Preview */}
              <div className="md:col-span-5 flex flex-col items-center justify-center space-y-4">
                <div className="bg-gray-50 p-6 rounded-[28px] border border-gray-100 flex items-center justify-center shadow-inner relative group w-full aspect-square max-w-[280px] md:max-w-none">
                  <img
                    src={getQRUrl(previewQr.data, modalColor, modalBgColor, modalSize)}
                    alt="Customized QR Preview"
                    className="w-full h-full object-contain rounded-2xl shadow-md bg-white p-3 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="text-center">
                  <span className="text-[10px] text-muted-text font-bold uppercase tracking-widest block">
                    Resolution Output
                  </span>
                  <span className="text-xs font-mono font-bold text-secondary-text">
                    {modalSize} &times; {modalSize} pixels
                  </span>
                </div>
              </div>

              {/* Right Side: Configuration Options */}
              <div className="md:col-span-7 space-y-6">
                
                {/* Foreground Accent Control */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-secondary-text uppercase tracking-wider block">
                      Foreground Accent Color
                    </label>
                    <span className="text-[11px] font-mono font-semibold text-primary">
                      {modalColor.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {colors.map((c) => (
                      <button
                        key={c.hex}
                        onClick={() => setModalColor(c.hex)}
                        className={`w-8 h-8 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                          modalColor.toLowerCase() === c.hex.toLowerCase() 
                            ? 'ring-2 ring-primary/40 border-white scale-110 shadow-sm' 
                            : 'border-transparent scale-100 hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      >
                        {modalColor.toLowerCase() === c.hex.toLowerCase() && (
                          <Check className="h-4 w-4 text-white" />
                        )}
                      </button>
                    ))}
                    
                    {/* Native Picker */}
                    <div className="relative flex items-center gap-1.5 ml-1 border-l border-gray-200 pl-3">
                      <input
                        id="fg-color-picker"
                        type="color"
                        value={modalColor}
                        onChange={(e) => setModalColor(e.target.value)}
                        className="w-8 h-8 rounded-lg border-0 cursor-pointer overflow-hidden p-0"
                        title="Custom Color Picker"
                      />
                      <span className="text-[10px] font-bold text-muted-text">Custom</span>
                    </div>
                  </div>
                </div>

                {/* Background Base Control */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-secondary-text uppercase tracking-wider block">
                      Background Base Color
                    </label>
                    <span className="text-[11px] font-mono font-semibold text-secondary-text">
                      {modalBgColor.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { name: 'Perfect White', hex: '#FFFFFF' },
                      { name: 'Frost Slate', hex: '#F8FAFC' },
                      { name: 'Soft Sand', hex: '#FEF3C7' },
                      { name: 'Pale Emerald', hex: '#F0FDF4' },
                      { name: 'Sky Sheen', hex: '#F0F9FF' },
                      { name: 'Slate Light', hex: '#E2E8F0' },
                    ].map((bg) => (
                      <button
                        key={bg.hex}
                        onClick={() => setModalBgColor(bg.hex)}
                        className={`w-8 h-8 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                          modalBgColor.toLowerCase() === bg.hex.toLowerCase() 
                            ? 'ring-2 ring-primary/40 border-white scale-110 shadow-sm' 
                            : 'border-gray-200 scale-100 hover:scale-105'
                        }`}
                        style={{ backgroundColor: bg.hex }}
                        title={bg.name}
                      >
                        {modalBgColor.toLowerCase() === bg.hex.toLowerCase() && (
                          <Check className="h-4 w-4 text-heading" />
                        )}
                      </button>
                    ))}

                    {/* Native Background Picker */}
                    <div className="relative flex items-center gap-1.5 ml-1 border-l border-gray-200 pl-3">
                      <input
                        id="bg-color-picker"
                        type="color"
                        value={modalBgColor}
                        onChange={(e) => setModalBgColor(e.target.value)}
                        className="w-8 h-8 rounded-lg border-0 cursor-pointer overflow-hidden p-0"
                        title="Custom Background Picker"
                      />
                      <span className="text-[10px] font-bold text-muted-text">Custom</span>
                    </div>
                  </div>
                </div>

                {/* QR Output Resolution Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-secondary-text uppercase tracking-wider block">
                    Export Dimensions / Resolution
                  </label>
                  <div id="qr-resolution-selector" className="grid grid-cols-3 gap-2 bg-gray-50 border border-gray-150 p-1 rounded-xl">
                    {[
                      { size: 300, label: '300px', desc: 'Web Output' },
                      { size: 500, label: '500px', desc: 'Standard Print' },
                      { size: 1000, label: '1000px', desc: 'High-Res / Poster' },
                    ].map((res) => (
                      <button
                        key={res.size}
                        type="button"
                        onClick={() => setModalSize(res.size)}
                        className={`py-2 px-3 rounded-lg text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                          modalSize === res.size 
                            ? 'bg-white text-primary shadow-sm border border-gray-100 font-bold' 
                            : 'text-secondary-text hover:text-heading font-semibold'
                        }`}
                      >
                        <span className="text-xs">{res.label}</span>
                        <span className="text-[8px] opacity-75">{res.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Action Buttons Footer */}
            <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => {
                  setModalColor(previewQr.color);
                  setModalBgColor('#ffffff');
                  setModalSize(500);
                }}
                className="w-full sm:w-auto px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-secondary-text text-xs font-bold rounded-[14px] border border-gray-200 transition-all cursor-pointer text-center"
              >
                Reset to Default Colors
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setPreviewQr(null)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-heading text-xs font-bold rounded-[14px] transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  id="btn-download-custom-qr"
                  type="button"
                  onClick={() => {
                    const finalUrl = getQRUrl(previewQr.data, modalColor, modalBgColor, modalSize);
                    handleDownloadQR(finalUrl, `styled_qr_${previewQr.name.replace(/\s+/g, '_')}_${modalSize}.png`, previewQr.id);
                  }}
                  disabled={!!downloadingIds[previewQr.id]}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold px-6 py-2.5 rounded-[14px] shadow-md shadow-primary/15 transition-all cursor-pointer disabled:opacity-50"
                >
                  {downloadingIds[previewQr.id] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  <span>Download Custom PNG</span>
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </div>
  );
}
