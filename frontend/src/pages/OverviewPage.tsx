import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  Search, 
  Sliders, 
  AlertTriangle, 
  Activity, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Mic, 
  FileText, 
  CheckCircle,
  ExternalLink,
  Layers,
  Sparkles,
  Zap
} from 'lucide-react';
import { AuthenticityCore } from '../components/AuthenticityCore';
import { SAMPLE_CASES } from '../data/sampleCases';
import { InvestigationResult } from '../types/forensics';

interface OverviewPageProps {
  onNavigate: (tab: string) => void;
  onSelectCase: (caseId: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigate, onSelectCase }) => {
  const [selectedPipelineStage, setSelectedPipelineStage] = useState<number | null>(0);

  const pipelineStages = [
    { name: 'DIGITAL CONTENT', desc: 'Raw ingestion of Image, Video, Audio, or Text documents.' },
    { name: 'FILE VALIDATION', desc: 'MIME validation, hex magic byte verification & SHA-256 hashing.' },
    { name: 'MEDIA CLASSIFICATION', desc: 'Routing stream to designated specialized forensic micro-service.' },
    { name: 'SPECIALIZED ENGINE', desc: 'Spatial-temporal, Fourier frequency, or NLP tokenizer processing.' },
    { name: 'FEATURE EXTRACTION', desc: 'Deriving PRNU noise residuals, biometrics, landmark optical flow.' },
    { name: 'AI MODEL INFERENCE', desc: 'ViT, 3D-CNN, Wav2Vec2, and Transformer Stylometry neural networks.' },
    { name: 'FORENSIC SIGNALS', desc: 'Individual probabilistic metrics scored with calibration weights.' },
    { name: 'EVIDENCE FUSION', desc: 'Cross-evidence mathematical synthesis and conflict resolution.' },
    { name: 'EXPLAINABLE AI', desc: 'Grad-CAM heatmaps, token saliency & temporal attribution paths.' },
    { name: 'AUTHENTICITY ASSESSMENT', desc: 'Probabilistic determination (Likely Real / AI-Generated / Uncertain).' },
    { name: 'FORENSIC REPORT', desc: 'Cryptographically timestamped PDF docket, JSON, and CSV export.' }
  ];

  const recentCases = Object.values(SAMPLE_CASES);

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px 80px' }}>
      {/* 1. HERO SECTION */}
      <section style={{ textAlign: 'center', padding: '40px 16px 30px', position: 'relative' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(0, 240, 255, 0.08)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            borderRadius: '20px',
            padding: '4px 14px',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '1px',
            color: '#00f0ff',
            textTransform: 'uppercase',
            marginBottom: '16px'
          }}
        >
          <Sparkles size={12} />
          One Platform &bull; Four Media Types &bull; Explainable Digital Authenticity
        </div>

        <h1
          style={{
            fontSize: '44px',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.5px',
            color: '#f8fafc',
            maxWidth: '900px',
            margin: '0 auto 16px'
          }}
        >
          Digital Content Can Look Real.{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #00f0ff 0%, #38bdf8 50%, #818cf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Evidence Tells the Story.
          </span>
        </h1>

        <p
          style={{
            fontSize: '16px',
            lineHeight: 1.6,
            color: '#94a3b8',
            maxWidth: '780px',
            margin: '0 auto 28px'
          }}
        >
          REALCHECK AI investigates images, videos, audio and text using specialized AI and forensic analysis — then explains the evidence behind every authenticity assessment.
        </p>

        {/* Hero Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <button
            onClick={() => onNavigate('image')}
            className="btn-cyber-primary"
            style={{ padding: '12px 24px', fontSize: '14px' }}
          >
            <span>START INVESTIGATION</span>
            <ArrowRight size={16} />
          </button>

          <button
            onClick={() => onNavigate('ai-hub')}
            className="btn-cyber-secondary"
            style={{ padding: '11px 22px', fontSize: '14px' }}
          >
            <Layers size={16} />
            <span>EXPLORE FORENSICS</span>
          </button>
        </div>

        {/* Hero Visual: Digital Evidence Core */}
        <div style={{ marginTop: '24px' }}>
          <AuthenticityCore onNavigateEngine={(engine) => onNavigate(engine)} />
        </div>
      </section>

      {/* 2. OVERVIEW DASHBOARD METRICS */}
      <section style={{ marginTop: '30px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.5px' }}>
              INVESTIGATION PULSE & METRICS
            </h2>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>
              Live telemetry aggregated across all four forensic inspection micro-engines
            </p>
          </div>
          <div style={{ fontSize: '11px', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
            UPDATED: JUST NOW
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '14px'
          }}
        >
          {[
            { label: 'Total Investigations', value: '1,428', sub: '+38 today', color: '#00f0ff' },
            { label: 'Images Analyzed', value: '612', sub: 'ViT + FFT', color: '#38bdf8' },
            { label: 'Videos Analyzed', value: '340', sub: 'Spatial-Temporal', color: '#60a5fa' },
            { label: 'Audio Analyzed', value: '284', sub: 'Spectrogram + Vocoder', color: '#06b6d4' },
            { label: 'Texts Analyzed', value: '192', sub: 'Stylometric NLP', color: '#818cf8' },
            { label: 'High-Risk Findings', value: '241', sub: 'Elevated anomalies', color: '#ef4444' },
            { label: 'Uncertain Findings', value: '48', sub: 'Mixed signals', color: '#94a3b8' },
          ].map((metric, idx) => (
            <div
              key={idx}
              className="glass-panel"
              style={{
                padding: '16px',
                borderLeft: `4px solid ${metric.color}`
              }}
            >
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {metric.label}
              </div>
              <div
                style={{
                  fontSize: '26px',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  color: '#f8fafc',
                  margin: '4px 0 2px'
                }}
              >
                {metric.value}
              </div>
              <div style={{ fontSize: '10px', color: metric.color, fontFamily: 'var(--font-mono)' }}>
                {metric.sub}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. MAIN FORENSIC PIPELINE INTERACTIVE MAP */}
      <section className="glass-panel forensic-corner" style={{ padding: '24px', marginBottom: '40px' }}>
        <div style={{ marginBottom: '18px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.5px' }}>
            SPECIALIZED FORENSIC PIPELINE ARCHITECTURE
          </h2>
          <p style={{ fontSize: '12px', color: '#94a3b8' }}>
            Click any processing stage to inspect the technical data contract and evidence extraction criteria
          </p>
        </div>

        {/* Horizontal Pipeline Steps */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '12px'
          }}
        >
          {pipelineStages.map((stage, idx) => {
            const isSelected = selectedPipelineStage === idx;
            return (
              <div
                key={idx}
                onClick={() => setSelectedPipelineStage(idx)}
                style={{
                  minWidth: '130px',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  background: isSelected ? 'rgba(0, 240, 255, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                  border: isSelected ? '1px solid #00f0ff' : '1px solid rgba(56, 189, 248, 0.15)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: isSelected ? '#00f0ff' : '#64748b' }}>
                  STEP {String(idx + 1).padStart(2, '0')}
                </div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: isSelected ? '#f8fafc' : '#cbd5e1', marginTop: '2px' }}>
                  {stage.name}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Stage Detail Card */}
        {selectedPipelineStage !== null && (
          <div
            style={{
              marginTop: '16px',
              padding: '16px 20px',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              borderLeft: '4px solid #00f0ff',
              borderRadius: '0 8px 8px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '20px'
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: '#00f0ff', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700 }}>
                STAGE {selectedPipelineStage + 1}: {pipelineStages[selectedPipelineStage].name}
              </div>
              <div style={{ fontSize: '13px', color: '#e2e8f0', marginTop: '4px', lineHeight: 1.5 }}>
                {pipelineStages[selectedPipelineStage].desc}
              </div>
            </div>

            <button
              onClick={() => onNavigate('about')}
              style={{
                background: 'rgba(0, 240, 255, 0.1)',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                color: '#00f0ff',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Read Specification
            </button>
          </div>
        )}
      </section>

      {/* 4. RECENT INVESTIGATIONS BENCHMARK TABLE */}
      <section className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.5px' }}>
              RECENT FORENSIC INVESTIGATIONS
            </h2>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>
              Standardized probabilistic cases ready for immediate examination
            </p>
          </div>

          <button
            onClick={() => onNavigate('workspace')}
            className="btn-cyber-secondary"
            style={{ fontSize: '12px', padding: '6px 14px' }}
          >
            <span>Open Multi-Media Case Board</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(56, 189, 248, 0.15)', color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 14px' }}>Case ID</th>
                <th style={{ padding: '12px 14px' }}>Target File</th>
                <th style={{ padding: '12px 14px' }}>Media Type</th>
                <th style={{ padding: '12px 14px' }}>Model Assessment</th>
                <th style={{ padding: '12px 14px' }}>Score</th>
                <th style={{ padding: '12px 14px' }}>Risk</th>
                <th style={{ padding: '12px 14px' }}>Confidence</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentCases.map((c) => {
                const isHighRisk = c.authenticity_score <= 30;
                const isMediumRisk = c.authenticity_score > 30 && c.authenticity_score <= 60;
                const riskBadge = isHighRisk ? 'badge-risk-high' : (isMediumRisk ? 'badge-risk-medium' : 'badge-risk-low');

                return (
                  <tr
                    key={c.case_id}
                    style={{
                      borderBottom: '1px solid rgba(56, 189, 248, 0.08)',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 240, 255, 0.04)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#00f0ff', fontWeight: 600 }}>
                      {c.case_id}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '13px', color: '#f1f5f9', fontWeight: 500 }}>
                      {c.file_name}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '12px', color: '#94a3b8' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {c.media_type === 'IMAGE' && <ImageIcon size={14} color="#00f0ff" />}
                        {c.media_type === 'VIDEO' && <VideoIcon size={14} color="#38bdf8" />}
                        {c.media_type === 'AUDIO' && <Mic size={14} color="#06b6d4" />}
                        {c.media_type === 'TEXT' && <FileText size={14} color="#60a5fa" />}
                        {c.media_type}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '12px', fontWeight: 600, color: isHighRisk ? '#f87171' : (isMediumRisk ? '#fbbf24' : '#34d399') }}>
                      {c.assessment}
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                      {c.authenticity_score}/100
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className={riskBadge}>{c.risk_level}</span>
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#94a3b8' }}>
                      {c.confidence_level} ({Math.round(c.confidence_score * 100)}%)
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          onSelectCase(c.case_id);
                          onNavigate(c.media_type.toLowerCase());
                        }}
                        style={{
                          background: 'rgba(56, 189, 248, 0.1)',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          color: '#38bdf8',
                          padding: '5px 12px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
