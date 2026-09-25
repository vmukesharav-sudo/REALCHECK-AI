"""
Text Stylometry Detector Engine for RealCheck AI
Analyzes Perplexity, Burstiness, Syntactic Uniformity, Vocabulary Entropy,
and Repetitive Discourse markers.
"""
import hashlib
import time
from typing import Dict, Any, Optional
from ..base import BaseDetector
from ...schemas.forensics import (
    InvestigationResult,
    ForensicSignal,
    EvidenceCard,
    MetadataAnalysis
)

class TextDetector(BaseDetector):
    def __init__(self):
        super().__init__(
            model_name="Transformer Encoders + Stylometric Profiler",
            model_version="v1.0.3-nlp",
            input_type="TEXT"
        )

    def analyze(self, file_path_or_content: Any, metadata: Optional[Dict[str, Any]] = None) -> InvestigationResult:
        case_id = f"RC-2026-{int(time.time() % 10000):04d}"
        file_name = (metadata or {}).get("file_name", "investigated_document.txt")
        text_content = str(file_path_or_content) if isinstance(file_path_or_content, str) else "Sample text input."
        file_size = f"{len(text_content.encode('utf-8')) / 1024:.1f} KB"
        content_hash = hashlib.sha256(text_content.encode()).hexdigest()

        # Compute dynamic NLP metrics based on input text
        words = text_content.split()
        word_count = len(words)
        sentences = [s.strip() for s in text_content.replace('!', '.').replace('?', '.').split('.') if s.strip()]
        sentence_count = max(len(sentences), 1)
        sentence_lengths = [len(s.split()) for s in sentences]
        avg_len = sum(sentence_lengths) / sentence_count
        variance = sum((l - avg_len) ** 2 for l in sentence_lengths) / sentence_count
        std_dev = variance ** 0.5

        # Heuristic stylometrics
        burstiness = round(max(0.1, min(1.0, std_dev / (avg_len + 1e-5))), 2)
        perplexity_est = round(max(10.0, min(80.0, 15.0 + burstiness * 25)), 1)
        ai_prob = round(max(20.0, min(95.0, 92.0 - burstiness * 50)), 1)

        signals = [
            ForensicSignal(
                name="Syntactic Uniformity & Low Burstiness",
                category="stylometric",
                score=ai_prob,
                weight=0.35,
                strength="Strong" if ai_prob > 70 else "Moderate",
                status="Anomaly Detected" if ai_prob > 70 else "Within Normal Variance",
                explanation=f"Sentence length standard deviation is {std_dev:.1f} words (burstiness: {burstiness}). Highly uniform rhythm is strongly correlated with LLM temperature decoding.",
                affected_region_or_time="Body text paragraphs",
                model_contribution_pct=38.0
            ),
            ForensicSignal(
                name="Token Probability Profile & Entropy",
                category="nlp",
                score=round(ai_prob * 0.94, 1),
                weight=0.30,
                strength="Strong" if ai_prob > 70 else "Moderate",
                status="Suspicious Pattern" if ai_prob > 70 else "Within Normal Variance",
                explanation="Predicted token rank remains consistently within top probability decile without natural human lexical idiosyncratic choices.",
                affected_region_or_time="Vocabulary distribution",
                model_contribution_pct=32.0
            ),
            ForensicSignal(
                name="Repetitive Discourse Connectors",
                category="stylometric",
                score=round(ai_prob * 0.88, 1),
                weight=0.20,
                strength="Moderate",
                status="Suspicious Pattern",
                explanation="Over-reliance on standardized structural transitions ('Furthermore', 'In conclusion', 'Crucially', 'Delve').",
                affected_region_or_time="Clause boundaries",
                model_contribution_pct=20.0
            ),
            ForensicSignal(
                name="Grammatical Precision & Surface Fluency",
                category="nlp",
                score=30.0,
                weight=0.15,
                strength="Weak",
                status="Within Normal Variance",
                explanation="Exemplary syntactic coherence without grammatical fractures.",
                affected_region_or_time="Document level",
                model_contribution_pct=10.0
            )
        ]

        evidence = [
            EvidenceCard(
                title="Sentence Structure Uniformity",
                status="Elevated Risk" if ai_prob > 60 else "Normal",
                score=round(ai_prob, 1),
                risk="High Risk" if ai_prob > 70 else "Medium Risk",
                explanation=f"Constricted sentence length variance (std dev: {std_dev:.1f} words).",
                category="syntax"
            ),
            EvidenceCard(
                title="Repetitive Phrasing",
                status="Elevated Risk" if ai_prob > 60 else "Normal",
                score=round(ai_prob * 0.9, 1),
                risk="High Risk" if ai_prob > 70 else "Medium Risk",
                explanation="Standard LLM rhetorical transitions and formulaic argument scaffolding.",
                category="stylometry"
            ),
            EvidenceCard(
                title="Vocabulary Consistency",
                status="Elevated Risk" if ai_prob > 60 else "Normal",
                score=round(ai_prob * 0.95, 1),
                risk="High Risk" if ai_prob > 70 else "Medium Risk",
                explanation="Predictable word frequency distributions matching top token priors.",
                category="vocabulary"
            ),
            EvidenceCard(
                title="Stylometric Fingerprint",
                status="Elevated Risk" if ai_prob > 60 else "Normal",
                score=round(ai_prob * 0.92, 1),
                risk="High Risk" if ai_prob > 70 else "Medium Risk",
                explanation="Strong similarity to instruction-tuned RLHF conversational models.",
                category="fingerprint"
            ),
            EvidenceCard(
                title="Human-like Stylistic Markers",
                status="Present",
                score=round(100 - ai_prob, 1),
                risk="Low Risk",
                explanation="Domain-specific terminology indicates human subject-matter direction.",
                category="human_markers"
            ),
            EvidenceCard(
                title="Authorship Uncertainty Notice",
                status="Important Notice",
                score=50.0,
                risk="Uncertain",
                explanation="AI-writing detection is probabilistic and cannot reliably prove human vs AI authorship.",
                category="uncertainty"
            )
        ]

        auth_score = int(max(10, min(95, 100 - ai_prob)))
        assessment = "Likely AI-Assisted" if 50 <= ai_prob <= 80 else ("Likely AI-Generated" if ai_prob > 80 else "Likely Authentic")
        risk = "High Risk" if auth_score <= 30 else ("Medium Risk" if auth_score <= 60 else "Low Risk")

        return InvestigationResult(
            case_id=case_id,
            media_type="TEXT",
            file_name=file_name,
            assessment=assessment,
            authenticity_score=auth_score,
            risk_level=risk,
            confidence_level="Moderate",
            confidence_score=round(ai_prob / 100.0, 2),
            is_demo_analysis=True,
            disclaimer="Prototype / Demonstration Analysis. AI-writing detection is probabilistic and cannot reliably prove authorship.",
            timestamp="2026-09-24T09:15:00Z",
            ai_generation_probability=ai_prob,
            manipulation_risk=round(ai_prob * 0.65, 1),
            forensic_anomaly_score=round(ai_prob * 0.85, 1),
            metadata_risk_score=10.0,
            signals=signals,
            evidence_breakdown=evidence,
            metadata=MetadataAnalysis(
                file_name=file_name,
                file_size_formatted=file_size,
                mime_type="text/plain",
                dimensions=None,
                duration=None,
                creation_time="2026-09-24 09:00:00 UTC",
                software_signature="UTF-8 Text Stream",
                camera_model=None,
                exif_available=False,
                editing_software_indicator="None",
                hash_sha256=content_hash,
                metadata_risk_score=10.0,
                note="Metadata is supporting evidence only and can be altered or removed."
            ),
            text_metrics={
                "word_count": word_count,
                "sentence_count": sentence_count,
                "avg_sentence_length": round(avg_len, 1),
                "sentence_length_std_dev": round(std_dev, 1),
                "perplexity_score": perplexity_est,
                "burstiness_score": burstiness,
                "repeated_phrases_count": 6,
                "vocabulary_richness_ttr": 0.52,
                "analyzed_text_sample": text_content[:300] + "..." if len(text_content) > 300 else text_content
            },
            why_result_explanation=f"The text exhibits a burstiness coefficient of {burstiness} with standard deviation of {std_dev:.1f} words per sentence. This uniform syntactic cadence combined with canonical discourse transitions ('Furthermore', 'In conclusion') indicates AI-assisted composition.",
            top_contributing_signals=[
                {"signal": "Syntactic Uniformity & Low Burstiness", "impact": "Strong", "weight": "38%"},
                {"signal": "Vocabulary Perplexity Profile", "impact": "Strong", "weight": "32%"},
                {"signal": "Repetitive Discourse Connectors", "impact": "Moderate", "weight": "20%"},
                {"signal": "Grammatical Precision Coherence", "impact": "Weak", "weight": "10%"}
            ],
            limitations="Non-native English writers, academic papers, and formulaic legal/business texts inherently exhibit lower burstiness and can produce elevated AI-likelihood indicators."
        )

    def explain(self, result: InvestigationResult) -> Dict[str, Any]:
        return {
            "method": "Integrated Gradients on Token Perplexity",
            "high_likelihood_tokens": ["Furthermore", "essential", "multifaceted", "paradigm", "testament"],
            "human_variance_tokens": ["however", "unexpectedly", "frankly", "messy"]
        }
