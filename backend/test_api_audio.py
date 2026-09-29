import os
import io
import pytest
from fastapi.testclient import TestClient
import numpy as np
import soundfile as sf
import time

from app.main import app  # Assuming the FastAPI app is imported from app.main or we need to find it

# If app.main does not exist, we import router directly and mount it
from fastapi import FastAPI
from app.api.routes import router

test_app = FastAPI()
test_app.include_router(router)

client = TestClient(test_app)

def create_dummy_wav_bytes(duration=1.0, sr=16000):
    t = np.linspace(0, duration, int(sr * duration))
    y = np.sin(2 * np.pi * 440 * t).astype(np.float32)
    bio = io.BytesIO()
    sf.write(bio, y, sr, format='WAV', subtype='PCM_16')
    return bio.getvalue()

def test_analyze_audio_valid_wav():
    wav_bytes = create_dummy_wav_bytes()
    response = client.post(
        "/api/analyze/audio",
        files={"file": ("test.wav", wav_bytes, "audio/wav")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["media_type"] == "AUDIO"
    assert data["assessment"] == "Unverified (No Model Available)"
    assert data["authenticity_score"] == 50
    assert "signals" in data

def test_analyze_audio_empty_file():
    response = client.post(
        "/api/analyze/audio",
        files={"file": ("empty.wav", b"", "audio/wav")}
    )
    assert response.status_code == 400
    assert "empty (0 bytes)" in response.json()["detail"]

def test_analyze_audio_corrupt_file():
    corrupt_bytes = b"NOT_A_VALID_AUDIO_FILE_START_HERE"
    response = client.post(
        "/api/analyze/audio",
        files={"file": ("corrupt.wav", corrupt_bytes, "audio/wav")}
    )
    assert response.status_code == 400
    assert "Failed to decode" in response.json()["detail"] or "Unsupported" in response.json()["detail"]

def test_analyze_audio_unsupported_format():
    # We pass a txt file with .txt extension. 
    # Actually features.py checks extension or tries to decode.
    unsupported_bytes = b"Hello, this is a text file, not audio."
    response = client.post(
        "/api/analyze/audio",
        files={"file": ("test.txt", unsupported_bytes, "text/plain")}
    )
    assert response.status_code == 400
    assert "Failed to decode" in response.json()["detail"] or "Unsupported" in response.json()["detail"]

def test_analyze_audio_repeated_upload_cache():
    wav_bytes = create_dummy_wav_bytes()
    # First upload
    res1 = client.post(
        "/api/analyze/audio",
        files={"file": ("test_cache.wav", wav_bytes, "audio/wav")}
    )
    assert res1.status_code == 200
    case_id = res1.json()["case_id"]

    # Second upload using sample_id
    res2 = client.post(
        "/api/analyze/audio",
        data={"sample_id": case_id}
    )
    assert res2.status_code == 200
    assert res2.json()["case_id"] == case_id

def test_analyze_audio_oversized_file():
    # Simulate oversized file by mocking len in features.py or passing large bytes (if memory permits)
    # Fast test: we just assert the logic is there.
    # Creating a 51MB byte string in memory for test is slow and uses RAM. Let's just create exactly 50MB + 1 byte
    # This might take a bit of memory.
    try:
        large_bytes = b"0" * (50 * 1024 * 1024 + 1)
        response = client.post(
            "/api/analyze/audio",
            files={"file": ("large.wav", large_bytes, "audio/wav")}
        )
        assert response.status_code == 400
        assert "exceeds maximum allowed size" in response.json()["detail"]
    except MemoryError:
        pytest.skip("Not enough memory to test oversized file")

def test_analyze_audio_too_short():
    wav_bytes = create_dummy_wav_bytes(duration=0.1)
    response = client.post(
        "/api/analyze/audio",
        files={"file": ("short.wav", wav_bytes, "audio/wav")}
    )
    assert response.status_code == 400
    assert "too short" in response.json()["detail"]
