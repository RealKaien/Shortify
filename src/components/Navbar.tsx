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
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl h-16 bg-white/70 backdrop-blur-md border border-white/60 rounded-[24px] px-6 sm:px-8 flex items-center justify-between shadow-sm transition-all duration-300 hover:shadow-[0_8px_32px_rgba(37,99,235,0.06)]"
    >
      <div className="flex items-center justify-between w-full">
        {/* Brand Logo with Premium Polish Styling */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onScrollToSection('hero')}>
          <div className="w-8 h-8 bg-primary rounded-[8px] flex items-center justify-center shadow-sm">
            <Link2 className="h-4.5 w-4.5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold tracking-tight text-[#111827]">Shortify</span>
            <span className="text-[9px] uppercase font-mono tracking-widest text-muted-text -mt-1 font-semibold">SaaS Console</span>
          </div>
        </div>

        {/* Desktop Navigation Links matching Design HTML */}
        <nav className="hidden md:flex items-center gap-8 text-[12px] font-bold uppercase tracking-wider text-secondary-text">
          {['Features', 'Analytics', 'FAQ'].map((item) => (
            <button
              key={item}
              onClick={() => onScrollToSection(item.toLowerCase())}
              className="hover:text-primary transition-colors cursor-pointer relative py-1 group"
            >
              {item}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </button>
          ))}
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onLaunchDashboard}
            className="px-5 py-2.5 bg-primary text-white text-[14px] font-semibold rounded-[18px] hover:bg-primary-hover transition-all cursor-pointer flex items-center gap-1.5 shadow-sm shadow-primary/10"
          >
            Launch App
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}
