import sys
import os
import numpy as np
import soundfile as sf

from app.detectors.audio.detector import AudioDetector

def test_audio_detector_real_file():
    detector = AudioDetector()
    # Create dummy real-like audio
    sr = 16000
    t = np.linspace(0, 1, sr)
    # Simple sine wave
    y = np.sin(2 * np.pi * 440 * t)
    
    file_path = "test_real.wav"
    sf.write(file_path, y, sr)
    
    result = detector.analyze(file_path)
    
    assert result.assessment == "Unverified (No Model Available)", f"Expected Unverified, got {result.assessment}"
    assert result.authenticity_score == 50, f"Expected 50, got {result.authenticity_score}"
    assert len(result.signals) == 4, f"Expected 4 signals, got {len(result.signals)}"
    assert result.signals[0].strength == "Information Only"

def test_audio_detector_empty_file():
    detector = AudioDetector()
    file_path = "test_empty.wav"
    with open(file_path, "wb") as f:
        pass
    
    from app.detectors.audio.features import AudioValidationException
    try:
        detector.analyze(file_path)
        assert False, "Expected AudioValidationException"
    except AudioValidationException as e:
        assert "empty (0 bytes)" in str(e)
    
    os.remove("test_real.wav")
    os.remove("test_empty.wav")

if __name__ == "__main__":
    test_audio_detector_real_file()
    test_audio_detector_empty_file()
    print("All tests passed successfully.")
