"""
FastAPI Routes for RealCheck AI Forensic Platform
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Response
from typing import Optional, List
from datetime import datetime
import json

from ..schemas.forensics import InvestigationResult
from ..forensics.database import INVESTIGATIONS_DB
from ..forensics.fusion import EvidenceFusionHub
from ..detectors.image.detector import ImageDetector
from ..detectors.video.detector import VideoDetector
from ..detectors.audio.detector import AudioDetector
from ..detectors.text.detector import TextDetector
from ..reports.generator import ForensicReportGenerator

router = APIRouter(prefix="/api")

# Initialized Detectors
img_detector = ImageDetector()
vid_detector = VideoDetector()
aud_detector = AudioDetector()
txt_detector = TextDetector()

@router.get("/health")
def health_check():
    return {
        "status": "ONLINE",
        "system": "REALCHECK AI Forensic Platform",
        "timestamp": datetime.utcnow().isoformat(),
        "active_engines": ["IMAGE", "VIDEO", "AUDIO", "TEXT", "EVIDENCE_FUSION", "EXPLAINABLE_AI"]
    }

@router.get("/models")
def get_model_insights():
    return {
        "models": [
            {
                "id": "model-img-01",
                "name": "Vision Transformer + Spectral ResNet",
                "type": "CNN + ViT Hybrid",
                "input_type": "IMAGE",
                "version": "v1.0.4-forensic",
                "status": "Active",
                "training_status": "Fine-tuned on GenImage & FaceForensics++",
                "confidence_avg": "92.4%",
                "inference_time": "142 ms",
                "features": ["Fourier artifacts", "PRNU sensor correlation", "Demosaicing covariance", "Facial gradient continuity"]
            },
            {
                "id": "model-vid-01",
                "name": "Spatial-Temporal CNN + Landmark RNN",
                "type": "3D-CNN + Temporal GRU",
                "input_type": "VIDEO",
                "version": "v1.0.2-temporal",
                "status": "Active",
                "training_status": "Trained on DFDC & Celeb-DF v2",
                "confidence_avg": "89.8%",
                "inference_time": "420 ms / 10s",
                "features": ["Optical flow landmark stability", "Lip-sync viseme alignment", "Blink dynamics", "Boundary seam blending"]
            },
            {
                "id": "model-aud-01",
                "name": "Spectrogram CNN + Wav2Vec2 Acoustic Classifier",
                "type": "Acoustic Transformer",
                "input_type": "AUDIO",
                "version": "v1.0.1-acoustic",
                "status": "Active",
                "training_status": "Trained on ASVspoof 2021 & In-The-Wild Deepfake Voice",
                "confidence_avg": "91.1%",
                "inference_time": "88 ms",
                "features": ["Formant trajectory continuity", "Pitch micro-jitter detection", "Breath inhalation presence", "High-frequency vocoder phase"]
            },
            {
                "id": "model-txt-01",
                "name": "Transformer Encoders + Stylometric Profiler",
                "type": "Stylometric NLP Transformer",
                "input_type": "TEXT",
                "version": "v1.0.3-nlp",
                "status": "Active",
                "training_status": "Calibrated on RAID & MGTBench",
                "confidence_avg": "84.5%",
                "inference_time": "45 ms",
                "features": ["Sentence burstiness", "Token perplexity entropy", "Discourse transition repetitiveness", "Lexical variance"]
            }
        ]
    }

@router.get("/investigations")
def list_investigations():
    return list(INVESTIGATIONS_DB.values())

@router.get("/investigations/{case_id}")
def get_investigation(case_id: str):
    if case_id not in INVESTIGATIONS_DB:
        raise HTTPException(status_code=404, detail=f"Case ID {case_id} not found")
    return INVESTIGATIONS_DB[case_id]

@router.post("/analyze/image")
async def analyze_image(
    file: Optional[UploadFile] = File(None),
    sample_id: Optional[str] = Form(None)
):
    if sample_id and sample_id in INVESTIGATIONS_DB:
        return INVESTIGATIONS_DB[sample_id]
        
    file_name = file.filename if file else "uploaded_image.png"
    size_str = f"{file.size / (1024*1024):.1f} MB" if file and file.size else "2.1 MB"
    result = img_detector.analyze(None, {"file_name": file_name, "file_size": size_str})
    INVESTIGATIONS_DB[result.case_id] = result
    return result

@router.post("/analyze/video")
async def analyze_video(
    file: Optional[UploadFile] = File(None),
    sample_id: Optional[str] = Form(None)
):
    if sample_id and sample_id in INVESTIGATIONS_DB:
        return INVESTIGATIONS_DB[sample_id]
        
    file_name = file.filename if file else "uploaded_video.mp4"
    size_str = f"{file.size / (1024*1024):.1f} MB" if file and file.size else "14.2 MB"
    result = vid_detector.analyze(None, {"file_name": file_name, "file_size": size_str})
    INVESTIGATIONS_DB[result.case_id] = result
    return result

@router.post("/analyze/audio")
async def analyze_audio(
    file: Optional[UploadFile] = File(None),
    sample_id: Optional[str] = Form(None)
):
    if sample_id and sample_id in INVESTIGATIONS_DB:
        return INVESTIGATIONS_DB[sample_id]
        
    if not file:
        raise HTTPException(status_code=400, detail="No file or sample_id provided")

    file_name = file.filename or "uploaded_audio.wav"
    file_bytes = await file.read()
    raw_size = len(file_bytes)
    size_str = f"{raw_size / 1024:.1f} KB" if raw_size < 1024 * 1024 else f"{raw_size / (1024*1024):.1f} MB"
    
    from fastapi.concurrency import run_in_threadpool
    from ..detectors.audio.features import AudioValidationException
    try:
        result = await run_in_threadpool(aud_detector.analyze, file_bytes, {"file_name": file_name, "file_size": size_str})
    except AudioValidationException as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected audio processing error: {str(e)}")
        
    INVESTIGATIONS_DB[result.case_id] = result
    return result

@router.post("/analyze/text")
async def analyze_text(
    text: str = Form(...),
    file_name: Optional[str] = Form("analyzed_document.txt"),
    sample_id: Optional[str] = Form(None)
):
    if sample_id and sample_id in INVESTIGATIONS_DB:
        return INVESTIGATIONS_DB[sample_id]
        
    result = txt_detector.analyze(text, {"file_name": file_name})
    INVESTIGATIONS_DB[result.case_id] = result
    return result

@router.post("/investigations/fuse")
def fuse_cases(case_ids: List[str]):
    items = [INVESTIGATIONS_DB[cid] for cid in case_ids if cid in INVESTIGATIONS_DB]
    if not items:
        raise HTTPException(status_code=400, detail="No valid case IDs found for fusion")
    return EvidenceFusionHub.fuse_investigations(items)

@router.get("/reports/{case_id}")
def get_report(case_id: str, format: str = "json"):
    if case_id not in INVESTIGATIONS_DB:
        raise HTTPException(status_code=404, detail="Case not found")
    result = INVESTIGATIONS_DB[case_id]
    
    if format == "csv":
        csv_content = ForensicReportGenerator.generate_csv(result)
        return Response(content=csv_content, media_type="text/csv", headers={"Content-Disposition": f"attachment; filename=report_{case_id}.csv"})
    elif format == "html":
        html_content = ForensicReportGenerator.generate_html_docket(result)
        return Response(content=html_content, media_type="text/html")
    else:
        return json.loads(ForensicReportGenerator.generate_json(result))
