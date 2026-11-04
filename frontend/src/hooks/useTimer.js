import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useTimer — Countdown timer for exam duration.
 *
 * @param {number} durationInSeconds  - Total exam duration in seconds
 * @param {Function} onExpire         - Callback fired when timer hits 0
 *
 * Returns:
 *  - timeLeft    : remaining seconds
 *  - formatted   : "MM:SS" string for display
 *  - isRunning   : boolean
 *  - start()     : start/resume the timer
 *  - pause()     : pause the timer
 *  - reset()     : reset to original duration
 *
 * Usage:
 *  const { formatted, timeLeft } = useTimer(3600, handleAutoSubmit);
 */
const useTimer = (durationInSeconds, onExpire) => {
  const [timeLeft, setTimeLeft]   = useState(durationInSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef               = useRef(null);

  const stop = useCallback(() => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
  }, []);

  const start = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
  }, [isRunning]);

  const pause = useCallback(() => {
    stop();
  }, [stop]);

  const reset = useCallback(() => {
    stop();
    setTimeLeft(durationInSeconds);
  }, [stop, durationInSeconds]);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setIsRunning(false);
          onExpire && onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isRunning, onExpire]);

  // Format as MM:SS
  const minutes  = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const seconds  = String(timeLeft % 60).padStart(2, '0');
  const formatted = `${minutes}:${seconds}`;

  return { timeLeft, formatted, isRunning, start, pause, reset };
};

export default useTimer;
