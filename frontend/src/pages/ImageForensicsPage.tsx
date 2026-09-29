import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Image as ImageIcon,
  ChevronRight,
  HelpCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  RefreshCw,
  X
} from 'lucide-react';
import { ScoreMeter } from '../components/ScoreMeter';
import { LiveScanAnimation } from '../components/LiveScanAnimation';
import { WhyThisResultModal } from '../components/WhyThisResultModal';
import { LoadingState, ErrorState } from '../components/AppStates';
import { forensicApi } from '../services/api';
import { InvestigationResult, ForensicSignal } from '../types/forensics';
import { Loader2 } from 'lucide-react';

interface ImageForensicsPageProps {
  onGenerateReport: (caseId: string) => void;
  onNavigate: (tab: string) => void;
  initialCaseId?: string;
}

type ViewTab = 'original' | 'overlay' | 'heatmap';

// Map signal category to a human-readable section label
const SIGNAL_CATEGORY_LABELS: Record<string, string> = {
  texture: 'Texture & Visual Anomaly',
  frequency: 'Frequency Domain Analysis',
  pixel: 'Pixel-Level Indicators',
  cv: 'Computer Vision Signals',
  metadata: 'Metadata Observations',
  multimodal: 'Multi-Modal Indicators',
};

function groupSignalsByCategory(signals: ForensicSignal[]) {
  const groups: Record<string, ForensicSignal[]> = {};
  for (const sig of signals) {
    const key = sig.category;
    if (!groups[key]) groups[key] = [];
    groups[key].push(sig);
  }
  return groups;
}

function riskColor(strength: string) {
  if (strength === 'Strong') return 'var(--risk-high)';
  if (strength === 'Moderate') return 'var(--risk-medium)';
  if (strength === 'Weak') return 'var(--risk-low)';
  return 'var(--text-dim)';
}

