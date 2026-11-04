import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  Layers 
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { useToast } from '../../context/ToastContext';
import AppLayout from '../../components/AppLayout';
import Modal from '../../components/Modal';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import StatCard from '../../components/StatCard';

const ManageTopics = () => {
  const [topics, setTopics] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ topic_id: null, topic_name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirmation modal state
  const [topicToDelete, setTopicToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getTopics();
      const list = Array.isArray(res) ? res : (res?.data || []);
      setTopics(list);
    } catch (err) {
      setError('Failed to fetch subject topics.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (topic = null) => {
    if (topic) {
      setFormData({
        topic_id: topic.topic_id || topic.id,
        topic_name: topic.topic_name || topic.name || '',
        description: topic.description || '',
      });
    } else {
      setFormData({ topic_id: null, topic_name: '', description: '' });
    }
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.topic_name.trim()) {
      setError('Topic name cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      topic_name: formData.topic_name.trim(),
      description: formData.description.trim(),
    };

    try {
      if (formData.topic_id) {
        await adminApi.updateTopic(formData.topic_id, payload);
        showToast('success', 'Subject topic updated successfully.');
      } else {
        await adminApi.createTopic(payload);
        showToast('success', 'New topic created successfully.');
      }
      setIsModalOpen(false);
      fetchTopics();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save subject topic.';
      setError(msg);
      showToast('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!topicToDelete) return;
    setIsDeleting(true);
    try {
      const id = topicToDelete.topic_id || topicToDelete.id;
      await adminApi.deleteTopic(id);
      showToast('success', 'Topic deleted successfully.');
      setTopicToDelete(null);
      fetchTopics();
    } catch (err) {
      const msg = err.response?.data?.message || 'Cannot delete topic. Ensure no active exams are linked.';
      setError(msg);
      showToast('error', msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredTopics = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return topics;
    return topics.filter((t) => {
      const name = (t.topic_name || t.name || '').toLowerCase();
      const desc = (t.description || '').toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
  }, [topics, searchTerm]);

  return (
    <AppLayout
      isAdmin={true}
      title="Manage Topics"
      breadcrumbs={[{ label: 'Admin Console' }, { label: 'Topics' }]}
    >
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Examination Subject Topics</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.9375rem' }}>
            Configure and categorize domain subjects (e.g., Mathematics, Computer Science, Logical Reasoning).
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => handleOpenModal()}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={16} />
          <span>Add New Topic</span>
        </button>
      </div>

      <ErrorMessage message={error} />

      {/* Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <StatCard
          title="Total Subject Topics"
          value={topics.length}
          icon={Layers}
          variant="primary"
        />
        <StatCard
          title="Filtered Matches"
          value={filteredTopics.length}
          icon={Search}
          variant="default"
        />
      </div>

      {/* Search Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', maxWidth: '380px' }}>
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
            placeholder="Search topics by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
      </div>

      {/* Topic Grid or Empty State */}
      {loading ? (
        <Loading text="Loading subject topics..." />
      ) : filteredTopics.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {filteredTopics.map((topic) => {
            const topicId = topic.topic_id || topic.id;
            const topicName = topic.topic_name || topic.name;

            return (
              <div
                key={topicId}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '1.5rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--border-radius-md)',
                        backgroundColor: 'var(--primary-light)',
                        color: 'var(--primary-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <BookOpen size={20} />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      ID #{topicId}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.1875rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                    {topicName}
                  </h3>

                  <p
                    style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.875rem',
                      lineHeight: 1.6,
                      minHeight: '44px',
                      marginBottom: '1.25rem',
                    }}
                  >
                    {topic.description || 'No specialized description provided for this topic category.'}
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '0.625rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--border-color)',
                  }}
                >
                  <button
                    className="btn btn-outline"
                    style={{ flex: 1, padding: '0.4rem', fontSize: '0.8125rem' }}
                    onClick={() => handleOpenModal(topic)}
                  >
                    <Edit3 size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    className="btn btn-danger"
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.8125rem' }}
                    onClick={() => setTopicToDelete(topic)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No Topics Found"
          description={
            searchTerm
              ? `No subject topics match "${searchTerm}".`
              : 'Get started by creating your first exam topic category.'
          }
          actionText={searchTerm ? 'Clear Search' : '+ Add First Topic'}
          onAction={searchTerm ? () => setSearchTerm('') : () => handleOpenModal()}
        />
      )}

      {/* Create / Edit Topic Modal */}
      <Modal
        isOpen={isModalOpen}
        title={formData.topic_id ? 'Edit Subject Topic' : 'Create Subject Topic'}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Topic Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Data Structures & Algorithms"
              value={formData.topic_name}
              onChange={(e) => setFormData({ ...formData, topic_name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Brief summary of skills, concepts, or syllabus covered in this topic..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

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
              {isSubmitting ? 'Saving...' : formData.topic_id ? 'Save Changes' : 'Create Topic'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal (Replaces window.confirm) */}
      <Modal
        isOpen={!!topicToDelete}
        title="Confirm Topic Deletion"
        onClose={() => setTopicToDelete(null)}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--status-error)' }}>
            <AlertTriangle size={24} />
            <h4 style={{ margin: 0, color: 'var(--status-error)' }}>Delete Subject Topic</h4>
          </div>

          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '0.9375rem', lineHeight: 1.6 }}>
            Are you sure you want to delete <strong>"{topicToDelete?.topic_name || topicToDelete?.name}"</strong>? 
            This action cannot be undone. Topics with associated exams cannot be deleted until exams are reassigned or removed.
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setTopicToDelete(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
            >
              {isDeleting ? 'Deleting...' : 'Delete Topic'}
            </button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
};

export default ManageTopics;
