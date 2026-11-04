import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useExamAttempt from '../../hooks/useExamAttempt';
import useExamSecurity from '../../hooks/useExamSecurity';
import useFetch from '../../hooks/useFetch';
import { getRemainingExamSeconds } from '../../utils/examTimer';
import QuestionCard from '../../components/QuestionCard';
import QuestionNavigation from '../../components/QuestionNavigation';
import Timer from '../../components/Timer';
import Modal from '../../components/Modal';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import {
  ShieldAlert,
  Send,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

const ExamPage = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { request } = useFetch();

  const {
    answers,
    submitted,
    loading: attemptLoading,
    error: attemptError,
    submitAnswer,
    submitExam,
  } = useExamAttempt(attemptId);

  const [examData, setExamData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialSeconds, setInitialSeconds] = useState(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState({});
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saving' | 'saved' | 'error'

  const autoSubmittedRef = useRef(false);
  const examRootRef = useRef(null);

  useEffect(() => {
    const fetchAttemptData = async () => {
      try {
        setLoading(true);
        const res = await request(`/student/attempts/${attemptId}`);
        const data = res?.data || res;
        if (!data || !data.exam) {
          throw new Error('Exam attempt information is not accessible.');
        }

        const exam = data.exam;
        const attempt = data.attempt;

        // If attempt was already submitted, redirect to results
        if (attempt?.status === 'SUBMITTED') {
          navigate('/student/results');
          return;
        }

        setExamData(exam);
        const qList = exam.questions || [];
        setQuestions(qList);

        // Prepopulate stored answers
        if (data.answers && Array.isArray(data.answers)) {
          const map = {};
          data.answers.forEach((a) => {
            map[a.question_id] = a.option_id;
          });
          setSelectedAnswers(map);
        }

        // Calculate timer
        const remaining = attempt?.remaining_seconds != null
          ? Number(attempt.remaining_seconds)
          : getRemainingExamSeconds(exam.duration || 60, attempt?.started_at);
        if (remaining === null || !Number.isFinite(remaining)) {
          throw new Error('Could not determine the exam start time. Please reload the attempt or contact an administrator.');
        }
        setInitialSeconds(remaining);
      } catch (err) {
        setError(err.message || 'Failed to load test attempt.');
      } finally {
        setLoading(false);
      }
    };

    if (attemptId) {
      fetchAttemptData();
    }
  }, [attemptId, request, navigate]);

  const security = useExamSecurity({
    attemptId,
    active: !loading && !error && !attemptError && Boolean(examData) && !submitted,
    onAutoSubmit: (event) => {
      autoSubmittedRef.current = true;
      navigate(event.result_id ? `/student/results/${event.result_id}` : '/student/results');
    },
  });
  const { videoRef, recordEvent: recordSecurityEvent } = security;

  useEffect(() => {
    const handleShortcut = (event) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      const eventType = {
        c: 'copy_attempt',
        x: 'cut_attempt',
        v: 'paste_attempt',
      }[event.key.toLowerCase()];
      if (!eventType) return;

      event.preventDefault();
      event.stopPropagation();
      void recordSecurityEvent(eventType);
    };

    const blockClipboard = (event) => {
      event.preventDefault();
      event.stopPropagation();
      const eventType = {
        copy: 'copy_attempt',
        cut: 'cut_attempt',
        paste: 'paste_attempt',
      }[event.type];
      void recordSecurityEvent(eventType);
    };

    document.addEventListener('keydown', handleShortcut, true);
    document.addEventListener('copy', blockClipboard, true);
    document.addEventListener('cut', blockClipboard, true);
    document.addEventListener('paste', blockClipboard, true);
    return () => {
      document.removeEventListener('keydown', handleShortcut, true);
      document.removeEventListener('copy', blockClipboard, true);
      document.removeEventListener('cut', blockClipboard, true);
      document.removeEventListener('paste', blockClipboard, true);
    };
  }, [recordSecurityEvent]);

  const handleSelectOption = async (optionId) => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    const qId = currentQ.question_id || currentQ.id;

    // Optimistically record selected option
    setSelectedAnswers((prev) => ({
      ...prev,
      [qId]: optionId,
    }));

    setSaveStatus('saving');
    try {
      await submitAnswer(qId, optionId);
      setSaveStatus('saved');
    } catch (err) {
      console.warn('Auto-save encountered an error:', err);
      setSaveStatus('error');
    }
  };

  const handleToggleFlag = () => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [currentIndex]: !prev[currentIndex],
    }));
  };

  const handleFinalSubmit = useCallback(async () => {
    if (autoSubmittedRef.current || isSubmitting) return;
    autoSubmittedRef.current = true;
    try {
      setIsSubmitting(true);
      await recordSecurityEvent('camera_stopped');
      await submitExam();
      setIsSubmitModalOpen(false);
      navigate('/student/results');
    } catch (err) {
      setError(err.message || 'Submission failed. Please check your connection and try again.');
      autoSubmittedRef.current = false;
      setIsSubmitting(false);
    }
  }, [submitExam, navigate, isSubmitting, recordSecurityEvent]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--background-color)' }}>
        <Loading text="Initializing secure test environment..." />
      </div>
    );
  }

  if (error || attemptError) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--background-color)', padding: '1.5rem' }}>
        <div className="card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
          <ShieldAlert size={48} style={{ color: 'var(--status-error)', margin: '0 auto 1rem' }} />
          <h3>Exam Session Alert</h3>
          <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
            {error || attemptError}
          </p>
          <button className="btn btn-primary w-full" onClick={() => navigate('/student/exams')}>
            Return to Available Exams
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--background-color)', padding: '1.5rem' }}>
        <div className="card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
          <h3>No Questions Assigned</h3>
          <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
            There are no questions attached to this exam module. Please contact the administrator.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/student/exams')}>
            Back to Available Exams
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const currentQId = currentQuestion?.question_id || currentQuestion?.id;
  const currentSelectedOption = selectedAnswers[currentQId] || answers[currentQId];

  // Map answered status
  const answeredStatusArray = questions.map((q) => {
    const id = q.question_id || q.id;
    return !!(selectedAnswers[id] || answers[id]);
  });

  const totalAnswered = answeredStatusArray.filter(Boolean).length;
  const totalFlagged = Object.values(flaggedQuestions).filter(Boolean).length;
  const isCurrentFlagged = !!flaggedQuestions[currentIndex];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background-color)', display: 'flex', flexDirection: 'column' }}>
      {!security.fullscreenActive && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="exam-fullscreen-heading"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            backgroundColor: 'rgba(15, 23, 42, 0.88)',
          }}
        >
          <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '2rem', textAlign: 'center' }}>
            <ShieldAlert size={40} style={{ color: 'var(--status-warning)', margin: '0 auto 1rem' }} />
            <h2 id="exam-fullscreen-heading">Full-screen required</h2>
            <p style={{ color: 'var(--text-secondary)', margin: '0.75rem 0 1.25rem' }}>
              Return to full-screen to continue your exam. Leaving the exam tab is recorded and cannot be blocked by the browser.
            </p>
            {security.securityError && (
              <p role="alert" style={{ color: 'var(--status-error)', marginBottom: '1rem' }}>{security.securityError}</p>
            )}
            <button type="button" className="btn btn-primary" onClick={security.enterFullscreen}>
              Return to Full Screen
            </button>
          </div>
        </div>
      )}

      {/* Sticky Exam Navigation Bar */}
      <header className="exam-taking-header">
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {examData?.exam_name || examData?.title || 'Competitive Exam'}
          </h2>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span aria-hidden="true">·</span>
            <span>Answered: {totalAnswered}/{questions.length}</span>
            {saveStatus === 'saving' && (
              <>
                <span aria-hidden="true">·</span>
                <span style={{ color: 'var(--primary-color)' }}>Saving answer...</span>
              </>
            )}
            {saveStatus === 'saved' && totalAnswered > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1" style={{ color: 'var(--status-success)' }}>
                  <CheckCircle2 size={12} /> Saved
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {initialSeconds !== null && (
            <Timer initialSeconds={initialSeconds} onTimeUp={handleFinalSubmit} />
          )}

          <button
            type="button"
            className="btn btn-danger"
            onClick={() => setIsSubmitModalOpen(true)}
            disabled={isSubmitting}
          >
            <Send size={15} />
            <span>Finish & Submit</span>
          </button>
        </div>
      </header>

      <section
        className="card"
        aria-live="polite"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          margin: '1rem 1.5rem 0',
          padding: '0.75rem 1rem',
        }}
      >
        <video
          ref={videoRef}
          muted
          playsInline
          aria-label="Local exam camera preview"
          style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: 'var(--radius-md)', backgroundColor: '#111827' }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
            Camera: {security.cameraStatus}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {security.faceStatus} · Violations: {security.violationCount}/{security.violationLimit}
            {security.autoSubmitEnabled ? ' · Auto-submit enabled' : ''}
          </div>
          {(security.warning || security.securityError) && (
            <div role="alert" style={{ color: 'var(--status-error)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
              {security.warning || security.securityError}
              {security.warning && security.securityError ? ` ${security.securityError}` : ''}
            </div>
          )}
        </div>
      </section>

      {security.tabSwitchAlert && security.fullscreenActive && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="tab-switch-heading"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            backgroundColor: 'rgba(15, 23, 42, 0.78)',
          }}
        >
          <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '2rem', textAlign: 'center' }}>
            <ShieldAlert size={40} style={{ color: 'var(--status-warning)', margin: '0 auto 1rem' }} />
            <h2 id="tab-switch-heading">Exam tab switch detected</h2>
            <p style={{ color: 'var(--text-secondary)', margin: '0.75rem 0 1.25rem' }}>
              This violation has been recorded. Tab switching cannot be blocked by the browser. Confirm to resume the exam.
            </p>
            <button type="button" className="btn btn-primary" onClick={security.dismissTabSwitchAlert}>
              Acknowledge and Resume
            </button>
          </div>
        </div>
      )}

      {/* Main Examination Viewport */}
      <main
        ref={examRootRef}
        className="exam-taking-content"
        style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
        onCopy={(event) => {
          event.preventDefault();
          void security.recordEvent('copy_attempt');
        }}
        onCut={(event) => {
          event.preventDefault();
          void security.recordEvent('cut_attempt');
        }}
        onPaste={(event) => {
          event.preventDefault();
          void security.recordEvent('paste_attempt');
        }}
        onContextMenu={(event) => {
          event.preventDefault();
          void security.recordEvent('context_menu_attempt');
        }}
      >
        {/* Left Column: Current Question */}
        <div>
          <QuestionCard
            question={currentQuestion}
            index={currentIndex + 1}
            total={questions.length}
            selectedOption={currentSelectedOption}
            onSelect={handleSelectOption}
            isFlagged={isCurrentFlagged}
            onToggleFlag={handleToggleFlag}
          />

          {/* Navigation Controls */}
          <div className="flex justify-between items-center mt-6">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
            >
              <ChevronLeft size={16} />
              <span>Previous Question</span>
            </button>

            <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--text-secondary)' }}>
              {currentIndex + 1} / {questions.length}
            </span>

            {currentIndex < questions.length - 1 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              >
                <span>Next Question</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsSubmitModalOpen(true)}
              >
                <span>Review & Submit</span>
                <Send size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Question Palette Sidebar */}
        <aside>
          <QuestionNavigation
            total={questions.length}
            current={currentIndex + 1}
            answeredMap={answeredStatusArray}
            flaggedMap={flaggedQuestions}
            onNavigate={(qNumber) => setCurrentIndex(qNumber - 1)}
          />
        </aside>
      </main>

      {/* Submission Confirmation Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        title="Confirm Examination Submission"
        onClose={() => setIsSubmitModalOpen(false)}
      >
        <div>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            Are you sure you want to finish your examination? Once submitted, your answers will be graded immediately and you will not be able to change them.
          </p>

          <div
            style={{
              backgroundColor: 'var(--surface-muted)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              padding: '1.25rem',
              marginBottom: '1.5rem',
            }}
          >
            <div className="flex justify-between items-center mb-2 text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>Total Questions:</span>
              <strong className="tabular-nums">{questions.length}</strong>
            </div>

            <div className="flex justify-between items-center mb-2 text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>Answered:</span>
              <strong className="tabular-nums" style={{ color: 'var(--status-success)' }}>
                {totalAnswered}
              </strong>
            </div>

            <div className="flex justify-between items-center mb-2 text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>Flagged for Review:</span>
              <strong className="tabular-nums" style={{ color: 'var(--status-warning)' }}>
                {totalFlagged}
              </strong>
            </div>

            <div className="flex justify-between items-center text-sm pt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Unanswered:</span>
              <strong className="tabular-nums" style={{ color: questions.length - totalAnswered > 0 ? 'var(--status-error)' : 'var(--text-primary)' }}>
                {questions.length - totalAnswered}
              </strong>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsSubmitModalOpen(false)}
              disabled={isSubmitting}
            >
              Continue Test
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span>Grading & Submitting...</span>
              ) : (
                <>
                  <Send size={15} />
                  <span>Yes, Finalize & Submit</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ExamPage;
