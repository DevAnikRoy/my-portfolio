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
import CustomCursor from './components/CustomCursor';

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
          
          <Hero />
          
          {/* IDs added here to enable Voice Command Navigation */}
          <div id="projects">
            <Projects onProjectView={handleProjectView} />
          </div>

          <div id="about">
            <About />
          </div>

          <div id="skills">
            <Skills />
          </div>

          {/* You can also add IDs to these if you want voice control for them */}
          <Education />
          <Experience />

          <div id="contact">
            <Contact />
          </div>

          <Footer />
        </>
      )}

      <Chatbot isOpen={isChatOpen} setIsOpen={setIsChatOpen} />
    </div>
  );
}

export default App;