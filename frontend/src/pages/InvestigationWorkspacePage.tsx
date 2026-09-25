import React, { useState } from 'react';
import { 
  FolderKanban, 
  Plus, 
  Layers, 
  ShieldAlert, 
  FileSpreadsheet, 
  Pin, 
  CheckSquare, 
  Square, 
  ExternalLink, 
  Sparkles, 
  AlertTriangle, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Mic, 
  FileText,
  Clock,
  ArrowRight
} from 'lucide-react';
import { SAMPLE_CASES } from '../data/sampleCases';
import { forensicApi } from '../services/api';
import { CrossMediaFusionResult } from '../types/forensics';

interface InvestigationWorkspacePageProps {
  onNavigate: (tab: string) => void;
  onSelectCase: (caseId: string) => void;
  onGenerateReport: (caseId: string) => void;
}

export const InvestigationWorkspacePage: React.FC<InvestigationWorkspacePageProps> = ({
  onNavigate,
  onSelectCase,
  onGenerateReport
}) => {
  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>([
    'RC-2026-0042',
    'RC-2026-0043',
    'RC-2026-0044',
    'RC-2026-0045'
  ]);

  const [fusionResult, setFusionResult] = useState<CrossMediaFusionResult | null>(() => {
    try {
      return forensicApi.fuseInvestigations(['RC-2026-0042', 'RC-2026-0043', 'RC-2026-0044', 'RC-2026-0045']);
    } catch {
      return null;
    }
  });

  const allBenchmarkCases = Object.values(SAMPLE_CASES);

  const toggleCaseSelection = (caseId: string) => {
    let updated: string[];
    if (selectedCaseIds.includes(caseId)) {
      updated = selectedCaseIds.filter(id => id !== caseId);
    } else {
      updated = [...selectedCaseIds, caseId];
    }
    setSelectedCaseIds(updated);

    if (updated.length > 0) {
      try {
        const fused = forensicApi.fuseInvestigations(updated);
        setFusionResult(fused);
      } catch {
        setFusionResult(null);
      }
    } else {
      setFusionResult(null);
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px 80px' }}>
      {/* Title & Case Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: '#00f0ff', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700 }}>
              CROSS-MEDIA INVESTIGATION HUB
            </span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>&bull;</span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>MULTI-MODAL EVIDENCE FUSION</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.5px', marginTop: '2px' }}>
            CASE DOSSIER: SUSPICIOUS SOCIAL MEDIA PROPAGATION (RC-2026-DOSSIER-01)
          </h1>
        </div>

        <button
          onClick={() => onGenerateReport('RC-2026-0042')}
          className="btn-cyber-primary"
          style={{ fontSize: '12px' }}
        >
          <FileSpreadsheet size={15} />
          <span>GENERATE MASTER DOSSIER REPORT</span>
        </button>
      </div>

      {/* Top Banner: Fused Cross-Media Assessment */}
      {fusionResult && (
        <div
          className="glass-panel-glow forensic-corner"
          style={{
            padding: '24px',
            marginBottom: '32px',
            backgroundColor: '#0c1426',
            borderColor: fusionResult.risk_level === 'High Risk' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(0, 240, 255, 0.4)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', color: '#00f0ff', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700 }}>
                  CROSS-MEDIA EVIDENCE SYNTHESIS
                </span>
                <span className={fusionResult.risk_level === 'High Risk' ? 'badge-risk-high' : 'badge-risk-medium'}>
                  {fusionResult.risk_level}
                </span>
                {fusionResult.uncertainty_detected && (
                  <span className="badge-risk-uncertain">
                    Uncertainty / High Variance
                  </span>
                )}
              </div>

              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>
                {fusionResult.assessment}
              </h2>

              <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.6, maxWidth: '720px' }}>
                {fusionResult.fusion_explanation}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '14px', fontSize: '11px', color: '#94a3b8' }}>
                <div>Media Types Fused: <strong style={{ color: '#00f0ff' }}>{fusionResult.media_types_analyzed.join(', ')}</strong></div>
                <div>Files Corroborated: <strong style={{ color: '#f8fafc' }}>{fusionResult.files_analyzed_count}</strong></div>
              </div>
            </div>

            {/* Score Ring / Summary */}
            <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Unified Score</div>
                <div style={{ fontSize: '38px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: fusionResult.unified_authenticity_score <= 30 ? '#ef4444' : '#f59e0b' }}>
                  {fusionResult.unified_authenticity_score} <span style={{ fontSize: '16px', color: '#64748b' }}>/ 100</span>
                </div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>Cross-Engine Average</div>
              </div>

              <div style={{ borderLeft: '1px solid rgba(56, 189, 248, 0.2)', paddingLeft: '20px', textAlign: 'left' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Avg AI Probability: <strong style={{ color: '#f87171' }}>{fusionResult.average_ai_generation_probability}%</strong></div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Avg Manipulation: <strong style={{ color: '#fbbf24' }}>{fusionResult.average_manipulation_risk}%</strong></div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Signal Variance: <strong>{fusionResult.signal_variance_spread} pts</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Left (Evidence Pinboard) & Right (Case Timeline & Top Signals) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.4fr) minmax(300px, 1fr)', gap: '24px' }}>
        {/* LEFT: Evidence Pinboard */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.5px' }}>
              EVIDENCE PINBOARD ({selectedCaseIds.length} ACTIVE ARTIFACTS)
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              Check/uncheck cards to test cross-media fusion
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {allBenchmarkCases.map((c) => {
              const isChecked = selectedCaseIds.includes(c.case_id);
              const isHighRisk = c.authenticity_score <= 30;

              return (
                <div
                  key={c.case_id}
                  className="glass-panel"
                  style={{
                    padding: '16px 18px',
                    borderColor: isChecked ? 'rgba(0, 240, 255, 0.4)' : 'rgba(56, 189, 248, 0.1)',
                    backgroundColor: isChecked ? 'rgba(13, 22, 40, 0.9)' : 'rgba(11, 16, 28, 0.6)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <button
                        onClick={() => toggleCaseSelection(c.case_id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: isChecked ? '#00f0ff' : '#64748b',
                          cursor: 'pointer',
                          padding: '2px 0 0 0'
                        }}
                      >
                        {isChecked ? <CheckSquare size={18} /> : <Square size={18} />}
                      </button>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#00f0ff', fontWeight: 700 }}>
                            {c.case_id}
                          </span>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>&bull; {c.media_type}</span>
                          <span className={isHighRisk ? 'badge-risk-high' : 'badge-risk-low'}>
                            {c.assessment}
                          </span>
                        </div>

                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>
                          {c.file_name}
                        </div>

                        <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', lineHeight: 1.4 }}>
                          {c.why_result_explanation.slice(0, 140)}...
                        </p>
                      </div>
                    </div>

                    {/* Score and Quick Inspect button */}
                    <div style={{ textAlign: 'right', minWidth: '90px' }}>
                      <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: isHighRisk ? '#f87171' : '#34d399' }}>
                        {c.authenticity_score}/100
                      </div>
                      <button
                        onClick={() => {
                          onSelectCase(c.case_id);
                          onNavigate(c.media_type.toLowerCase());
                        }}
                        style={{
                          marginTop: '6px',
                          background: 'rgba(56, 189, 248, 0.1)',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          color: '#38bdf8',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <span>Open Lab</span>
                        <ArrowRight size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Case Timeline & Top Cross-Media Signals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Top Cross-Media Signals */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '14px' }}>
              TOP CORROBORATING SIGNALS
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {fusionResult?.top_contributing_signals.map((sig, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(56, 189, 248, 0.1)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#f8fafc' }}>
                      {sig.name}
                    </span>
                    <span className="badge-risk-high">{sig.strength}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                    {sig.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Case Chronological Timeline */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: '#00f0ff', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '14px' }}>
              <Clock size={15} />
              <span>INVESTIGATION TIMELINE & CHAIN OF CUSTODY</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative', paddingLeft: '16px' }}>
              <div style={{ position: 'absolute', top: '8px', bottom: '8px', left: '4px', width: '2px', backgroundColor: 'rgba(56, 189, 248, 0.2)' }} />

              {[
                { time: '08:14 UTC', title: 'Suspect Image Uploaded', desc: 'Case RC-2026-0042 initiated; 91% AI probability identified.', icon: ImageIcon },
                { time: '08:22 UTC', title: 'Video Statement Corroborated', desc: 'Case RC-2026-0043 linked; lip-sync offset at 00:08 matches speech drift.', icon: VideoIcon },
                { time: '08:35 UTC', title: 'Voicemail Intercept Ingested', desc: 'Case RC-2026-0044 audio voice clone verified (00:17 - 00:21).', icon: Mic },
                { time: '08:48 UTC', title: 'Briefing Memo Stylometry Run', desc: 'Case RC-2026-0045 text verified as AI-assisted drafting.', icon: FileText },
                { time: '09:00 UTC', title: 'Evidence Fusion Hub Synthesized', desc: 'Cross-media risk assessment calculated with 4 corroborating channels.', icon: Sparkles }
              ].map((event, idx) => {
                const Icon = event.icon;
                return (
                  <div key={idx} style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-16px', top: '4px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00f0ff', boxShadow: '0 0 6px #00f0ff' }} />
                    <div style={{ fontSize: '10px', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>{event.time}</div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc', marginTop: '1px' }}>{event.title}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{event.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
