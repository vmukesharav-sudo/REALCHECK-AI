import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Upload,
  Play,
  HelpCircle,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Info,
  X,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { ScoreMeter } from '../components/ScoreMeter';
import { EvidenceCardComponent } from '../components/EvidenceCardComponent';
import { LiveScanAnimation } from '../components/LiveScanAnimation';
import { WhyThisResultModal } from '../components/WhyThisResultModal';
import { LoadingState, ErrorState } from '../components/AppStates';
import { forensicApi } from '../services/api';
import { InvestigationResult, ForensicSignal } from '../types/forensics';
import { Loader2 } from 'lucide-react';

interface TextStylometryPageProps {
  onGenerateReport: (caseId: string) => void;
  onNavigate: (tab: string) => void;
  initialCaseId?: string;
}

const SIGNAL_CATEGORY_LABELS: Record<string, string> = {
  nlp: 'Language & Content Model (NLP)',
  acoustic: 'Acoustic & Voice Characteristics',
  frequency: 'Frequency & Spectral Anomalies',
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

export const TextStylometryPage: React.FC<TextStylometryPageProps> = ({
  onGenerateReport,
  onNavigate,
  initialCaseId
}) => {
  const [currentCase, setCurrentCase] = useState<InvestigationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [textInput, setTextInput] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [isWhyModalOpen, setIsWhyModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!initialCaseId) {
        setIsLoading(false);
        return;
    }
    let isMounted = true;
    setIsLoading(true);
    setError(null);
    forensicApi.getInvestigation(initialCaseId)
      .then(data => {
        if (isMounted) {
          setCurrentCase(data);
          setTextInput(data.text_metrics?.analyzed_text_sample || '');
        }
      })
      .catch(err => {
        if (isMounted) setError(err.message || 'Failed to load case');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => { isMounted = false; };
  }, [initialCaseId]);



  const handleAnalyzeCustomText = async (textToAnalyze?: string) => {
    const text = textToAnalyze || textInput;
    if (!text.trim()) return;

    setIsScanning(true);
    setError(null);
    try {
      const res = await forensicApi.analyzeMedia('TEXT', text);
      setCurrentCase(res);
    } catch (err: any) {
      setError(err.message || 'Analysis failed.');
    } finally {
      setIsScanning(false);
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
    reader.onerror = () => {
      setError('Failed to read file. Please ensure it is a valid text format.');
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
    // reset input so the same file can be selected again
    if (e.target) e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processUploadedFile(file);
  };

  if (isLoading) {
    return <LoadingState message="Loading case data..." />;
  }

  if (isScanning) {
    return <LoadingState message="Analysis in progress..." stages={[
      { name: 'Document received', status: 'completed' },
      { name: 'Stylometric modeling', status: 'processing' },
      { name: 'NLP & Grammar extraction', status: 'pending' }
    ]} />;
  }

  const signalGroups = currentCase ? groupSignalsByCategory(currentCase.signals) : {};
  const metrics = currentCase?.text_metrics;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px 24px 80px', width: '100%' }}>
      <input ref={fileInputRef} type="file" accept=".txt,.pdf,.docx,.md,.json,.csv" style={{ display: 'none' }} onChange={handleFileChange} />

      {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-dim)', marginBottom: '20px' }}>
        <button onClick={() => onNavigate('overview')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, fontSize: '13px' }}>Overview</button>
        <ChevronRight size={14} />
        <button onClick={() => onNavigate('new-investigation')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, fontSize: '13px' }}>Investigate</button>
        <ChevronRight size={14} />
        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Text</span>
      </nav>

      {/* ── Page header ────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>Text & Message Authenticity</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Analyze linguistic patterns and stylistic indicators.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)', border: 'none', borderRadius: '8px', padding: '9px 16px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
          >
            <Upload size={16} /> Upload Document
          </button>
          {currentCase && (
            <button
              onClick={() => onGenerateReport(currentCase.case_id)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '9px 16px', cursor: 'pointer', fontWeight: 500, fontSize: '14px' }}
            >
              <FileSpreadsheet size={16} /> Report
            </button>
          )}
        </div>
      </div>

      {/* ── Error banner ───────────────────────────────────────────────── */}
      {error && (
        <div style={{ marginBottom: '20px', padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', color: 'var(--risk-high)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={16} />
          {error}
          <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><X size={14} /></button>
        </div>
      )}

      {/* ── Main two-column grid ───────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>

        {/* LEFT — Input & Editor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', overflow: 'hidden' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-body-pattern-1)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Text Input
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                {textInput.trim().split(/\s+/).filter(Boolean).length} WORDS &bull; {textInput.length} CHARS
              </div>
            </div>

            <div style={{ padding: '16px' }}>
              <div
                style={{
                  position: 'relative',
                  border: isDragging ? '2px dashed var(--cyan-primary)' : '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  background: isDragging ? 'rgba(0,240,255,0.05)' : 'var(--bg-deep)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Paste your text or message here..."
                  style={{
                    width: '100%', height: '350px', background: 'transparent', border: 'none', resize: 'none',
                    padding: '16px', color: 'var(--text-main)', fontSize: '14px', lineHeight: 1.6,
                    fontFamily: 'var(--font-sans)', outline: 'none'
                  }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => fileInputRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-body-pattern-1)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
                    <Upload size={14} /> Upload TXT/MD
                  </button>
                  <button onClick={() => setTextInput('')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', color: 'var(--text-dim)', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
                    <Trash2 size={14} /> Clear
                  </button>
                </div>
                <button
                  onClick={() => handleAnalyzeCustomText()}
                  disabled={!textInput.trim() || isScanning}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--cyan-primary)', border: 'none', color: 'var(--text-invert)', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: !textInput.trim() || isScanning ? 'not-allowed' : 'pointer', opacity: !textInput.trim() || isScanning ? 0.5 : 1 }}
                >
                  <Play size={14} style={{ fill: 'currentColor' }} /> Analyze Text
                </button>
              </div>
            </div>
          </div>


        </div>

        {/* RIGHT — Assessment */}
        {currentCase && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

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

              {/* Stylometric Limitations Disclaimer */}
              <div style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '6px', padding: '12px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <Info size={16} color="var(--risk-medium)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                  <strong style={{ display: 'block', color: 'var(--text-main)', marginBottom: '2px' }}>Limitations of Stylometry</strong>
                  Stylometric indicators provide statistical probabilities based on token entropy and burstiness, not definitive proof. Human authors can write with low variance, and AI can be prompted to simulate human burstiness.
                </div>
              </div>

              {/* Observed Linguistic Features / Metrics */}
              {metrics && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                    Observed Linguistic Features
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {[
                      { label: 'Burstiness', value: metrics.burstiness_score.toFixed(2), color: metrics.burstiness_score < 0.3 ? 'var(--risk-medium)' : 'var(--text-main)' },
                      { label: 'Perplexity Est', value: metrics.perplexity_score.toFixed(1), color: metrics.perplexity_score < 20 ? 'var(--risk-medium)' : 'var(--text-main)' },
                      { label: 'Sentence Variation', value: metrics.sentence_length_std_dev.toFixed(1) + 'w', color: 'var(--text-main)' },
                      { label: 'Lexical Richness', value: metrics.vocabulary_richness_ttr.toFixed(2), color: 'var(--text-main)' },
                    ].map((item, i) => (
                      <div key={i} style={{ background: 'var(--bg-body-pattern-1)', borderRadius: '8px', padding: '10px 12px' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>{item.label}</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: item.color }}>
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Statistical/Heuristic Interpretation */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                  Statistical Interpretation
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                  <div style={{ background: 'var(--bg-body-pattern-1)', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>AI-Generation Likelihood</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Estimated probability of LLM assistance.</div>
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: currentCase.ai_generation_probability > 70 ? 'var(--risk-high)' : 'var(--risk-low)' }}>
                      {currentCase.ai_generation_probability.toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                <button onClick={() => setIsWhyModalOpen(true)}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px', background: 'var(--bg-body-pattern-1)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                  <HelpCircle size={15} color="var(--cyan-primary)" /> Why this result?
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Evidence section ──────────────────────────────────────────────── */}
      {currentCase && (
        <div style={{ marginTop: '32px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>Forensic Evidence</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Evidence returned by the NLP analysis engine. All values are from backend analysis.</p>
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
                          <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>Region: {sig.affected_region_or_time}</span>
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
      )}

      {currentCase && (
        <WhyThisResultModal
          isOpen={isWhyModalOpen}
          onClose={() => setIsWhyModalOpen(false)}
          result={currentCase}
          onInvestigateDeeper={() => onNavigate('workspace')}
        />
      )}
    </div>
  );
};
