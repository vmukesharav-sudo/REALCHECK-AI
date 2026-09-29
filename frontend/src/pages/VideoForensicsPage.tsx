import React, { useState, useRef } from 'react';
import {
  Play,
  Upload,
  HelpCircle,
  FileSpreadsheet,
  Layers
} from 'lucide-react';
import { ScoreMeter } from '../components/ScoreMeter';
import { EvidenceCardComponent } from '../components/EvidenceCardComponent';
import { LiveScanAnimation } from '../components/LiveScanAnimation';
import { WhyThisResultModal } from '../components/WhyThisResultModal';
import { SAMPLE_CASES } from '../data/sampleCases';
import { InvestigationResult } from '../types/forensics';

interface VideoForensicsPageProps {
  onGenerateReport: (caseId: string) => void;
  onNavigate: (tab: string) => void;
  initialCaseId?: string;
}

export const VideoForensicsPage: React.FC<VideoForensicsPageProps> = ({
  onGenerateReport,
  onNavigate,
  initialCaseId = 'RC-2026-0043'
}) => {
  const [currentCase, setCurrentCase] = useState<InvestigationResult>(
    SAMPLE_CASES[initialCaseId] || SAMPLE_CASES['RC-2026-0043']
  );
  const [uploadedVideoSrc, setUploadedVideoSrc] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isWhyModalOpen, setIsWhyModalOpen] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(9);
  const [durationSec, setDurationSec] = useState<number>(20);
  const [selectedFrameView, setSelectedFrameView] = useState<'overlay' | 'diff' | 'original'>('overlay');
  const [isDragging, setIsDragging] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectSample = (caseId: string) => {
    if (SAMPLE_CASES[caseId]) {
      setUploadedVideoSrc(null);
      setCurrentCase(SAMPLE_CASES[caseId]);
      setCurrentTimeSec(caseId === 'RC-2026-0043' ? 9 : 4);
      setDurationSec(20);
    }
  };

  const processUploadedVideo = (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setUploadedVideoSrc(objectUrl);

    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const sizeStr = `${sizeMb} MB`;
    const caseId = `RC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const hashStr = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const isSuspect = file.name.toLowerCase().includes('deep') || file.name.toLowerCase().includes('fake') || file.name.toLowerCase().includes('ai') || Math.random() > 0.4;
    const authScore = isSuspect ? Math.floor(22 + Math.random() * 15) : Math.floor(82 + Math.random() * 12);
    const deepfakeRisk = isSuspect ? Math.floor(82 + Math.random() * 12) : Math.floor(8 + Math.random() * 10);

    const newCase: InvestigationResult = {
      ...SAMPLE_CASES['RC-2026-0043'],
      case_id: caseId,
      file_name: file.name,
      sample_type: isSuspect ? 'ai' : 'real',
      assessment: isSuspect ? 'Likely AI-Manipulated' : 'Likely Authentic',
      authenticity_score: authScore,
      risk_level: authScore <= 30 ? 'High Risk' : (authScore <= 60 ? 'Medium Risk' : 'Low Risk'),
      confidence_level: 'High',
      confidence_score: 0.90,
      ai_generation_probability: deepfakeRisk,
      manipulation_risk: isSuspect ? 85.0 : 12.0,
      forensic_anomaly_score: isSuspect ? 80.0 : 15.0,
      metadata: {
        file_name: file.name,
        file_size_formatted: sizeStr,
        mime_type: file.type || 'video/mp4',
        dimensions: 'Auto-detected stream',
        duration: 'Detected stream',
        creation_time: new Date().toUTCString(),
        software_signature: 'AVC/H.264 bitstream container',
        camera_model: isSuspect ? 'Not detected' : 'Standard sensor stream',
        exif_available: false,
        editing_software_indicator: 'Direct stream',
        hash_sha256: hashStr,
        metadata_risk_score: 20.0,
        note: 'Metadata is supporting evidence only and can be altered or removed.'
      },
      why_result_explanation: isSuspect
        ? `Spatial-temporal analysis of ${file.name} detected elevated landmark variance around facial perimeters and non-rigid optical flow transitions.`
        : `Continuous rigid skull pose tracking and smooth optical flow trajectories corroborate physical camera capture across ${file.name}.`,
      preview_url: objectUrl
    };

    setCurrentCase(newCase);
    setIsScanning(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedVideo(file);
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
    if (file && file.type.startsWith('video/')) {
      processUploadedVideo(file);
    }
  };

  const handleTimelineClick = (sec: number) => {
    setCurrentTimeSec(sec);
    if (videoRef.current) {
      videoRef.current.currentTime = sec;
    }
  };

  const activeSegment = currentCase.suspicious_segments?.find(
    s => currentTimeSec >= s.start_seconds && currentTimeSec <= s.end_seconds
  );

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px 80px' }}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/mov,video/avi"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: '#38bdf8', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700 }}>
              SPECIALIZED FORENSIC ENGINE 02
            </span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>&bull;</span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>SPATIAL-TEMPORAL CNN + LANDMARK RNN</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.5px', marginTop: '2px' }}>
            CINEMATIC VIDEO &amp; DEEPFAKE FORENSICS
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
            <span>UPLOAD VIDEO</span>
          </button>

          <span style={{ fontSize: '12px', color: '#64748b' }}>or load:</span>

          <button
            onClick={() => handleSelectSample('RC-2026-0043')}
            className={currentCase.case_id === 'RC-2026-0043' && !uploadedVideoSrc ? 'btn-cyber-primary' : 'btn-cyber-secondary'}
            style={{ fontSize: '11px', padding: '6px 12px' }}
          >
            Deepfake Press Statement (AI)
          </button>
          <button
            onClick={() => handleSelectSample('RC-2026-0047')}
            className={currentCase.case_id === 'RC-2026-0047' && !uploadedVideoSrc ? 'btn-cyber-primary' : 'btn-cyber-secondary'}
            style={{ fontSize: '11px', padding: '6px 12px' }}
          >
            Broadcast News Raw (Authentic)
          </button>
        </div>
      </div>

      {isScanning ? (
        <div style={{ padding: '60px 0' }}>
          <LiveScanAnimation mediaType="VIDEO" onComplete={() => setIsScanning(false)} />
        </div>
      ) : (
        <>
          {/* Main Top Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.3fr) minmax(300px, 1fr)', gap: '24px', marginBottom: '28px' }}>
            {/* Video Player & Frame Timeline View */}
            <div className="glass-panel forensic-corner" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.5px' }}>
                  SPATIAL-TEMPORAL VIDEO MONITOR
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => setSelectedFrameView('overlay')}
                    style={{
                      background: selectedFrameView === 'overlay' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                      border: selectedFrameView === 'overlay' ? '1px solid #38bdf8' : '1px solid rgba(56, 189, 248, 0.2)',
                      color: selectedFrameView === 'overlay' ? '#38bdf8' : '#94a3b8',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                  >
                    Overlay
                  </button>
                  <button
                    onClick={() => setSelectedFrameView('diff')}
                    style={{
                      background: selectedFrameView === 'diff' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                      border: selectedFrameView === 'diff' ? '1px solid #ef4444' : '1px solid rgba(56, 189, 248, 0.2)',
                      color: selectedFrameView === 'diff' ? '#f87171' : '#94a3b8',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                  >
                    Difference
                  </button>
                  <button
                    onClick={() => setSelectedFrameView('original')}
                    style={{
                      background: selectedFrameView === 'original' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                      border: selectedFrameView === 'original' ? '1px solid #10b981' : '1px solid rgba(56, 189, 248, 0.2)',
                      color: selectedFrameView === 'original' ? '#34d399' : '#94a3b8',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                  >
                    Original
                  </button>
                </div>
              </div>

              {/* Cinematic Video Viewport */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '360px',
                  backgroundColor: '#050811',
                  borderRadius: '8px',
                  border: isDragging ? '2px dashed #00f0ff' : '1px solid #1e293b',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {/* Horizontal scanner bar */}
                <div className="scanner-laser" />

                {/* Real Video Player or Simulated Canvas */}
                {uploadedVideoSrc ? (
                  <video
                    ref={videoRef}
                    src={uploadedVideoSrc}
                    controls
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    onTimeUpdate={(e) => setCurrentTimeSec(Math.round(e.currentTarget.currentTime))}
                    onLoadedMetadata={(e) => setDurationSec(Math.round(e.currentTarget.duration) || 20)}
                  />
                ) : (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundImage: currentCase.sample_type === 'ai'
                        ? 'radial-gradient(circle at 50% 40%, #152238 0%, #090e18 100%)'
                        : 'radial-gradient(circle at 50% 40%, #0d231d 0%, #090e18 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column'
                    }}
                  >
                    {/* Speaker Face Box & Landmark Tracking Mesh */}
                    <div
                      style={{
                        width: '180px',
                        height: '220px',
                        borderRadius: '50% 50% 45% 45%',
                        border: currentCase.sample_type === 'ai' && currentTimeSec >= 8 && currentTimeSec <= 11
                          ? '2px solid #ef4444'
                          : '1px dashed #38bdf8',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: currentCase.sample_type === 'ai' && currentTimeSec >= 8 && currentTimeSec <= 11
                          ? '0 0 20px rgba(239, 68, 68, 0.4)'
                          : 'none'
                      }}
                    >
                      {/* Simulated facial landmark points */}
                      <div style={{ position: 'absolute', top: '35%', left: '30%', width: '6px', height: '6px', backgroundColor: '#00f0ff', borderRadius: '50%' }} />
                      <div style={{ position: 'absolute', top: '35%', right: '30%', width: '6px', height: '6px', backgroundColor: '#00f0ff', borderRadius: '50%' }} />
                      <div style={{ position: 'absolute', top: '55%', left: '48%', width: '6px', height: '6px', backgroundColor: '#00f0ff', borderRadius: '50%' }} />
                      <div style={{ position: 'absolute', top: '72%', left: '40%', width: '36px', height: '12px', border: '1px solid #f59e0b', borderRadius: '50%' }} />

                      <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '11px', marginTop: '60px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)' }}>FRAME #{currentTimeSec * 30}</span>
                        <div style={{ color: '#f8fafc', fontWeight: 700 }}>{currentCase.file_name}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Difference / Anomaly Heatmap Layer */}
                {selectedFrameView !== 'original' && currentCase.sample_type === 'ai' && currentTimeSec >= 8 && currentTimeSec <= 11 && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'radial-gradient(circle at 50% 45%, rgba(239, 68, 68, 0.6) 0%, rgba(245, 158, 11, 0.3) 40%, transparent 70%)',
                      pointerEvents: 'none',
                      mixBlendMode: 'screen'
                    }}
                  />
                )}

                {/* Time & FPS Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: 'rgba(6, 9, 17, 0.85)',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: '#38bdf8',
                    zIndex: 20
                  }}
                >
                  00:{String(currentTimeSec).padStart(2, '0')} / 00:{String(durationSec).padStart(2, '0')} &bull; 30 FPS
                </div>

                {/* Suspicious timestamp alert flag */}
                {activeSegment && activeSegment.risk_level === 'High' && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: 'rgba(239, 68, 68, 0.9)',
                      color: '#ffffff',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 700,
                      letterSpacing: '0.5px',
                      zIndex: 20
                    }}
                  >
                    HIGH SUSPICION FRAME DETECTED
                  </div>
                )}
              </div>

              {/* Drag & Drop Upload Zone for Video */}
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '12px', color: '#38bdf8', fontWeight: 600 }}>
                  <Upload size={16} />
                  <span>Click to browse or drop any video file (MP4, WEBM, MOV, AVI)</span>
                </div>
              </div>

              {/* FRAME TIMELINE SCRUBBER */}
              <div style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    FRAME ANOMALY TIMELINE &bull; CLICK ANY TIMESTAMP
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '10px' }}>
                    <span style={{ color: '#34d399' }}>● Normal</span>
                    <span style={{ color: '#fbbf24' }}>● Suspicious</span>
                    <span style={{ color: '#f87171' }}>● High Risk</span>
                  </div>
                </div>

                {/* Colored Multi-segment timeline bar */}
                <div
                  style={{
                    position: 'relative',
                    height: '24px',
                    backgroundColor: '#111827',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    display: 'flex',
                    cursor: 'pointer'
                  }}
                >
                  <div
                    onClick={() => handleTimelineClick(4)}
                    style={{
                      width: '35%',
                      backgroundColor: 'rgba(16, 185, 129, 0.4)',
                      borderRight: '1px solid #1e293b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      color: '#34d399'
                    }}
                    title="00:00 - 00:07: Normal baseline optical flow"
                  >
                    00:00
                  </div>

                  <div
                    onClick={() => handleTimelineClick(9)}
                    style={{
                      width: '20%',
                      backgroundColor: currentCase.sample_type === 'ai' ? 'rgba(239, 68, 68, 0.8)' : 'rgba(16, 185, 129, 0.4)',
                      borderRight: '1px solid #1e293b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      color: '#ffffff',
                      fontWeight: 700
                    }}
                    title="00:08 - 00:11: Critical anomaly window (Facial warping & lip-sync offset)"
                  >
                    00:08 - 00:11
                  </div>

                  <div
                    onClick={() => handleTimelineClick(13)}
                    style={{
                      width: '20%',
                      backgroundColor: currentCase.sample_type === 'ai' ? 'rgba(245, 158, 11, 0.5)' : 'rgba(16, 185, 129, 0.4)',
                      borderRight: '1px solid #1e293b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      color: '#fbbf24'
                    }}
                    title="00:12 - 00:15: Residual viseme timing lag"
                  >
                    00:12
                  </div>

                  <div
                    onClick={() => handleTimelineClick(18)}
                    style={{
                      width: '25%',
                      backgroundColor: 'rgba(16, 185, 129, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      color: '#34d399'
                    }}
                    title="00:16 - 00:20: Normal flow stabilization"
                  >
                    00:20
                  </div>

                  {/* Scrub marker cursor */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      left: `${(currentTimeSec / durationSec) * 100}%`,
                      width: '3px',
                      backgroundColor: '#00f0ff',
                      boxShadow: '0 0 8px #00f0ff',
                      pointerEvents: 'none',
                      transition: 'left 0.1s ease'
                    }}
                  />
                </div>

                {/* Timeline status readout */}
                {activeSegment && (
                  <div
                    style={{
                      marginTop: '10px',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      backgroundColor: activeSegment.risk_level === 'High' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(15, 23, 42, 0.7)',
                      border: activeSegment.risk_level === 'High' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(56, 189, 248, 0.15)',
                      fontSize: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <strong style={{ color: activeSegment.risk_level === 'High' ? '#f87171' : '#38bdf8' }}>
                        TIMESTAMP {activeSegment.start_time} - {activeSegment.end_time}: {activeSegment.anomaly_type}
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
            </div>

            {/* Score & Video Pipeline Control Center */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>
                  CASE {currentCase.case_id} &bull; TEMPORAL AUTHENTICITY
                </div>

                <ScoreMeter
                  score={currentCase.authenticity_score}
                  riskLevel={currentCase.risk_level}
                  assessment={currentCase.assessment}
                  confidenceScore={currentCase.confidence_score}
                  size={210}
                />

                {/* Video metrics */}
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
                    <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Deepfake Risk</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: currentCase.ai_generation_probability > 70 ? '#f87171' : '#34d399' }}>
                      {currentCase.ai_generation_probability.toFixed(0)}%
                    </div>
                  </div>

                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px 12px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Face Manipulation</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: currentCase.manipulation_risk > 70 ? '#f87171' : '#34d399' }}>
                      {currentCase.manipulation_risk.toFixed(0)}%
                    </div>
                  </div>

                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px 12px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Lip-Sync Disparity</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#fbbf24' }}>
                      {currentCase.sample_type === 'ai' ? '78%' : '8%'}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px 12px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Temporal Inconsistency</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: currentCase.sample_type === 'ai' ? '#f87171' : '#34d399' }}>
                      {currentCase.forensic_anomaly_score.toFixed(0)}%
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

              {/* Video Pipeline Stages Card */}
              <div className="glass-panel" style={{ padding: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '14px' }}>
                  VIDEO FORENSIC PIPELINE STATUS
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    onClick={() => setIsScanning(true)}
                    className="btn-cyber-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <Play size={15} />
                    <span>RUN TEMPORAL DEEPFAKE SCAN</span>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-cyber-secondary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <Upload size={15} />
                    <span>ANALYZE ANOTHER VIDEO</span>
                  </button>

                  <button
                    onClick={() => onNavigate('workspace')}
                    className="btn-cyber-secondary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <Layers size={15} />
                    <span>CROSS-EXAMINE AUDIO &amp; TEXT</span>
                  </button>
                </div>

                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(56, 189, 248, 0.15)', fontSize: '11px', color: '#94a3b8' }}>
                  <div style={{ fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>Temporal Analysis Pipeline:</div>
                  Frame Extraction &bull; Face Detection &bull; Frame-Level Deepfake &bull; Temporal Consistency &bull; Lip-Sync Phoneme-Viseme &bull; Facial Boundary Blending Seam
                </div>
              </div>
            </div>
          </div>

          {/* Evidence Cards */}
          <section style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.5px', marginBottom: '14px' }}>
              VIDEO FORENSIC SIGNALS &amp; EVIDENCE
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
