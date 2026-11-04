import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { attemptApi } from '../../services/attemptApi';
import api from '../../services/api'; // Using base API to get attempt details as attemptApi doesn't have it yet, or we can use it.
import Timer from '../../components/Timer';
import QuestionCard from '../../components/QuestionCard';
import QuestionNavigation from '../../components/QuestionNavigation';
import Modal from '../../components/Modal';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';

const ExamPage = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  
  const [attemptDetails, setAttemptDetails] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [answeredMap, setAnsweredMap] = useState([]);

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        // Need to get attempt data including questions
        const response = await api.get(`/student/attempts/${attemptId}`);
        const data = response.data;
        
        setAttemptDetails(data.attempt || data);
        setQuestions(data.questions || []);
        
        // Restore answered state if any
        if (data.answers) {
          const answers = {};
          const map = new Array(data.questions?.length || 0).fill(false);
          
          data.answers.forEach(ans => {
            answers[ans.question_id] = ans.option_id;
            const qIndex = data.questions.findIndex(q => q.id === ans.question_id || q.question_id === ans.question_id);
            if (qIndex !== -1) map[qIndex] = true;
          });
          
          setSelectedAnswers(answers);
          setAnsweredMap(map);
        } else {
          setAnsweredMap(new Array(data.questions?.length || 0).fill(false));
        }
        
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load exam. It may have already been submitted.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchExamData();
  }, [attemptId]);

  const handleSelectOption = async (optionId) => {
    const question = questions[currentQuestionIndex];
    const qId = question.id || question.question_id;
    
    // Update local state immediately for snappy UI
    setSelectedAnswers(prev => ({ ...prev, [qId]: optionId }));
    
    const newAnsweredMap = [...answeredMap];
    newAnsweredMap[currentQuestionIndex] = true;
    setAnsweredMap(newAnsweredMap);
    
    // Send to backend
    try {
      await attemptApi.saveAnswer(attemptId, qId, optionId);
    } catch (err) {
      // Revert if failed (optional, but good UX)
      console.error('Failed to save answer');
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleNavigate = (questionNumber) => {
    setCurrentQuestionIndex(questionNumber - 1);
  };

  const handleTimeUp = () => {
    submitExam(true);
  };

  const confirmSubmit = () => {
    setShowSubmitModal(true);
  };

  const submitExam = async (isAutoSubmit = false) => {
    try {
      if (!isAutoSubmit) setSubmitting(true);
      setShowSubmitModal(false);
      
      const response = await attemptApi.submitAttempt(attemptId);
      navigate(`/student/results/${response.result_id || response.id || response.result?.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit exam');
      if (!isAutoSubmit) setSubmitting(false);
    }
  };

  if (loading) return <div className="exam-layout"><div style={{padding: '5rem'}}><Loading text="Loading exam environment..." /></div></div>;
  if (error) return <div className="exam-layout"><div style={{padding: '5rem', maxWidth: '600px', margin: '0 auto'}}><ErrorMessage message={error} /><button className="btn btn-primary" onClick={() => navigate('/student/dashboard')}>Return to Dashboard</button></div></div>;
  
  if (!questions || questions.length === 0) {
    return <div className="exam-layout"><div style={{padding: '5rem', textAlign: 'center'}}>No questions found for this exam.</div></div>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const qId = currentQuestion.id || currentQuestion.question_id;
  const answeredCount = answeredMap.filter(Boolean).length;
  
  // Calculate remaining time
  // Assuming backend returns start_time and duration.
  // Using duration for simplicity if specific time_left isn't provided.
  let initialSeconds = 3600; // fallback
  if (attemptDetails) {
     const duration = attemptDetails.exam?.duration || attemptDetails.duration || 60;
     const startedAt = new Date(attemptDetails.start_time || attemptDetails.started_at).getTime();
     const now = new Date().getTime();
     const elapsed = Math.floor((now - startedAt) / 1000);
     initialSeconds = Math.max(0, (duration * 60) - elapsed);
  }

  return (
    <div className="exam-layout">
      <header className="exam-header">
        <h2 style={{ margin: 0 }}>{attemptDetails?.exam?.title || attemptDetails?.exam_name || 'Exam'}</h2>
        <Timer initialSeconds={initialSeconds} onTimeUp={handleTimeUp} />
      </header>
      
      <div className="exam-content">
        <div>
          <QuestionCard 
            question={currentQuestion} 
            index={currentQuestionIndex + 1} 
            total={questions.length}
            selectedOption={selectedAnswers[qId]}
            onSelect={handleSelectOption}
          />
          
          <div className="flex justify-between mt-6">
            <button 
              className="btn btn-outline" 
              onClick={handlePrevious} 
              disabled={currentQuestionIndex === 0}
            >
              &larr; Previous
            </button>
            
            {currentQuestionIndex === questions.length - 1 ? (
              <button className="btn btn-primary" onClick={confirmSubmit}>
                Finish & Review
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleNext}>
                Next &rarr;
              </button>
            )}
          </div>
        </div>
        
        <div>
          <QuestionNavigation 
            total={questions.length} 
            current={currentQuestionIndex + 1} 
            answeredMap={answeredMap}
            onNavigate={handleNavigate}
          />
          
          <button 
            className="btn btn-danger w-full" 
            style={{ marginTop: '1.5rem', padding: '1rem', fontSize: '1.125rem' }}
            onClick={confirmSubmit}
          >
            SUBMIT EXAM
          </button>
        </div>
      </div>
      
      <Modal isOpen={showSubmitModal} title="Confirm Submission" onClose={() => setShowSubmitModal(false)}>
        <p>You have answered <strong>{answeredCount}</strong> out of <strong>{questions.length}</strong> questions.</p>
        <p>Are you sure you want to submit? You cannot change your answers after submission.</p>
        <div className="flex justify-end gap-4 mt-6">
          <button className="btn btn-outline" onClick={() => setShowSubmitModal(false)} disabled={submitting}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={() => submitExam(false)} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Yes, Submit Exam'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ExamPage;
