import React, { useState, useEffect } from 'react';
import { Menu, X, Home } from 'lucide-react';

const Navbar = ({ onNavigate, isProjectView = false }) => {
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

      // Update active section based on scroll position
      if (!isProjectView) {
        const sections = navItems.map(item => item.href.substring(1));
        const scrollPosition = window.scrollY + 100; // Offset for better detection

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

  const isActive = (sectionName) => {
    return activeSection === sectionName;
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-slate-900/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Portfolio
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {isProjectView ? (
              <button
                onClick={() => onNavigate()}
                className="flex items-center text-gray-300 hover:text-blue-400 transition-colors duration-200"
              >
                <Home size={18} className="mr-2" />
                Back to Home
              </button>
            ) : (
              navItems.map((item) => {
                const sectionName = item.href.substring(1);
                const active = isActive(sectionName);
                
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavClick(item.href, sectionName)}
                    className={`relative text-gray-300 hover:text-blue-400 transition-all duration-200 font-medium ${
                      active ? 'text-blue-400' : ''
                    }`}
                  >
                    {item.name}
                    {active && (
                      <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-blue-400 transition-colors duration-200"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-slate-800 rounded-lg mb-4">
              {isProjectView ? (
                <button
                  onClick={() => onNavigate()}
                  className="flex items-center w-full px-3 py-2 text-gray-300 hover:text-blue-400 transition-colors duration-200"
                >
                  <Home size={18} className="mr-2" />
                  Back to Home
                </button>
              ) : (
                navItems.map((item) => {
                  const sectionName = item.href.substring(1);
                  const active = isActive(sectionName);
                  
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleNavClick(item.href, sectionName)}
                      className={`relative block w-full text-left px-3 py-2 text-gray-300 hover:text-blue-400 transition-colors duration-200 ${
                        active ? 'text-blue-400 bg-slate-700/50' : ''
                      }`}
                    >
                      {item.name}
                      {active && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-purple-500 rounded-r-full"></div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;