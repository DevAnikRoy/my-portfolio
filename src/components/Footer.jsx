import React from 'react';
import { Heart, Github, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Github, href: 'https://github.com/DevAnikRoy', label: 'GitHub' },
    { icon: Linkedin, href: 'https://www.linkedin.com/in/anik-roy-2171621b3/', label: 'LinkedIn' },
    { icon: Mail, href: '', label: 'anikroy302@gmail.com' },
  ];

  const quickLinks = [
    { name: 'About', href: '#about' },
    { name: 'Skills', href: '#skills' },
    { name: 'Projects', href: '#projects' },
    { name: 'Contact', href: '#contact' },
  ];

  const handleQuickLinkClick = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center mb-4">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Anik Roy
              </span>
            </div>
            <p className="text-gray-400 mb-6 max-w-sm">
              Full Stack Developer passionate about creating exceptional digital experiences 
              with modern technologies and clean code.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <a
                    key={index}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-slate-800 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300"
                    aria-label={link.label}
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleQuickLinkClick(link.href)}
                    className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-6">Get In Touch</h3>
            <div className="space-y-3">
              <p className="text-gray-400">
                <strong className="text-white">Email:</strong><br />
                anikroy302@gmail.com
              </p>
              <p className="text-gray-400">
                <strong className="text-white">Phone:</strong><br />
                +8801722718821
              </p>
              <p className="text-gray-400">
                <strong className="text-white">Location:</strong><br />
                Dhaka, Bangladesh.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="py-6 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center text-gray-400 mb-4 md:mb-0">
              <span>© {currentYear} Dev-Anik-Roy. Made with</span>
              <Heart className="text-red-500 mx-2" size={16} />
              <span>and lots of coffee</span>
            </div>
            
            <button
              onClick={scrollToTop}
              className="text-gray-400 hover:text-blue-400 transition-colors duration-200 flex items-center"
            >
              Back to top ↑
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;