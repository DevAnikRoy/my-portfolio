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

  // 1. Lenis Smooth Scroll Setup
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

  // 2. Global Voice Command & Wake Word Logic
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    const scrollToSection = (id) => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    };

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
      console.log("Captured:", transcript);
      
      // Wake Word Detection
      if (transcript.includes("hey agent") || transcript.includes("hi agent")) {
        console.log("Wake word detected!");
        setIsChatOpen(true);
      }

      // Direct Navigation Commands
      if (transcript.includes("go to about")) scrollToSection("about");
      if (transcript.includes("go to projects")) scrollToSection("projects");
      if (transcript.includes("go to skills")) scrollToSection("skills");
      if (transcript.includes("go to contact")) scrollToSection("contact");
    };

    // Auto-restart if the service times out
    recognition.onend = () => {
      recognition.start();
    };

    // Browsers require a user click to start the mic. 
    // This starts the listener after the first click anywhere on the page.
    const startOnInteraction = () => {
      recognition.start();
      window.removeEventListener('click', startOnInteraction);
    };

    window.addEventListener('click', startOnInteraction);

    return () => {
      window.removeEventListener('click', startOnInteraction);
      recognition.onend = null;
      recognition.stop();
    };
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
          
          <div id="projects">
            <Projects onProjectView={handleProjectView} />
          </div>

          <div id="about">
            <About />
          </div>

          <div id="skills">
            <Skills />
          </div>

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