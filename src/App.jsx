import React, { useState, useRef, useEffect, useCallback } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Skills from "./components/Skills";
import Education from "./components/Education";
import Experience from "./components/Experience";
import Projects from "./components/Projects";
import ProjectDetail from "./components/ProjectDetail";
import WebflowArchive from "./components/WebflowArchive";
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
import { warmVoiceApis } from "./services/voice-agent/voiceApi";
import { pauseNavMic, resumeNavMic } from "./services/voice-agent/micMutex";

function App() {
  const [currentView, setCurrentView] = useState("home");
  const [selectedProject, setSelectedProject] = useState(null);
  const [detailReturn, setDetailReturn] = useState("home");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [pendingLink, setPendingLink] = useState(null);
  const [samActive, setSamActive] = useState(false);
  const [samKind, setSamKind] = useState("full");
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

  const skipHashApplyRef = useRef(false);

  const dismissOverlaysForNav = useCallback(() => {
    window.dispatchEvent(new Event("close-mobile-nav"));
    setIsChatOpen(false);
    setIsAuditOpen(false);
    if (showVoiceIntro) {
      voiceIntroClosedRef.current = true;
      autoStartedRef.current = true;
      try {
        sessionStorage.setItem("voice-intro-dismissed", "1");
      } catch {
        /* ignore */
      }
      setShowVoiceIntro(false);
    }
  }, [showVoiceIntro]);

  const scrollToSection = useCallback((id) => {
    dismissOverlaysForNav();
    const jump = () => {
      if (!id || id === "home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    window.setTimeout(jump, document.body.classList.contains("nav-locked") ? 90 : 0);
  }, [dismissOverlaysForNav]);

  const openUrl = useCallback((url) => {
    setPendingLink(url);
    const w = window.open(url, "_blank");
    if (w && !w.closed) setPendingLink(null);
  }, []);

  const setHash = useCallback((hash) => {
    const target = hash ? `#${hash}` : "";
    if (window.location.hash === target) return;
    skipHashApplyRef.current = true;
    window.history.pushState(
      null,
      "",
      hash ? `#${hash}` : `${window.location.pathname}${window.location.search}`
    );
    window.setTimeout(() => {
      skipHashApplyRef.current = false;
    }, 0);
  }, []);

  const handleOpenArchive = useCallback(() => {
    window.dispatchEvent(new Event("close-mobile-nav"));
    setSelectedProject(null);
    setCurrentView("webflow-work");
    setHash("webflow-work");
    window.scrollTo(0, 0);
  }, [setHash]);

  const handleProjectView = useCallback(
    (project, from = "home") => {
      window.dispatchEvent(new Event("close-mobile-nav"));
      setSelectedProject(project);
      setDetailReturn(from);
      setCurrentView("project-detail");
      setHash(project?.id != null ? `project-${project.id}` : "project");
      window.scrollTo(0, 0);
    },
    [setHash]
  );

  const handleBackToHome = useCallback(
    (section = "home") => {
      const id = typeof section === "string" ? section : "home";
      dismissOverlaysForNav();
      setCurrentView("home");
      setSelectedProject(null);
      setHash("");
      window.scrollTo(0, 0);
      if (id && id !== "home") {
        window.setTimeout(() => scrollToSection(id), 160);
      }
    },
    [dismissOverlaysForNav, scrollToSection, setHash]
  );

  const handleNavSection = useCallback(
    (section = "home") => {
      const id = typeof section === "string" ? section : "home";
      if (currentView !== "home") {
        handleBackToHome(id);
        return;
      }
      scrollToSection(id);
    },
    [currentView, handleBackToHome, scrollToSection]
  );

  const handleBackToProjects = useCallback(() => {
    if (detailReturn === "archive") {
      handleOpenArchive();
      return;
    }
    handleBackToHome("projects");
  }, [detailReturn, handleBackToHome, handleOpenArchive]);

  const deactivateSam = useCallback(async ({ waitForReport = false } = {}) => {
    if (waitForReport) {
      setEndingSession(true);
      await new Promise((r) => setTimeout(r, 1600));
    }
    setSamActive(false);
    setEndingSession(false);
  }, []);

  actionCtxRef.current = {
    scrollToSection,
    openUrl,
    openProject: (project) =>
      handleProjectView(project, project?.tier === "delivery" ? "archive" : "home"),
    goHome: () => handleBackToHome("home"),
    navigateHomeTo: handleBackToHome,
    backToProjects: handleBackToProjects,
    openWebflowArchive: handleOpenArchive,
    currentView,
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
    endCall: () => {
      /* handled in useVoiceAgent; keep for siteActions completeness */
    },
  };

  const onActions = useCallback((actions) => {
    executeSiteActions(actions, actionCtxRef.current);
  }, []);

  const onSessionEnd = useCallback(
    ({ reason } = {}) => {
      if (reason === "intro-complete" || reason === "intro-error") {
        void deactivateSam({ waitForReport: false });
        return;
      }
      if (reason === "endCall") {
        void deactivateSam({ waitForReport: true });
      }
    },
    [deactivateSam]
  );

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
  } = useVoiceAgent({
    active: samActive,
    kind: samKind,
    onActions,
    onSessionEnd,
  });

  const startSam = useCallback(async ({ kind = "full" } = {}) => {
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
    warmVoiceApis();
    setEndingSession(false);
    setSamKind(kind === "intro" ? "intro" : "full");
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
    startSam({ kind: "intro" });
  };

  // Returning visitors who already dismissed intro — auto-start intro greeting once per load.
  useEffect(() => {
    if (showVoiceIntro || autoStartedRef.current) return;
    try {
      if (sessionStorage.getItem("voice-intro-dismissed") === "1") {
        autoStartedRef.current = true;
        startSam({ kind: "intro" });
      }
    } catch {
      /* ignore */
    }
  }, [showVoiceIntro, startSam]);

  useEffect(() => {
    const applyHash = () => {
      if (skipHashApplyRef.current) return;
      const raw = (window.location.hash || "").replace(/^#\/?/, "");
      if (raw === "webflow-work") {
        setSelectedProject(null);
        setCurrentView("webflow-work");
        return;
      }
      const match = raw.match(/^project-(\d+)$/);
      if (match) {
        const project = PROJECTS.find((p) => String(p.id) === match[1]);
        if (project) {
          setSelectedProject({ ...project, liveUrl: project.live, githubUrl: project.git });
          setDetailReturn(project.tier === "delivery" ? "archive" : "home");
          setCurrentView("project-detail");
          return;
        }
      }
      setCurrentView("home");
      setSelectedProject(null);
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    window.addEventListener("popstate", applyHash);
    return () => {
      window.removeEventListener("hashchange", applyHash);
      window.removeEventListener("popstate", applyHash);
    };
  }, []);

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
    startSam({ kind: "full" });
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
    showVoiceIntro ||
    isChatOpen ||
    isAuditOpen ||
    !samActive ||
    samKind === "intro";

  return (
    <div className="min-h-screen bg-[#110E1B] text-white font-sans selection:bg-purple-500/30 selection:text-purple-200 flex flex-col md:flex-row">
      <a ref={linkRef} target="_blank" rel="noopener noreferrer" className="hidden" />
      <CustomCursor />

      {currentView === "project-detail" && selectedProject ? (
        <>
          <Navbar
            onNavigate={handleNavSection}
            isProjectView={true}
            setIsChatOpen={setIsChatOpen}
            setIsCallOpen={openTalkWithSam}
            setIsAuditOpen={openSiteAudit}
          />
          <main className="flex-1 min-w-0">
            <ProjectDetail
              project={selectedProject}
              onBack={handleBackToProjects}
              backLabel={
                detailReturn === "archive"
                  ? "Back to Webflow work"
                  : "Back to Projects"
              }
            />
          </main>
        </>
      ) : currentView === "webflow-work" ? (
        <>
          <Navbar
            onNavigate={handleNavSection}
            isProjectView={true}
            setIsChatOpen={setIsChatOpen}
            setIsCallOpen={openTalkWithSam}
            setIsAuditOpen={openSiteAudit}
          />
          <main className="flex-1 min-w-0">
            <WebflowArchive
              onProjectView={(project) => handleProjectView(project, "archive")}
              onBack={() => handleBackToHome("projects")}
            />
            <Footer />
          </main>
        </>
      ) : (
        <>
          <Navbar
            onNavigate={handleNavSection}
            setIsChatOpen={setIsChatOpen}
            setIsCallOpen={openTalkWithSam}
            setIsAuditOpen={openSiteAudit}
          />

          <main className="flex-1 min-w-0">
            <div className="max-w-5xl mx-auto px-4 pt-[calc(5.5rem+env(safe-area-inset-top))] pb-8 sm:px-6 md:p-12 lg:p-16 md:pt-12 space-y-4 md:space-y-8 min-h-[calc(100dvh-theme(spacing.80))]">
              <Hero />
              <Projects
                onProjectView={handleProjectView}
                onOpenArchive={handleOpenArchive}
              />
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
