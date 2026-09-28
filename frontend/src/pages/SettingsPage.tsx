import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Sliders, 
  FileText, 
  Shield, 
  Database, 
  Info,
  LogOut,
  Trash2,
  Key
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  
  // Theme state
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system';
  });

  // UI-only Preferences State
  const [prefs, setPrefs] = useState({
    notifyAnalysis: true,
    notifyAlerts: true,
    autoSave: true,
    showConfidence: true,
    showEvidence: true,
    reportBreakdown: true,
    reportTextMetrics: true
  });

  const togglePref = (key: keyof typeof prefs) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleThemeChange = (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
    localStorage.setItem('theme', mode);
    let activeTheme = mode;
    if (mode === 'system') {
      activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', activeTheme);
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all recent investigations? This action cannot be undone.')) {
      alert('Recent investigations cleared.');
    }
  };

  const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', marginTop: '24px', color: 'var(--text-main)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
      <Icon size={18} color="var(--cyan-primary)" />
      <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0, letterSpacing: '0.5px' }}>{title}</h2>
    </div>
  );

  const ToggleRow = ({ label, description, checked, onChange }: any) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
      <div>
        <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-main)' }}>{label}</div>
        {description && <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>{description}</div>}
      </div>
      <button 
        onClick={onChange}
        style={{
          position: 'relative',
          width: '40px',
          height: '22px',
          borderRadius: '11px',
          background: checked ? 'var(--cyan-primary)' : 'var(--bg-deep)',
          border: `1px solid ${checked ? 'var(--cyan-primary)' : 'var(--border-subtle)'}`,
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{
          position: 'absolute',
          top: '2px',
          left: checked ? '20px' : '2px',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          background: '#fff',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }} />
      </button>
    </div>
  );

  return (
    <div style={{ padding: '32px 48px', maxWidth: '900px', margin: '0 auto', color: 'var(--text-main)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <SettingsIcon size={28} color="var(--cyan-primary)" />
        <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0 }}>Settings</h1>
      </div>

      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '24px 32px'
      }}>
        
        {/* 1. ACCOUNT */}
        <SectionHeader icon={User} title="ACCOUNT" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '4px' }}>Name</div>
            <div style={{ fontSize: '15px', fontWeight: 500 }}>{user?.name || 'Investigator'}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '4px' }}>Email Address</div>
            <div style={{ fontSize: '15px' }}>{user?.name ? `${user.name.toLowerCase().replace(/\s+/g, '.')}@realcheck.ai` : 'investigator@realcheck.ai'}</div>
          </div>
        </div>

        {/* 2. APPEARANCE */}
        <SectionHeader icon={Sliders} title="APPEARANCE" />
        <div style={{ display: 'flex', gap: '12px' }}>
          {['dark', 'light', 'system'].map(mode => (
            <button
              key={mode}
              onClick={() => handleThemeChange(mode as any)}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '6px',
                background: themeMode === mode ? 'var(--bg-body-pattern-1)' : 'transparent',
                border: `1px solid ${themeMode === mode ? 'var(--cyan-primary)' : 'var(--border-subtle)'}`,
                color: themeMode === mode ? 'var(--cyan-primary)' : 'var(--text-main)',
                cursor: 'pointer',
                textTransform: 'capitalize',
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* 3. NOTIFICATIONS */}
        <SectionHeader icon={Bell} title="NOTIFICATIONS" />
        <ToggleRow 
          label="Analysis Completed" 
          description="Receive alerts when long-running media processing finishes."
          checked={prefs.notifyAnalysis}
          onChange={() => togglePref('notifyAnalysis')}
        />
        <ToggleRow 
          label="Investigation Alerts" 
          description="Get notified about critical risk thresholds and forensic anomalies."
          checked={prefs.notifyAlerts}
          onChange={() => togglePref('notifyAlerts')}
        />

        {/* 4. ANALYSIS PREFERENCES */}
        <SectionHeader icon={Sliders} title="ANALYSIS PREFERENCES" />
        <ToggleRow 
          label="Auto-Save Investigations" 
          description="Automatically store all analyzed media to your workspace."
          checked={prefs.autoSave}
          onChange={() => togglePref('autoSave')}
        />
        <ToggleRow 
          label="Show Confidence Details" 
          description="Display AI model confidence intervals on the forensic dashboard."
          checked={prefs.showConfidence}
          onChange={() => togglePref('showConfidence')}
        />
        <ToggleRow 
          label="Show Forensic Evidence" 
          description="Display deep-level metadata and tensor highlights by default."
          checked={prefs.showEvidence}
          onChange={() => togglePref('showEvidence')}
        />

        {/* 5. REPORT PREFERENCES */}
        <SectionHeader icon={FileText} title="REPORT PREFERENCES" />
        <ToggleRow 
          label="Include Evidence Breakdown" 
          description="Attach raw forensic data and JSON schema to exported reports."
          checked={prefs.reportBreakdown}
          onChange={() => togglePref('reportBreakdown')}
        />
        <ToggleRow 
          label="Include Text Metrics" 
          description="Include Stylometry and NLP metrics in combined multi-modal reports."
          checked={prefs.reportTextMetrics}
          onChange={() => togglePref('reportTextMetrics')}
        />

        {/* 6. SECURITY */}
        <SectionHeader icon={Shield} title="SECURITY" />
        <div style={{ display: 'flex', gap: '16px' }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
            background: 'transparent', border: '1px solid var(--border-subtle)', borderRadius: '6px',
            color: 'var(--text-main)', cursor: 'pointer', fontSize: '13px', fontWeight: 500
          }}>
            <Key size={16} />
            Change Password
          </button>
          <button 
            onClick={logout}
            style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px',
            color: 'var(--risk-high-text)', cursor: 'pointer', fontSize: '13px', fontWeight: 500
          }}>
            <LogOut size={16} />
            Sign Out
          </button>
        </div>

        {/* 7. DATA */}
        <SectionHeader icon={Database} title="DATA" />
        <div>
          <button 
            onClick={handleClearData}
            style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
            background: 'transparent', border: '1px solid var(--border-subtle)', borderRadius: '6px',
            color: 'var(--text-main)', cursor: 'pointer', fontSize: '13px', fontWeight: 500
          }}>
            <Trash2 size={16} />
            Clear Recent Investigations
          </button>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '8px' }}>
            Warning: This removes your local workspace history.
          </div>
        </div>

        {/* 8. ABOUT */}
        <SectionHeader icon={Info} title="ABOUT" />
        <div style={{ background: 'var(--bg-deep)', padding: '16px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-main)', marginBottom: '4px' }}>REALCHECK AI</div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>Explainable Digital Authenticity & Forensic Analysis</div>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '8px', fontSize: '13px' }}>
            <div style={{ color: 'var(--text-dim)' }}>Version</div>
            <div style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>2.4.0-enterprise</div>
            <div style={{ color: 'var(--text-dim)' }}>License</div>
            <div style={{ color: 'var(--text-main)' }}>Enterprise Analytics License</div>
          </div>
        </div>

      </div>
    </div>
  );
};