export const ImageForensicsPage: React.FC<ImageForensicsPageProps> = ({
  onGenerateReport,
  onNavigate,
  initialCaseId
}) => {
  const [currentCase, setCurrentCase] = useState<InvestigationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isWhyModalOpen, setIsWhyModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [viewTab, setViewTab] = useState<ViewTab>('original');
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.65);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const caseToLoad = initialCaseId || 'RC-2026-0042';
    let isMounted = true;
    setIsLoading(true);
    setError(null);
    forensicApi.getInvestigation(caseToLoad)
      .then(data => { if (isMounted) setCurrentCase(data); })
      .catch(err => { if (isMounted) setError(err.message || 'Failed to load case'); })
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, [initialCaseId]);

  // Auto-select first suspicious region
  useEffect(() => {
    if (currentCase?.suspicious_regions?.length) {
      setSelectedRegionId(currentCase.suspicious_regions[0].id);
    } else {
      setSelectedRegionId(null);
    }
  }, [currentCase]);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError(`Unsupported file type: ${file.type}. Please upload PNG, JPG, WEBP, or GIF.`);
      return;
    }
    setError(null);
    setUploadedImageSrc(URL.createObjectURL(file));
    setUploadedFileName(file.name);
    setViewTab('original');
    setIsScanning(true);
    forensicApi.analyzeMedia('IMAGE', file)
      .then(res => { setCurrentCase(res); setIsScanning(false); })
      .catch(err => { setError(err.message || 'Analysis failed.'); setIsScanning(false); });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleLoadSample = (caseId: string) => {
    setIsScanning(true);
    setError(null);
    setUploadedImageSrc(null);
    setUploadedFileName(null);
    forensicApi.analyzeMedia('IMAGE', undefined, caseId)
      .then(res => { setCurrentCase(res); })
      .catch(err => setError(err.message))
      .finally(() => setIsScanning(false));
  };

  const handleRemoveUpload = () => {
    setUploadedImageSrc(null);
    setUploadedFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const selectedRegion = currentCase?.suspicious_regions?.find(r => r.id === selectedRegionId);
  const signalGroups = currentCase ? groupSignalsByCategory(
    currentCase.signals.filter(s => ['texture', 'frequency', 'pixel', 'cv', 'metadata', 'multimodal'].includes(s.category))
  ) : {};

  // ── Loading & error states ────────────────────────────────────────────────
  if (isLoading) {
    return <LoadingState message="Loading case data..." />;
  }

  // ── Analysis in progress ──────────────────────────────────────────────────
  if (isScanning) {
    return <LoadingState message="Analysis in progress..." stages={[
      { name: 'File received', status: 'completed' },
      { name: 'Forensic analysis', status: 'processing' },
      { name: 'Evidence extraction', status: 'pending' }
    ]} />;
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (error && !currentCase) {
    return <ErrorState message={error} onRetry={() => onNavigate('overview')} />;
  }

  if (!currentCase) {
    return (
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px 24px 80px', width: '100%' }}>
        {/* Hidden file input */}
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
        
        {/* Breadcrumb */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-dim)', marginBottom: '20px' }}>
          <button onClick={() => onNavigate('overview')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, fontSize: '13px' }}>Overview</button>
          <ChevronRight size={14} />
          <button onClick={() => onNavigate('new-investigation')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, fontSize: '13px' }}>Investigate</button>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Image</span>
        </nav>

        {/* Page header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>Image Forensics</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Analyze visual authenticity and manipulation evidence.</p>
          </div>
        </div>

        {/* Upload area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          style={{
            border: isDragging ? '2px dashed var(--cyan-primary)' : '2px dashed var(--border-subtle)',
            borderRadius: '12px', padding: '60px 24px', textAlign: 'center', cursor: 'pointer',
            background: isDragging ? 'rgba(0,240,255,0.06)' : 'var(--bg-card)',
            transition: 'all 0.2s', minHeight: '40vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--bg-body-pattern-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <ImageIcon size={28} color="var(--cyan-primary)" />
          </div>
          <div style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '18px', marginBottom: '8px' }}>Upload an image for forensic analysis</div>
          <div style={{ color: 'var(--text-dim)', fontSize: '14px', marginBottom: '24px' }}>PNG, JPG, WEBP, GIF — Max 25 MB</div>
          <button
            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
          >
            <Upload size={16} /> Browse Files
          </button>
        </div>
      </div>
    );
  }

  const isHighRisk = currentCase.authenticity_score <= 30;
  const isMediumRisk = currentCase.authenticity_score > 30 && currentCase.authenticity_score <= 60;
  const riskAccent = isHighRisk ? 'var(--risk-high)' : isMediumRisk ? 'var(--risk-medium)' : 'var(--risk-low)';

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px 24px 80px', width: '100%' }}>
      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />

      {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-dim)', marginBottom: '20px' }}>
        <button onClick={() => onNavigate('overview')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, fontSize: '13px' }}>Overview</button>
        <ChevronRight size={14} />
        <button onClick={() => onNavigate('new-investigation')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, fontSize: '13px' }}>Investigate</button>
        <ChevronRight size={14} />
        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Image</span>
      </nav>

      {/* ── Page header ────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>Image Forensics</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Analyze visual authenticity and manipulation evidence.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)', border: 'none', borderRadius: '8px', padding: '9px 16px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
          >
            <Upload size={16} /> Upload Image
          </button>
          <button
            onClick={() => onGenerateReport(currentCase.case_id)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '9px 16px', cursor: 'pointer', fontWeight: 500, fontSize: '14px' }}
          >
            <FileSpreadsheet size={16} /> Report
          </button>
        </div>
      </div>

      {/* ── Error banner (non-fatal) ────────────────────────────────────── */}
      {error && currentCase && (
        <div style={{ marginBottom: '20px', padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', color: 'var(--risk-high)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={16} />
          {error}
          <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><X size={14} /></button>
        </div>
      )}

      {/* ── Main two-column grid ───────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>

        {/* LEFT — Media Viewer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>


          {/* Image viewer card */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', overflow: 'hidden' }}>
            {/* Tab bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                {(['original', 'overlay', 'heatmap'] as ViewTab[]).map((tab) => (
                  <button key={tab} onClick={() => setViewTab(tab)}
                    style={{
                      padding: '5px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                      fontSize: '12px', fontWeight: viewTab === tab ? 700 : 500,
                      background: viewTab === tab ? 'var(--bg-body-pattern-1)' : 'transparent',
                      color: viewTab === tab ? 'var(--text-main)' : 'var(--text-muted)',
                      textTransform: 'capitalize'
                    }}>
                    {tab}
                  </button>
                ))}
              </div>
              {uploadedImageSrc && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{uploadedFileName}</span>
                  <button onClick={handleRemoveUpload} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Viewport */}
            <div
              style={{ position: 'relative', width: '100%', aspectRatio: '4/3', background: '#060911', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              {/* Scanner line */}
              <div className="scanner-laser" />

              {/* Actual image or placeholder */}
              {uploadedImageSrc ? (
                <img src={uploadedImageSrc} alt="Subject under investigation" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block', position: 'relative', zIndex: 5 }} />
              ) : (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-main)', fontWeight: 600 }}>{currentCase.file_name}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>{currentCase.metadata.dimensions}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-dim)', marginTop: '4px' }}>CASE {currentCase.case_id}</div>
                </div>
              )}

              {/* Heatmap overlay */}
              {(viewTab === 'overlay' || viewTab === 'heatmap') && currentCase.sample_type === 'ai' && (
                <div style={{
                  position: 'absolute', inset: 0, zIndex: 10,
                  background: 'radial-gradient(ellipse at 50% 38%, rgba(239,68,68,0.72) 0%, rgba(245,158,11,0.42) 45%, rgba(0,240,255,0.12) 75%, transparent 100%)',
                  opacity: viewTab === 'heatmap' ? 0.95 : heatmapOpacity,
                  pointerEvents: 'none',
                  mixBlendMode: viewTab === 'heatmap' ? 'normal' : 'screen',
                  transition: 'opacity 0.2s'
                }} />
              )}
              {(viewTab === 'overlay' || viewTab === 'heatmap') && currentCase.sample_type === 'real' && (
                <div style={{
                  position: 'absolute', inset: 0, zIndex: 10,
                  background: 'radial-gradient(circle at 50% 50%, rgba(16,185,129,0.2) 0%, rgba(56,189,248,0.08) 60%, transparent 100%)',
                  opacity: 0.7, pointerEvents: 'none'
                }} />
              )}

              {/* Suspicious region bounding boxes */}
              {currentCase.suspicious_regions?.map((reg) => (
                <div key={reg.id} onClick={() => setSelectedRegionId(reg.id === selectedRegionId ? null : reg.id)}
                  style={{
                    position: 'absolute', zIndex: 15,
                    left: `${reg.coordinates.x}%`, top: `${reg.coordinates.y}%`,
                    width: `${reg.coordinates.width}%`, height: `${reg.coordinates.height}%`,
                    border: selectedRegionId === reg.id ? '2px solid var(--risk-high)' : '1px dashed rgba(239,68,68,0.5)',
                    background: selectedRegionId === reg.id ? 'rgba(239,68,68,0.12)' : 'transparent',
                    borderRadius: '3px', cursor: 'pointer', transition: 'all 0.15s'
                  }}
                >
                  <span style={{ position: 'absolute', top: '-18px', left: 0, background: 'var(--risk-high)', color: '#fff', fontSize: '8px', fontWeight: 700, padding: '1px 5px', borderRadius: '2px', letterSpacing: '0.3px', whiteSpace: 'nowrap' }}>
                    {reg.label} {Math.round(reg.confidence * 100)}%
                  </span>
                </div>
              ))}

              {/* Opacity slider */}
              {viewTab === 'overlay' && (
                <div style={{ position: 'absolute', bottom: '10px', right: '10px', zIndex: 20, background: 'rgba(6,9,17,0.85)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', color: 'var(--text-muted)' }}>
                  <span>Opacity</span>
                  <input type="range" min="0.1" max="1" step="0.05" value={heatmapOpacity} onChange={(e) => setHeatmapOpacity(parseFloat(e.target.value))} style={{ width: '60px', accentColor: 'var(--cyan-primary)' }} />
                </div>
              )}
            </div>
          </div>

          {/* Suspicious region detail */}
          {selectedRegion && (
            <div style={{ background: 'var(--bg-card)', border: `1px solid rgba(239,68,68,0.35)`, borderLeft: `3px solid var(--risk-high)`, borderRadius: '8px', padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--risk-high)', textTransform: 'uppercase' }}>{selectedRegion.label}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{selectedRegion.anomaly_type}</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>{selectedRegion.explanation}</p>
            </div>
          )}

          {/* Sample switchers */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '14px 16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Load sample case</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={() => handleLoadSample('RC-2026-0042')}
                style={{ fontSize: '12px', padding: '6px 12px', background: currentCase.case_id === 'RC-2026-0042' && !uploadedImageSrc ? 'rgba(0,240,255,0.1)' : 'var(--bg-body-pattern-1)', border: currentCase.case_id === 'RC-2026-0042' && !uploadedImageSrc ? '1px solid var(--cyan-primary)' : '1px solid var(--border-subtle)', color: 'var(--text-muted)', borderRadius: '6px', cursor: 'pointer' }}>
                Synthetic Diffusion (AI)
              </button>
              <button onClick={() => handleLoadSample('RC-2026-0046')}
                style={{ fontSize: '12px', padding: '6px 12px', background: currentCase.case_id === 'RC-2026-0046' && !uploadedImageSrc ? 'rgba(0,240,255,0.1)' : 'var(--bg-body-pattern-1)', border: currentCase.case_id === 'RC-2026-0046' && !uploadedImageSrc ? '1px solid var(--cyan-primary)' : '1px solid var(--border-subtle)', color: 'var(--text-muted)', borderRadius: '6px', cursor: 'pointer' }}>
                Nikon D850 Raw (Authentic)
              </button>
              <button onClick={() => fileInputRef.current?.click()}
                style={{ fontSize: '12px', padding: '6px 12px', background: 'var(--bg-body-pattern-1)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <RefreshCw size={12} /> Upload another
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT — Assessment + Evidence */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Assessment card */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '24px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
              Authenticity Assessment
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <ScoreMeter
                score={currentCase.authenticity_score}
                riskLevel={currentCase.risk_level}
                assessment={currentCase.assessment}
                confidenceScore={currentCase.confidence_score}
                size={180}
              />
            </div>

            {/* Disclaimer */}
            <div style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '6px', padding: '10px 12px', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <Info size={14} color="var(--risk-medium)" style={{ flexShrink: 0, marginTop: '1px' }} />
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                This score reflects AI model inference, not a legal determination. A single score does not confirm or deny authenticity. Combine with contextual investigation.
              </p>
            </div>

            {/* 4 sub-scores */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              {[
                { label: 'AI Generation Probability', value: currentCase.ai_generation_probability, suffix: '%', color: currentCase.ai_generation_probability > 70 ? 'var(--risk-high)' : 'var(--text-main)' },
                { label: 'Manipulation Risk', value: currentCase.manipulation_risk, suffix: '%', color: currentCase.manipulation_risk > 50 ? 'var(--risk-medium)' : 'var(--text-main)' },
                { label: 'Forensic Anomaly Score', value: currentCase.forensic_anomaly_score, suffix: '%', color: 'var(--text-main)' },
                { label: 'Metadata Risk', value: currentCase.metadata_risk_score, suffix: '%', color: 'var(--text-main)' },
              ].map((item, i) => (
                <div key={i} style={{ background: 'var(--bg-body-pattern-1)', borderRadius: '8px', padding: '10px 12px' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>{item.label}</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: item.color }}>
                    {item.value.toFixed(1)}<span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{item.suffix}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setIsWhyModalOpen(true)}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px', background: 'var(--bg-body-pattern-1)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                <HelpCircle size={15} color="var(--cyan-primary)" /> Why this result?
              </button>
              <button onClick={() => onGenerateReport(currentCase.case_id)}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px', background: 'var(--btn-primary-bg)', border: 'none', color: 'var(--btn-primary-text)', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                <FileSpreadsheet size={15} /> Generate Report
              </button>
            </div>
          </div>

          {/* Metadata card */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>
              File & Metadata
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'Filename', value: currentCase.metadata.file_name },
                { label: 'Size', value: currentCase.metadata.file_size_formatted },
                { label: 'MIME Type', value: currentCase.metadata.mime_type },
                { label: 'Dimensions', value: currentCase.metadata.dimensions || '—' },
                { label: 'Camera', value: currentCase.metadata.camera_model || 'Not detected' },
                { label: 'EXIF Present', value: currentCase.metadata.exif_available ? 'Yes' : 'No (stripped)' },
                { label: 'Software', value: currentCase.metadata.software_signature || '—' },
                { label: 'SHA-256', value: currentCase.metadata.hash_sha256.slice(0, 20) + '…', mono: true },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', fontSize: '13px', borderBottom: i < 7 ? '1px solid var(--border-subtle)' : 'none', paddingBottom: i < 7 ? '8px' : '0' }}>
                  <span style={{ color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>{row.label}</span>
                  <span style={{ color: 'var(--text-muted)', textAlign: 'right', fontFamily: row.mono ? 'var(--font-mono)' : 'inherit', fontSize: row.mono ? '11px' : '13px', wordBreak: 'break-all' }}>{row.value}</span>
                </div>
              ))}
            </div>
            {currentCase.metadata.note && (
              <div style={{ marginTop: '12px', padding: '10px 12px', background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '6px', fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--risk-medium)' }}>Note: </strong>{currentCase.metadata.note}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Evidence section ──────────────────────────────────────────────── */}
      <div style={{ marginTop: '32px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
            Forensic Evidence
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Why did the system produce this result? Evidence returned by the backend forensic engines.
          </p>
        </div>

        {/* Evidence breakdown cards */}
        {currentCase.evidence_breakdown.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px', marginBottom: '28px' }}>
            {currentCase.evidence_breakdown.map((card, idx) => {
              const isAnomalous = card.risk === 'High Risk' || card.risk === 'Medium Risk';
              return (
                <div key={idx} style={{ background: 'var(--bg-card)', border: `1px solid ${isAnomalous ? 'rgba(239,68,68,0.25)' : 'var(--border-subtle)'}`, borderRadius: '10px', padding: '16px', borderLeft: `3px solid ${isAnomalous ? 'var(--risk-high)' : card.risk === 'Low Risk' ? 'var(--risk-low)' : 'var(--text-dim)'}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>{card.title}</span>
                    {isAnomalous
                      ? <AlertTriangle size={14} color="var(--risk-high)" />
                      : <CheckCircle2 size={14} color="var(--risk-low)" />}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '6px', textTransform: 'uppercase' }}>{card.category}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{card.explanation}</div>
                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1, height: '4px', background: 'var(--border-subtle)', borderRadius: '2px', marginRight: '10px' }}>
                      <div style={{ height: '100%', width: `${card.score}%`, background: isAnomalous ? 'var(--risk-high)' : 'var(--risk-low)', borderRadius: '2px', transition: 'width 0.6s ease' }} />
                    </div>
                    <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{card.score}/100</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Signal breakdown by category */}
        {Object.keys(signalGroups).length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(signalGroups).map(([cat, signals]) => (
              <div key={cat} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', background: 'var(--bg-body-pattern-1)' }}>
                  {SIGNAL_CATEGORY_LABELS[cat] || cat}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {signals.map((sig, i) => (
                    <div key={i} style={{ padding: '12px 16px', borderBottom: i < signals.length - 1 ? '1px solid var(--border-subtle)' : 'none', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: riskColor(sig.strength), flexShrink: 0, marginTop: '4px' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '3px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>{sig.name}</span>
                          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: riskColor(sig.strength), whiteSpace: 'nowrap' }}>{sig.strength}</span>
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>{sig.explanation}</p>
                        {sig.affected_region_or_time && (
                          <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>Region: {sig.affected_region_or_time}</span>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', whiteSpace: 'nowrap', paddingTop: '3px' }}>{sig.score}/100</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Why This Result modal */}
      <WhyThisResultModal
        isOpen={isWhyModalOpen}
        onClose={() => setIsWhyModalOpen(false)}
        result={currentCase}
        onInvestigateDeeper={() => onNavigate('workspace')}
      />
    </div>
  );
};
