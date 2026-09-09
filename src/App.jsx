import React, { useState, useRef, useEffect, useCallback } from "react";
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
import VoicePopup from "./components/VoicePopup";
import AgentFloatingCaptions from "./components/AgentFloatingCaptions";
import AgentSessionControls from "./components/AgentSessionControls";
import SiteAuditModal from "./components/SiteAuditModal";
import PROJECTS from "./data/projects";
import useVoiceAgent from "./hooks/useVoiceAgent";
import { executeSiteActions } from "./services/voice-agent/siteActions";
import { warmMic } from "./services/voice-agent/micWarm";
import { pauseNavMic, resumeNavMic } from "./services/voice-agent/micMutex";

function App() {
  const [currentView, setCurrentView] = useState("home");
  const [selectedProject, setSelectedProject] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [pendingLink, setPendingLink] = useState(null);
  const [samActive, setSamActive] = useState(false);
  const [endingSession, setEndingSession] = useState(false);
  const autoStartedRef = useRef(false);

  const voiceIntroClosedRef = useRef(false);
  const [showVoiceIntro, setShowVoiceIntro] = useState(() => {
    try {
      return sessionStorage.getItem("voice-intro-dismissed") !== "1";
    } catch {
      return true;
    }
  });

  const linkRef = useRef(null);
  const actionCtxRef = useRef({});

  const scrollToSection = useCallback((id) => {
    window.dispatchEvent(new Event("close-mobile-nav"));
    if (id === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const openUrl = useCallback((url) => {
    setPendingLink(url);
    const w = window.open(url, "_blank");
    if (w && !w.closed) setPendingLink(null);
  }, []);

  const handleProjectView = useCallback((project) => {
    window.dispatchEvent(new Event("close-mobile-nav"));
    setSelectedProject(project);
    setCurrentView("project-detail");
    window.scrollTo(0, 0);
  }, []);

  const handleBackToHome = useCallback(() => {
    setCurrentView("home");
    setSelectedProject(null);
    window.scrollTo(0, 0);
  }, []);

  const handleBackToProjects = useCallback(() => {
    setCurrentView("home");
    setSelectedProject(null);
    setTimeout(() => {
      scrollToSection("projects");
    }, 50);
  }, [scrollToSection]);

  actionCtxRef.current = {
    scrollToSection,
    openUrl,
    openProject: handleProjectView,
    goHome: handleBackToHome,
    backToProjects: handleBackToProjects,
    projects: PROJECTS,
    openAudit: () => {
      setIsChatOpen(false);
      window.dispatchEvent(new Event("close-mobile-nav"));
      setIsAuditOpen(true);
    },
    openChat: () => {
      setIsAuditOpen(false);
      window.dispatchEvent(new Event("close-mobile-nav"));
      setIsChatOpen(true);
    },
  };

  const onActions = useCallback((actions) => {
    executeSiteActions(actions, actionCtxRef.current);
  }, []);

  const {
    status,
    muted,
    error,
    userCaption,
    agentCaption,
    captionVisible,
    reportStatus,
    hangUp,
    toggleMute,
    retryListen,
  } = useVoiceAgent({ active: samActive, onActions });

  const startSam = useCallback(async () => {
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* ignore */
    }
    try {
      await warmMic();
    } catch {
      /* permission prompt may appear */
    }
    setEndingSession(false);
    setSamActive(true);
  }, []);

  const dismissVoiceIntro = () => {
    if (voiceIntroClosedRef.current) return;
    voiceIntroClosedRef.current = true;
    autoStartedRef.current = true;
    try {
      sessionStorage.setItem("voice-intro-dismissed", "1");
    } catch {
      /* ignore */
    }
    setShowVoiceIntro(false);
    startSam();
  };

  // Returning visitors who already dismissed intro — auto-start Sam once per page load.
  useEffect(() => {
    if (showVoiceIntro || autoStartedRef.current) return;
    try {
      if (sessionStorage.getItem("voice-intro-dismissed") === "1") {
        autoStartedRef.current = true;
        startSam();
      }
    } catch {
      /* ignore */
    }
  }, [showVoiceIntro, startSam]);

  // Pause Sam while chat or audit overlays own attention / mic.
  useEffect(() => {
    if (!samActive) return undefined;
    if (isChatOpen || isAuditOpen) {
      pauseNavMic();
      return () => resumeNavMic();
    }
    return undefined;
  }, [isChatOpen, isAuditOpen, samActive]);

  useEffect(() => {
    if (!pendingLink) return;
    const t = setTimeout(() => setPendingLink(null), 10000);
    return () => clearTimeout(t);
  }, [pendingLink]);

  const openTalkWithSam = () => {
    setIsChatOpen(false);
    setIsAuditOpen(false);
    window.dispatchEvent(new Event("close-mobile-nav"));
    startSam();
  };

  const openSiteAudit = () => {
    setIsChatOpen(false);
    window.dispatchEvent(new Event("close-mobile-nav"));
    setIsAuditOpen(true);
  };

  const handleHangUp = async () => {
    if (endingSession) return;
    setEndingSession(true);
    await hangUp();
    await new Promise((r) => setTimeout(r, 1600));
    setSamActive(false);
    setEndingSession(false);
  };

  const controlsHidden =
    showVoiceIntro || isChatOpen || isAuditOpen || !samActive;

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
            setIsCallOpen={openTalkWithSam}
            setIsAuditOpen={openSiteAudit}
          />
          <main className="flex-1 min-w-0">
            <ProjectDetail project={selectedProject} onBack={handleBackToHome} />
          </main>
        </>
      ) : (
        <>
          <Navbar
            setIsChatOpen={setIsChatOpen}
            setIsCallOpen={openTalkWithSam}
            setIsAuditOpen={openSiteAudit}
          />

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

            <Footer />
          </main>
        </>
      )}

      {showVoiceIntro && (
        <div id="voicePopUp">
          <VoicePopup onFinish={dismissVoiceIntro} />
        </div>
      )}

      {samActive && (
        <AgentFloatingCaptions
          agentCaption={agentCaption}
          userCaption={userCaption}
          visible={captionVisible || status === "speaking" || status === "thinking"}
          status={status}
        />
      )}

      <AgentSessionControls
        status={status}
        muted={muted}
        error={error}
        reportStatus={reportStatus}
        onToggleMute={toggleMute}
        onHangUp={handleHangUp}
        onRetry={retryListen}
        ending={endingSession}
        hidden={controlsHidden}
      />

      <Chatbot
        isOpen={isChatOpen}
        setIsOpen={setIsChatOpen}
        onStartVoiceCall={openTalkWithSam}
        liftFab={samActive && !controlsHidden}
      />

      <SiteAuditModal isOpen={isAuditOpen} onClose={() => setIsAuditOpen(false)} />

      {pendingLink && (
        <div className="fixed bottom-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.5rem))] md:bottom-6 left-1/2 -translate-x-1/2 z-50 animate-bounce px-4 w-full max-w-sm">
          <a
            href={pendingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-medium shadow-xl transition-all hover:scale-105"
            style={{
              background: "linear-gradient(90deg,#7873F5,#EC77AB)",
              color: "#fff",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Open in new tab
          </a>
        </div>
      )}
    </div>
  );
}

export default App;
