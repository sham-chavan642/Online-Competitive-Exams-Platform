import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useExams from '../../hooks/useExams';
import useStudent from '../../hooks/useStudent';
import { storePreparedCameraStream, stopPreparedCameraStream } from '../../utils/examCamera';
import AppLayout from '../../components/AppLayout';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import {
  Clock,
  Award,
  Calendar,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  Shield,
  BookOpen
} from 'lucide-react';

const ExamDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getExamById, exam, loading: examLoading, error: examError } = useExams();
  const { startExam, loading: startingLoading, error: startError } = useStudent();
  const [error, setError] = useState(null);
  const [cameraConsent, setCameraConsent] = useState(false);
  const [candidateName, setCandidateName] = useState('');
  const [candidatePrn, setCandidatePrn] = useState('');

  useEffect(() => {
    if (id) {
      getExamById(id);
    }
  }, [id, getExamById]);

  const handleStartExam = async () => {
    let stream;
    try {
      setError(null);
      const requiresCandidateDetails = examData.require_candidate_details !== false && examData.require_candidate_details !== 0;
      if (requiresCandidateDetails && (!candidateName.trim() || !candidatePrn.trim())) {
        throw new Error('Please enter your name and PRN before starting the exam.');
      }
      if (!cameraConsent) {
        throw new Error('Please review and accept the camera monitoring notice before starting.');
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access is not available in this browser or connection.');
      }
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      storePreparedCameraStream(stream);
      const res = await startExam(id, {
        candidate_name: candidateName.trim(),
        candidate_prn: candidatePrn.trim(),
      });
      const attemptId = res?.attempt_id || res?.data?.attempt_id || res?.attemptId;
      if (attemptId) {
        navigate(`/student/exam/${attemptId}`);
      } else {
        throw new Error('Failed to initiate examination session');
      }
    } catch (err) {
      stopPreparedCameraStream();
      if (stream && !stream.getTracks().every((track) => track.readyState === 'ended')) {
        stream.getTracks().forEach((track) => track.stop());
      }
      setError(err.message || 'Unable to start exam. You may have already attempted this exam or the session is closed.');
    }
  };

  const loading = examLoading || startingLoading;
  const displayError = error || examError || startError;

  const examData = exam || {};
  const questionCount = examData.questions?.length || 0;
  const topicName = examData.topic_name || examData.topic?.name || examData.topic || 'General Aptitude';

  return (
    <AppLayout
      title="Examination Details"
      breadcrumbs={[
        { label: 'Portal', path: '/student/dashboard' },
        { label: 'Exams', path: '/student/exams' },
        { label: examData.exam_name || examData.title || 'Details' },
      ]}
    >
      <div style={{ maxWidth: '880px', margin: '0 auto' }}>
        <button
          className="btn btn-ghost btn-sm mb-4"
          onClick={() => navigate('/student/exams')}
        >
          ← Return to Available Exams
        </button>

        <ErrorMessage message={displayError} />

        {loading && !exam ? (
          <Loading text="Loading exam specifications..." />
        ) : exam ? (
          <div className="card" style={{ padding: '2.5rem 2rem' }}>
            {/* Header info */}
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.75rem', marginBottom: '1.75rem' }}>
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--primary-color)' }}>
                  <BookOpen size={14} />
                  <span>Topic: {topicName}</span>
                </div>
                <span className="badge badge-success">Eligible to Attempt</span>
              </div>

              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
                {examData.exam_name || examData.title}
              </h2>

              {examData.description && (
                <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {examData.description}
                </p>
              )}
            </div>

            {/* Key Test Specs Bar */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1rem',
                padding: '1.25rem',
                backgroundColor: 'var(--surface-muted)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                marginBottom: '2rem',
              }}
            >
              <div className="flex items-center gap-3">
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>DURATION</div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }} className="tabular-nums">
                    {examData.duration} Mins
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--status-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Award size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>TOTAL MARKS</div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }} className="tabular-nums">
                    {examData.total_marks || examData.totalMarks}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(2, 132, 199, 0.1)', color: 'var(--status-info)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HelpCircle size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>QUESTIONS</div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }} className="tabular-nums">
                    {questionCount > 0 ? questionCount : 'Configured'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(217, 119, 6, 0.1)', color: 'var(--status-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>SCHEDULE</div>
                  <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                    Active Window
                  </div>
                </div>
              </div>
            </div>

            {examData.require_candidate_details !== false && examData.require_candidate_details !== 0 && (
              <div
                className="card"
                style={{
                  padding: '1.25rem',
                  marginBottom: '1.5rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '1rem',
                }}
              >
                <label>
                  <span className="form-label">Candidate Name *</span>
                  <input
                    className="form-control"
                    type="text"
                    autoComplete="name"
                    maxLength={255}
                    value={candidateName}
                    onChange={(event) => setCandidateName(event.target.value)}
                    required
                  />
                </label>
                <label>
                  <span className="form-label">PRN *</span>
                  <input
                    className="form-control"
                    type="text"
                    autoComplete="off"
                    maxLength={100}
                    value={candidatePrn}
                    onChange={(event) => setCandidatePrn(event.target.value)}
                    required
                  />
                </label>
              </div>
            )}

            {/* Examination Rules & Instructions */}
            <div
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                backgroundColor: '#FFFFFF',
                marginBottom: '2rem',
              }}
            >
              <div className="flex items-center gap-2 mb-3" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem' }}>
                <Shield size={18} style={{ color: 'var(--primary-color)' }} />
                <span>Important Examination Guidelines</span>
              </div>

              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <li>
                  <strong style={{ color: 'var(--text-primary)' }}>Synchronized Timer:</strong> The timer begins immediately when you click <em>Start Examination</em> and cannot be paused.
                </li>
                <li>
                  <strong style={{ color: 'var(--text-primary)' }}>Continuous Saving:</strong> Your selected answers are synchronized with the server automatically as you choose each option.
                </li>
                <li>
                  <strong style={{ color: 'var(--text-primary)' }}>Question Navigation:</strong> You can jump to any question using the side Question Palette or Previous/Next controls.
                </li>
                <li>
                  <strong style={{ color: 'var(--text-primary)' }}>Review Flags:</strong> You may mark questions for review and return to reconsider your answers prior to final submission.
                </li>
                <li>
                  <strong style={{ color: 'var(--text-primary)' }}>Authoritative Auto-Submit:</strong> When the countdown timer expires, your test will be finalized and evaluated automatically.
                </li>
              </ul>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.625rem',
                  marginTop: '1rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={cameraConsent}
                  onChange={(event) => setCameraConsent(event.target.checked)}
                  style={{ marginTop: '0.2rem' }}
                />
                <span>
                  I consent to camera monitoring during this exam. The live preview and face detection stay in this browser;
                  no camera images or audio are uploaded or stored. Security event types and timestamps are recorded for
                  exam review along with brief technical status details. Browser controls cannot completely prevent cheating.
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end items-center gap-3">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate('/student/exams')}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={handleStartExam}
                disabled={
                  startingLoading ||
                  !cameraConsent ||
                  (examData.require_candidate_details !== false &&
                    examData.require_candidate_details !== 0 &&
                    (!candidateName.trim() || !candidatePrn.trim()))
                }
              >
                {startingLoading ? (
                  <span>Initializing Attempt Session...</span>
                ) : (
                  <>
                    <span>Enable Camera & Start Exam</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="card text-center" style={{ padding: '3rem' }}>
            <p>Exam details could not be retrieved.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ExamDetails;
