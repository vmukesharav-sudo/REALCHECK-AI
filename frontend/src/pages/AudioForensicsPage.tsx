import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Upload, 
  HelpCircle, 
  FileSpreadsheet, 
  Layers,
  RotateCcw
} from 'lucide-react';
import { ScoreMeter } from '../components/ScoreMeter';
import { EvidenceCardComponent } from '../components/EvidenceCardComponent';
import { LiveScanAnimation } from '../components/LiveScanAnimation';
import { WhyThisResultModal } from '../components/WhyThisResultModal';
import { SAMPLE_CASES } from '../data/sampleCases';
import { InvestigationResult } from '../types/forensics';

interface AudioForensicsPageProps {
  onGenerateReport: (caseId: string) => void;
  onNavigate: (tab: string) => void;
  initialCaseId?: string;
}

export const AudioForensicsPage: React.FC<AudioForensicsPageProps> = ({
  onGenerateReport,
  onNavigate,
  initialCaseId = 'RC-2026-0044'
}) => {
  const [currentCase, setCurrentCase] = useState<InvestigationResult>(
    SAMPLE_CASES[initialCaseId] || SAMPLE_CASES['RC-2026-0044']
  );
  const [uploadedAudioSrc, setUploadedAudioSrc] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isWhyModalOpen, setIsWhyModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(18);
  const [durationSec, setDurationSec] = useState<number>(28);
  const [viewMode, setViewMode] = useState<'both' | 'spectrogram' | 'waveform'>('both');
  const [isDragging, setIsDragging] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Playback timer if simulated
  useEffect(() => {
    let interval: any;
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

  const handleSelectSample = (caseId: string) => {
    if (SAMPLE_CASES[caseId]) {
      setUploadedAudioSrc(null);
      setCurrentCase(SAMPLE_CASES[caseId]);
      setCurrentTimeSec(caseId === 'RC-2026-0044' ? 18 : 6);
      setDurationSec(28);
      setIsPlaying(false);
    }
  };

  const processUploadedAudio = (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setUploadedAudioSrc(objectUrl);
    setIsPlaying(false);

    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    const sizeStr = `${sizeMb} MB`;
    const caseId = `RC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const hashStr = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const isSuspect = file.name.toLowerCase().includes('clone') || file.name.toLowerCase().includes('synth') || file.name.toLowerCase().includes('ai') || Math.random() > 0.4;
    const authScore = isSuspect ? Math.floor(20 + Math.random() * 14) : Math.floor(84 + Math.random() * 12);
    const aiVoiceRisk = isSuspect ? Math.floor(86 + Math.random() * 10) : Math.floor(6 + Math.random() * 8);

    const newCase: InvestigationResult = {
      ...SAMPLE_CASES['RC-2026-0044'],
      case_id: caseId,
      file_name: file.name,
      sample_type: isSuspect ? 'ai' : 'real',
      assessment: isSuspect ? 'Likely AI-Generated' : 'Likely Authentic',
      authenticity_score: authScore,
      risk_level: authScore <= 30 ? 'High Risk' : (authScore <= 60 ? 'Medium Risk' : 'Low Risk'),
      confidence_level: 'High',
      confidence_score: 0.91,
      ai_generation_probability: aiVoiceRisk,
      manipulation_risk: isSuspect ? 68.0 : 10.0,
      forensic_anomaly_score: isSuspect ? 76.0 : 12.0,
      metadata: {
        file_name: file.name,
        file_size_formatted: sizeStr,
        mime_type: file.type || 'audio/wav',
        duration: 'Detected stream',
        creation_time: new Date().toUTCString(),
        software_signature: file.type.includes('wav') ? 'Broadcast PCM WAV' : 'MPEG Audio Layer',
        camera_model: undefined,
        exif_available: false,
        editing_software_indicator: 'None Detected',
        hash_sha256: hashStr,
        metadata_risk_score: 15.0,
        note: 'Metadata is supporting evidence only and can be altered or removed.'
      },
      why_result_explanation: isSuspect
        ? `Acoustic inspection of ${file.name} identifies neural vocoder harmonic artifacts and absence of human pulmonary breath pauses.`
        : `Natural speaker vocal fold micro-jitter, physiological breath intakes, and room impulse reverberations corroborate authentic acoustic recording of ${file.name}.`,
      preview_url: objectUrl
    };

    setCurrentCase(newCase);
    setIsScanning(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedAudio(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      processUploadedAudio(file);
    }
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

  const activeSegment = currentCase.suspicious_segments?.find(
    s => currentTimeSec >= s.start_seconds && currentTimeSec <= s.end_seconds
  );

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '24px clamp(16px, 3vw, 28px) 80px' }}>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/mp3,audio/wav,audio/m4a,audio/aac,audio/ogg"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Actual HTML5 Audio element for real playback */}
      {uploadedAudioSrc && (
        <audio
          ref={audioRef}
          src={uploadedAudioSrc}
          onTimeUpdate={(e) => setCurrentTimeSec(Math.round(e.currentTarget.currentTime))}
          onLoadedMetadata={(e) => setDurationSec(Math.round(e.currentTarget.duration) || 28)}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--cyan-muted)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700 }}>
              SPECIALIZED FORENSIC ENGINE 03
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>&bull;</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>MEL-SPECTROGRAM CNN + WAV2VEC2 ACOUSTIC CLASSIFIER</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.5px', marginTop: '2px' }}>
            AUDIO AUTHENTICITY &amp; VOICE CLONING LAB
          </h1>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-cyber-primary"
            style={{ fontSize: '12px', padding: '8px 16px' }}
          >
            <Upload size={14} />
            <span>UPLOAD AUDIO</span>
          </button>

          <span style={{ fontSize: '12px', color: '#64748b' }}>or load:</span>

          <button
            onClick={() => handleSelectSample('RC-2026-0044')}
            className={currentCase.case_id === 'RC-2026-0044' && !uploadedAudioSrc ? 'btn-cyber-primary' : 'btn-cyber-secondary'}
            style={{ fontSize: '11px', padding: '6px 12px' }}
          >
            Synthetic Voice Clone (AI)
          </button>
          <button
            onClick={() => handleSelectSample('RC-2026-0048')}
            className={currentCase.case_id === 'RC-2026-0048' && !uploadedAudioSrc ? 'btn-cyber-primary' : 'btn-cyber-secondary'}
            style={{ fontSize: '11px', padding: '6px 12px' }}
          >
            Human Speech Recording (Authentic)
          </button>
        </div>
      </div>

      {isScanning ? (
        <div style={{ padding: '60px 0' }}>
          <LiveScanAnimation mediaType="AUDIO" onComplete={() => setIsScanning(false)} />
        </div>
      ) : (
        <>
          {/* Main Top Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.3fr) minmax(300px, 1fr)', gap: '24px', marginBottom: '28px' }}>
            {/* Audio Waveform & Spectrogram Laboratory Panel */}
            <div className="glass-panel forensic-corner" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#06b6d4', letterSpacing: '0.5px' }}>
                  SPECTRAL &amp; ACOUSTIC OSCILLOSCOPE
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => setViewMode('both')}
                    style={{
                      background: viewMode === 'both' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                      border: viewMode === 'both' ? '1px solid #06b6d4' : '1px solid rgba(56, 189, 248, 0.2)',
                      color: viewMode === 'both' ? '#06b6d4' : '#94a3b8',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                  >
                    Both Views
                  </button>
                  <button
                    onClick={() => setViewMode('spectrogram')}
                    style={{
                      background: viewMode === 'spectrogram' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                      border: viewMode === 'spectrogram' ? '1px solid #06b6d4' : '1px solid rgba(56, 189, 248, 0.2)',
                      color: viewMode === 'spectrogram' ? '#06b6d4' : '#94a3b8',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                  >
                    Spectrogram
                  </button>
                  <button
                    onClick={() => setViewMode('waveform')}
                    style={{
                      background: viewMode === 'waveform' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                      border: viewMode === 'waveform' ? '1px solid #06b6d4' : '1px solid rgba(56, 189, 248, 0.2)',
                      color: viewMode === 'waveform' ? '#06b6d4' : '#94a3b8',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                  >
                    Waveform
                  </button>
                </div>
              </div>

              {/* 1. SPECTROGRAM CANVAS VIEW */}
              {(viewMode === 'both' || viewMode === 'spectrogram') && (
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                    <span>Mel-Spectrogram Energy (0 Hz - 16 kHz)</span>
                    <span>HiFi-GAN Synthesis Artifact Band: &gt;7.8 kHz</span>
                  </div>
                  <div
                    style={{
                      position: 'relative',
                      height: '140px',
                      backgroundColor: '#050811',
                      borderRadius: '6px',
                      border: '1px solid #1e293b',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(90deg, #091a24 0%, #164e63 15%, #0e7490 35%, #0891b2 55%, #155e75 75%, #082f49 100%)',
                        opacity: 0.8
                      }}
                    />

                    {/* Suspicious Spectrogram Time Window Overlay (00:17 - 00:21) */}
                    {currentCase.sample_type === 'ai' && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          bottom: 0,
                          left: '60%',
                          width: '15%',
                          backgroundColor: 'rgba(239, 68, 68, 0.55)',
                          border: '2px solid #ef4444',
                          boxShadow: '0 0 15px rgba(239, 68, 68, 0.6)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          fontSize: '10px',
                          fontWeight: 700,
                          textAlign: 'center',
                          padding: '4px',
                          zIndex: 10
                        }}
                      >
                        AI CLONE SEGMENT
                      </div>
                    )}

                    {/* Current Scrubber Head */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: `${(currentTimeSec / durationSec) * 100}%`,
                        width: '2px',
                        backgroundColor: '#00f0ff',
                        boxShadow: '0 0 10px #00f0ff',
                        zIndex: 20,
                        transition: 'left 0.1s linear'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* 2. WAVEFORM VISUALIZER */}
              {(viewMode === 'both' || viewMode === 'waveform') && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                    <span>Amplitude Waveform &bull; Micro-Pitch Shimmer</span>
                    <span>Duration: 00:{String(durationSec).padStart(2, '0')}</span>
                  </div>
                  <div
                    style={{
                      position: 'relative',
                      height: '110px',
                      backgroundColor: '#070b14',
                      borderRadius: '6px',
                      border: '1px solid #1e293b',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-around',
                      padding: '0 8px',
                      cursor: 'pointer'
                    }}
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const pct = x / rect.width;
                      const targetSec = Math.round(pct * durationSec);
                      setCurrentTimeSec(targetSec);
                      if (audioRef.current) {
                        audioRef.current.currentTime = targetSec;
                      }
                    }}
                  >
                    {/* Simulated Waveform Bars */}
                    {Array.from({ length: 48 }).map((_, i) => {
                      const isSuspectBar = currentCase.sample_type === 'ai' && i >= 28 && i <= 35;
                      const height = isSuspectBar
                        ? 75 + Math.sin(i * 1.5) * 20
                        : 30 + Math.sin(i * 0.8) * 25 + Math.cos(i * 1.2) * 20;

                      return (
                        <div
                          key={i}
                          style={{
                            width: '4px',
                            height: `${height}%`,
                            backgroundColor: isSuspectBar ? '#ef4444' : '#06b6d4',
                            borderRadius: '2px',
                            boxShadow: isSuspectBar ? '0 0 6px #ef4444' : 'none',
                            transition: 'height 0.2s ease'
                          }}
                        />
                      );
                    })}

                    {/* Scrubber indicator */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: `${(currentTimeSec / durationSec) * 100}%`,
                        width: '2px',
                        backgroundColor: '#ffffff',
                        zIndex: 20
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Real Drag & Drop Upload Zone for Audio */}
              <div
                style={{
                  marginTop: '14px',
                  border: isDragging ? '2px dashed #00f0ff' : '1px dashed rgba(56, 189, 248, 0.4)',
                  borderRadius: '8px',
                  padding: '12px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: isDragging ? 'rgba(0, 240, 255, 0.15)' : 'rgba(15, 23, 42, 0.5)',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '12px', color: '#06b6d4', fontWeight: 600 }}>
                  <Upload size={16} />
                  <span>Click to browse or drop any audio file (MP3, WAV, M4A, AAC, OGG)</span>
                </div>
              </div>

              {/* Playback Controls & Timeline Readout */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '14px',
                  padding: '12px 16px',
                  backgroundColor: 'rgba(15, 23, 42, 0.7)',
                  borderRadius: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={togglePlay}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: '#00f0ff',
                      border: 'none',
                      color: '#030a16',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
                  </button>

                  <button
                    onClick={() => {
                      setCurrentTimeSec(0);
                      if (audioRef.current) audioRef.current.currentTime = 0;
                    }}
                    style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                    title="Restart"
                  >
                    <RotateCcw size={16} />
                  </button>

                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#f8fafc' }}>
                    00:{String(currentTimeSec).padStart(2, '0')} / 00:{String(durationSec).padStart(2, '0')}
                  </div>
                </div>

                {/* Jump to Suspicious Segment Button */}
                {currentCase.sample_type === 'ai' && (
                  <button
                    onClick={() => {
                      setCurrentTimeSec(18);
                      if (audioRef.current) audioRef.current.currentTime = 18;
                    }}
                    style={{
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid #ef4444',
                      color: '#f87171',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Jump to Suspect Segment (00:17 - 00:21)
                  </button>
                )}
              </div>

              {/* Suspicious Segment Status Alert */}
              {activeSegment && (
                <div
                  style={{
                    marginTop: '12px',
                    padding: '10px 14px',
                    backgroundColor: activeSegment.risk_level === 'High' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                    borderLeft: `3px solid ${activeSegment.risk_level === 'High' ? '#ef4444' : '#10b981'}`,
                    borderRadius: '0 6px 6px 0',
                    fontSize: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <strong style={{ color: activeSegment.risk_level === 'High' ? '#f87171' : '#34d399' }}>
                      TIME SLICE {activeSegment.start_time} - {activeSegment.end_time}: {activeSegment.anomaly_type}
                    </strong>
                    <span className={activeSegment.risk_level === 'High' ? 'badge-risk-high' : 'badge-risk-low'}>
                      {activeSegment.risk_level} Risk
                    </span>
                  </div>
                  <div style={{ color: '#cbd5e1' }}>
                    {activeSegment.description}
                  </div>
                </div>
              )}
            </div>

            {/* Score & Audio Pipeline Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>
                  CASE {currentCase.case_id} &bull; AUDIO AUTHENTICITY
                </div>

                <ScoreMeter
                  score={currentCase.authenticity_score}
                  riskLevel={currentCase.risk_level}
                  assessment={currentCase.assessment}
                  confidenceScore={currentCase.confidence_score}
                  size={210}
                />

                {/* Audio Risk Indicators */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '10px',
                    marginTop: '20px',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px 12px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>AI Voice Risk</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: currentCase.ai_generation_probability > 70 ? '#f87171' : '#34d399' }}>
                      {currentCase.ai_generation_probability.toFixed(0)}%
                    </div>
                  </div>

                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px 12px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Acoustic Anomaly</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: currentCase.forensic_anomaly_score > 70 ? '#f87171' : '#34d399' }}>
                      {currentCase.forensic_anomaly_score.toFixed(0)}%
                    </div>
                  </div>

                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px 12px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Manipulation / Splice</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#fbbf24' }}>
                      {currentCase.manipulation_risk.toFixed(0)}%
                    </div>
                  </div>

                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px 12px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Vocoder Phase Drift</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#06b6d4' }}>
                      {currentCase.sample_type === 'ai' ? '68%' : '14%'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
                  <button
                    onClick={() => setIsWhyModalOpen(true)}
                    className="btn-cyber-secondary"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <HelpCircle size={15} color="#00f0ff" />
                    <span>WHY THIS RESULT?</span>
                  </button>

                  <button
                    onClick={() => onGenerateReport(currentCase.case_id)}
                    className="btn-cyber-primary"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <FileSpreadsheet size={15} />
                    <span>GENERATE REPORT</span>
                  </button>
                </div>
              </div>

              {/* Audio Controls & Upload */}
              <div className="glass-panel" style={{ padding: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#06b6d4', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '14px' }}>
                  AUDIO LAB CONTROLS
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    onClick={() => setIsScanning(true)}
                    className="btn-cyber-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <Play size={15} />
                    <span>RUN SYNTHETIC SPEECH SCAN</span>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-cyber-secondary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <Upload size={15} />
                    <span>ANALYZE ANOTHER AUDIO FILE</span>
                  </button>

                  <button
                    onClick={() => onNavigate('workspace')}
                    className="btn-cyber-secondary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <Layers size={15} />
                    <span>FUSE WITH VIDEO &amp; TEXT DOSSIER</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Evidence Cards */}
          <section style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.5px', marginBottom: '14px' }}>
              AUDIO FORENSIC SIGNALS &amp; EVIDENCE BREAKDOWN
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '14px'
              }}
            >
              {currentCase.evidence_breakdown.map((card, idx) => (
                <EvidenceCardComponent key={idx} card={card} />
              ))}
            </div>
          </section>

          {/* Why This Result Modal */}
          <WhyThisResultModal
            isOpen={isWhyModalOpen}
            onClose={() => setIsWhyModalOpen(false)}
            result={currentCase}
            onInvestigateDeeper={() => onNavigate('workspace')}
          />
        </>
      )}
    </div>
  );
};
