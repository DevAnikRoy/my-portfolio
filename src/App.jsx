import React, { useState, useEffect, useRef } from 'react';
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
  
  // Ref to prevent duplicate command processing
  const lastCommandRef = useRef("");

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

  // 2. Global Voice Command & Peer-to-Peer Logic
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    // Enhanced Peer-to-Peer Speech Function
    const speak = (text) => {
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(text);
      
      const voices = synth.getVoices();
      // Look for a natural male voice for that "Architect" vibe
      const maleVoice = voices.find(voice => 
        voice.name.includes("Google US English") || voice.name.includes("Male")
      );
      
      if (maleVoice) utterance.voice = maleVoice;
      utterance.pitch = 1.1; 
      utterance.rate = 1.0;  
      
      synth.cancel(); // Clear queue to stay responsive
      synth.speak(utterance);
    };

    // Personality Response Bank
    const peerResponses = {
      home: ["Heading back to the start.", "Right at the top for you.", "Back to home base."],
      about: ["Alright, taking you to my story.", "Sure thing, here’s a bit about me.", "On it. Let's see who I am."],
      projects: ["Check these out. Here’s my recent work.", "Cool, let's dive into the projects.", "Moving to the portfolio now."],
      skills: ["Cool, here is my tech stack.", "Showing you what I can do.", "Loading the technical toolkit."],
      education: ["Here is my academic background.", "Taking you to my learning journey."],
      experience: ["Let's look at my professional history.", "Moving to my career timeline."],
      contact: ["Let's get in touch. Moving to contact.", "Sure, I'm always down to chat. Here you go.", "Navigating to the contact section."]
    };

    // Navigation Handler
    const handleNavigation = (id) => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        
        // Pick a random peer response based on the section ID
        const responses = peerResponses[id] || [`Moving to ${id}.`];
        const randomMsg = responses[Math.floor(Math.random() * responses.length)];
        speak(randomMsg);
      }
    };

    // Voice Intent Map
    const voiceCommands = [
      { intent: "home", triggers: ["home", "main", "start", "top"], action: () => handleNavigation("home") },
      { intent: "about", triggers: ["about", "who are you", "story", "info"], action: () => handleNavigation("about") },
      { intent: "skills", triggers: ["skills", "stack", "tools", "coding"], action: () => handleNavigation("skills") },
      { intent: "education", triggers: ["education", "study", "university"], action: () => handleNavigation("education") },
      { intent: "experience", triggers: ["experience", "work history", "career"], action: () => handleNavigation("experience") },
      { intent: "projects", triggers: ["projects", "works", "portfolio", "built"], action: () => handleNavigation("projects") },
      { intent: "contact", triggers: ["contact", "hire", "email", "message"], action: () => handleNavigation("contact") },
      { 
        intent: "chat", 
        triggers: ["open chat", "close chat", "agent", "talk to me"], 
        action: () => {
          setIsChatOpen(prev => !prev);
          speak(isChatOpen ? "Closing the chat." : "Agent system active.");
        } 
      }
    ];

    recognition.onresult = (event) => {
      const currentIndex = event.resultIndex;
      const transcript = event.results[currentIndex][0].transcript.toLowerCase().trim();

      // Duplicate Filter: Only process if it's a new unique command
      if (transcript === lastCommandRef.current) return;
      lastCommandRef.current = transcript;

      console.log("Voice Command Recognized:", transcript);

      // Wake Word logic
      if (transcript.includes("hey agent") || transcript.includes("hi agent")) {
        setIsChatOpen(true);
        speak("System online. What do you need?");
        return;
      }

      // Execute matched intent
      voiceCommands.forEach(command => {
        if (command.triggers.some(trigger => transcript.includes(trigger))) {
          command.action();
        }
      });
    };

    recognition.onend = () => recognition.start();

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
  }, [isChatOpen]); // Dependency added to keep toggle logic fresh

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
          <Navbar onNavigate={handleBackToHome} isProjectView={true} setIsChatOpen={setIsChatOpen} />
          <ProjectDetail project={selectedProject} onBack={handleBackToHome} />
        </>
      ) : (
        <>
          <Navbar setIsChatOpen={setIsChatOpen} />
          
          <div id="home"><Hero /></div>
          <div id="projects"><Projects onProjectView={handleProjectView} /></div>
          <div id="about"><About /></div>
          <div id="skills"><Skills /></div>
          <div id="education"><Education /></div>
          <div id="experience"><Experience /></div>
          <div id="contact"><Contact /></div>

          <Footer />
        </>
      )}

      <Chatbot isOpen={isChatOpen} setIsOpen={setIsChatOpen} />
    </div>
  );
}

export default App;