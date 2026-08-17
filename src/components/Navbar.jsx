import React, { useState, useEffect } from 'react';
import {
  X,
  Menu,
  Compass,
  FolderKanban,
  Code2,
  Briefcase,
  User,
  GraduationCap,
  Mail,
  Bot,
  FileText,
  Github,
  Linkedin,
  Home,
} from 'lucide-react';
import heroImage from '../assets/new-img-2026.jpg';

const navItems = [
  { name: 'Explore', href: '#home', id: 'home', Icon: Compass },
  { name: 'Projects', href: '#projects', id: 'projects', Icon: FolderKanban },
  { name: 'Skills', href: '#skills', id: 'skills', Icon: Code2 },
  { name: 'Experience', href: '#experience', id: 'experience', Icon: Briefcase },
  { name: 'About me', href: '#about', id: 'about', Icon: User },
  { name: 'Education', href: '#education', id: 'education', Icon: GraduationCap },
  { name: 'Contact', href: '#contact', id: 'contact', Icon: Mail },
];

function NavButton({ item, active, onClick }) {
  const Icon = item.Icon;
  const isActive = active === item.id;

  return (
    <button
      onClick={onClick}
      className={`group relative flex items-center justify-between w-full min-h-[48px] px-4 py-3.5 md:py-3 rounded-2xl transition-all duration-200 overflow-hidden ${
        isActive ? 'bg-[#120F1F] text-white' : 'text-[#8E8E93] active:text-white hover:text-white'
      }`}
    >
      {!isActive && (
        <>
          <div className="absolute inset-0 rounded-2xl p-[2px] bg-gradient-to-r from-[#7873F5] to-[#EC77AB] opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-150 -z-10" />
          <div className="absolute inset-[2px] bg-gradient-to-r from-[#7873F5]/5 to-[#EC77AB]/5 rounded-2xl opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-150 -z-10" />
        </>
      )}
      <div className="flex items-center gap-4">
        <Icon
          size={20}
          className={isActive ? 'text-white' : 'text-[#8E8E93] group-hover:text-white'}
        />
        <span className="text-sm font-medium tracking-wide">{item.name}</span>
      </div>
    </button>
  );
}

