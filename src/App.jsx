import React, { useState, useEffect } from 'react';
import Lenis from '@studio-freight/lenis';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Education from './components/Education';
import Experience from './components/Experience';
import Projects from './components/Projects';
import ProjectDetail from './components/ProjectDetail';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot'; 
// Import your new components
import CustomCursor from './components/CustomCursor';
import Magnetic from './components/Magnetic';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedProject, setSelectedProject] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  const handleProjectView = (project) => {
    setSelectedProject(project);
    setCurrentView('project-detail');
    window.scrollTo(0, 0);
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedProject(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 selection:bg-blue-500/30 text-white">
      {/* 1. Global Custom Cursor goes here */}
      <CustomCursor />

      {currentView === 'project-detail' && selectedProject ? (
        <>
          <Navbar 
            onNavigate={handleBackToHome} 
            isProjectView={true} 
            setIsChatOpen={setIsChatOpen} 
          />
          <ProjectDetail project={selectedProject} onBack={handleBackToHome} />
        </>
      ) : (
        <>
          <Navbar setIsChatOpen={setIsChatOpen} />
          
          {/* 
            Example of using Magnetic in App.jsx (though it's usually better 
            to use it inside Hero.jsx or Contact.jsx for specific buttons)
          */}
          <Hero />
          
          <Projects onProjectView={handleProjectView} />
          <About />
          <Skills />
          <Education />
          <Experience />
          <Contact />
          <Footer />
        </>
      )}

      <Chatbot isOpen={isChatOpen} setIsOpen={setIsChatOpen} />
    </div>
  );
}

export default App;