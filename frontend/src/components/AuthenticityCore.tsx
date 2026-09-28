import React, { useState } from 'react';
import { Image, Video, Mic, FileText, Cpu, Network, ShieldCheck, FileSpreadsheet, ArrowRight, Zap } from 'lucide-react';

interface AuthenticityCoreProps {
  onNavigateEngine: (engine: string) => void;
  activeScore?: number;
  activeAssessment?: string;
}

export const AuthenticityCore: React.FC<AuthenticityCoreProps> = ({
  onNavigateEngine,
  activeScore = 78,
  activeAssessment = 'Probabilistic Fusion Engine Active'
}) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const engines = [
    { id: 'image', label: 'IMAGE FORENSICS', icon: Image, angle: 45, color: 'var(--cyan-primary)', desc: 'Fourier FFT & PRNU Noise' },
    { id: 'video', label: 'VIDEO ANALYSIS', icon: Video, angle: 135, color: 'var(--blue-soft)', desc: 'Spatial-Temporal Face Flow' },
    { id: 'audio', label: 'AUDIO AUTHENTICITY', icon: Mic, angle: 225, color: 'var(--cyan-muted)', desc: 'Harmonic Formant & Vocoder' },
    { id: 'text', label: 'TEXT STYLOMETRY', icon: FileText, angle: 315, color: '#60a5fa', desc: 'Burstiness & Perplexity' },
  ];

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '780px',
        height: '460px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* SVG Connecting Flow Lines */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          overflow: 'visible'
        }}
      >
        <defs>
          <linearGradient id="coreLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Outer Orbit Rings */}
        <circle cx="50%" cy="50%" r="185" fill="none" stroke="rgba(56, 189, 248, 0.12)" strokeWidth="1" strokeDasharray="4 6" />
        <circle cx="50%" cy="50%" r="115" fill="none" stroke="rgba(0, 240, 255, 0.2)" strokeWidth="1.5" />
        
        {/* Radar beam in background */}
        <line x1="50%" y1="50%" x2="70%" y2="20%" stroke="rgba(0, 240, 255, 0.3)" strokeWidth="2" className="radar-sweep" />

        {/* 4 connecting lines from engines to center */}
        {/* Top-Right: Image */}
        <line x1="68%" y1="22%" x2="50%" y2="50%" stroke="#00f0ff" strokeWidth="1.5" className="flow-connector" />
        {/* Bottom-Right: Video */}
        <line x1="68%" y1="78%" x2="50%" y2="50%" stroke="#38bdf8" strokeWidth="1.5" className="flow-connector" />
        {/* Bottom-Left: Audio */}
        <line x1="32%" y1="78%" x2="50%" y2="50%" stroke="#06b6d4" strokeWidth="1.5" className="flow-connector" />
        {/* Top-Left: Text */}
        <line x1="32%" y1="22%" x2="50%" y2="50%" stroke="#60a5fa" strokeWidth="1.5" className="flow-connector" />
      </svg>

      {/* Central Authenticity Core Node */}
      <div
        className="glass-panel-glow pulse-node"
        onClick={() => onNavigateEngine('ai-hub')}
        style={{
          width: '160px',
          height: '160px',
          borderRadius: '50%',
          backgroundColor: '#091022',
          border: '2px solid #00f0ff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 40px rgba(0, 240, 255, 0.35)',
          cursor: 'pointer',
          zIndex: 10,
          textAlign: 'center',
          padding: '12px',
          userSelect: 'none'
        }}
      >
        <Zap size={22} color="#00f0ff" />
        <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--text-muted)', marginTop: '4px' }}>
          EVIDENCE CORE
        </span>
        <div style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>
          {activeScore}%
        </div>
        <span style={{ fontSize: '9px', color: 'var(--blue-soft)', letterSpacing: '0.4px', fontWeight: 600 }}>
          AUTHENTICITY
        </span>
      </div>

      {/* 4 Orbiting Media Nodes */}
      {/* 1. Image (Top-Right) */}
      <div
        className="glass-panel"
        onClick={() => onNavigateEngine('image')}
        onMouseEnter={() => setHoveredNode('image')}
        onMouseLeave={() => setHoveredNode(null)}
        style={{
          position: 'absolute',
          top: '40px',
          right: '80px',
          padding: '12px 18px',
          borderRadius: '10px',
          border: hoveredNode === 'image' ? '1px solid #00f0ff' : '1px solid rgba(56, 189, 248, 0.25)',
          background: 'rgba(11, 18, 33, 0.95)',
          cursor: 'pointer',
          zIndex: 20,
          boxShadow: hoveredNode === 'image' ? '0 0 20px rgba(0, 240, 255, 0.3)' : 'none',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(0, 240, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Image size={16} color="#00f0ff" />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.8px', color: 'var(--text-main)' }}>IMAGE ENGINE</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Fourier FFT &bull; PRNU Noise</div>
          </div>
        </div>
      </div>

      {/* 2. Video (Bottom-Right) */}
      <div
        className="glass-panel"
        onClick={() => onNavigateEngine('video')}
        onMouseEnter={() => setHoveredNode('video')}
        onMouseLeave={() => setHoveredNode(null)}
        style={{
          position: 'absolute',
          bottom: '40px',
          right: '80px',
          padding: '12px 18px',
          borderRadius: '10px',
          border: hoveredNode === 'video' ? '1px solid #38bdf8' : '1px solid rgba(56, 189, 248, 0.25)',
          background: 'rgba(11, 18, 33, 0.95)',
          cursor: 'pointer',
          zIndex: 20,
          boxShadow: hoveredNode === 'video' ? '0 0 20px rgba(56, 189, 248, 0.3)' : 'none',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Video size={16} color="#38bdf8" />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.8px', color: 'var(--text-main)' }}>VIDEO ANALYSIS</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Lip-Sync &bull; Landmark Warping</div>
          </div>
        </div>
      </div>

      {/* 3. Audio (Bottom-Left) */}
      <div
        className="glass-panel"
        onClick={() => onNavigateEngine('audio')}
        onMouseEnter={() => setHoveredNode('audio')}
        onMouseLeave={() => setHoveredNode(null)}
        style={{
          position: 'absolute',
          bottom: '40px',
          left: '80px',
          padding: '12px 18px',
          borderRadius: '10px',
          border: hoveredNode === 'audio' ? '1px solid #06b6d4' : '1px solid rgba(56, 189, 248, 0.25)',
          background: 'rgba(11, 18, 33, 0.95)',
          cursor: 'pointer',
          zIndex: 20,
          boxShadow: hoveredNode === 'audio' ? '0 0 20px rgba(6, 182, 212, 0.3)' : 'none',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mic size={16} color="#06b6d4" />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.8px', color: 'var(--text-main)' }}>AUDIO AUTHENTICITY</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Mel Spectrogram &bull; Jitter</div>
          </div>
        </div>
      </div>

      {/* 4. Text (Top-Left) */}
      <div
        className="glass-panel"
        onClick={() => onNavigateEngine('text')}
        onMouseEnter={() => setHoveredNode('text')}
        onMouseLeave={() => setHoveredNode(null)}
        style={{
          position: 'absolute',
          top: '40px',
          left: '80px',
          padding: '12px 18px',
          borderRadius: '10px',
          border: hoveredNode === 'text' ? '1px solid #60a5fa' : '1px solid rgba(56, 189, 248, 0.25)',
          background: 'rgba(11, 18, 33, 0.95)',
          cursor: 'pointer',
          zIndex: 20,
          boxShadow: hoveredNode === 'text' ? '0 0 20px rgba(96, 165, 250, 0.3)' : 'none',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(96, 165, 250, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={16} color="#60a5fa" />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.8px', color: 'var(--text-main)' }}>TEXT STYLOMETRY</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Burstiness &bull; Perplexity</div>
          </div>
        </div>
      </div>
    </div>
  );
};
