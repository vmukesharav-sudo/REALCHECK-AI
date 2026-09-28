import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Mic, 
  FileText,
  Activity,
  ArrowRight,
  FolderKanban,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { forensicApi } from '../services/api';
import { InvestigationResult } from '../types/forensics';
import { LoadingState, EmptyState } from '../components/AppStates';

interface OverviewPageProps {
  onNavigate: (tab: string) => void;
  onSelectCase: (caseId: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigate, onSelectCase }) => {
  const [recentCases, setRecentCases] = useState<InvestigationResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    forensicApi.getInvestigations().then(data => {
      if (isMounted) {
        setRecentCases(data || []);
        setIsLoading(false);
      }
    }).catch(() => {
      if (isMounted) {
        setRecentCases([]);
        setIsLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, []);

  // Compute metrics if data is available
  const totalCases = recentCases.length;
  const completedCases = recentCases.length; // Assuming all returned are completed for now
  const reviewRequired = recentCases.filter(c => c.authenticity_score <= 30).length;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px', width: '100%' }}>
      
      {/* 1. HEADER */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.5px', marginBottom: '8px' }}>
            Overview
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
            Your digital authenticity investigation workspace.
          </p>
        </div>
        
        <button
          onClick={() => onNavigate('workspace')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)',
            border: 'none', borderRadius: '8px', padding: '10px 16px',
            cursor: 'pointer', fontWeight: 600, fontSize: '14px', transition: 'all 0.2s',
            boxShadow: '0 4px 14px rgba(0, 210, 255, 0.2)'
          }}
        >
          <Plus size={18} />
          New Investigation
        </button>
      </div>

      {/* 2. SUMMARY METRICS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Total Cases</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
            {isLoading ? '-' : totalCases}
          </div>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Processing</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
            {isLoading ? '-' : '0'}
          </div>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Completed</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
            {isLoading ? '-' : completedCases}
          </div>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--risk-high)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Review Required</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
            {isLoading ? '-' : reviewRequired}
          </div>
        </div>
      </div>

      {/* 3. QUICK ANALYSIS CARDS */}
      <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px', letterSpacing: '0.5px' }}>
        Quick Analysis
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '40px' }}>
        {[
          { id: 'image', label: 'Image', desc: 'Detect visual manipulation and AI-generation indicators.', icon: ImageIcon, color: '#00f0ff' },
          { id: 'video', label: 'Video', desc: 'Inspect temporal and deepfake-related evidence.', icon: VideoIcon, color: '#38bdf8' },
          { id: 'audio', label: 'Audio', desc: 'Analyze acoustic and voice-cloning indicators.', icon: Mic, color: '#06b6d4' },
          { id: 'text', label: 'Text', desc: 'Analyze linguistic/stylometric indicators.', icon: FileText, color: '#60a5fa' }
        ].map(card => (
          <div 
            key={card.id}
            onClick={() => onNavigate(card.id)}
            style={{ 
              background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', 
              borderRadius: '12px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s ease',
              display: 'flex', flexDirection: 'column', gap: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--cyan-primary)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <card.icon size={20} color={card.color} />
                <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '16px' }}>{card.label}</span>
              </div>
              <ArrowRight size={16} color="var(--text-dim)" />
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.5 }}>
              {card.desc}
            </p>
          </div>
        ))}
      </div>

      {/* 4. RECENT INVESTIGATIONS & ACTIVITY SPLIT */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* RECENT INVESTIGATIONS */}
        <div style={{ flex: 2, minWidth: '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '0.5px' }}>
              Recent Investigations
            </h2>
            {recentCases.length > 0 && (
              <button 
                onClick={() => onNavigate('workspace')}
                style={{ background: 'transparent', border: 'none', color: 'var(--cyan-primary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                View All <ArrowRight size={14} />
              </button>
            )}
          </div>
          
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', overflow: 'hidden' }}>
            {isLoading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
            ) : recentCases.length === 0 ? (
              <div style={{ padding: '60px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-body-pattern-1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FolderKanban size={24} color="var(--text-dim)" />
                </div>
                <div style={{ color: 'var(--text-muted)' }}>No investigations yet.</div>
                <button
                  onClick={() => onNavigate('workspace')}
                  style={{
                    background: 'var(--bg-body-pattern-1)', color: 'var(--cyan-primary)', border: '1px solid var(--border-subtle)',
                    borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  + New Investigation
                </button>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', fontSize: '11px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Case ID</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Media</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Result</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCases.slice(0, 5).map((c) => {
                      const isHighRisk = c.authenticity_score <= 30;
                      const isMediumRisk = c.authenticity_score > 30 && c.authenticity_score <= 60;
                      
                      return (
                        <tr key={c.case_id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-main)', fontWeight: 500 }}>
                            {c.case_id}
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {c.media_type === 'IMAGE' && <ImageIcon size={14} color="#00f0ff" />}
                              {c.media_type === 'VIDEO' && <VideoIcon size={14} color="#38bdf8" />}
                              {c.media_type === 'AUDIO' && <Mic size={14} color="#06b6d4" />}
                              {c.media_type === 'TEXT' && <FileText size={14} color="#60a5fa" />}
                              <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {c.file_name}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--risk-low-text)', background: 'var(--risk-low-bg)', padding: '2px 8px', borderRadius: '12px', border: '1px solid var(--risk-low-border)' }}>
                              COMPLETED
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: isHighRisk ? 'var(--risk-high)' : (isMediumRisk ? 'var(--risk-medium)' : 'var(--risk-low)') }}>
                            {c.assessment}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <button
                              onClick={() => {
                                onSelectCase(c.case_id);
                                onNavigate(c.media_type.toLowerCase());
                              }}
                              style={{
                                background: 'transparent', border: '1px solid var(--border-subtle)',
                                color: 'var(--cyan-primary)', padding: '4px 10px', borderRadius: '4px',
                                fontSize: '11px', fontWeight: 600, cursor: 'pointer'
                              }}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ACTIVITY */}
        <div style={{ flex: 1, minWidth: '0' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '0.5px', marginBottom: '16px' }}>
            Activity
          </h2>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '32px 24px', height: 'calc(100% - 38px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-body-pattern-1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={24} color="var(--text-dim)" />
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center' }}>
              No recent activity to show.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
