import React, { useState } from 'react';
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

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedProject, setSelectedProject] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleProjectView = (project) => {
    setSelectedProject(project);
    setCurrentView('project-detail');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedProject(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {currentView === 'project-detail' && selectedProject ? (
        <>
          {/* We pass setIsChatOpen to the Navbar so the "Ask AI" button works */}
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
          <About />
          <Skills />
          <Education />
          <Experience />
          <Projects onProjectView={handleProjectView} />
          <Contact />
          <Footer />
        </>
      )}

      {/* The Chatbot is placed here once, and it receives the open/close state */}
      <Chatbot isOpen={isChatOpen} setIsOpen={setIsChatOpen} />
    </div>
  );
}

export default App;