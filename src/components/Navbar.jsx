import React, { useState, useEffect } from 'react';
import { Menu, X, Home, MessageSquareText } from 'lucide-react';

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
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled || isOpen ? 'bg-slate-900/95 backdrop-blur-md shadow-lg border-b border-slate-800' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Anik Roy
            </span>
          </div>

          {/* Desktop Navigation (Hidden on Mobile/Tablet) */}
          <div className="hidden lg:flex items-center space-x-6">
            {!isProjectView ? (
              navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.href, item.href.substring(1))}
                  className={`text-sm font-medium transition-colors hover:text-blue-400 ${
                    activeSection === item.href.substring(1) ? 'text-blue-400' : 'text-gray-300'
                  }`}
                >
                  {item.name}
                </button>
              ))
            ) : (
              <button onClick={onNavigate} className="flex items-center text-gray-300 hover:text-blue-400">
                <Home size={18} className="mr-2" /> Home
              </button>
            )}

            <button
              onClick={() => setIsChatOpen(true)}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition-all text-sm font-semibold shadow-lg shadow-blue-500/20"
            >
              <MessageSquareText size={18} />
              Ask AI
            </button>
          </div>

          {/* Mobile/Tablet Controls (Visible on Small Devices) */}
          <div className="lg:hidden flex items-center gap-3">
            <button 
              onClick={() => setIsChatOpen(true)}
              className="p-2.5 text-blue-400 bg-blue-500/10 rounded-full border border-blue-500/20"
            >
              <MessageSquareText size={20} />
            </button>
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="p-2 text-gray-300 hover:text-white"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-4 pt-2 pb-6 space-y-1 bg-slate-900 border-t border-slate-800">
          {!isProjectView ? (
            navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.href, item.href.substring(1))}
                className="block w-full text-left px-4 py-3 text-base font-medium text-gray-300 hover:text-blue-400 hover:bg-slate-800 rounded-xl transition-all"
              >
                {item.name}
              </button>
            ))
          ) : (
            <button onClick={onNavigate} className="block w-full text-left px-4 py-3 text-gray-300">
              <Home size={18} className="inline mr-2" /> Back to Home
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;