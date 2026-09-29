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

def test_feature_extractor_sine_wave():
    from app.detectors.audio.features import AudioFeatureExtractor
    import librosa
    
    extractor = AudioFeatureExtractor()
    sr = 16000
    duration = 1.0
    t = np.linspace(0, duration, int(sr * duration))
    # 440 Hz sine wave with 0.8 amplitude to prevent clipping
    y = 0.8 * np.sin(2 * np.pi * 440 * t)
    
    features = extractor.extract_features(y, sr, duration)
    
    # Assert pitch is around 440 Hz
    assert 435 < features["mean_f0"] < 445
    assert features["voiced_ratio"] > 0.8
    # Assert very low jitter for perfect sine wave
    assert features["period_jitter_pct"] < 5.0
    # Assert zero clipping
    assert features["clipping_ratio"] == 0.0

def test_feature_extractor_silence():
    from app.detectors.audio.features import AudioFeatureExtractor
    
    extractor = AudioFeatureExtractor()
    sr = 16000
    duration = 1.0
    y = np.zeros(int(sr * duration))
    
    features = extractor.extract_features(y, sr, duration)
    
    # Assert low energy and high silence ratio
    assert features["mean_rms"] < 1e-4
    assert features["silence_ratio"] > 0.9
    # Unvoiced ratio should be 1.0
    assert features["unvoiced_ratio"] == 1.0

def test_feature_extractor_mixed_frequencies():
    from app.detectors.audio.features import AudioFeatureExtractor
    
    extractor = AudioFeatureExtractor()
    sr = 16000
    duration = 1.0
    t = np.linspace(0, duration, int(sr * duration))
    # Mix of 200 Hz and 5000 Hz (high freq)
    y = np.sin(2 * np.pi * 200 * t) + 0.5 * np.sin(2 * np.pi * 5000 * t)
    
    features = extractor.extract_features(y, sr, duration)
    
    # Should have some high frequency energy
    assert features["high_freq_energy_ratio"] > 0.05
    # Should not be entirely flat
    assert features["mean_flatness"] < 1.0

if __name__ == "__main__":
    test_audio_detector_real_file()
    test_audio_detector_empty_file()
    test_feature_extractor_sine_wave()
    test_feature_extractor_silence()
    test_feature_extractor_mixed_frequencies()
    print("All tests passed successfully.")
