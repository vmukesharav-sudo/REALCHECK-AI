import React from 'react';
import { 
  Crosshair, 
  Search, 
  ShieldCheck, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Mic, 
  FileText, 
  FolderKanban, 
  Network, 
  FileSpreadsheet, 
  Cpu, 
  Info,
  Activity
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenSearch: () => void;
  activeCaseId?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  onOpenSearch,
  activeCaseId = 'RC-2026-0042'
}) => {
  const navItems = [
    { id: 'overview', label: 'OVERVIEW', icon: Activity },
    { id: 'image', label: 'IMAGE', icon: ImageIcon },
    { id: 'video', label: 'VIDEO', icon: VideoIcon },
    { id: 'audio', label: 'AUDIO', icon: Mic },
    { id: 'text', label: 'TEXT', icon: FileText },
    { id: 'workspace', label: 'WORKSPACE', icon: FolderKanban },
    { id: 'ai-hub', label: 'AI HUB', icon: Network },
    { id: 'reports', label: 'FORENSIC REPORTS', icon: FileSpreadsheet },
    { id: 'models', label: 'MODEL INSIGHTS', icon: Cpu },
    { id: 'about', label: 'ABOUT', icon: Info },
  ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(6, 9, 17, 0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(56, 189, 248, 0.15)',
        padding: '0 24px'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
          maxWidth: '1600px',
          margin: '0 auto'
        }}
      >
        {/* Left: Brand Wordmark */}
        <div
          onClick={() => onTabChange('overview')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0, 240, 255, 0.1)',
              border: '1px solid #00f0ff',
              borderRadius: '6px',
              boxShadow: '0 0 10px rgba(0, 240, 255, 0.3)'
            }}
          >
            <Crosshair size={18} color="#00f0ff" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  letterSpacing: '2.5px',
                  color: '#f8fafc'
                }}
              >
                REALCHECK
              </span>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  letterSpacing: '1px',
                  background: 'linear-gradient(135deg, #00f0ff, #0284c7)',
                  color: '#030a16',
                  padding: '1px 6px',
                  borderRadius: '4px'
                }}
              >
                AI
              </span>
            </div>
            <div style={{ fontSize: '9px', letterSpacing: '0.8px', color: '#64748b', textTransform: 'uppercase' }}>
              Explainable Digital Authenticity
            </div>
          </div>
        </div>

        {/* Center: Main Navigation */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            overflowX: 'auto',
            padding: '4px 0'
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                style={{
                  background: isActive ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
                  border: isActive ? '1px solid rgba(0, 240, 255, 0.4)' : '1px solid transparent',
                  color: isActive ? '#00f0ff' : '#94a3b8',
                  padding: '7px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '0.6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = '#94a3b8';
                }}
              >
                <Icon size={14} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Quick Search, Status & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Quick Command Search Button */}
          <button
            onClick={onOpenSearch}
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: '6px',
              padding: '6px 12px',
              color: '#94a3b8',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <Search size={14} color="#00f0ff" />
            <span style={{ display: 'inline-block' }}>Search...</span>
            <kbd
              style={{
                background: '#090d19',
                border: '1px solid #1e293b',
                borderRadius: '3px',
                padding: '1px 5px',
                fontSize: '10px',
                color: '#64748b'
              }}
            >
              Ctrl+K
            </kbd>
          </button>

          {/* System Status: ANALYSIS ENGINE ONLINE */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '5px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.5px',
              color: '#34d399'
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                boxShadow: '0 0 8px #10b981'
              }}
            />
            <span>ANALYSIS ENGINE ONLINE</span>
          </div>

          {/* Active Case ID */}
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: '#38bdf8',
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              padding: '4px 8px',
              borderRadius: '4px'
            }}
            title="Global Case Identifier"
          >
            {activeCaseId}
          </div>
        </div>
      </div>
    </header>
  );
};
