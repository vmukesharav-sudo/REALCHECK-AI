import React, { useState } from 'react';
import {
  Sliders,
  Shield,
  Moon,
  Sun,
  Monitor,
  Save,
  Check
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system';
  });

  const [saved, setSaved] = useState(false);
  const [threshold, setThreshold] = useState('30');
  const [defaultModel, setDefaultModel] = useState('ensemble');
  const [c2paStrict, setC2paStrict] = useState(true);
  const [autoReport, setAutoReport] = useState(true);

  const handleThemeChange = (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
    localStorage.setItem('theme', mode);
    let activeTheme = mode;
    if (mode === 'system') {
      activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', activeTheme);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ padding: '32px 24px 80px', maxWidth: '1100px', margin: '0 auto', color: 'var(--text-main)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--cyan-primary)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700 }}>
              PLATFORM CONFIGURATION
            </span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.5px', marginTop: '2px' }}>
            System Settings &amp; Preferences
          </h1>
        </div>

        <button
          onClick={handleSave}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: saved ? 'var(--risk-low-bg)' : 'var(--btn-primary-bg)',
            color: saved ? 'var(--risk-low-text)' : 'var(--btn-primary-text)',
            border: saved ? '1px solid var(--risk-low-border)' : 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '14px',
            transition: 'all 0.2s',
            boxShadow: '0 4px 14px rgba(0, 210, 255, 0.2)'
          }}
        >
          {saved ? <Check size={18} /> : <Save size={18} />}
          <span>{saved ? 'Saved Successfully' : 'Save Changes'}</span>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* 1. Appearance & Theme */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--bg-body-pattern-1)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sun size={18} color="var(--cyan-primary)" />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>Interface Theme</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Choose your preferred color theme or match system settings.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
            <button
              onClick={() => handleThemeChange('dark')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                borderRadius: '8px',
                background: themeMode === 'dark' ? 'var(--bg-body-pattern-1)' : 'var(--bg-card)',
                border: themeMode === 'dark' ? '1px solid var(--cyan-primary)' : '1px solid var(--border-subtle)',
                color: themeMode === 'dark' ? 'var(--cyan-primary)' : 'var(--text-main)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px'
              }}
            >
              <Moon size={16} />
              <span>Dark Forensic</span>
            </button>

            <button
              onClick={() => handleThemeChange('light')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                borderRadius: '8px',
                background: themeMode === 'light' ? 'var(--bg-body-pattern-1)' : 'var(--bg-card)',
                border: themeMode === 'light' ? '1px solid var(--cyan-primary)' : '1px solid var(--border-subtle)',
                color: themeMode === 'light' ? 'var(--cyan-primary)' : 'var(--text-main)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px'
              }}
            >
              <Sun size={16} />
              <span>Light Mode</span>
            </button>

            <button
              onClick={() => handleThemeChange('system')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                borderRadius: '8px',
                background: themeMode === 'system' ? 'var(--bg-body-pattern-1)' : 'var(--bg-card)',
                border: themeMode === 'system' ? '1px solid var(--cyan-primary)' : '1px solid var(--border-subtle)',
                color: themeMode === 'system' ? 'var(--cyan-primary)' : 'var(--text-main)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px'
              }}
            >
              <Monitor size={16} />
              <span>System Default</span>
            </button>
          </div>
        </div>

        {/* 2. Detection & Forensic Thresholds */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--bg-body-pattern-1)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sliders size={18} color="var(--cyan-primary)" />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>Forensic Anomaly Sensitivity</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Calibrate threshold triggers for High Risk classification and alert flags.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                High-Risk Threshold Score: {threshold} / 100
              </label>
              <input
                type="range"
                min="10"
                max="50"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                style={{ width: '100%', accentColor: 'var(--cyan-primary)', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Cases scoring &le; {threshold} will be flagged as High Risk requiring mandatory manual review.
              </span>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                Default Engine Pipeline
              </label>
              <select
                value={defaultModel}
                onChange={(e) => setDefaultModel(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  background: 'var(--bg-body)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                  fontSize: '13px'
                }}
              >
                <option value="ensemble">Multi-Scale Ensemble (VisionTransformer + Spectral + Spatial)</option>
                <option value="spectral">Spectral FFT Priority</option>
                <option value="temporal">Temporal Optical Flow Optimized</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Security & C2PA Provenance */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--bg-body-pattern-1)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={18} color="var(--cyan-primary)" />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>C2PA &amp; Cryptographic Provenance</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Manage strict manifest checks and cryptographic certificate validation.</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={c2paStrict}
                onChange={(e) => setC2paStrict(e.target.checked)}
                style={{ accentColor: 'var(--cyan-primary)', width: '16px', height: '16px' }}
              />
              <span style={{ fontSize: '13px', color: 'var(--text-main)' }}>
                Require C2PA manifest verification on enterprise batch ingestion
              </span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={autoReport}
                onChange={(e) => setAutoReport(e.target.checked)}
                style={{ accentColor: 'var(--cyan-primary)', width: '16px', height: '16px' }}
              />
              <span style={{ fontSize: '13px', color: 'var(--text-main)' }}>
                Automatically generate explainable forensic summary cards for all investigations
              </span>
            </label>
          </div>
        </div>

      </div>
    </div>
  );
};
