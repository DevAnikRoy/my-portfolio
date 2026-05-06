import React, { useState, useEffect, useRef } from 'react';
import { X, Menu, Home, Bot, Mic } from 'lucide-react';

const Navbar = ({ onNavigate, isProjectView = false, setIsChatOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [scrollProgress, setScrollProgress] = useState(0);
  const progressRef = useRef(null);

  const navItems = [
    { name: 'Home', href: '#home' },
    { name: 'Projects', href: '#projects' },
    { name: 'About', href: '#about' },
    { name: 'Skills', href: '#skills' },
    { name: 'Education', href: '#education' },
    { name: 'Experience', href: '#experience' },
    { name: 'Contact', href: '#contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? (scrollY / docHeight) * 100 : 0);
      setScrolled(scrollY > 60);

      if (!isProjectView) {
        const sections = navItems.map(i => i.href.substring(1));
        for (let i = sections.length - 1; i >= 0; i--) {
          const el = document.getElementById(sections[i]);
          if (el && el.offsetTop <= scrollY + 120) {
            setActiveSection(sections[i]);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isProjectView]);

  const handleNavClick = (href, sectionName) => {
    if (isProjectView) { onNavigate(); return; }
    const el = document.querySelector(href);
    if (el) { el.scrollIntoView({ behavior: 'smooth' }); setActiveSection(sectionName); }
    setIsOpen(false);
  };

  return (
    <>
      {/* Scroll Progress Bar */}
      <div
        ref={progressRef}
        className="progress-bar"
        style={{ width: `${scrollProgress}%`, transition: 'width 0.1s linear' }}
      />

      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled || isOpen
            ? 'glass border-b border-white/5'
            : 'bg-transparent'
        }`}
        style={{ fontFamily: 'var(--font-body)' }}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="flex justify-between items-center h-[70px] relative">

            {/* Logo */}
            <button
              onClick={() => handleNavClick('#home', 'home')}
              className="relative z-10 flex items-center gap-2 group"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center relative"
                style={{ background: 'linear-gradient(135deg, var(--clr-accent), var(--clr-accent2))' }}>
                <span className="text-white font-black text-xs" style={{ fontFamily: 'var(--font-display)' }}>AR</span>
              </div>
              <span className="text-white font-bold text-lg hidden sm:block" style={{ fontFamily: 'var(--font-display)' }}>
                Anik<span style={{ color: 'var(--clr-accent)' }}>.</span>
              </span>
            </button>

            {/* Center Nav - Desktop */}
            <div className="hidden lg:flex absolute inset-0 items-center justify-center pointer-events-none">
              <div className="flex items-center gap-1 pointer-events-auto glass rounded-full px-3 py-1.5">
                {!isProjectView ? navItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleNavClick(item.href, item.href.substring(1))}
                    className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-300 relative ${
                      activeSection === item.href.substring(1)
                        ? 'text-black'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    style={activeSection === item.href.substring(1) ? {
                      background: 'linear-gradient(135deg, var(--clr-accent), var(--clr-accent2))',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.65rem'
                    } : { fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}
                  >
                    {item.name}
                  </button>
                )) : (
                  <button onClick={onNavigate} className="flex items-center gap-2 text-gray-300 hover:text-white text-sm px-4 py-2">
                    <Home size={14} /> Back to Home
                  </button>
                )}
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 z-10">
              <button
                onClick={() => setIsChatOpen(true)}
                className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 relative group overflow-hidden"
                style={{
                  background: 'rgba(0,212,255,0.1)',
                  border: '1px solid rgba(0,212,255,0.3)',
                  color: 'var(--clr-accent)',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(135deg, var(--clr-accent), var(--clr-accent2))' }} />
                <Bot size={14} className="relative z-10 group-hover:text-black transition-colors" />
                <span className="relative z-10 group-hover:text-black transition-colors">Ask AI</span>
                <span className="relative z-10 w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-screen' : 'max-h-0'}`}>
          <div className="px-5 py-6 space-y-1 border-t border-white/5">
            {!isProjectView ? navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.href, item.href.substring(1))}
                className={`block w-full text-left px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeSection === item.href.substring(1)
                    ? 'text-black'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                style={activeSection === item.href.substring(1)
                  ? { background: 'linear-gradient(135deg, var(--clr-accent), var(--clr-accent2))', fontFamily: 'var(--font-mono)' }
                  : { fontFamily: 'var(--font-mono)' }}
              >
                {item.name}
              </button>
            )) : (
              <button onClick={onNavigate} className="block w-full text-left px-4 py-3.5 text-gray-300 hover:bg-white/5 rounded-xl">
                <Home size={16} className="inline mr-2" /> Back to Home
              </button>
            )}

            <div className="pt-3 border-t border-white/5">
              <button
                onClick={() => { setIsChatOpen(true); setIsOpen(false); }}
                className="w-full py-3.5 rounded-xl text-sm font-semibold text-black transition-all duration-300"
                style={{ background: 'linear-gradient(135deg, var(--clr-accent), var(--clr-accent2))' }}
              >
                <Bot size={16} className="inline mr-2" /> Ask AI Assistant
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;