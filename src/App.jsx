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
          <Navbar onNavigate={handleBackToHome} isProjectView={true} />
          <ProjectDetail project={selectedProject} onBack={handleBackToHome} />
        </>
      ) : (
        <>
          <Navbar />
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

      {/* Put the Chatbot here so it shows up on BOTH the home and detail pages */}
      <Chatbot />
    </div>
  );
}

export default App;
