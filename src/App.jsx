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

  // 2. Global Voice Command & Intent Logic
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    // Audio Feedback Helper
    const speak = (text) => {
      const speech = new SpeechSynthesisUtterance(text);
      speech.rate = 1.1;
      speech.pitch = 1;
      window.speechSynthesis.speak(speech);
    };

    // Navigation Helper
    const scrollToSection = (id) => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        speak(`Navigating to ${id}.`);
      }
    };

    // --- FULL NAVBAR INTENT MAP ---
    const voiceCommands = [
      {
        intent: "Home",
        triggers: ["home", "main", "start", "top", "beginning"],
        action: () => {
          window.scrollTo({ top: 0, behavior: "smooth" });
          speak("Scrolling to top.");
        }
      },
      {
        intent: "About",
        triggers: ["about", "who are you", "story", "info", "background"],
        action: () => scrollToSection("about")
      },
      {
        intent: "Skills",
        triggers: ["skills", "stack", "technologies", "tools", "coding"],
        action: () => scrollToSection("skills")
      },
      {
        intent: "Education",
        triggers: ["education", "study", "university", "college", "degree"],
        action: () => scrollToSection("education")
      },
      {
        intent: "Experience",
        triggers: ["experience", "work history", "jobs", "career", "professional"],
        action: () => scrollToSection("experience")
      },
      {
        intent: "Projects",
        triggers: ["projects", "works", "portfolio", "build", "built"],
        action: () => scrollToSection("projects")
      },
      {
        intent: "Contact",
        triggers: ["contact", "hire", "email", "message", "reach"],
        action: () => scrollToSection("contact")
      },
      {
        intent: "Chat Control",
        triggers: ["open chat", "close chat", "stop talking", "agent", "talk to me"],
        action: () => setIsChatOpen(prev => !prev)
      }
    ];

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
      console.log("Captured:", transcript);

      // Wake Word Logic
      if (transcript.includes("hey agent") || transcript.includes("hi agent")) {
        setIsChatOpen(true);
        speak("Agent online. How can I assist you?");
        return; 
      }

      // Command Execution Loop
      voiceCommands.forEach(command => {
        if (command.triggers.some(trigger => transcript.includes(trigger))) {
          console.log(`Executing: ${command.intent}`);
          command.action();
        }
      });
    };

    // Auto-restart listener
    recognition.onend = () => recognition.start();

    // Start on first user click (Browser requirement)
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
          
          <div id="home">
            <Hero />
          </div>

          <div id="projects">
            <Projects onProjectView={handleProjectView} />
          </div>

          <div id="about">
            <About />
          </div>

          <div id="skills">
            <Skills />
          </div>

          <div id="education">
            <Education />
          </div>

          <div id="experience">
            <Experience />
          </div>

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