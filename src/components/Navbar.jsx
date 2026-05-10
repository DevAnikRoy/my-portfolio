import React, { useState, useEffect } from 'react';
import { X, Menu, Home, Bot } from 'lucide-react';

const Navbar = ({ onNavigate, isProjectView = false, setIsChatOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const navItems = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Skills', href: '#skills' },
    { name: 'Education', href: '#education' },
    { name: 'Experience', href: '#experience' },
    { name: 'Projects', href: '#projects' },
    { name: 'Contact', href: '#contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      if (!isProjectView) {
        const sections = navItems.map(item => item.href.substring(1));
        const scrollPosition = window.scrollY + 100;

        for (let i = sections.length - 1; i >= 0; i--) {
          const section = document.getElementById(sections[i]);
          if (section && section.offsetTop <= scrollPosition) {
            setActiveSection(sections[i]);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isProjectView]);

  const handleNavClick = (href, sectionName) => {
    if (isProjectView) {
      onNavigate();
      return;
    }
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionName);
    }
    setIsOpen(false); 
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      scrolled || isOpen ? 'bg-slate-900/95 backdrop-blur-md shadow-lg border-b border-slate-800/50' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 relative">
          
          {/* 1. LOGO (Left) */}
          <div className="flex-shrink-0 z-10">
            <span 
              onClick={() => handleNavClick('#home', 'home')}
              className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity"
            >
              Anik Roy
            </span>
          </div>

          {/* 2. NAVIGATION LINKS (Middle - Absolute Center on Desktop) */}
          <div className="hidden lg:flex absolute inset-0 items-center justify-center pointer-events-none">
            <div className="flex space-x-8 pointer-events-auto">
              {!isProjectView ? (
                navItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleNavClick(item.href, item.href.substring(1))}
                    className={`text-sm font-medium tracking-wide transition-all duration-300 hover:text-blue-400 relative group ${
                      activeSection === item.href.substring(1) ? 'text-blue-400' : 'text-gray-300'
                    }`}
                  >
                    {item.name}
                    {/* Active Underline Animation */}
                    <span className={`absolute -bottom-1 left-0 h-0.5 bg-blue-500 transition-all duration-300 ${
                      activeSection === item.href.substring(1) ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}></span>
                  </button>
                ))
              ) : (
                <button onClick={onNavigate} className="flex items-center text-gray-300 hover:text-blue-400 font-medium transition-colors">
                  <Home size={18} className="mr-2" /> Back to Home
                </button>
              )}
            </div>
          </div>

          {/* 3. ACTION BUTTONS (Right) */}
          <div className="flex items-center z-10">
            {/* Desktop Ask AI Button with Eye-Catching Effects */}
            <div className="hidden lg:block relative group">
              {/* Animated Background Glow */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-20 group-hover:opacity-50 transition duration-500"></div>
              
              <button
                onClick={() => setIsChatOpen(true)}
                className="relative flex items-center gap-2 px-6 py-2.5 bg-slate-900 border border-slate-700/50 text-gray-200 rounded-full hover:text-white transition-all text-sm font-bold overflow-hidden"
              >
                {/* Shimmer Light Beam Effect */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none"></div>

                <div className="relative">
                  <Bot size={18} className="text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                  {/* Status Pulse Dot */}
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                </div>

                <span className="tracking-wide">Ask AI</span>
              </button>
            </div>

            {/* Mobile/Tablet Menu Toggle */}
            <div className="lg:hidden flex items-center">
              <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="p-2 text-gray-300 hover:text-white transition-colors"
              >
                {isOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-4 pt-2 pb-8 space-y-1 bg-slate-900 border-t border-slate-800 shadow-2xl">
          {!isProjectView ? (
            navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.href, item.href.substring(1))}
                className={`block w-full text-left px-4 py-4 text-base font-medium rounded-xl transition-all ${
                  activeSection === item.href.substring(1) 
                    ? 'text-blue-400 bg-blue-500/5' 
                    : 'text-gray-300 hover:text-blue-400 hover:bg-slate-800'
                }`}
              >
                {item.name}
              </button>
            ))
          ) : (
            <button onClick={onNavigate} className="block w-full text-left px-4 py-4 text-gray-300 hover:bg-slate-800 rounded-xl">
              <Home size={18} className="inline mr-2" /> Back to Home
            </button>
          )}
        </div>
      </div>

      {/* Global CSS for Shimmer - Add this to your Tailwind/CSS file */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </nav>
  );
};

export default Navbar;