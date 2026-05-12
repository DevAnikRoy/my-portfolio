import React, { useState, useRef } from "react"; // Added useRef
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

function App() {
  const [currentView, setCurrentView] = useState("home");
  const [selectedProject, setSelectedProject] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showSecondPopup, setShowSecondPopup] = useState(false);

  // Ref to track agent activation
  const isAgentActiveRef = useRef(false);

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
        handleVoiceCommands(transcript);
      }
    };

    recognition.start();
  };

  const handleVoiceCommands = (command) => {
    const matches = (keywords) => keywords.some((key) => command.includes(key));

    if (matches(["home", "start", "top", "main", "beginning"])) {
      speak("Heading back to the top.");
      document.getElementById("home")?.scrollIntoView({ behavior: "smooth" });
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
      document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
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
      document.getElementById("skills")?.scrollIntoView({ behavior: "smooth" });
    } else if (
      matches(["education", "study", "university", "college", "degree"])
    ) {
      speak("Moving to my academic background.");
      document
        .getElementById("education")
        ?.scrollIntoView({ behavior: "smooth" });
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
      document
        .getElementById("experience")
        ?.scrollIntoView({ behavior: "smooth" });
    } else if (
      matches(["project", "work", "portfolio", "showcase", "build", "apps"])
    ) {
      speak("Redirecting to my featured projects.");
      document
        .getElementById("projects")
        ?.scrollIntoView({ behavior: "smooth" });
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
      document
        .getElementById("contact")
        ?.scrollIntoView({ behavior: "smooth" });
    } else if (matches(["scroll down", "next", "more"])) {
      window.scrollBy({ top: 600, behavior: "smooth" });
    } else if (matches(["scroll up", "back", "previous"])) {
      window.scrollBy({ top: -600, behavior: "smooth" });
    }
  };

  const handleProjectView = (project) => {
    setSelectedProject(project);
    setCurrentView("project-detail");
    window.scrollTo(0, 0);
  };

  const handleBackToHome = () => {
    setCurrentView("home");
    setSelectedProject(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 selection:bg-blue-500/30 text-white">
      <CustomCursor />

      {currentView === "project-detail" && selectedProject ? (
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
          <div id="skills">
            <Skills />
          </div>
          <div id="experience">
            <Experience />
          </div>
          <div id="about">
            <About />
          </div>
          <div id="education">
            <Education />
          </div>
          <div id="contact">
            <Contact />
          </div>
          <div id="voicePopUp">
            <VoicePopup onFinish={initVoiceListener} />
          </div>

          <Footer />
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
    </div>
  );
}

export default App;
