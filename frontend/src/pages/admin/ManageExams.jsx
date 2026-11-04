import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  Award, 
  Edit3, 
  Trash2, 
  HelpCircle, 
  AlertTriangle 
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { useToast } from '../../context/ToastContext';
import AppLayout from '../../components/AppLayout';
import Modal from '../../components/Modal';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import StatCard from '../../components/StatCard';

const ManageExams = () => {
  const [exams, setExams] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('ALL');

  // Modal create/edit state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getDefaultTimes = () => {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + 30);
    return {
      start_time: now.toISOString().slice(0, 16),
      end_time: future.toISOString().slice(0, 16),
    };
  };

  const initialFormState = {
    exam_id: null,
    exam_name: '',
    description: '',
    topic_id: '',
    duration: 60,
    total_marks: 100,
    require_candidate_details: true,
    ...getDefaultTimes(),
  };

  const [formData, setFormData] = useState(initialFormState);

  // Deletion modal state
  const [examToDelete, setExamToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [examsRes, topicsRes] = await Promise.all([
        adminApi.getExams(),
        adminApi.getTopics(),
      ]);
      const examsList = Array.isArray(examsRes) ? examsRes : (examsRes?.data || []);
      const topicsList = Array.isArray(topicsRes) ? topicsRes : (topicsRes?.data || []);
      setExams(examsList);
      setTopics(topicsList);
    } catch (err) {
      setError('Failed to fetch examination data.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (exam = null) => {
    if (exam) {
      const formatForInput = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 16);
      };

      setFormData({
        exam_id: exam.exam_id || exam.id,
        exam_name: exam.exam_name || exam.title || '',
        description: exam.description || '',
        topic_id: String(exam.topic_id || exam.topic?.id || exam.topic?.topic_id || ''),
        duration: Number(exam.duration || 60),
        total_marks: Number(exam.total_marks || 100),
        require_candidate_details: exam.require_candidate_details !== false && exam.require_candidate_details !== 0,
        start_time: formatForInput(exam.start_time) || getDefaultTimes().start_time,
        end_time: formatForInput(exam.end_time) || getDefaultTimes().end_time,
      });
    } else {
      setFormData({
        ...initialFormState,
        topic_id: topics.length > 0 ? String(topics[0].topic_id || topics[0].id) : '',
        ...getDefaultTimes(),
      });
    }
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.exam_name.trim()) {
      setError('Examination title is required.');
      return;
    }
    if (!formData.topic_id) {
      setError('Please select an examination subject topic.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      exam_name: formData.exam_name.trim(),
      description: formData.description.trim(),
      topic_id: parseInt(formData.topic_id, 10),
      duration: parseInt(formData.duration, 10),
      total_marks: parseInt(formData.total_marks, 10),
      require_candidate_details: formData.require_candidate_details,
      start_time: new Date(formData.start_time).toISOString(),
      end_time: new Date(formData.end_time).toISOString(),
    };

    try {
      if (formData.exam_id) {
        await adminApi.updateExam(formData.exam_id, payload);
        showToast('success', 'Examination updated successfully.');
      } else {
        await adminApi.createExam(payload);
        showToast('success', 'New examination created successfully.');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save examination.';
      setError(msg);
      showToast('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!examToDelete) return;
    setIsDeleting(true);
    try {
      const id = examToDelete.exam_id || examToDelete.id;
      await adminApi.deleteExam(id);
      showToast('success', 'Examination removed successfully.');
      setExamToDelete(null);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete examination.';
      setError(msg);
      showToast('error', msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const getTopicName = (topicId) => {
    const t = topics.find((item) => String(item.topic_id || item.id) === String(topicId));
    return t ? t.topic_name || t.name : 'General';
  };

  const getExamStatus = (exam) => {
    const now = new Date();
    const start = exam.start_time ? new Date(exam.start_time) : null;
    const end = exam.end_time ? new Date(exam.end_time) : null;

    if (start && now < start) return { label: 'Upcoming', badge: 'badge-warning' };
    if (end && now > end) return { label: 'Expired', badge: 'badge-neutral' };
    return { label: 'Active', badge: 'badge-success' };
  };

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const title = (exam.exam_name || exam.title || '').toLowerCase();
      const matchesSearch = title.includes(searchTerm.toLowerCase().trim());
      const matchesTopic =
        selectedTopicId === 'ALL' || String(exam.topic_id) === String(selectedTopicId);
      return matchesSearch && matchesTopic;
    });
  }, [exams, searchTerm, selectedTopicId]);

  return (
    <AppLayout
      isAdmin={true}
      title="Manage Examinations"
      breadcrumbs={[{ label: 'Admin Console' }, { label: 'Examinations' }]}
    >
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Examination Management</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.9375rem' }}>
            Author, configure, schedule, and attach question banks to competitive examinations.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => handleOpenModal()}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={16} />
          <span>Create Examination</span>
        </button>
      </div>

      <ErrorMessage message={error} />

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <StatCard
          title="Total Exams"
          value={exams.length}
          icon={GraduationCap}
          variant="primary"
        />
        <StatCard
          title="Configured Topics"
          value={topics.length}
          icon={Award}
          variant="default"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Search examinations by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} style={{ color: 'var(--text-secondary)' }} />
            <select
              className="form-control"
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              style={{ width: 'auto', minWidth: '160px' }}
            >
              <option value="ALL">All Topics</option>
              {topics.map((t) => (
                <option key={t.topic_id || t.id} value={t.topic_id || t.id}>
                  {t.topic_name || t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Examinations Table */}
      {loading ? (
        <Loading text="Loading examinations..." />
      ) : filteredExams.length > 0 ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Exam Title</th>
                  <th>Topic</th>
                  <th style={{ textAlign: 'center' }}>Duration</th>
                  <th style={{ textAlign: 'center' }}>Total Marks</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExams.map((exam) => {
                  const examId = exam.exam_id || exam.id;
                  const topicName = exam.topic?.name || exam.topic?.topic_name || getTopicName(exam.topic_id);
                  const statusInfo = getExamStatus(exam);

                  return (
                    <tr key={examId}>
                      <td style={{ fontWeight: 600 }}>
                        <div style={{ color: 'var(--text-primary)' }}>
                          {exam.exam_name || exam.title}
                        </div>
                        {exam.description && (
                          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px', maxWidth: '320px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {exam.description}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-primary">{topicName}</span>
                      </td>
                      <td style={{ textAlign: 'center' }} className="tabular-nums">
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem' }}>
                          <Clock size={14} style={{ color: 'var(--text-muted)' }} />
                          <span>{exam.duration}m</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }} className="tabular-nums">
                        {exam.total_marks}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${statusInfo.badge}`}>{statusInfo.label}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.375rem' }}>
                          <button
                            className="btn btn-primary"
                            style={{ padding: '0.35rem 0.625rem', fontSize: '0.8125rem' }}
                            onClick={() => navigate('/admin/questions', { state: { examId } })}
                            title="Manage Questions for this Exam"
                          >
                            <HelpCircle size={14} />
                            <span>Questions</span>
                          </button>
                          <button
                            className="btn btn-outline"
                            style={{ padding: '0.35rem 0.625rem', fontSize: '0.8125rem' }}
                            onClick={() => handleOpenModal(exam)}
                            title="Edit Exam"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{ padding: '0.35rem 0.625rem', fontSize: '0.8125rem' }}
                            onClick={() => setExamToDelete(exam)}
                            title="Delete Exam"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={GraduationCap}
          title="No Examinations Found"
          description={
            searchTerm || selectedTopicId !== 'ALL'
              ? 'No exams match your search criteria. Try adjusting your filters.'
              : 'No examinations created yet. Start by authoring your first competitive exam.'
          }
          actionText={searchTerm || selectedTopicId !== 'ALL' ? 'Clear Filters' : '+ Create Exam'}
          onAction={
            searchTerm || selectedTopicId !== 'ALL'
              ? () => {
                  setSearchTerm('');
                  setSelectedTopicId('ALL');
                }
              : () => handleOpenModal()
          }
        />
      )}

      {/* Create / Edit Exam Modal */}
      <Modal
        isOpen={isModalOpen}
        title={formData.exam_id ? 'Edit Examination' : 'Create Examination'}
        onClose={() => setIsModalOpen(false)}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Examination Title *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. National Engineering Aptitude Test 2026"
              value={formData.exam_name}
              onChange={(e) => setFormData({ ...formData, exam_name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Subject Topic *</label>
            <select
              className="form-control"
              value={formData.topic_id}
              onChange={(e) => setFormData({ ...formData, topic_id: e.target.value })}
              required
            >
              <option value="">-- Select Subject Topic --</option>
              {topics.map((t) => (
                <option key={t.topic_id || t.id} value={t.topic_id || t.id}>
                  {t.topic_name || t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description / Instructions</label>
            <textarea
              className="form-control"
              rows="2"
              placeholder="Provide test overview, subject syllabus, or scoring details..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Duration (Minutes) *</label>
              <input
                type="number"
                min="60"
                step="1"
                className="form-control"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                required
              />
              <small style={{ color: 'var(--text-secondary)' }}>Minimum duration: 60 minutes. Admins can set a longer duration.</small>
            </div>
            <div className="form-group">
              <label className="form-label">Total Marks *</label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={formData.total_marks}
                onChange={(e) => setFormData({ ...formData, total_marks: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Available From *</label>
              <input
                type="datetime-local"
                className="form-control"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Available Until *</label>
              <input
                type="datetime-local"
                className="form-control"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                required
              />
            </div>
          </div>

          <label className="flex items-start gap-2" style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
            <input
              type="checkbox"
              checked={formData.require_candidate_details}
              onChange={(event) => setFormData({ ...formData, require_candidate_details: event.target.checked })}
            />
            <span>Require candidate Name and PRN before this exam starts</span>
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : formData.exam_id ? 'Update Exam' : 'Create Exam'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Deletion Modal */}
      <Modal
        isOpen={!!examToDelete}
        title="Confirm Examination Deletion"
        onClose={() => setExamToDelete(null)}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--status-error)' }}>
            <AlertTriangle size={24} />
            <h4 style={{ margin: 0, color: 'var(--status-error)' }}>Delete Examination</h4>
          </div>

          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '0.9375rem', lineHeight: 1.6 }}>
            Are you sure you want to delete <strong>"{examToDelete?.exam_name || examToDelete?.title}"</strong>? 
            This will permanently remove the exam along with its configured questions and candidate attempts.
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setExamToDelete(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
            >
              {isDeleting ? 'Deleting...' : 'Delete Exam'}
            </button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
};

export default ManageExams;
