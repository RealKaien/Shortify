import React from 'react';
import { motion } from 'motion/react';
import { Link2, ArrowRight } from 'lucide-react';

interface NavbarProps {
  onLaunchDashboard: () => void;
  onScrollToSection: (sectionId: string) => void;
}

export default function Navbar({ onLaunchDashboard, onScrollToSection }: NavbarProps) {
  return (
    <motion.header 
      id="floating-navbar"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-5xl h-14 bg-[#ffffff]/75 backdrop-blur-xl border border-[#e8e8ed]/60 rounded-full px-6 sm:px-8 flex items-center justify-between shadow-[0_12px_40px_rgba(0,0,0,0.03)] transition-all duration-300 hover:shadow-[0_16px_48px_rgba(0,0,0,0.05)]"
    >
      <div className="flex items-center justify-between w-full">
        {/* Brand Logo with Premium Polish Styling */}
        <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => onScrollToSection('hero')}>
          <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-sm">
            <Link2 className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-sm font-semibold tracking-tight text-[#1d1d1f]">Shortify</span>
            <span className="text-[8px] uppercase tracking-wider text-muted-text -mt-1 font-medium font-mono">Console</span>
          </div>
        </div>

        {/* Desktop Navigation Links matching Apple Style */}
        <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-[#1d1d1f]/80">
          {['Features', 'Analytics', 'FAQ'].map((item) => (
            <button
              key={item}
              onClick={() => onScrollToSection(item.toLowerCase())}
              className="hover:text-primary transition-colors cursor-pointer relative py-1 group font-sans tracking-tight"
            >
              {item}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary rounded-full transition-all duration-300 group-hover:w-2" />
            </button>
          ))}
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onLaunchDashboard}
            className="px-4.5 py-1.5 bg-[#1d1d1f] hover:bg-[#2d2d2f] text-white text-[12px] sm:text-[13px] font-medium rounded-full transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
          >
            Launch App
            <ArrowRight className="h-3.5 w-3.5" />
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}
