import React from 'react';
import { Code, Coffee, Mountain, Camera } from 'lucide-react';

const About = () => {
  return (
    <section id="about" className="py-20 bg-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">About Me</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto"></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-semibold text-white mb-6">My Journey</h3>
            <div className="space-y-4 text-gray-300 text-lg leading-relaxed">
              <p>
                My programming journey began 1 years ago when I discovered the magic of turning ideas into reality through code. 
                What started as curiosity quickly evolved into a passion for creating elegant solutions to complex problems.
              </p>
              <p>
                I'm a full-stack developer skilled in React.js, Node.js, Express.js, and MongoDB, with a passion for building fast, responsive, and user-friendly web applications. I work with modern frontend tools like Tailwind CSS, Framer Motion, and JavaScript (ES6+), and create visually stunning interfaces using Webflow and Framer. On the backend, I use JWT and Firebase Auth for secure authentication. I also specialize in WordPress development with Elementor Pro and plugins like WooCommerce and Yoast SEO, delivering complete end-to-end web solutions.
              </p>
              <p>
                The type of work that excites me most involves solving challenging technical problems, optimizing performance, 
                and collaborating with teams to bring innovative ideas to life. I'm particularly drawn to projects that have 
                a positive impact on people's lives.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-semibold text-white mb-6">Beyond Code</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-slate-700/50 p-6 rounded-lg hover:bg-slate-700 transition-colors duration-200">
                <Mountain className="text-blue-400 mb-3" size={32} />
                <h4 className="text-white font-semibold mb-2">Hiking</h4>
                <p className="text-gray-400 text-sm">
                  Love exploring nature trails and finding inspiration in the great outdoors.
                </p>
              </div>
              
              <div className="bg-slate-700/50 p-6 rounded-lg hover:bg-slate-700 transition-colors duration-200">
                <Camera className="text-purple-400 mb-3" size={32} />
                <h4 className="text-white font-semibold mb-2">Photography</h4>
                <p className="text-gray-400 text-sm">
                  Capturing moments and telling stories through the lens of my camera.
                </p>
              </div>
              
              <div className="bg-slate-700/50 p-6 rounded-lg hover:bg-slate-700 transition-colors duration-200">
                <Coffee className="text-cyan-400 mb-3" size={32} />
                <h4 className="text-white font-semibold mb-2">Coffee</h4>
                <p className="text-gray-400 text-sm">
                  Enthusiast of specialty coffee and exploring different brewing methods.
                </p>
              </div>
              
              <div className="bg-slate-700/50 p-6 rounded-lg hover:bg-slate-700 transition-colors duration-200">
                <Code className="text-green-400 mb-3" size={32} />
                <h4 className="text-white font-semibold mb-2">Open Source</h4>
                <p className="text-gray-400 text-sm">
                  Contributing to open source projects and sharing knowledge with the community.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;