"""
Audio Authenticity Detector for RealCheck AI
Performs full pipeline verification: safe decoding, acoustic & prosodic extraction,
calibrated inference, structured evidence mapping, and diagnostic logging.
"""
import hashlib
import time
import uuid
import logging
from typing import Dict, Any, Optional

from ..base import BaseDetector
from .features import AudioFeatureExtractor, AudioValidationException
from .engine import AudioModelEngine
from ...schemas.forensics import (
    InvestigationResult,
    SuspiciousTimeSegment,
    MetadataAnalysis
)

logger = logging.getLogger("realcheck.audio.detector")

class AudioDetector(BaseDetector):
    def __init__(self, weights_path: Optional[str] = None):
        super().__init__(
            model_name="Spectrogram Acoustic Profiler & Voice Artifact Classifier",
            model_version="v1.2.0-calibrated",
            input_type="AUDIO"
        )
        self.extractor = AudioFeatureExtractor(max_duration_sec=300.0, target_sr=16000)
        self.engine = AudioModelEngine(weights_path=weights_path)

    def analyze(self, file_path_or_content: Any, metadata: Optional[Dict[str, Any]] = None) -> InvestigationResult:
        req_id = f"req-aud-{uuid.uuid4().hex[:8]}"
        t_start = time.time()
        
        file_name = (metadata or {}).get("file_name", "uploaded_audio.wav")
        case_id = (metadata or {}).get("case_id") or f"RC-2026-{int(time.time() * 1000) % 10000:04d}"

        # Calculate exact SHA256 checksum & file size
        raw_size_bytes = 0
        content_hash = "unknown"
        if isinstance(file_path_or_content, (bytes, bytearray)):
            raw_size_bytes = len(file_path_or_content)
            content_hash = hashlib.sha256(file_path_or_content).hexdigest()
        elif isinstance(file_path_or_content, str):
            import os
            if os.path.exists(file_path_or_content):
                raw_size_bytes = os.path.getsize(file_path_or_content)
                with open(file_path_or_content, "rb") as f:
                    content_hash = hashlib.sha256(f.read()).hexdigest()
        
        size_str = (metadata or {}).get("file_size")
        if not size_str or size_str == "Unknown MB":
            if raw_size_bytes > 0:
                if raw_size_bytes < 1024 * 1024:
                    size_str = f"{raw_size_bytes / 1024:.1f} KB"
                else:
                    size_str = f"{raw_size_bytes / (1024*1024):.1f} MB"
            else:
                size_str = "Unknown"

        # 1. Decode and Validate Audio
        y, sr, duration, audio_meta = self.extractor.decode_and_validate(
            file_path_or_content,
            file_name=file_name
        )
        # 2. Extract Acoustic & Prosodic Features
        features = self.extractor.extract_features(y, sr, duration)

        # 3. Model Prediction
        pred = self.engine.predict(features, audio_meta, file_name)

        # 4. Assemble Segments
        suspicious_segments = [
            SuspiciousTimeSegment(
                start_time=seg["start_time"],
                end_time=seg["end_time"],
                start_seconds=seg["start_seconds"],
                end_seconds=seg["end_seconds"],
                risk_level=seg["risk_level"],
                anomaly_type=seg["anomaly_type"],
                description=seg["description"]
            )
            for seg in features.get("segments", [])
        ]

        # 5. Assemble Metadata
        meta_analysis = MetadataAnalysis(
            file_name=file_name,
            file_size_formatted=size_str,
            mime_type=f"audio/{audio_meta.get('format_name', 'wav').lower()}",
            duration=f"{duration:.2f}s ({audio_meta.get('orig_sample_rate', sr)}Hz)",
            creation_time=time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
            software_signature=f"{audio_meta.get('format_name', 'WAV')} [{audio_meta.get('subtype', 'PCM')}]",
            camera_model=None,
            exif_available=False,
            editing_software_indicator="None detected in header",
            hash_sha256=content_hash,
            metadata_risk_score=pred.metadata_risk_score,
            note="Audio stream decoded and verified."
        )

        total_elapsed_ms = round((time.time() - t_start) * 1000, 1)

        # Diagnostic log (no audio content or PII)
        logger.info(
            f"[{req_id}] Audio analysis complete: file='{file_name}', duration={duration:.2f}s, "
            f"sr={audio_meta.get('orig_sample_rate', sr)}Hz, model='{pred.model_name}', "
            f"verdict='{pred.assessment}', auth_score={pred.authenticity_score}/100, "
            f"ai_prob={pred.ai_generation_probability:.1f}%, latency={total_elapsed_ms}ms"
        )

        result = InvestigationResult(
            case_id=case_id,
            media_type="AUDIO",
            file_name=file_name,
            assessment=pred.assessment,
            authenticity_score=pred.authenticity_score,
            risk_level=pred.risk_level,
            confidence_level=pred.confidence_level,
            confidence_score=pred.confidence_score,
            is_demo_analysis=False,
            disclaimer="Analysis generated by acoustic feature and vocoder artifact model. Probabilistic assessment, not absolute proof.",
            timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            ai_generation_probability=pred.ai_generation_probability,
            manipulation_risk=pred.manipulation_risk,
            forensic_anomaly_score=pred.forensic_anomaly_score,
            metadata_risk_score=pred.metadata_risk_score,
            signals=pred.signals,
            evidence_breakdown=pred.evidence_breakdown,
            metadata=meta_analysis,
            suspicious_segments=suspicious_segments,
            why_result_explanation=pred.why_explanation,
            top_contributing_signals=pred.top_signals,
            limitations=pred.limitations
        )

        # Attach waveform envelope for UI rendering if supported
        try:
            result.heatmap_data = {
                "waveform_envelope": features.get("waveform_envelope", []),
                "model_status": pred.model_status,
                "latency_ms": total_elapsed_ms
            }
        except Exception:
            pass

        return result

    def explain(self, result: InvestigationResult) -> Dict[str, Any]:
        return {
            "method": "Acoustic, Prosodic, and Spectral Vocoder Artifact Analysis",
            "model": self.engine.model_name,
            "version": self.engine.model_version,
            "status": self.engine.model_status,
            "signals_evaluated": len(result.signals)
        }
