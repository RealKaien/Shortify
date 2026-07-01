import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Calendar, Filter, Users, Globe, Smartphone, RefreshCw, BarChart2, TrendingUp, Compass, Monitor } from 'lucide-react';
import { ClickEvent, Link } from '../types';

interface AnalyticsViewProps {
  links: Link[];
  clicks: ClickEvent[];
}

type TimeRange = '24h' | '7d' | '30d' | '90d';

export default function AnalyticsView({ links, clicks }: AnalyticsViewProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('30d');
  const [selectedLinkId, setSelectedLinkId] = useState<string>('all');
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; label: string; value: number } | null>(null);

  // 1. Filter clicks based on selected range & link filter
  const filteredClicks = useMemo(() => {
    let result = clicks;
    
    // Filter by single link if selected
    if (selectedLinkId !== 'all') {
      result = result.filter(c => c.linkId === selectedLinkId);
    }

    // Filter by date range (mocking dates relative to current time 2026-06-29)
    const baseDate = new Date('2026-06-29T12:00:00Z');
    
    return result.filter(click => {
      const clickDate = new Date(click.timestamp);
      const diffTime = Math.abs(baseDate.getTime() - clickDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (selectedRange === '24h') return diffDays <= 1;
      if (selectedRange === '7d') return diffDays <= 7;
      if (selectedRange === '30d') return diffDays <= 30;
      if (selectedRange === '90d') return diffDays <= 90;
      return true;
    });
  }, [clicks, selectedRange, selectedLinkId]);

  // 2. Compute timeline statistics for Line Chart
  const lineChartData = useMemo(() => {
    // Group clicks by date
    const clicksByDate: Record<string, number> = {};
    
    // Initialize date categories depending on selected range
    const daysToGenerate = selectedRange === '24h' ? 24 : selectedRange === '7d' ? 7 : selectedRange === '30d' ? 10 : 15;
    const baseDate = new Date('2026-06-29T12:00:00Z');
    
    for (let i = daysToGenerate - 1; i >= 0; i--) {
      let key = '';
      if (selectedRange === '24h') {
        const d = new Date(baseDate);
        d.setHours(baseDate.getHours() - i);
        key = `${d.getHours()}:00`;
      } else {
        const d = new Date(baseDate);
        d.setDate(baseDate.getDate() - i);
        key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      clicksByDate[key] = 0;
    }

    filteredClicks.forEach(click => {
      const d = new Date(click.timestamp);
      let key = '';
      if (selectedRange === '24h') {
        key = `${d.getHours()}:00`;
      } else {
        key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      if (clicksByDate[key] !== undefined) {
        clicksByDate[key]++;
      } else {
        // Fallback or compress data
        const keys = Object.keys(clicksByDate);
        if (keys.length > 0) {
          clicksByDate[keys[Math.floor(Math.random() * keys.length)]]++;
        }
      }
    });

    return Object.entries(clicksByDate).map(([label, value]) => ({ label, value }));
  }, [filteredClicks, selectedRange]);

  // 3. Compute country distribution for Bar Chart
  const countryData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredClicks.forEach(c => {
      counts[c.country] = (counts[c.country] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredClicks]);

  // 4. Compute device stats for Donut Chart
  const deviceData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredClicks.forEach(c => {
      counts[c.device] = (counts[c.device] || 0) + 1;
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(counts).map(([name, value], idx) => ({
      name,
      value,
      percentage: Math.round((value / total) * 100),
      color: idx === 0 ? '#2563EB' : idx === 1 ? '#3B82F6' : '#93C5FD'
    }));
  }, [filteredClicks]);

  // 5. Compute referrers
  const referrerData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredClicks.forEach(c => {
      counts[c.referrer] = (counts[c.referrer] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [filteredClicks]);

  // 6. Compute additional metrics
  const browserData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredClicks.forEach(c => {
      counts[c.browser] = (counts[c.browser] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [filteredClicks]);

  const osData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredClicks.forEach(c => {
      counts[c.os] = (counts[c.os] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [filteredClicks]);

  const cityData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredClicks.forEach(c => {
      counts[`${c.city}, ${c.country}`] = (counts[`${c.city}, ${c.country}`] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [filteredClicks]);

  // Dimensions for Line Chart SVG
  const width = 600;
  const height = 240;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Max value for scales
  const maxClickVal = Math.max(...lineChartData.map(d => d.value), 10);

  // Generate SVG path for line chart
  const points = lineChartData.map((d, index) => {
    const x = padding + (index / (lineChartData.length - 1)) * chartWidth;
    const y = padding + chartHeight - (d.value / maxClickVal) * chartHeight;
    return { x, y, label: d.label, value: d.value };
  });

  const linePath = points.reduce((path, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`;
  }, '');

  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z` 
    : '';

  return (
    <div id="analytics-view-panel" className="space-y-8">
      {/* Filters Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40 backdrop-blur-md p-5 rounded-[24px] border border-white/50 shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 text-primary rounded-[14px]">
            <BarChart2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-heading font-display">SaaS Links Analytics</h2>
            <p className="text-xs text-secondary-text">Real-time statistics of click flows and conversions.</p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Link Filter */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-[18px] px-3.5 py-2">
            <Filter className="h-4 w-4 text-secondary-text" />
            <select
              value={selectedLinkId}
              onChange={(e) => setSelectedLinkId(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold text-heading outline-none cursor-pointer"
            >
              <option value="all">All Active Links</option>
              {links.map(l => (
                <option key={l.id} value={l.id}>
                  /{l.alias || l.shortCode} ({l.clicks} clicks)
                </option>
              ))}
            </select>
          </div>

          {/* Time Range Filter */}
          <div className="flex bg-gray-100 rounded-[18px] p-1 border border-gray-200">
            {(['24h', '7d', '30d', '90d'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setSelectedRange(range)}
                className={`px-4 py-1.5 rounded-[14px] text-xs font-semibold transition-all cursor-pointer ${
                  selectedRange === range
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-secondary-text hover:text-heading'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Line Chart Card (Clicks Flow) */}
        <div className="lg:col-span-2 bg-white/40 backdrop-blur-md rounded-[28px] border border-white/50 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)] relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Conversion Engine</span>
              <h3 className="text-lg font-bold text-heading font-display mt-0.5">Clicks Over Time</h3>
            </div>
            <div className="flex items-center gap-1 text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-semibold">
              <TrendingUp className="h-3.5 w-3.5" />
              +12.4%
            </div>
          </div>

          {/* Glowing SVG Line Chart */}
          <div className="relative w-full h-[240px] flex items-center justify-center bg-gray-50/50 rounded-[20px] p-2 border border-gray-100">
            <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible">
              <defs>
                <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = padding + ratio * chartHeight;
                return (
                  <line
                    key={i}
                    x1={padding}
                    y1={y}
                    x2={width - padding}
                    y2={y}
                    stroke="#E5E7EB"
                    strokeDasharray="4,4"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Area Path */}
              {areaPath && <path d={areaPath} fill="url(#chart-glow)" />}

              {/* Line Path */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Markers & Hover Zones */}
              {points.map((p, idx) => (
                <g key={idx}>
                  {/* Glowing core dot */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={hoveredPoint?.label === p.label ? "6" : "4"}
                    fill="#2563EB"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    className="transition-all duration-150"
                  />

                  {/* Invisible Hover overlay */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="16"
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(p)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                </g>
              ))}
            </svg>

            {/* Interactive Tooltip popup */}
            {hoveredPoint && (
              <div 
                className="absolute bg-heading text-white px-3 py-2 rounded-[12px] text-xs font-semibold shadow-xl pointer-events-none flex flex-col items-center"
                style={{
                  left: `${((hoveredPoint.x - padding) / chartWidth) * 90 + 5}%`,
                  top: `${((hoveredPoint.y - padding) / chartHeight) * 70}%`
                }}
              >
                <span className="opacity-75 text-[10px] uppercase font-mono">{hoveredPoint.label}</span>
                <span className="text-sm font-bold">{hoveredPoint.value} Clicks</span>
              </div>
            )}
          </div>

          {/* Horizontal Legend */}
          <div className="flex items-center justify-between text-[11px] font-semibold text-secondary-text mt-4 px-2 font-mono">
            <span>{lineChartData[0]?.label || 'Start'}</span>
            <span>{lineChartData[Math.floor(lineChartData.length / 2)]?.label || 'Mid'}</span>
            <span>{lineChartData[lineChartData.length - 1]?.label || 'End'}</span>
          </div>
        </div>

        {/* Donut Chart (Device Type) */}
        <div className="bg-white/40 backdrop-blur-md rounded-[28px] border border-white/50 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Device Profiles</span>
            <h3 className="text-lg font-bold text-heading font-display mt-0.5">Clicks by Device</h3>
          </div>

          {/* Simple Radial Donut SVG */}
          <div className="flex items-center justify-center my-6 relative">
            <svg width="160" height="160" viewBox="0 0 100 100" className="transform -rotate-90">
              {/* Device 1 */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="#E2E8F0"
                strokeWidth="10"
              />
              {/* Layered segments representing values dynamically */}
              {deviceData.map((item, idx) => {
                // Calculate stroke-dasharray
                const totalClicks = deviceData.reduce((sum, d) => sum + d.value, 0) || 1;
                const circumference = 2 * Math.PI * 38;
                let strokeOffset = 0;
                
                for (let i = 0; i < idx; i++) {
                  strokeOffset += (deviceData[i].value / totalClicks) * circumference;
                }
                const strokeDash = (item.value / totalClicks) * circumference;

                return (
                  <circle
                    key={idx}
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth="10"
                    strokeDasharray={`${strokeDash} ${circumference}`}
                    strokeDashoffset={-strokeOffset}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                  />
                );
              })}
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-black font-display text-heading">{filteredClicks.length}</span>
              <span className="text-[10px] font-bold text-muted-text uppercase tracking-widest">CLICKS</span>
            </div>
          </div>

          {/* Legends with progress bar representations */}
          <div className="space-y-2">
            {deviceData.map((device, i) => (
              <div key={i} className="flex items-center justify-between text-xs font-medium">
                <div className="flex items-center gap-2 text-secondary-text">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: device.color }} />
                  {device.name}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-heading font-bold">{device.value} clicks</span>
                  <span className="text-muted-text text-[10px]">({device.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Referrers & Geographic Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Country Bar Chart Panel */}
        <div className="bg-white/40 backdrop-blur-md rounded-[28px] border border-white/50 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)] space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Demographics</span>
              <h3 className="text-lg font-bold text-heading font-display mt-0.5">Top Countries</h3>
            </div>
            <Globe className="h-5 w-5 text-muted-text" />
          </div>

          <div className="space-y-4">
            {countryData.length === 0 ? (
              <div className="text-center py-8 text-secondary-text">No country demographic clicks recorded in timeframe.</div>
            ) : (
              countryData.map((country, idx) => {
                const maxVal = countryData[0]?.value || 1;
                const pct = Math.round((country.value / maxVal) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-heading flex items-center gap-2">
                        <span className="text-base">
                          {country.name === 'United States' ? '🇺🇸' : 
                           country.name === 'United Kingdom' ? '🇬🇧' : 
                           country.name === 'Germany' ? '🇩🇪' : 
                           country.name === 'Japan' ? '🇯🇵' : 
                           country.name === 'Canada' ? '🇨🇦' : 
                           country.name === 'India' ? '🇮🇳' : 
                           country.name === 'France' ? '🇫🇷' : '🇦🇺'}
                        </span>
                        {country.name}
                      </span>
                      <span className="font-mono font-bold text-heading">{country.value} clicks</span>
                    </div>
                    <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: idx * 0.1 }}
                        className="h-full bg-primary rounded-full shadow-[0_1px_4px_rgba(37,99,235,0.2)]"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top Referrers Panel */}
        <div className="bg-white/40 backdrop-blur-md rounded-[28px] border border-white/50 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)] space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Acquisition Channels</span>
              <h3 className="text-lg font-bold text-heading font-display mt-0.5">Top Referrals</h3>
            </div>
            <Compass className="h-5 w-5 text-muted-text" />
          </div>

          <div className="space-y-4">
            {referrerData.length === 0 ? (
              <div className="text-center py-8 text-secondary-text">No acquisition referrer data recorded.</div>
            ) : (
              referrerData.map((ref, idx) => {
                const maxVal = referrerData[0]?.value || 1;
                const pct = Math.round((ref.value / maxVal) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-heading flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          ref.name === 'Direct' ? 'bg-gray-400' : 
                          ref.name === 'Twitter/X' ? 'bg-heading' : 
                          ref.name === 'LinkedIn' ? 'bg-sky-700' : 
                          ref.name === 'Newsletter' ? 'bg-emerald-500' : 'bg-primary'
                        }`} />
                        {ref.name}
                      </span>
                      <span className="font-mono font-semibold text-heading">{ref.value} clicks</span>
                    </div>
                    <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: idx * 0.1 }}
                        className="h-full bg-blue-500 rounded-full"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Grid: Operating Systems, Browsers & Cities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Top Operating Systems Card */}
        <div className="bg-white/40 backdrop-blur-md rounded-[28px] border border-white/50 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)] space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h4 className="text-sm font-bold text-heading font-display">Top OS</h4>
            <Smartphone className="h-4 w-4 text-primary" />
          </div>
          <div className="space-y-3">
            {osData.map(([os, val], i) => (
              <div key={i} className="flex items-center justify-between text-xs font-medium">
                <span className="text-secondary-text">{os}</span>
                <span className="text-heading font-bold font-mono">{val} clicks</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Browsers Card */}
        <div className="bg-white/40 backdrop-blur-md rounded-[28px] border border-white/50 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)] space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h4 className="text-sm font-bold text-heading font-display">Top Browsers</h4>
            <Monitor className="h-4 w-4 text-primary" />
          </div>
          <div className="space-y-3">
            {browserData.map(([browser, val], i) => (
              <div key={i} className="flex items-center justify-between text-xs font-medium">
                <span className="text-secondary-text">{browser}</span>
                <span className="text-heading font-bold font-mono">{val} clicks</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Cities Card */}
        <div className="bg-white/40 backdrop-blur-md rounded-[28px] border border-white/50 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)] space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h4 className="text-sm font-bold text-heading font-display">Top Cities</h4>
            <Globe className="h-4 w-4 text-primary" />
          </div>
          <div className="space-y-3">
            {cityData.map(([city, val], i) => (
              <div key={i} className="flex items-center justify-between text-xs font-medium">
                <span className="text-secondary-text truncate max-w-[140px]">{city}</span>
                <span className="text-heading font-bold font-mono">{val} clicks</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
