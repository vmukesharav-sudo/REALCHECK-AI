import React from 'react';
import { Cpu, CheckCircle2, Zap, Layers, ShieldCheck, Activity, BarChart2, Database } from 'lucide-react';
import { forensicApi } from '../services/api';

export const ModelInsightsPage: React.FC = () => {
  const models = forensicApi.getModelInsights();

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px 80px' }}>
      {/* Title */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#00f0ff', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700 }}>
            TRANSPARENCY & ML GOVERNANCE
          </span>
          <span style={{ fontSize: '11px', color: '#64748b' }}>&bull;</span>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>SYSTEM SPECIFICATION</span>
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.5px', marginTop: '2px' }}>
          TRANSPARENT AI MODEL REGISTRY & FORENSIC ENGINES
        </h1>
        <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
          Full visibility into the neural architectures, training corpora, inference latency, and calibration weights of our 4 specialized detection engines.
        </p>
      </div>

      {/* Model Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
          marginBottom: '36px'
        }}
      >
        {models.map((m) => (
          <div
            key={m.id}
            className="glass-panel forensic-corner"
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: '#00f0ff',
                    backgroundColor: 'rgba(0, 240, 255, 0.1)',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}
                >
                  {m.input_type} ENGINE
                </span>
                <span className="badge-risk-low" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={12} />
                  <span>{m.status}</span>
                </span>
              </div>

              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', marginBottom: '4px' }}>
                {m.name}
              </h2>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>
                Architecture: <strong>{m.type}</strong> &bull; Version: <strong>{m.version}</strong>
              </div>

              {/* Training Corpus & Metrics */}
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px 14px', borderRadius: '6px', marginBottom: '16px', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontWeight: 600, marginBottom: '4px' }}>
                  <Database size={14} />
                  <span>Training Calibration</span>
                </div>
                <div style={{ color: '#cbd5e1' }}>
                  {m.training_status}
                </div>
              </div>

              {/* Feature Tags */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Primary Forensic Signals
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {m.features.map((feat, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: 'rgba(56, 189, 248, 0.1)',
                        border: '1px solid rgba(56, 189, 248, 0.2)',
                        color: '#38bdf8',
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Latency & Confidence Bar */}
            <div
              style={{
                borderTop: '1px solid rgba(56, 189, 248, 0.15)',
                paddingTop: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px'
              }}
            >
              <div>
                <span style={{ color: '#64748b' }}>Benchmark Conf:</span>{' '}
                <strong style={{ color: '#34d399', fontFamily: 'var(--font-mono)' }}>{m.confidence_avg}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Latency:</span>{' '}
                <strong style={{ color: '#00f0ff', fontFamily: 'var(--font-mono)' }}>{m.inference_time}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Model Lineage & Limitations Notice */}
      <div
        className="glass-panel"
        style={{
          padding: '20px 24px',
          borderLeft: '4px solid #f59e0b',
          fontSize: '12px',
          color: '#cbd5e1',
          lineHeight: 1.6
        }}
      >
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#fbbf24', marginBottom: '4px' }}>
          MODEL TRANSPARENCY &amp; REASONING GUARANTEE
        </div>
        REALCHECK AI guarantees that every detection score is decomposed into explainable sub-signals. Our engines never output a black-box binary verdict. When model confidence dips below calibration thresholds, the system flags the result as <em>Uncertain / Mixed Evidence</em> to protect against false accusations.
      </div>
    </div>
  );
};
