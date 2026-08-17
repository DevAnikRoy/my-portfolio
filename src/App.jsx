import React, { useState, useRef, useEffect } from "react";
import Lenis from "@studio-freight/lenis";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Skills from "./components/Skills";
import Education from "./components/Education";
import Experience from "./components/Experience";
import Projects from "./components/Projects";
import ProjectDetail from "./components/ProjectDetail";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Chatbot from "./components/Chatbot";
import CustomCursor from "./components/CustomCursor";
import Carousel from "./components/Carousel";
import VoicePopup from "./components/VoicePopup";
import SecondPopUp from "./components/SecondPopUp";
import PROJECTS from "./data/projects";

function App() {
  const [currentView, setCurrentView] = useState("home");
  const [selectedProject, setSelectedProject] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showSecondPopup, setShowSecondPopup] = useState(false);
  const [pendingLink, setPendingLink] = useState(null);

  // Ref to track agent activation
  const isAgentActiveRef = useRef(false);
  const voiceInitializedRef = useRef(false);

  // Refs to sync latest state with voice closure (recognition.onresult is set once)
  const currentViewRef = useRef(currentView);
  const selectedProjectRef = useRef(selectedProject);
  const handleProjectViewRef = useRef(null);
  const handleBackToHomeRef = useRef(null);
  const linkRef = useRef(null);

  useEffect(() => { currentViewRef.current = currentView; }, [currentView]);
  useEffect(() => { selectedProjectRef.current = selectedProject; }, [selectedProject]);

  // Function to make the Agent speak back to you
  const speak = (text) => {
    // Cancel any current speech so it doesn't get "stuck"
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Get all available voices
    let voices = window.speechSynthesis.getVoices();

    // If voices aren't loaded yet, wait for them
    if (voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
        setVoiceAndSpeak(utterance, voices);
      };
    } else {
      setVoiceAndSpeak(utterance, voices);
    }
  };

  // Helper to pick a professional voice
  const setVoiceAndSpeak = (utterance, voices) => {
    const preferredVoice =
      voices.find((v) => v.name.includes("Google US English")) || voices[0];
    utterance.voice = preferredVoice;
    utterance.rate = 0.95;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const initVoiceListener = () => {
    // 1. WARM UP THE VOICE ENGINE
    const warmup = new SpeechSynthesisUtterance("");
    window.speechSynthesis.speak(warmup);

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript
        .toLowerCase()
        .trim();
      console.log("Agent Heard:", transcript);

      // 1. ACTIVATE AGENT
      if (
        transcript.includes("hey agent") ||
        transcript.includes("hay agent")
      ) {
        speak("System activated. How can I help you?");
        setTimeout(() => {
          setShowSecondPopup(true);
          isAgentActiveRef.current = true;
        }, 500);
        return;
      }

      // 2. NAVIGATION COMMANDS
      if (isAgentActiveRef.current) {
        handleVoiceCommandsRef.current?.(transcript);
      }
    };

    recognition.onend = () => {
      if (!voiceInitializedRef.current) return;
      setTimeout(() => {
        try {
          recognition.start();
        } catch {
          /* already running */
        }
      }, 280);
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        voiceInitializedRef.current = false;
      }
    };

    try {
      recognition.start();
      voiceInitializedRef.current = true;
    } catch {
      voiceInitializedRef.current = false;
    }
  };

  useEffect(() => {
    if (!pendingLink) return;
    const t = setTimeout(() => setPendingLink(null), 10000);
    return () => clearTimeout(t);
  }, [pendingLink]);

  const openUrl = (url) => {
    setPendingLink(url);
    const w = window.open(url, '_blank');
    if (w && !w.closed) setPendingLink(null);
  };

  const handleVoiceCommandsRef = useRef(null);
  const handleBackToProjectsRef = useRef(null);

  const scrollToSection = (id) => {
    window.dispatchEvent(new Event("close-mobile-nav"));
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleVoiceCommands = (command) => {
    const matches = (keywords) => keywords.some((key) => command.includes(key));

    // --- Project Detail View Commands ---
    if (currentViewRef.current === "project-detail" && selectedProjectRef.current) {
      const proj = selectedProjectRef.current;

      if (matches(["live demo", "demo", "live site", "visit site"])) {
        speak(`Opening ${proj.title} live demo.`);
        openUrl(proj.liveUrl);
        return;
      }
      if (matches(["source code", "github", "code", "repository", "repo"])) {
        const gitUrl = proj.githubUrl || proj.git;
        if (!gitUrl) {
          speak(`${proj.title} is a live Webflow site. Opening the live demo instead.`);
          openUrl(proj.liveUrl || proj.live);
          return;
        }
        speak(`Opening ${proj.title} source code.`);
        openUrl(gitUrl);
        return;
      }
      if (matches(["go back", "back", "return"])) {
        speak("Going back to projects.");
        handleBackToProjectsRef.current?.();
        return;
      }
      if (matches(["back to home", "home"])) {
        speak("Heading back to the top.");
        handleBackToHomeRef.current?.();
        return;
      }
    }

    // --- Project Name Commands (from anywhere) ---
    const matchedProject = PROJECTS.find((p) => {
      const title = p.title.toLowerCase();
      const bareName = title.replace(/\s*platform$/i, '');
      const words = bareName.split(/\s+/);
      const cmdNoSpace = command.replace(/\s+/g, '');
      const aliases = (p.aliases || []).map((a) => a.toLowerCase());
      if (aliases.some((alias) => command.includes(alias) || cmdNoSpace.includes(alias.replace(/\s+/g, '')))) {
        return true;
      }
      if (command.includes(title) || command.includes(bareName)) return true;
      if (words.length === 1) return command.includes(words[0]) || cmdNoSpace.includes(words[0]);
      if (words.length > 1) {
        const matched = words.filter(w => w.length > 1 && (command.includes(w) || cmdNoSpace.includes(w)));
        return matched.length >= 2;
      }
      return false;
    });
    if (matchedProject) {
      if (matches(["details", "detail", "show", "see", "open", "case study", "view", "tell me about"])) {
        speak(`Opening ${matchedProject.title} case study.`);
        handleProjectViewRef.current?.({
          ...matchedProject,
          liveUrl: matchedProject.live,
          githubUrl: matchedProject.git,
        });
        return;
      }
      if (matches(["live demo", "demo", "live site"])) {
        speak(`Opening ${matchedProject.title} live demo.`);
        openUrl(matchedProject.live);
        return;
      }
      if (matches(["source code", "github", "code", "repository"])) {
        if (!matchedProject.git) {
          speak(`${matchedProject.title} is a live Webflow site. Opening the live demo instead.`);
          openUrl(matchedProject.live);
          return;
        }
        speak(`Opening ${matchedProject.title} source code.`);
        openUrl(matchedProject.git);
        return;
      }
    }

    // --- Section Navigation Commands ---
    if (matches(["home", "start", "top", "main", "beginning"])) {
      speak("Heading back to the top.");
      scrollToSection("home");
    } else if (
      matches([
        "about",
        "who are you",
        "yourself",
        "bio",
        "background",
        "story",
      ])
    ) {
      speak("Let me tell you a bit about myself.");
      scrollToSection("about");
    } else if (
      matches([
        "skills",
        "tech",
        "languages",
        "tools",
        "what do you use",
        "stack",
      ])
    ) {
      speak("Here are the technologies I specialize in.");
      scrollToSection("skills");
    } else if (
      matches(["education", "study", "university", "college", "degree"])
    ) {
      speak("Moving to my academic background.");
      scrollToSection("education");
    } else if (
      matches([
        "experience",
        "work",
        "jobs",
        "history",
        "career",
        "professional",
      ])
    ) {
      speak("Here is my professional work history.");
      scrollToSection("experience");
    } else if (
      matches(["project", "work", "portfolio", "showcase", "build", "apps"])
    ) {
      speak("Redirecting to my featured projects.");
      scrollToSection("projects");
    } else if (
      matches([
        "contact",
        "hire",
        "email",
        "message",
        "call",
        "reach out",
        "touch",
      ])
    ) {
      speak("Let's get in touch.");
      scrollToSection("contact");
    } else if (matches(["scroll down", "next", "more"])) {
      window.dispatchEvent(new Event("close-mobile-nav"));
      window.scrollBy({
        top: Math.max(280, Math.round(window.innerHeight * 0.7)),
        behavior: "smooth",
      });
    } else if (matches(["scroll up", "back", "previous"])) {
      window.dispatchEvent(new Event("close-mobile-nav"));
      window.scrollBy({
        top: -Math.max(280, Math.round(window.innerHeight * 0.7)),
        behavior: "smooth",
      });
    }
  };

  const handleProjectView = (project) => {
    window.dispatchEvent(new Event("close-mobile-nav"));
    setSelectedProject(project);
    setCurrentView("project-detail");
    window.scrollTo(0, 0);
  };

  const handleBackToHome = () => {
    setCurrentView("home");
    setSelectedProject(null);
    window.scrollTo(0, 0);
  };

  const handleBackToProjects = () => {
    setCurrentView("home");
    setSelectedProject(null);
    setTimeout(() => {
      scrollToSection("projects");
    }, 50);
  };

  handleProjectViewRef.current = handleProjectView;
  handleBackToHomeRef.current = handleBackToHome;
  handleBackToProjectsRef.current = handleBackToProjects;
  handleVoiceCommandsRef.current = handleVoiceCommands;

  return (
    <div className="min-h-screen bg-[#110E1B] text-white font-sans selection:bg-purple-500/30 selection:text-purple-200 flex flex-col md:flex-row">
      <a ref={linkRef} target="_blank" rel="noopener noreferrer" className="hidden" />
      <CustomCursor />

      {currentView === "project-detail" && selectedProject ? (
        <>
          <Navbar
            onNavigate={handleBackToHome}
            isProjectView={true}
            setIsChatOpen={setIsChatOpen}
          />
          <main className="flex-1 min-w-0">
            <ProjectDetail project={selectedProject} onBack={handleBackToHome} />
          </main>
        </>
      ) : (
        <>
          <Navbar setIsChatOpen={setIsChatOpen} />

          <main className="flex-1 min-w-0">
            <div className="max-w-5xl mx-auto px-4 pt-[calc(5.5rem+env(safe-area-inset-top))] pb-8 sm:px-6 md:p-12 lg:p-16 md:pt-12 space-y-4 md:space-y-8 min-h-[calc(100dvh-theme(spacing.80))]">
              <Hero />
              <Projects onProjectView={handleProjectView} />
              <Skills />
              <Experience />
              <About />
              <Education />
              <Contact />
            </div>

            {!voiceInitializedRef.current && (
              <div id="voicePopUp">
                <VoicePopup onFinish={initVoiceListener} />
              </div>
            )}

            <Footer />
          </main>
        </>
      )}

      <SecondPopUp
        isOpen={showSecondPopup}
        onClose={() => {
          setShowSecondPopup(false);
          document.body.style.overflow = "auto";
        }}
      />

      <Chatbot isOpen={isChatOpen} setIsOpen={setIsChatOpen} />

      {pendingLink && (
        <div className="fixed bottom-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.5rem))] md:bottom-6 left-1/2 -translate-x-1/2 z-50 animate-bounce px-4 w-full max-w-sm">
          <a href={pendingLink} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-medium shadow-xl transition-all hover:scale-105"
            style={{ background:'linear-gradient(90deg,#7873F5,#EC77AB)', color:'#fff' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Open in new tab
          </a>
        </div>
      )}
    </div>
  );
}

export default App;
