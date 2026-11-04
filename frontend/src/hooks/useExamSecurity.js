import { useCallback, useEffect, useRef, useState } from 'react';
import { examSecurityApi } from '../services/examSecurityApi';
import { takePreparedCameraStream } from '../utils/examCamera';

const FACE_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite';

const EVENT_LABELS = {
  tab_hidden: 'Leaving the exam tab is recorded.',
  fullscreen_exit: 'Exiting full-screen mode is recorded.',
  copy_attempt: 'Copying exam content is disabled and recorded.',
  cut_attempt: 'Cutting exam content is disabled and recorded.',
  paste_attempt: 'Pasting into the exam is disabled and recorded.',
  context_menu_attempt: 'The exam context menu is disabled and recorded.',
  camera_permission_denied: 'Camera permission is unavailable.',
  camera_disconnected: 'The camera disconnected.',
  face_missing: 'No face is visible in the camera.',
  multiple_faces: 'More than one face is visible in the camera.',
};

const useExamSecurity = ({ attemptId, active, onAutoSubmit }) => {
  const videoRef = useRef(null);
  const autoSubmitRef = useRef(false);
  const onAutoSubmitRef = useRef(onAutoSubmit);
  const eventTimesRef = useRef({});
  const [cameraStatus, setCameraStatus] = useState('Starting camera...');
  const [faceStatus, setFaceStatus] = useState('Face detection is starting...');
  const [settings, setSettings] = useState({ violation_limit: 3, auto_submit: 0 });
  const [violationCount, setViolationCount] = useState(0);
  const [warning, setWarning] = useState('');
  const [securityError, setSecurityError] = useState('');
  const [fullscreenActive, setFullscreenActive] = useState(Boolean(document.fullscreenElement));
  const [tabSwitchAlert, setTabSwitchAlert] = useState(false);

  useEffect(() => {
    onAutoSubmitRef.current = onAutoSubmit;
  }, [onAutoSubmit]);

  const recordEvent = useCallback(async (eventType, details) => {
    const now = Date.now();
    const lastRecorded = eventTimesRef.current[eventType] || 0;
    if (now - lastRecorded < 750) return null;
    eventTimesRef.current[eventType] = now;
    setWarning(EVENT_LABELS[eventType] || 'An exam security event was recorded.');

    try {
      const event = await examSecurityApi.recordEvent(attemptId, eventType, details);
      setViolationCount(event.violation_count);
      setSettings((previous) => ({
        ...previous,
        violation_limit: event.violation_limit,
      }));
      if (event.auto_submitted && !autoSubmitRef.current) {
        autoSubmitRef.current = true;
        onAutoSubmitRef.current?.(event);
      }
      return event;
    } catch (error) {
      setSecurityError(error.response?.data?.message || error.message || 'Could not save an exam security event.');
      return null;
    }
  }, [attemptId]);

  useEffect(() => {
    if (!active || !attemptId) return undefined;
    let cancelled = false;
    let stream;
    let detector;
    let detectionTimer;
    const videoElement = videoRef.current;
    let hasEnteredFullscreen = Boolean(document.fullscreenElement);
    let lastFaceEvent = '';
    let candidateFaceEvent = '';
    let consecutiveFaceFrames = 0;
    let lastVideoTime = -1;

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setTabSwitchAlert(true);
        void recordEvent('tab_hidden');
      } else if (document.visibilityState === 'visible' && document.fullscreenElement) {
        setWarning('You switched away from the exam. This violation has been recorded.');
      }
    };
    const onFullscreenChange = () => {
      if (document.fullscreenElement) {
        hasEnteredFullscreen = true;
        setFullscreenActive(true);
      } else if (hasEnteredFullscreen) {
        hasEnteredFullscreen = false;
        setFullscreenActive(false);
        void recordEvent('fullscreen_exit');
      } else {
        setFullscreenActive(false);
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    document.addEventListener('fullscreenchange', onFullscreenChange);

    const initialize = async () => {
      try {
        const preparedStream = takePreparedCameraStream();
        let attemptSettings = { violation_limit: 3, auto_submit: 0, violation_count: 0 };
        try {
          attemptSettings = await examSecurityApi.getAttemptSettings(attemptId);
        } catch (error) {
          setSecurityError(error.response?.data?.message || error.message || 'Could not load exam security settings.');
        }
        if (cancelled) {
          preparedStream?.getTracks().forEach((track) => track.stop());
          return;
        }
        setSettings(attemptSettings);
        setViolationCount(attemptSettings.violation_count || 0);

        stream = preparedStream || await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        const videoTrack = stream.getVideoTracks()[0];
        if (!videoTrack) throw new Error('No camera video track is available.');
        videoTrack.onended = () => {
          setCameraStatus('Camera disconnected');
          void recordEvent('camera_disconnected');
        };
        videoTrack.onmute = () => {
          setCameraStatus('Camera temporarily unavailable');
          void recordEvent('camera_disconnected', 'Camera video track was muted');
        };
        videoTrack.onunmute = () => setCameraStatus('Camera active');
        if (videoElement) {
          videoElement.srcObject = stream;
          await videoElement.play();
        }
        setCameraStatus('Camera active');
        void examSecurityApi.recordEvent(attemptId, 'camera_started')
          .catch((error) => setSecurityError(error.response?.data?.message || error.message || 'Could not save camera status.'));

        try {
          const [
            { FaceDetector },
            { default: visionWasmLoader },
            { default: visionWasmBinary },
          ] = await Promise.all([
            import('@mediapipe/tasks-vision'),
            import('@mediapipe/tasks-vision/vision_wasm_internal.js?url'),
            import('@mediapipe/tasks-vision/vision_wasm_internal.wasm?url'),
          ]);
          const fileset = {
            wasmLoaderPath: visionWasmLoader,
            wasmBinaryPath: visionWasmBinary,
          };
          detector = await FaceDetector.createFromOptions(fileset, {
            baseOptions: { modelAssetPath: FACE_MODEL_URL },
            runningMode: 'VIDEO',
            minDetectionConfidence: 0.6,
          });
        } catch (error) {
          setFaceStatus('Face detection unavailable');
          setSecurityError(error.message || 'Could not load face detection.');
          void recordEvent('face_detection_unavailable', error.message);
          return;
        }
        if (cancelled) {
          detector.close();
          return;
        }
        setFaceStatus('Face detection active');

        detectionTimer = window.setInterval(() => {
          const video = videoElement;
          if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
              video.currentTime === lastVideoTime || !detector) return;
          lastVideoTime = video.currentTime;
          try {
            const faceCount = detector.detectForVideo(video, performance.now()).detections.length;
            const eventType = faceCount === 0 ? 'face_missing' : faceCount > 1 ? 'multiple_faces' : '';
            setFaceStatus(faceCount === 0 ? 'No face detected' : faceCount > 1 ? 'Multiple faces detected' : 'One face detected');
            if (!eventType) {
              candidateFaceEvent = '';
              consecutiveFaceFrames = 0;
              lastFaceEvent = '';
              return;
            }
            if (candidateFaceEvent === eventType) consecutiveFaceFrames += 1;
            else {
              candidateFaceEvent = eventType;
              consecutiveFaceFrames = 1;
            }
            if (consecutiveFaceFrames >= 3 && lastFaceEvent !== eventType) {
              lastFaceEvent = eventType;
              void recordEvent(eventType);
            }
          } catch (error) {
            setFaceStatus('Face detection unavailable');
            setSecurityError(error.message || 'Face detection failed.');
          }
        }, 700);
      } catch (error) {
        if (cancelled) return;
        const denied = error.name === 'NotAllowedError' || error.name === 'SecurityError';
        setCameraStatus(denied ? 'Camera permission denied' : 'Camera unavailable');
        setFaceStatus('Face detection unavailable');
        await recordEvent(denied ? 'camera_permission_denied' : 'camera_disconnected', error.message);
      }
    };

    void initialize();

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibilityChange);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      if (detectionTimer) window.clearInterval(detectionTimer);
      if (detector) detector.close();
      if (stream) {
        stream.getVideoTracks().forEach((track) => {
          track.onended = null;
          track.onmute = null;
          track.onunmute = null;
        });
        stream.getTracks().forEach((track) => track.stop());
      }
      if (videoElement) videoElement.srcObject = null;
      if (document.fullscreenElement) {
        void document.exitFullscreen().catch((error) => {
          setSecurityError(error.message || 'Could not exit full-screen mode.');
        });
      }
    };
  }, [active, attemptId, recordEvent]);

  const enterFullscreen = useCallback(async () => {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      try {
        await document.documentElement.requestFullscreen();
        setFullscreenActive(true);
      } catch (error) {
        setSecurityError(error.message || 'Could not enter full-screen mode.');
      }
    }
  }, []);

  return {
    videoRef,
    cameraStatus,
    faceStatus,
    violationCount,
    violationLimit: settings.violation_limit,
    autoSubmitEnabled: Boolean(settings.auto_submit),
    warning,
    securityError,
    fullscreenActive,
    tabSwitchAlert,
    dismissTabSwitchAlert: () => setTabSwitchAlert(false),
    recordEvent,
    enterFullscreen,
  };
};

export default useExamSecurity;
