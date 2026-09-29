"""
Audio Feature Extraction and Validation Pipeline for RealCheck AI
Extracts acoustic, spectral, prosodic, and temporal features from audio streams.
"""
import io
import os
import tempfile
import logging
import numpy as np
from typing import Dict, Any, Tuple, List, Optional
import soundfile as sf
import librosa

logger = logging.getLogger("realcheck.audio.features")

class AudioValidationException(Exception):
    """Raised when audio fails format, size, or decoding validation."""
    pass

class AudioFeatureExtractor:
    def __init__(self, max_duration_sec: float = 300.0, target_sr: int = 16000):
        self.max_duration_sec = max_duration_sec
        self.target_sr = target_sr

    def decode_and_validate(
        self,
        file_path_or_content: Any,
        file_name: str = "audio.wav"
    ) -> Tuple[np.ndarray, int, float, Dict[str, Any]]:
        """
        Safely decode and validate raw audio bytes or file paths.
        Returns (audio_mono_array, sample_rate, duration_seconds, audio_metadata)
        """
        if file_path_or_content is None:
            raise AudioValidationException("No audio content provided.")

        raw_bytes = None
        orig_sr = None
        y = None
        channels = 1
        subtype = "PCM_16"
        format_name = "WAV"

        # Check raw bytes
        if isinstance(file_path_or_content, (bytes, bytearray)):
            raw_bytes = bytes(file_path_or_content)
            if len(raw_bytes) == 0:
                raise AudioValidationException("Uploaded audio file is empty (0 bytes).")
            if len(raw_bytes) > 50 * 1024 * 1024:
                raise AudioValidationException("Audio file exceeds maximum allowed size of 50 MB.")

            # Try decoding via soundfile (in-memory)
            try:
                with io.BytesIO(raw_bytes) as bio:
                    info = sf.info(bio)
                    channels = info.channels
                    orig_sr = info.samplerate
                    subtype = info.subtype
                    format_name = info.format
                    bio.seek(0)
                    data, orig_sr = sf.read(bio, dtype="float32", always_2d=False)
                    y = data
            except Exception as sf_err:
                # If soundfile in-memory read fails, try file-based decoding
                ext = os.path.splitext(file_name)[1].lower()
                if not ext:
                    ext = ".wav"
                
                if ext in [".m4a", ".aac", ".mp4"]:
                    raise AudioValidationException(
                        f"M4A/AAC format ({ext}) cannot be decoded because system ffmpeg is not available. "
                        "Please upload a standard WAV, MP3, FLAC, or OGG audio file."
                    )

                temp_path = None
                try:
                    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tf:
                        tf.write(raw_bytes)
                        temp_path = tf.name

                    # Try librosa / soundfile
                    data, orig_sr = librosa.load(temp_path, sr=None, mono=False)
                    if data.ndim > 1:
                        channels = data.shape[0]
                        y = data
                    else:
                        channels = 1
                        y = data
                except Exception as lib_err:
                    err_str = str(lib_err) or str(sf_err)
                    if "format not recognized" in err_str.lower() or "unsupported" in err_str.lower():
                        raise AudioValidationException(
                            f"Unsupported or unrecognized audio encoding in '{file_name}'. "
                            "Supported formats: WAV, MP3, FLAC, OGG."
                        )
                    raise AudioValidationException(f"Failed to decode audio file '{file_name}': {err_str}")
                finally:
                    if temp_path and os.path.exists(temp_path):
                        try:
                            os.unlink(temp_path)
                        except OSError:
                            pass

        elif isinstance(file_path_or_content, str):
            if not os.path.exists(file_path_or_content):
                raise AudioValidationException(f"Audio file path '{file_path_or_content}' does not exist.")
            if os.path.getsize(file_path_or_content) == 0:
                raise AudioValidationException("Audio file on disk is empty (0 bytes).")
            
            try:
                info = sf.info(file_path_or_content)
                channels = info.channels
                orig_sr = info.samplerate
                subtype = info.subtype
                format_name = info.format
                data, orig_sr = sf.read(file_path_or_content, dtype="float32", always_2d=False)
                y = data
            except Exception:
                try:
                    data, orig_sr = librosa.load(file_path_or_content, sr=None, mono=False)
                    if data.ndim > 1:
                        channels = data.shape[0]
                        y = data
                    else:
                        channels = 1
                        y = data
                except Exception as e:
                    raise AudioValidationException(f"Could not load audio file: {str(e)}")
        else:
            raise AudioValidationException(f"Unsupported input type: {type(file_path_or_content)}")

        if y is None or len(y) == 0:
            raise AudioValidationException("Decoded audio contains no samples.")

        # Convert to mono if multi-channel
        if y.ndim > 1:
            if y.shape[0] == channels and channels > 1:
                # librosa shape is (channels, samples)
                y = np.mean(y, axis=0)
            elif y.shape[1] == channels and channels > 1:
                # soundfile shape is (samples, channels)
                y = np.mean(y, axis=1)

        # Sanitize non-finite values (NaN / Inf)
        y = np.nan_to_num(y, nan=0.0, posinf=1.0, neginf=-1.0)

        # Resample to standard target sample rate if needed
        if orig_sr != self.target_sr:
            y = librosa.resample(y, orig_sr=orig_sr, target_sr=self.target_sr)
            sr = self.target_sr
        else:
            sr = orig_sr

        duration = float(len(y)) / float(sr)
        if duration < 0.5:
            raise AudioValidationException(
                f"Audio duration ({duration:.2f}s) is too short. "
                "Minimum required duration for forensic acoustic analysis is 0.5 seconds."
            )

        if duration > self.max_duration_sec:
            # Truncate to maximum duration
            max_samples = int(self.max_duration_sec * sr)
            y = y[:max_samples]
            duration = self.max_duration_sec
            logger.warning(f"Audio truncated to maximum duration of {self.max_duration_sec}s.")

        audio_metadata = {
            "channels": channels,
            "orig_sample_rate": orig_sr,
            "analysis_sample_rate": sr,
            "duration_sec": duration,
            "sample_count": len(y),
            "format_name": format_name,
            "subtype": subtype
        }

        return y, sr, duration, audio_metadata

    def extract_features(
        self,
        y: np.ndarray,
        sr: int,
        duration: float
    ) -> Dict[str, Any]:
        """
        Extract deterministic acoustic, spectral, prosodic, and temporal features.
        """
        # 1. Waveform Envelope (60 normalized bins for UI visualizer)
        envelope_bins = 60
        bin_size = max(1, len(y) // envelope_bins)
        envelope = []
        for i in range(envelope_bins):
            start = i * bin_size
            end = min(len(y), (i + 1) * bin_size)
            chunk = y[start:end]
            val = float(np.max(np.abs(chunk))) if len(chunk) > 0 else 0.05
            envelope.append(round(max(0.08, min(1.0, val)), 3))

        # Peak and Clipping check
        peak_amp = float(np.max(np.abs(y)))
        clipping_ratio = float(np.mean(np.abs(y) >= 0.98))

        # 2. RMS Energy & Dynamics
        rms = librosa.feature.rms(y=y, frame_length=1024, hop_length=512)[0]
        mean_rms = float(np.mean(rms))
        std_rms = float(np.std(rms))
        max_rms = float(np.max(rms)) if len(rms) > 0 else 1e-4
        min_rms = float(np.min(rms)) if len(rms) > 0 else 1e-4
        dynamic_range_db = float(20 * np.log10(max(1e-4, max_rms) / max(1e-6, min_rms + 1e-6)))
        if max_rms < 1e-5:
            silence_ratio = 1.0
        else:
            silence_ratio = float(np.mean(rms < (0.05 * max_rms)))

        # 3. Zero-Crossing Rate
        zcr = librosa.feature.zero_crossing_rate(y=y, frame_length=1024, hop_length=512)[0]
        mean_zcr = float(np.mean(zcr))
        std_zcr = float(np.std(zcr))

        # 4. Spectral Features
        cent = librosa.feature.spectral_centroid(y=y, sr=sr, hop_length=512)[0]
        mean_cent = float(np.mean(cent))
        std_cent = float(np.std(cent))

        bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr, hop_length=512)[0]
        mean_bandwidth = float(np.mean(bandwidth))

        rolloff_85 = librosa.feature.spectral_rolloff(y=y, sr=sr, roll_percent=0.85, hop_length=512)[0]
        mean_rolloff_85 = float(np.mean(rolloff_85))

        rolloff_95 = librosa.feature.spectral_rolloff(y=y, sr=sr, roll_percent=0.95, hop_length=512)[0]
        mean_rolloff_95 = float(np.mean(rolloff_95))

        flatness = librosa.feature.spectral_flatness(y=y, hop_length=512)[0]
        mean_flatness = float(np.mean(flatness))

        # 5. MFCCs (13 coefficients)
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13, hop_length=512)
        mfcc_means = [float(np.mean(mfccs[i])) for i in range(13)]
        mfcc_vars = [float(np.var(mfccs[i])) for i in range(13)]
        mean_mfcc_var = float(np.mean(mfcc_vars))

        # 6. Fundamental Frequency ($f_0$ pitch tracking)
        # Using YIN algorithm bounded to human voice range (60 - 450 Hz)
        mean_f0 = 0.0
        std_f0 = 0.0
        f0_min = 0.0
        f0_max = 0.0
        voiced_ratio = 0.0
        unvoiced_ratio = 1.0
        period_jitter_pct = 0.0
        period_jitter_abs = 0.0
        try:
            f0 = librosa.yin(y, fmin=60, fmax=450, sr=sr, hop_length=512)
            valid_f0 = f0[(f0 > 65) & (f0 <= 450) & ~np.isnan(f0)]
            if len(valid_f0) > 0:
                mean_f0 = float(np.mean(valid_f0))
                std_f0 = float(np.std(valid_f0))
                f0_min = float(np.min(valid_f0))
                f0_max = float(np.max(valid_f0))
                voiced_ratio = float(len(valid_f0) / len(f0))
                unvoiced_ratio = 1.0 - voiced_ratio
                
                # Micro-jitter (cycle-to-cycle period variation)
                if len(valid_f0) > 1:
                    periods = 1.0 / valid_f0
                    period_diffs = np.abs(np.diff(periods))
                    period_jitter_abs = float(np.mean(period_diffs))
                    mean_period = float(np.mean(periods))
                    if mean_period > 0:
                        period_jitter_pct = (period_jitter_abs / mean_period) * 100.0
        except Exception as e:
            logger.debug(f"Pitch extraction skipped: {e}")

        # 6.5. Additional Spectral & Energy (STFT-based)
        # Spectral flux (abrupt spectral changes)
        S = np.abs(librosa.stft(y, n_fft=1024, hop_length=512))
        S_norm = S / (S.max() + 1e-8)
        spectral_flux = float(np.mean(np.sqrt(np.sum(np.diff(S_norm, axis=1)**2, axis=0))))
        
        # High frequency energy ratio (above 4000 Hz)
        freqs = librosa.fft_frequencies(sr=sr, n_fft=1024)
        high_freq_idx = np.where(freqs > 4000)[0]
        if len(high_freq_idx) > 0 and S.sum() > 0:
            high_freq_energy_ratio = float(np.sum(S[high_freq_idx, :]) / np.sum(S))
        else:
            high_freq_energy_ratio = 0.0

        # 7. Time Segment Breakdown (slices of 2s - 5s for timeline visualization)
        segment_duration = max(2.0, min(5.0, duration / 4.0))
        num_segments = max(2, int(np.ceil(duration / segment_duration)))
        segments = []

        for idx in range(num_segments):
            start_sec = idx * segment_duration
            end_sec = min(duration, (idx + 1) * segment_duration)
            if start_sec >= duration:
                break
            
            start_frame = int(start_sec * sr)
            end_frame = int(end_sec * sr)
            chunk_y = y[start_frame:end_frame]
            
            if len(chunk_y) == 0:
                continue

            chunk_rms = float(np.mean(np.abs(chunk_y)))
            chunk_peak = float(np.max(np.abs(chunk_y)))
            
            # Segment risk heuristic
            seg_risk = "Normal"
            anomaly_type = "Harmonic Baseline"
            desc = f"Spectral continuity and energy balance within normal human voice range ({start_sec:.1f}s - {end_sec:.1f}s)."

            if chunk_rms < 0.005:
                seg_risk = "Amber"
                anomaly_type = "Low Energy / Silent Pause"
                desc = "Near-zero acoustic energy region; pause between speech phrases."
            elif chunk_peak >= 0.98:
                seg_risk = "Amber"
                anomaly_type = "Waveform Clipping / Saturation"
                desc = "Amplitude levels reach DAC ceiling resulting in waveform clipping."
            elif mean_flatness > 0.15 and std_f0 < 10.0:
                seg_risk = "High"
                anomaly_type = "Synthetic Phase Incoherence"
                desc = "Elevated spectral flatness with unnaturally static pitch harmonics."

            start_m, start_s = divmod(int(start_sec), 60)
            end_m, end_s = divmod(int(end_sec), 60)

            segments.append({
                "start_time": f"{start_m:02d}:{start_s:02d}",
                "end_time": f"{end_m:02d}:{end_s:02d}",
                "start_seconds": round(start_sec, 2),
                "end_seconds": round(end_sec, 2),
                "risk_level": seg_risk,
                "anomaly_type": anomaly_type,
                "description": desc
            })

        return {
            "waveform_envelope": envelope,
            "peak_amp": peak_amp,
            "clipping_ratio": clipping_ratio,
            "mean_rms": mean_rms,
            "std_rms": std_rms,
            "max_rms": max_rms,
            "dynamic_range_db": dynamic_range_db,
            "silence_ratio": silence_ratio,
            "mean_zcr": mean_zcr,
            "std_zcr": std_zcr,
            "mean_cent": mean_cent,
            "std_cent": std_cent,
            "mean_bandwidth": mean_bandwidth,
            "mean_rolloff_85": mean_rolloff_85,
            "mean_rolloff_95": mean_rolloff_95,
            "mean_flatness": mean_flatness,
            "mfcc_means": mfcc_means,
            "mfcc_vars": mfcc_vars,
            "mean_mfcc_var": mean_mfcc_var,
            "mean_f0": mean_f0,
            "std_f0": std_f0,
            "f0_min": f0_min,
            "f0_max": f0_max,
            "voiced_ratio": voiced_ratio,
            "unvoiced_ratio": unvoiced_ratio,
            "period_jitter_pct": period_jitter_pct,
            "period_jitter_abs": period_jitter_abs,
            "spectral_flux": spectral_flux,
            "high_freq_energy_ratio": high_freq_energy_ratio,
            "segments": segments
        }
