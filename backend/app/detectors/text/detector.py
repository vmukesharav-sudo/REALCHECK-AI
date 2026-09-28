"""
Text Stylometry Detector Engine for RealCheck AI
Performs Lexical Diversity, Burstiness (Sentence Length Variance),
and structural pattern analysis using basic NLP heuristics.
"""
import hashlib
import time
import re
from datetime import datetime
from typing import Dict, Any, Optional
import math

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
            model_name="Stylometric & Lexical Variance Analysis",
            model_version="v2.0.0-real-computation",
            input_type="TEXT"
        )

    def analyze(self, file_path_or_content: Any, metadata: Optional[Dict[str, Any]] = None) -> InvestigationResult:
        case_id = f"RC-2026-{int(time.time() % 10000):04d}"
        file_name = (metadata or {}).get("file_name", "analyzed_document.txt")
        file_size = "0.0 MB"
        
        text_content = str(file_path_or_content) if file_path_or_content else ""
        content_hash = hashlib.sha256(text_content.encode('utf-8')).hexdigest()
        file_size = f"{len(text_content.encode('utf-8')) / (1024):.1f} KB"

        signals = []
        evidence = []
        
        authenticity_score = 100
        ai_prob = 10.0
        manip_risk = 10.0
        forensic_anomaly = 10.0
        meta_risk = 10.0
        
        why_explanation = "The text was analyzed using real local stylometric heuristics."
        
        burstiness = 0.0
        lexical_diversity = 0.0
        sentence_count = 0
        word_count = 0

        if text_content.strip():
            try:
                # 1. Burstiness (Sentence Length Variance)
                sentences = [s.strip() for s in re.split(r'[.!?]+', text_content) if s.strip()]
                sentence_count = len(sentences)
                
                sentence_lengths = [len(s.split()) for s in sentences]
                
                # 2. Lexical Diversity (Type-Token Ratio)
                words = re.findall(r'\b\w+\b', text_content.lower())
                word_count = len(words)
                unique_words = set(words)
                
                if word_count > 0:
                    lexical_diversity = len(unique_words) / word_count
                
                if sentence_count > 1:
                    mean_length = sum(sentence_lengths) / sentence_count
                    variance = sum((x - mean_length) ** 2 for x in sentence_lengths) / sentence_count
                    std_dev = math.sqrt(variance)
                    burstiness = std_dev / mean_length if mean_length > 0 else 0
                else:
                    burstiness = 0.0

                if sentence_count > 3:
                    if burstiness < 0.35:
                        ai_prob += 40.0
                        authenticity_score -= 30
                        why_explanation += f" Sentence lengths are highly uniform (Burstiness: {burstiness:.2f}), which is characteristic of LLM generation algorithms prioritizing safe, average sentence structures."
                        
                        signals.append(
                            ForensicSignal(
                                name="Low Sentence Burstiness",
                                category="stylometric",
                                score=75.0,
                                weight=0.40,
                                strength="Strong",
                                status="Suspicious Pattern",
                                explanation=f"Low variance in sentence lengths (Burstiness: {burstiness:.2f}). Human writers typically alternate between short and long sentences.",
                                affected_region_or_time="Document Structure",
                                model_contribution_pct=40.0
                            )
                        )
                        evidence.append(
                            EvidenceCard(
                                title="Uniform Sentence Cadence",
                                status="Elevated Risk",
                                score=75.0,
                                risk="High Risk",
                                explanation="Text rhythm is unnaturally consistent, lacking human structural variance.",
                                category="stylometric"
                            )
                        )
                    else:
                        signals.append(
                            ForensicSignal(
                                name="Natural Sentence Burstiness",
                                category="stylometric",
                                score=15.0,
                                weight=0.20,
                                strength="Normal",
                                status="Within Normal Variance",
                                explanation=f"Sentence length variance (Burstiness: {burstiness:.2f}) indicates natural human stylistic rhythm.",
                                affected_region_or_time="Document Structure",
                                model_contribution_pct=10.0
                            )
                        )
                        
                if word_count > 50:
                    if lexical_diversity < 0.4:
                        ai_prob += 30.0
                        authenticity_score -= 20
                        why_explanation += f" Lexical diversity (TTR: {lexical_diversity:.2f}) is lower than expected, suggesting constrained vocabulary."
                        
                        signals.append(
                            ForensicSignal(
                                name="Constrained Lexical Diversity",
                                category="lexical",
                                score=65.0,
                                weight=0.30,
                                strength="Moderate",
                                status="Suspicious Pattern",
                                explanation=f"Type-Token Ratio ({lexical_diversity:.2f}) indicates repetitive word usage often seen in AI generation.",
                                affected_region_or_time="Vocabulary",
                                model_contribution_pct=30.0
                            )
                        )
                    else:
                        signals.append(
                            ForensicSignal(
                                name="Rich Lexical Diversity",
                                category="lexical",
                                score=15.0,
                                weight=0.20,
                                strength="Normal",
                                status="Within Normal Variance",
                                explanation=f"Type-Token Ratio ({lexical_diversity:.2f}) indicates healthy, varied vocabulary typical of human authorship.",
                                affected_region_or_time="Vocabulary",
                                model_contribution_pct=10.0
                            )
                        )
                        
                if word_count <= 20:
                    authenticity_score -= 10
                    why_explanation += " The provided text is too short for highly confident stylometric analysis."

            except Exception as e:
                authenticity_score = 0
                why_explanation = f"Error during text processing: {str(e)}"
        else:
            authenticity_score = 0
            why_explanation = "No text content provided."

        risk_level = "Low Risk"
        assessment = "Likely Authentic"
        if authenticity_score <= 30:
            risk_level = "High Risk"
            assessment = "Likely AI-Generated"
        elif authenticity_score <= 60:
            risk_level = "Medium Risk"
            assessment = "Likely AI-Assisted"
            
        return InvestigationResult(
            case_id=case_id,
            media_type="TEXT",
            file_name=file_name,
            assessment=assessment,
            authenticity_score=authenticity_score,
            risk_level=risk_level,
            confidence_level="Moderate",
            confidence_score=0.75,
            is_demo_analysis=False,
            disclaimer="Analysis generated from real local stylometric heuristics (Lexical Diversity & Burstiness).",
            timestamp=datetime.utcnow().isoformat() + "Z",
            ai_generation_probability=min(99.0, ai_prob),
            manipulation_risk=manip_risk,
            forensic_anomaly_score=forensic_anomaly,
            metadata_risk_score=meta_risk,
            signals=signals,
            evidence_breakdown=evidence,
            text_metrics={
                "word_count": word_count,
                "sentence_count": sentence_count,
                "burstiness": float(f"{burstiness:.3f}"),
                "lexical_diversity": float(f"{lexical_diversity:.3f}"),
                "perplexity_estimate": "N/A (Requires LLM)"
            },
            metadata=MetadataAnalysis(
                file_name=file_name,
                file_size_formatted=file_size,
                mime_type="text/plain",
                hash_sha256=content_hash,
                metadata_risk_score=meta_risk,
                note="Computed directly from uploaded text.",
                exif_available=False
            ),
            why_result_explanation=why_explanation,
            top_contributing_signals=[{"signal": s.name, "impact": s.strength, "weight": f"{s.weight*100:.0f}%"} for s in signals],
            limitations="Stylometry is highly subjective. Rule-based heuristics cannot reliably detect lightly edited AI text or highly formulaic human text."
        )

    def explain(self, result: InvestigationResult) -> Dict[str, Any]:
        return {
            "method": "Burstiness & Type-Token Ratio",
            "layer_targeted": "N/A",
            "heatmap_resolution": "N/A",
            "salient_features": [
                "Sentence Length Variance",
                "Vocabulary Repetition"
            ]
        }
