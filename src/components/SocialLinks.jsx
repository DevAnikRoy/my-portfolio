import React from 'react';
import { Github, Linkedin, Twitter, Mail } from 'lucide-react';

const SocialLinks = () => {
  const socialLinks = [
    { icon: Github, href: 'https://github.com/DevAnikRoy', label: 'GitHub' },
    { icon: Linkedin, href: 'https://www.linkedin.com/in/anik-roy-2171621b3/', label: 'LinkedIn' },
    { icon: Mail, href: 'anikroy302@gmail.com', label: 'Email' },
  ];

  return (
    <div className="flex space-x-6 justify-center lg:justify-start">
      {socialLinks.map((link, index) => {
        const Icon = link.icon;
        return (
          <a
            key={index}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 bg-slate-800 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl"
            aria-label={link.label}
          >
            <Icon size={20} />
          </a>
        );
      })}
    </div>
  );
};

export default SocialLinks;