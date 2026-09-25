import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight, ShieldAlert, FileText, Image, Video, Mic, Sparkles } from 'lucide-react';
import { SAMPLE_CASES } from '../data/sampleCases';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCase: (caseId: string) => void;
  onNavigate: (tab: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectCase,
  onNavigate
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onClose(); // toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickActions = [
    { label: 'Show High-Risk Videos', icon: Video, action: () => { onNavigate('video'); onSelectCase('RC-2026-0043'); onClose(); } },
    { label: 'Find Suspicious Image Regions (Grad-CAM)', icon: Image, action: () => { onNavigate('image'); onSelectCase('RC-2026-0042'); onClose(); } },
    { label: 'Open Case RC-2026-0044 (AI Voice Clone)', icon: Mic, action: () => { onNavigate('audio'); onSelectCase('RC-2026-0044'); onClose(); } },
    { label: 'Analyze Text Stylometry (RC-2026-0045)', icon: FileText, action: () => { onNavigate('text'); onSelectCase('RC-2026-0045'); onClose(); } },
    { label: 'Launch Cross-Media Evidence Workspace', icon: ShieldAlert, action: () => { onNavigate('workspace'); onClose(); } },
    { label: 'View Centralized Explainable AI Hub', icon: Sparkles, action: () => { onNavigate('ai-hub'); onClose(); } },
  ];

  const filteredCases = Object.values(SAMPLE_CASES).filter(c => 
    c.case_id.toLowerCase().includes(query.toLowerCase()) ||
    c.file_name.toLowerCase().includes(query.toLowerCase()) ||
    c.assessment.toLowerCase().includes(query.toLowerCase()) ||
    c.media_type.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(3, 7, 18, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '100px'
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel forensic-corner"
        style={{
          width: '640px',
          maxWidth: '90vw',
          backgroundColor: '#0c1322',
          borderColor: 'rgba(0, 240, 255, 0.4)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 240, 255, 0.15)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(56, 189, 248, 0.15)',
            gap: '12px'
          }}
        >
          <Search size={20} color="#00f0ff" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search evidence, cases, files, findings... (e.g. 'high-risk', 'RC-2026-0042')"
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f8fafc',
              fontSize: '15px',
              fontFamily: 'var(--font-sans)'
            }}
          />
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Results Container */}
        <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '12px 16px' }}>
          {query.trim() === '' ? (
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', paddingLeft: '4px' }}>
                Suggested Forensic Actions
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {quickActions.map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <div
                      key={idx}
                      onClick={action.action}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        background: 'rgba(15, 23, 42, 0.5)',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 240, 255, 0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.5)'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Icon size={16} color="#38bdf8" />
                        <span style={{ fontSize: '13px', color: '#e2e8f0' }}>{action.label}</span>
                      </div>
                      <ArrowRight size={14} color="#64748b" />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', paddingLeft: '4px' }}>
                Matching Investigations ({filteredCases.length})
              </div>
              {filteredCases.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                  No matching forensic records found for "{query}".
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {filteredCases.map((c) => (
                    <div
                      key={c.case_id}
                      onClick={() => {
                        onSelectCase(c.case_id);
                        onNavigate(c.media_type.toLowerCase());
                        onClose();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '6px',
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid rgba(56, 189, 248, 0.1)',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.4)'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.1)'}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#00f0ff' }}>
                            {c.case_id}
                          </span>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>&bull; {c.media_type}</span>
                          <span
                            className={
                              c.authenticity_score <= 30
                                ? 'badge-risk-high'
                                : c.authenticity_score <= 60
                                ? 'badge-risk-medium'
                                : 'badge-risk-low'
                            }
                          >
                            {c.assessment}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>
                          {c.file_name}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '14px', color: '#f8fafc' }}>
                          {c.authenticity_score}/100
                        </div>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>Score</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div
          style={{
            padding: '10px 20px',
            background: 'rgba(6, 9, 17, 0.95)',
            borderTop: '1px solid rgba(56, 189, 248, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
            color: '#64748b'
          }}
        >
          <span>Use <strong>Esc</strong> to close</span>
          <span>REALCHECK AI Forensics Search</span>
        </div>
      </div>
    </div>
  );
};
