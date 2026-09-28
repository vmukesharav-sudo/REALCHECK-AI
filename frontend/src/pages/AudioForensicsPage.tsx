import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Mic as MicIcon,
  ChevronRight,
  HelpCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  RefreshCw,
  X,
  Clock,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { ScoreMeter } from '../components/ScoreMeter';
import { LiveScanAnimation } from '../components/LiveScanAnimation';
import { WhyThisResultModal } from '../components/WhyThisResultModal';
import { LoadingState, ErrorState } from '../components/AppStates';
import { forensicApi } from '../services/api';
import { InvestigationResult, ForensicSignal, SuspiciousTimeSegment } from '../types/forensics';
import { Loader2 } from 'lucide-react';

interface AudioForensicsPageProps {
  onGenerateReport: (caseId: string) => void;
  onNavigate: (tab: string) => void;
  initialCaseId?: string;
}

type ViewTab = 'waveform' | 'spectrogram' | 'both';

const SIGNAL_CATEGORY_LABELS: Record<string, string> = {
  acoustic: 'Acoustic & Voice Characteristics',
  frequency: 'Frequency & Spectral Anomalies',
  metadata: 'Metadata Observations',
  nlp: 'Language & Content Model (ASR)',
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

function segmentRiskColor(risk: SuspiciousTimeSegment['risk_level']) {
  if (risk === 'High') return 'rgba(239,68,68,0.75)';
  if (risk === 'Amber') return 'rgba(245,158,11,0.55)';
  return 'rgba(16,185,129,0.35)';
}

export const AudioForensicsPage: React.FC<AudioForensicsPageProps> = ({
  onGenerateReport,
  onNavigate,
  initialCaseId
}) => {
  const [currentCase, setCurrentCase] = useState<InvestigationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadedAudioSrc, setUploadedAudioSrc] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isWhyModalOpen, setIsWhyModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const [viewTab, setViewTab] = useState<ViewTab>('both');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [durationSec, setDurationSec] = useState(30);
  const [selectedSegment, setSelectedSegment] = useState<SuspiciousTimeSegment | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!initialCaseId) {
        setIsLoading(false);
        return;
    }
    let isMounted = true;
    setIsLoading(true);
    setError(null);
    forensicApi.getInvestigation(initialCaseId)
      .then(data => { if (isMounted) setCurrentCase(data); })
      .catch(err => { if (isMounted) setError(err.message || 'Failed to load case'); })
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, [initialCaseId]);

  // Simulated timer if audio is not real
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying && !uploadedAudioSrc) {
      interval = setInterval(() => {
        setCurrentTimeSec((prev) => {
          if (prev >= durationSec) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, uploadedAudioSrc, durationSec]);

  useEffect(() => {
    if (currentCase?.suspicious_segments?.length) {
      const highRisk = currentCase.suspicious_segments.find(s => s.risk_level === 'High');
      setSelectedSegment(highRisk || currentCase.suspicious_segments[0]);
    } else {
      setSelectedSegment(null);
    }
  }, [currentCase]);

  const processFile = (file: File) => {
    if (!file.type.startsWith('audio/')) {
      setError(`Unsupported file type: ${file.type}. Please upload MP3, WAV, M4A, or OGG.`);
      return;
    }
    setError(null);
    setUploadedAudioSrc(URL.createObjectURL(file));
    setUploadedFileName(file.name);
    setViewTab('both');
    setCurrentTimeSec(0);
    setIsPlaying(false);
    setIsScanning(true);
    forensicApi.analyzeMedia('AUDIO', file)
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
    setUploadedAudioSrc(null);
    setUploadedFileName(null);
    setCurrentTimeSec(0);
    setIsPlaying(false);
    forensicApi.analyzeMedia('AUDIO', undefined, caseId)
      .then(res => { setCurrentCase(res); })
      .catch(err => setError(err.message))
      .finally(() => setIsScanning(false));
  };

  const handleRemoveUpload = () => {
    setUploadedAudioSrc(null);
    setUploadedFileName(null);
    setIsPlaying(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (audioRef.current) audioRef.current.pause();
  };

  const togglePlay = () => {
    if (uploadedAudioSrc && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimelineClick = (seg: SuspiciousTimeSegment) => {
    setSelectedSegment(seg);
    setCurrentTimeSec(seg.start_seconds);
    if (audioRef.current && uploadedAudioSrc) {
      audioRef.current.currentTime = seg.start_seconds;
    }
  };

  const activeSegment = currentCase?.suspicious_segments?.find(
    s => currentTimeSec >= s.start_seconds && currentTimeSec <= s.end_seconds
  ) || selectedSegment;

  const signalGroups = currentCase ? groupSignalsByCategory(
    currentCase.signals.filter(s =>
      ['acoustic', 'frequency', 'metadata', 'nlp', 'multimodal'].includes(s.category)
    )
  ) : {};

  // ── States ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return <LoadingState message="Loading case data..." />;
  }

  if (isScanning) {
    return <LoadingState message="Analysis in progress..." stages={[
      { name: 'File received', status: 'completed' },
      { name: 'Acoustic feature extraction', status: 'processing' },
      { name: 'Voice clone detection', status: 'pending' }
    ]} />;
  }

  if (error && !currentCase) {
    return <ErrorState message={error} onRetry={() => onNavigate('overview')} />;
  }

  if (!currentCase) {
    return (
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px 24px 80px', width: '100%' }}>
        <input ref={fileInputRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={handleFileChange} />
        
        {/* Breadcrumb */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-dim)', marginBottom: '20px' }}>
          <button onClick={() => onNavigate('overview')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, fontSize: '13px' }}>Overview</button>
          <ChevronRight size={14} />
          <button onClick={() => onNavigate('new-investigation')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, fontSize: '13px' }}>Investigate</button>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Audio</span>
        </nav>

        {/* Page header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>Audio Forensics</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Analyze acoustic authenticity, synthetic clone detection, and metadata.</p>
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
            <MicIcon size={28} color="var(--cyan-primary)" />
          </div>
          <div style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '18px', marginBottom: '8px' }}>Upload audio for forensic analysis</div>
          <div style={{ color: 'var(--text-dim)', fontSize: '14px', marginBottom: '24px' }}>MP3, WAV, M4A, OGG — Max 50 MB</div>
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

  const segments = currentCase.suspicious_segments || [];
  const actualDuration = segments.length > 0 ? Math.max(durationSec, segments[segments.length - 1].end_seconds) : durationSec;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px 24px 80px', width: '100%' }}>
      <input ref={fileInputRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={handleFileChange} />

      {uploadedAudioSrc && (
        <audio
          ref={audioRef}
          src={uploadedAudioSrc}
          onTimeUpdate={(e) => setCurrentTimeSec(Math.round(e.currentTarget.currentTime))}
          onLoadedMetadata={(e) => setDurationSec(Math.round(e.currentTarget.duration) || 30)}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-dim)', marginBottom: '20px' }}>
        <button onClick={() => onNavigate('overview')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, fontSize: '13px' }}>Overview</button>
        <ChevronRight size={14} />
        <button onClick={() => onNavigate('new-investigation')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, fontSize: '13px' }}>Investigate</button>
        <ChevronRight size={14} />
        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Audio</span>
      </nav>

      {/* ── Page header ────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>Audio Authenticity</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Analyze acoustic anomalies, deepfake voice cloning, and synthesis artifacts.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)', border: 'none', borderRadius: '8px', padding: '9px 16px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
          >
            <Upload size={16} /> Upload Audio
          </button>
          <button
            onClick={() => onGenerateReport(currentCase.case_id)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '9px 16px', cursor: 'pointer', fontWeight: 500, fontSize: '14px' }}
          >
            <FileSpreadsheet size={16} /> Report
          </button>
        </div>
      </div>

      {/* ── Error banner ───────────────────────────────────────────────── */}
      {error && currentCase && (
        <div style={{ marginBottom: '20px', padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', color: 'var(--risk-high)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={16} />
          {error}
          <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><X size={14} /></button>
        </div>
      )}

      {/* ── Main two-column grid ───────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>

        {/* LEFT — Audio Viewer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>



          {/* Viewer Card */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                {(['waveform', 'spectrogram', 'both'] as ViewTab[]).map((tab) => (
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
              {uploadedAudioSrc && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{uploadedFileName}</span>
                  <button onClick={handleRemoveUpload} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}><X size={14} /></button>
                </div>
              )}
            </div>

            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* 1. SPECTROGRAM */}
              {(viewTab === 'both' || viewTab === 'spectrogram') && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    <span>Mel-Spectrogram (0 Hz - 16 kHz)</span>
                  </div>
                  <div style={{ position: 'relative', height: '140px', background: '#0a0f18', borderRadius: '6px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, #091a24 0%, #164e63 15%, #0e7490 35%, #0891b2 55%, #155e75 75%, #082f49 100%)', opacity: 0.8 }} />
                    
                    {/* Render Suspicious Blocks */}
                    {segments.map((seg, idx) => (
                      <div
                        key={idx}
                        style={{
                          position: 'absolute', top: 0, bottom: 0,
                          left: `${(seg.start_seconds / actualDuration) * 100}%`,
                          width: `${((seg.end_seconds - seg.start_seconds) / actualDuration) * 100}%`,
                          background: seg.risk_level === 'High' ? 'rgba(239,68,68,0.4)' : seg.risk_level === 'Amber' ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.2)',
                          borderLeft: `1px solid ${seg.risk_level === 'High' ? '#ef4444' : 'transparent'}`,
                          borderRight: `1px solid ${seg.risk_level === 'High' ? '#ef4444' : 'transparent'}`,
                          zIndex: 10
                        }}
                      />
                    ))}

                    {/* Scrubber */}
                    <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${(currentTimeSec / actualDuration) * 100}%`, width: '2px', background: 'var(--cyan-primary)', boxShadow: '0 0 10px #00f0ff', zIndex: 20, transition: 'left 0.1s linear' }} />
                  </div>
                </div>
              )}

              {/* 2. WAVEFORM */}
              {(viewTab === 'both' || viewTab === 'waveform') && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    <span>Amplitude Waveform</span>
                  </div>
                  <div
                    style={{ position: 'relative', height: '90px', background: 'var(--bg-deep)', borderRadius: '6px', border: '1px solid var(--border-subtle)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 8px', cursor: 'pointer' }}
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const pct = (e.clientX - rect.left) / rect.width;
                      const targetSec = Math.round(pct * actualDuration);
                      setCurrentTimeSec(targetSec);
                      if (audioRef.current) audioRef.current.currentTime = targetSec;
                    }}
                  >
                    {Array.from({ length: 60 }).map((_, i) => {
                      const barTime = (i / 60) * actualDuration;
                      const seg = segments.find(s => barTime >= s.start_seconds && barTime <= s.end_seconds);
                      const height = 30 + Math.sin(i * 0.8) * 25 + Math.cos(i * 1.2) * 20;

                      return (
                        <div
                          key={i}
                          style={{
                            width: '4px', height: `${height}%`,
                            background: seg?.risk_level === 'High' ? 'var(--risk-high)' : seg?.risk_level === 'Amber' ? 'var(--risk-medium)' : 'var(--cyan-muted)',
                            borderRadius: '2px', transition: 'height 0.2s ease',
                            boxShadow: seg?.risk_level === 'High' ? '0 0 6px rgba(239,68,68,0.5)' : 'none'
                          }}
                        />
                      );
                    })}
                    <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${(currentTimeSec / actualDuration) * 100}%`, width: '2px', background: 'var(--text-main)', zIndex: 20 }} />
                  </div>
                </div>
              )}

              {/* CONTROLS */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-body-pattern-1)', padding: '12px 16px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button onClick={togglePlay} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--cyan-primary)', border: 'none', color: 'var(--text-invert)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
                  </button>
                  <button onClick={() => { setCurrentTimeSec(0); if (audioRef.current) audioRef.current.currentTime = 0; }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} title="Restart">
                    <RotateCcw size={16} />
                  </button>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-main)' }}>
                    00:{String(currentTimeSec).padStart(2, '0')} / 00:{String(Math.floor(actualDuration)).padStart(2, '0')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Timeline ─────────────────────────────────────────────── */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <Clock size={14} />
                Acoustic Timeline
              </div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '10px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--risk-low)' }}><span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'rgba(16,185,129,0.5)', display: 'inline-block' }} /> Normal</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--risk-medium)' }}><span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'rgba(245,158,11,0.7)', display: 'inline-block' }} /> Suspicious</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--risk-high)' }}><span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'rgba(239,68,68,0.9)', display: 'inline-block' }} /> High Risk</span>
              </div>
            </div>

            {segments.length > 0 ? (
              <>
                <div style={{ position: 'relative', height: '28px', borderRadius: '6px', overflow: 'hidden', display: 'flex', cursor: 'pointer', background: 'var(--bg-body-pattern-1)', marginBottom: '10px' }}>
                  {segments.map((seg, i) => {
                    const width = actualDuration > 0 ? ((seg.end_seconds - seg.start_seconds) / actualDuration) * 100 : (100 / segments.length);
                    const isActive = selectedSegment?.start_time === seg.start_time;
                    return (
                      <div key={i} onClick={() => handleTimelineClick(seg)} title={`${seg.start_time}–${seg.end_time}: ${seg.anomaly_type}`}
                        style={{
                          width: `${width}%`, background: segmentRiskColor(seg.risk_level),
                          borderRight: '1px solid rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#fff',
                          outline: isActive ? '2px solid var(--cyan-primary)' : 'none', outlineOffset: '-2px',
                          transition: 'filter 0.15s', flexShrink: 0
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
                      >
                        {width > 8 ? seg.start_time : ''}
                      </div>
                    );
                  })}
                  {uploadedAudioSrc && (
                    <div style={{
                      position: 'absolute', top: 0, bottom: 0, width: '2px', background: 'var(--cyan-primary)', boxShadow: '0 0 6px var(--cyan-primary)',
                      left: `${(currentTimeSec / (actualDuration || 1)) * 100}%`, pointerEvents: 'none', transition: 'left 0.1s ease'
                    }} />
                  )}
                </div>

                {selectedSegment && (
                  <div style={{
                    padding: '12px 14px', borderRadius: '8px',
                    background: selectedSegment.risk_level === 'High' ? 'rgba(239,68,68,0.07)' : selectedSegment.risk_level === 'Amber' ? 'rgba(245,158,11,0.07)' : 'rgba(16,185,129,0.07)',
                    border: `1px solid ${selectedSegment.risk_level === 'High' ? 'rgba(239,68,68,0.3)' : selectedSegment.risk_level === 'Amber' ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)'}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>{selectedSegment.start_time} – {selectedSegment.end_time}</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px',
                        background: selectedSegment.risk_level === 'High' ? 'rgba(239,68,68,0.2)' : selectedSegment.risk_level === 'Amber' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)',
                        color: selectedSegment.risk_level === 'High' ? 'var(--risk-high)' : selectedSegment.risk_level === 'Amber' ? 'var(--risk-medium)' : 'var(--risk-low)',
                      }}>
                        {selectedSegment.risk_level} Risk
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>{selectedSegment.anomaly_type}</div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>{selectedSegment.description}</p>
                  </div>
                )}
              </>
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>No acoustic segment data returned by the backend.</div>
            )}
          </div>

          {/* Sample switcher */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '14px 16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Load sample case</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={() => handleLoadSample('RC-2026-0044')}
                style={{ fontSize: '12px', padding: '6px 12px', background: currentCase.case_id === 'RC-2026-0044' && !uploadedAudioSrc ? 'rgba(0,240,255,0.1)' : 'var(--bg-body-pattern-1)', border: currentCase.case_id === 'RC-2026-0044' && !uploadedAudioSrc ? '1px solid var(--cyan-primary)' : '1px solid var(--border-subtle)', color: 'var(--text-muted)', borderRadius: '6px', cursor: 'pointer' }}>
                Synthetic Clone
              </button>
              <button onClick={() => handleLoadSample('RC-2026-0048')}
                style={{ fontSize: '12px', padding: '6px 12px', background: currentCase.case_id === 'RC-2026-0048' && !uploadedAudioSrc ? 'rgba(0,240,255,0.1)' : 'var(--bg-body-pattern-1)', border: currentCase.case_id === 'RC-2026-0048' && !uploadedAudioSrc ? '1px solid var(--cyan-primary)' : '1px solid var(--border-subtle)', color: 'var(--text-muted)', borderRadius: '6px', cursor: 'pointer' }}>
                Human Speech
              </button>
              <button onClick={() => fileInputRef.current?.click()}
                style={{ fontSize: '12px', padding: '6px 12px', background: 'var(--bg-body-pattern-1)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <RefreshCw size={12} /> Upload another
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT — Assessment */}
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
                This score reflects acoustic and spectral analysis by an AI model. Signal-processing indicators alone do not constitute a validated deepfake classifier without contextual evidence. Transcription/ASR is not proof of cloning.
              </p>
            </div>

            {/* Sub-scores — real values only */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              {[
                { label: 'Voice Clone Risk', value: currentCase.ai_generation_probability, suffix: '%', color: currentCase.ai_generation_probability > 70 ? 'var(--risk-high)' : 'var(--text-main)' },
                { label: 'Acoustic Anomaly', value: currentCase.forensic_anomaly_score, suffix: '%', color: 'var(--text-main)' },
                { label: 'Manipulation Risk', value: currentCase.manipulation_risk, suffix: '%', color: currentCase.manipulation_risk > 50 ? 'var(--risk-medium)' : 'var(--text-main)' },
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
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>File & Metadata</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'Filename', value: currentCase.metadata.file_name },
                { label: 'Size', value: currentCase.metadata.file_size_formatted },
                { label: 'MIME Type', value: currentCase.metadata.mime_type },
                { label: 'Duration', value: currentCase.metadata.duration || '—' },
                { label: 'Software', value: currentCase.metadata.software_signature || '—' },
                { label: 'SHA-256', value: currentCase.metadata.hash_sha256.slice(0, 20) + '…', mono: true },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', fontSize: '13px', borderBottom: i < 5 ? '1px solid var(--border-subtle)' : 'none', paddingBottom: i < 5 ? '8px' : '0' }}>
                  <span style={{ color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>{row.label}</span>
                  <span style={{ color: 'var(--text-muted)', textAlign: 'right', fontFamily: row.mono ? 'var(--font-mono)' : 'inherit', fontSize: row.mono ? '11px' : '13px' }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Evidence section ──────────────────────────────────────────────── */}
      <div style={{ marginTop: '32px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>Forensic Evidence</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Evidence returned by the acoustic forensic engine. All values are from backend analysis.</p>
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
                    {isAnomalous ? <AlertTriangle size={14} color="var(--risk-high)" /> : <CheckCircle2 size={14} color="var(--risk-low)" />}
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

        {/* Signals grouped by category */}
        {Object.keys(signalGroups).length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(signalGroups).map(([cat, signals]) => (
              <div key={cat} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', background: 'var(--bg-body-pattern-1)' }}>
                  {SIGNAL_CATEGORY_LABELS[cat] || cat}
                </div>
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
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>Timestamp: {sig.affected_region_or_time}</span>
                      )}
                    </div>
                    <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', whiteSpace: 'nowrap', paddingTop: '3px' }}>{sig.score}/100</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <WhyThisResultModal
        isOpen={isWhyModalOpen}
        onClose={() => setIsWhyModalOpen(false)}
        result={currentCase}
        onInvestigateDeeper={() => onNavigate('workspace')}
      />
    </div>
  );
};