const Navbar = ({ onNavigate, isProjectView = false, setIsChatOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      if (isProjectView) return;
      const sections = navItems.map((item) => item.id);
      const offset = window.innerWidth < 768 ? 140 : 120;
      const scrollPosition = window.scrollY + offset;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (!section) continue;
        const top = section.getBoundingClientRect().top + window.scrollY;
        if (top <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isProjectView]);

  useEffect(() => {
    const close = () => setIsOpen(false);
    window.addEventListener('close-mobile-nav', close);
    return () => window.removeEventListener('close-mobile-nav', close);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('nav-locked', isOpen);
    return () => document.body.classList.remove('nav-locked');
  }, [isOpen]);

  const handleNavClick = (href, sectionName) => {
    if (isProjectView) {
      onNavigate();
      setIsOpen(false);
      return;
    }
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionName);
    }
    setIsOpen(false);
  };

  const sidebarInner = (
    <div className="flex flex-col justify-between h-full min-h-0">
      <div>
        <div className="hidden md:flex items-center gap-4 mb-12">
          <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-r from-[#7873F5] to-[#EC77AB]">
            <div className="w-full h-full rounded-full overflow-hidden border border-[#191528]">
              <img
                src={heroImage}
                alt="Anik Roy"
                className="w-full h-full rounded-full object-cover object-[center_0%] bg-[#0E0C17]"
              />
            </div>
          </div>
          <div>
            <h2 className="font-bold text-xl leading-tight text-white mb-1">Anik Roy</h2>
            <p className="text-sm text-[#8E8E93] font-medium">Frontend Architect</p>
          </div>
        </div>

        <div className="space-y-1 mb-8">
          {isProjectView ? (
            <button
              onClick={() => {
                onNavigate();
                setIsOpen(false);
              }}
              className="group relative flex items-center w-full min-h-[48px] px-4 py-3 rounded-2xl bg-[#120F1F] text-white"
            >
              <Home size={20} className="mr-4" />
              <span className="text-sm font-medium tracking-wide">Back to Home</span>
            </button>
          ) : (
            navItems.map((item) => (
              <NavButton
                key={item.id}
                item={item}
                active={activeSection}
                onClick={() => handleNavClick(item.href, item.id)}
              />
            ))
          )}
        </div>

        <div className="space-y-1 mb-8">
          <p className="px-4 text-xs font-bold text-[#48484A] mb-3 uppercase tracking-widest">
            Resources
          </p>
          <button
            onClick={() => {
              setIsChatOpen(true);
              setIsOpen(false);
            }}
            className="group relative flex items-center w-full min-h-[48px] px-4 py-3.5 rounded-2xl text-[#8E8E93] hover:text-white transition-all overflow-hidden"
          >
            <div className="absolute inset-0 rounded-2xl p-[2px] bg-gradient-to-r from-[#7873F5] to-[#EC77AB] opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-150 -z-10" />
            <Bot size={20} className="mr-4 text-[#8E8E93] group-hover:text-white" />
            <span className="text-sm font-medium tracking-wide">Ask AI</span>
          </button>
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center w-full min-h-[48px] px-4 py-3.5 rounded-2xl text-[#8E8E93] hover:text-white transition-all overflow-hidden"
          >
            <FileText size={20} className="mr-4 text-[#8E8E93] group-hover:text-white" />
            <span className="text-sm font-medium tracking-wide">Resume</span>
          </a>
        </div>

        <div className="space-y-3 px-4 pt-4 border-t border-[#191528] pb-[max(1rem,env(safe-area-inset-bottom))]">
          <p className="text-xs font-bold text-[#48484A] uppercase tracking-widest mb-2">
            Connect
          </p>
          <div className="flex gap-2">
            <a
              href="mailto:anikroy302@gmail.com"
              className="relative p-3 rounded-xl bg-[#1C1C1E] min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Email"
            >
              <Mail size={20} className="text-[#8E8E93]" />
            </a>
            <a
              href="https://www.linkedin.com/in/anik-roy-2171621b3/"
              target="_blank"
              rel="noreferrer"
              className="relative p-3 rounded-xl bg-[#1C1C1E] min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="LinkedIn"
            >
              <Linkedin size={20} className="text-[#8E8E93]" />
            </a>
            <a
              href="https://github.com/DevAnikRoy"
              target="_blank"
              rel="noreferrer"
              className="relative p-3 rounded-xl bg-[#1C1C1E] min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="GitHub"
            >
              <Github size={20} className="text-[#8E8E93]" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="w-full md:w-[320px] md:h-screen md:sticky md:top-0 border-r border-[#191528] bg-[#0E0C17] hidden md:flex flex-col justify-between p-8 z-50 overflow-y-auto scrollbar-hide">
        {sidebarInner}
      </aside>

      <header className="md:hidden fixed top-0 left-0 right-0 z-[100] border-b border-[#191528] bg-[#0E0C17]/90 backdrop-blur-xl pt-[env(safe-area-inset-top)]">
        <div className="flex items-center justify-between h-16 px-4">
          <button
            onClick={() => handleNavClick('#home', 'home')}
            className="flex items-center gap-3 min-h-[44px]"
          >
            <div className="w-9 h-9 rounded-full p-[1.5px] bg-gradient-to-r from-[#7873F5] to-[#EC77AB]">
              <img
                src={heroImage}
                alt=""
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <span className="font-semibold text-white text-sm">Anik Roy</span>
          </button>
          <button
            onClick={() => setIsOpen((v) => !v)}
            className="relative w-11 h-11 flex items-center justify-center rounded-full bg-[#1C1C1E]"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
          >
            <div
              className={`absolute inset-0 rounded-full p-[2px] bg-gradient-to-r from-[#7873F5] to-[#EC77AB] transition-opacity ${
                isOpen ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMask:
                  'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
              }}
            />
            <div className="relative z-10 text-white">
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </div>
          </button>
        </div>
      </header>

      {isOpen && (
        <div className="md:hidden fixed inset-0 z-[90] bg-[#0E0C17] overflow-y-auto pt-[calc(4.5rem+env(safe-area-inset-top))] px-5">
          {sidebarInner}
        </div>
      )}
    </>
  );
};

export default Navbar;
