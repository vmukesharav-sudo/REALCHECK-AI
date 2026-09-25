import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Play, 
  HelpCircle, 
  FileSpreadsheet, 
  Layers, 
  AlertTriangle, 
  ShieldCheck, 
  RotateCcw,
  Check
} from 'lucide-react';
import { ScoreMeter } from '../components/ScoreMeter';
import { EvidenceCardComponent } from '../components/EvidenceCardComponent';
import { LiveScanAnimation } from '../components/LiveScanAnimation';
import { WhyThisResultModal } from '../components/WhyThisResultModal';
import { SAMPLE_CASES } from '../data/sampleCases';
import { forensicApi } from '../services/api';
import { InvestigationResult } from '../types/forensics';

interface TextStylometryPageProps {
  onGenerateReport: (caseId: string) => void;
  onNavigate: (tab: string) => void;
  initialCaseId?: string;
}

export const TextStylometryPage: React.FC<TextStylometryPageProps> = ({
  onGenerateReport,
  onNavigate,
  initialCaseId = 'RC-2026-0045'
}) => {
  const [currentCase, setCurrentCase] = useState<InvestigationResult>(
    SAMPLE_CASES[initialCaseId] || SAMPLE_CASES['RC-2026-0045']
  );
  const [textInput, setTextInput] = useState<string>(
    SAMPLE_CASES['RC-2026-0045'].text_metrics?.analyzed_text_sample || ''
  );
  const [isScanning, setIsScanning] = useState(false);
  const [isWhyModalOpen, setIsWhyModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectSample = (type: 'ai' | 'human') => {
    if (type === 'ai') {
      const sample = SAMPLE_CASES['RC-2026-0045'];
      setCurrentCase(sample);
      setTextInput(sample.text_metrics?.analyzed_text_sample || '');
    } else {
      const humanText = `Honestly, I was pretty skeptical when we first kicked off the project back in November. We ran into all sorts of weird edge cases with the database migration, and half the scripts broke because someone forgot to sanitize the timestamp strings. But hey, after three late-night debug marathons and way too much cold coffee, the pipeline finally stabilized!`;
      setTextInput(humanText);
      handleAnalyzeCustomText(humanText);
    }
  };

  const handleAnalyzeCustomText = async (textToAnalyze?: string) => {
    const text = textToAnalyze || textInput;
    if (!text.trim()) return;

    setIsScanning(true);
    try {
      const res = await forensicApi.analyzeMedia('TEXT', text);
      setCurrentCase(res);
    } catch {
      // Fallback
    }
  };

  const processUploadedFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setTextInput(content);
        handleAnalyzeCustomText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
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
    if (file) {
      processUploadedFile(file);
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px 80px' }}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.pdf,.docx,.md,.json,.csv"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: '#818cf8', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700 }}>
              SPECIALIZED FORENSIC ENGINE 04
            </span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>&bull;</span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>TRANSFORMER ENCODERS + STYLOMETRIC PROFILER</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.5px', marginTop: '2px' }}>
            TEXT STYLOMETRY &amp; AI-WRITING ASSESSMENT
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
            <span>UPLOAD DOCUMENT</span>
          </button>

          <span style={{ fontSize: '12px', color: '#64748b' }}>or load:</span>

          <button
            onClick={() => handleSelectSample('ai')}
            className={currentCase.ai_generation_probability > 60 ? 'btn-cyber-primary' : 'btn-cyber-secondary'}
            style={{ fontSize: '11px', padding: '6px 12px' }}
          >
            AI-Assisted Executive Memo
          </button>
          <button
            onClick={() => handleSelectSample('human')}
            className={currentCase.ai_generation_probability <= 60 ? 'btn-cyber-primary' : 'btn-cyber-secondary'}
            style={{ fontSize: '11px', padding: '6px 12px' }}
          >
            Human Developer Retrospective
          </button>
        </div>
      </div>

      {isScanning ? (
        <div style={{ padding: '60px 0' }}>
          <LiveScanAnimation mediaType="TEXT" onComplete={() => setIsScanning(false)} />
        </div>
      ) : (
        <>
          {/* Main Top Grid: Editor on Left & Analysis on Right */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.25fr) minmax(300px, 1fr)', gap: '24px', marginBottom: '28px' }}>
            {/* LEFT: Text Editor & Inspector */}
            <div className="glass-panel forensic-corner" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#818cf8', letterSpacing: '0.5px' }}>
                  LINGUISTIC &amp; STYLOMETRIC TEXT EDITOR
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                  {textInput.split(/\s+/).filter(Boolean).length} WORDS &bull; {textInput.length} CHARS
                </div>
              </div>

              {/* Text Area with Drag & Drop */}
              <div
                style={{
                  position: 'relative',
                  border: isDragging ? '2px dashed #00f0ff' : 'none',
                  borderRadius: '6px'
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Paste suspect text or drag & drop text/doc files here to assess burstiness, perplexity, and AI-writing markers..."
                  style={{
                    width: '100%',
                    height: '280px',
                    backgroundColor: '#070b14',
                    border: '1px solid #1e293b',
                    borderRadius: '6px',
                    padding: '14px',
                    color: '#f8fafc',
                    fontSize: '13px',
                    fontFamily: 'var(--font-sans)',
                    lineHeight: 1.6,
                    resize: 'none',
                    outline: 'none',
                    boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.5)'
                  }}
                />
              </div>

              {/* Quick Text Upload & Analysis Action Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(56, 189, 248, 0.2)',
                      color: '#94a3b8',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Upload size={13} color="#38bdf8" />
                    <span>Upload TXT / DOCX / PDF / MD</span>
                  </button>

                  <button
                    onClick={() => setTextInput('')}
                    style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '11px', cursor: 'pointer' }}
                  >
                    Clear Text
                  </button>
                </div>

                <button
                  onClick={() => handleAnalyzeCustomText()}
                  className="btn-cyber-primary"
                  style={{ fontSize: '12px', padding: '8px 16px' }}
                >
                  <Play size={14} />
                  <span>ANALYZE STYLOMETRY</span>
                </button>
              </div>

              {/* Real-time Stylometric Parameters */}
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px 14px',
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  borderRadius: '6px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '10px',
                  fontSize: '11px'
                }}
              >
                <div>
                  <div style={{ color: '#64748b', textTransform: 'uppercase' }}>Burstiness</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: (currentCase.text_metrics?.burstiness_score || 0) < 0.3 ? '#f87171' : '#34d399' }}>
                    {currentCase.text_metrics?.burstiness_score || 0.18}
                  </div>
                </div>

                <div>
                  <div style={{ color: '#64748b', textTransform: 'uppercase' }}>Perplexity Est</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>
                    {currentCase.text_metrics?.perplexity_score || 14.2}
                  </div>
                </div>

                <div>
                  <div style={{ color: '#64748b', textTransform: 'uppercase' }}>Sentence StdDev</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: (currentCase.text_metrics?.sentence_length_std_dev || 0) < 4 ? '#fbbf24' : '#34d399' }}>
                    {currentCase.text_metrics?.sentence_length_std_dev || 2.1}w
                  </div>
                </div>

                <div>
                  <div style={{ color: '#64748b', textTransform: 'uppercase' }}>Lexical Richness</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#f8fafc' }}>
                    {currentCase.text_metrics?.vocabulary_richness_ttr || 0.48}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Score & Assessment */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>
                  CASE {currentCase.case_id} &bull; STYLOMETRIC ASSESSMENT
                </div>

                <ScoreMeter
                  score={currentCase.authenticity_score}
                  riskLevel={currentCase.risk_level}
                  assessment={currentCase.assessment}
                  confidenceScore={currentCase.confidence_score}
                  size={210}
                />

                {/* Text Probability Indicators */}
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
                    <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>AI-Likelihood</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: currentCase.ai_generation_probability > 70 ? '#f87171' : '#34d399' }}>
                      {currentCase.ai_generation_probability.toFixed(0)}%
                    </div>
                  </div>

                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px 12px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Syntactic Uniformity</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#fbbf24' }}>
                      {currentCase.ai_generation_probability > 70 ? 'High (Constricted)' : 'Natural Dynamic'}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px 12px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Trope Frequency</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#818cf8' }}>
                      {currentCase.ai_generation_probability > 70 ? 'Elevated' : 'Minimal'}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px 12px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Human Variance</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#34d399' }}>
                      {Math.max(10, 100 - currentCase.ai_generation_probability).toFixed(0)}%
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

              {/* Ethical Disclaimer Card */}
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(56, 189, 248, 0.15)',
                  borderRadius: '8px',
                  padding: '16px',
                  fontSize: '11px',
                  color: '#94a3b8',
                  lineHeight: 1.5
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontWeight: 700, marginBottom: '6px' }}>
                  <ShieldCheck size={14} />
                  <span>CRITICAL FORENSIC DISCLAIMER</span>
                </div>
                AI-writing detection is probabilistic and cannot definitively establish human vs AI authorship. Results reflect stylometric correlations (burstiness, token entropy) rather than absolute proof.
              </div>
            </div>
          </div>

          {/* Evidence Cards */}
          <section style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.5px', marginBottom: '14px' }}>
              TEXT STYLOMETRIC SIGNALS &amp; EVIDENCE BREAKDOWN
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
