import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CommandPalette } from './components/CommandPalette';
import { OverviewPage } from './pages/OverviewPage';
import { ImageForensicsPage } from './pages/ImageForensicsPage';
import { VideoForensicsPage } from './pages/VideoForensicsPage';
import { AudioForensicsPage } from './pages/AudioForensicsPage';
import { TextStylometryPage } from './pages/TextStylometryPage';
import { InvestigationWorkspacePage } from './pages/InvestigationWorkspacePage';
import { CentralizedAiHubPage } from './pages/CentralizedAiHubPage';
import { ModelInsightsPage } from './pages/ModelInsightsPage';
import { ForensicReportsPage } from './pages/ForensicReportsPage';
import { ArchitectureAboutPage } from './pages/ArchitectureAboutPage';
import { 
  Activity, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Mic, 
  FileText, 
  FolderKanban, 
  Network, 
  FileSpreadsheet 
} from 'lucide-react';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [activeCaseId, setActiveCaseId] = useState<string>('RC-2026-0042');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Scroll to top when tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentTab]);

  const handleGenerateReport = (caseId: string) => {
    setActiveCaseId(caseId);
    setCurrentTab('reports');
  };

  const handleSelectCase = (caseId: string) => {
    setActiveCaseId(caseId);
  };

  const renderActivePage = () => {
    switch (currentTab) {
      case 'overview':
        return (
          <OverviewPage
            onNavigate={(tab) => setCurrentTab(tab)}
            onSelectCase={handleSelectCase}
          />
        );
      case 'image':
        return (
          <ImageForensicsPage
            onGenerateReport={handleGenerateReport}
            onNavigate={(tab) => setCurrentTab(tab)}
            initialCaseId={activeCaseId}
          />
        );
      case 'video':
        return (
          <VideoForensicsPage
            onGenerateReport={handleGenerateReport}
            onNavigate={(tab) => setCurrentTab(tab)}
            initialCaseId={activeCaseId}
          />
        );
      case 'audio':
        return (
          <AudioForensicsPage
            onGenerateReport={handleGenerateReport}
            onNavigate={(tab) => setCurrentTab(tab)}
            initialCaseId={activeCaseId}
          />
        );
      case 'text':
        return (
          <TextStylometryPage
            onGenerateReport={handleGenerateReport}
            onNavigate={(tab) => setCurrentTab(tab)}
            initialCaseId={activeCaseId}
          />
        );
      case 'workspace':
        return (
          <InvestigationWorkspacePage
            onNavigate={(tab) => setCurrentTab(tab)}
            onSelectCase={handleSelectCase}
            onGenerateReport={handleGenerateReport}
          />
        );
      case 'ai-hub':
        return (
          <CentralizedAiHubPage
            onNavigate={(tab) => setCurrentTab(tab)}
          />
        );
      case 'models':
        return <ModelInsightsPage />;
      case 'reports':
        return (
          <ForensicReportsPage
            selectedCaseId={activeCaseId}
            onNavigate={(tab) => setCurrentTab(tab)}
          />
        );
      case 'about':
        return (
          <ArchitectureAboutPage
            onNavigate={(tab) => setCurrentTab(tab)}
          />
        );
      default:
        return (
          <OverviewPage
            onNavigate={(tab) => setCurrentTab(tab)}
            onSelectCase={handleSelectCase}
          />
        );
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-deep)' }}>
      {/* Global Header */}
      <Header
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        onOpenSearch={() => setIsSearchOpen(true)}
        activeCaseId={activeCaseId}
      />

      {/* Main Content Viewport */}
      <main style={{ flex: 1 }}>
        {renderActivePage()}
      </main>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectCase={handleSelectCase}
        onNavigate={(tab) => setCurrentTab(tab)}
      />

      {/* Global Footer */}
      <Footer onNavigate={(tab) => setCurrentTab(tab)} />

      {/* Mobile Bottom Navigation Bar (Visible on small screens) */}
      <div
        className="no-print"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(6, 9, 17, 0.96)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(56, 189, 248, 0.2)',
          display: 'none', // enabled via media query or default flex on narrow screens
          justifyContent: 'space-around',
          padding: '8px 4px',
          zIndex: 40
        }}
        id="mobile-bottom-nav"
      >
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'image', label: 'Image', icon: ImageIcon },
          { id: 'video', label: 'Video', icon: VideoIcon },
          { id: 'audio', label: 'Audio', icon: Mic },
          { id: 'text', label: 'Text', icon: FileText },
          { id: 'workspace', label: 'Cases', icon: FolderKanban },
          { id: 'reports', label: 'Report', icon: FileSpreadsheet },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: isActive ? '#00f0ff' : '#94a3b8',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                fontSize: '10px',
                cursor: 'pointer'
              }}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default App;
