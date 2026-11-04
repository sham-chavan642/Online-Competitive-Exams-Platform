import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useStudent from '../../hooks/useStudent';
import AppLayout from '../../components/AppLayout';
import ExamCard from '../../components/ExamCard';
import EmptyState from '../../components/EmptyState';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { Search, FileText, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

const AvailableExams = () => {
  const { getAvailableExams, availableExams, loading, error } = useStudent();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('ALL');
  const [sortBy, setSortBy] = useState('DEFAULT');
  const navigate = useNavigate();

  useEffect(() => {
    getAvailableExams();
  }, [getAvailableExams]);

  const examsList = availableExams || [];

  // Extract unique topic names from the real data
  const availableTopics = useMemo(() => {
    const set = new Set();
    examsList.forEach((e) => {
      const tName = e.topic_name || e.topic?.name || e.topic;
      if (tName) set.add(tName);
    });
    return Array.from(set);
  }, [examsList]);

  // Filter & sort
  const filteredExams = useMemo(() => {
    return examsList
      .filter((exam) => {
        const title = (exam.exam_name || exam.title || '').toLowerCase();
        const desc = (exam.description || '').toLowerCase();
        const topic = (exam.topic_name || exam.topic?.name || exam.topic || '').toLowerCase();
        const q = searchTerm.toLowerCase();

        const matchesSearch = title.includes(q) || desc.includes(q) || topic.includes(q);

        if (selectedTopic === 'ALL') return matchesSearch;
        const currentTopic = exam.topic_name || exam.topic?.name || exam.topic;
        return matchesSearch && currentTopic === selectedTopic;
      })
      .sort((a, b) => {
        if (sortBy === 'DURATION_ASC') return (a.duration || 0) - (b.duration || 0);
        if (sortBy === 'DURATION_DESC') return (b.duration || 0) - (a.duration || 0);
        if (sortBy === 'MARKS_DESC') return (b.total_marks || 0) - (a.total_marks || 0);
        if (sortBy === 'TITLE') return (a.exam_name || a.title || '').localeCompare(b.exam_name || b.title || '');
        return 0;
      });
  }, [examsList, searchTerm, selectedTopic, sortBy]);

  return (
    <AppLayout
      title="Available Exams"
      breadcrumbs={[
        { label: 'Portal', path: '/student/dashboard' },
        { label: 'Available Exams' },
      ]}
    >
      <div className="page-header">
        <div className="page-header-text">
          <h2>Active Examinations</h2>
          <p>
            Browse competitive exams currently scheduled and eligible for evaluation.
          </p>
        </div>
      </div>

      <ErrorMessage message={error} />

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-input-group">
          <div className="input-wrapper">
            <Search size={16} className="input-icon-left" />
            <input
              type="text"
              className="form-control input-with-left-icon"
              placeholder="Search by exam name, topic, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
          {/* Topic Select */}
          {availableTopics.length > 0 && (
            <div className="flex items-center gap-1">
              <label htmlFor="topic-filter" className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                Topic:
              </label>
              <select
                id="topic-filter"
                className="form-control"
                style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.8125rem' }}
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
              >
                <option value="ALL">All Topics</option>
                {availableTopics.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sort Select */}
          <div className="flex items-center gap-1">
            <label htmlFor="sort-filter" className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              Sort:
            </label>
            <select
              id="sort-filter"
              className="form-control"
              style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.8125rem' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="DEFAULT">Recommended</option>
              <option value="TITLE">Title (A-Z)</option>
              <option value="DURATION_ASC">Shortest Duration</option>
              <option value="DURATION_DESC">Longest Duration</option>
              <option value="MARKS_DESC">Highest Total Marks</option>
            </select>
          </div>
        </div>
      </div>

      {/* Exam Grid */}
      {loading && examsList.length === 0 ? (
        <Loading text="Loading available examinations..." />
      ) : filteredExams.length > 0 ? (
        <div className="grid grid-cols-3 gap-6">
          {filteredExams.map((exam) => (
            <ExamCard
              key={exam.exam_id || exam.id}
              exam={{
                ...exam,
                title: exam.exam_name || exam.title,
                status: 'AVAILABLE',
              }}
              actionText="View Details & Start"
              onAction={() => navigate(`/student/exams/${exam.exam_id || exam.id}`)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title={searchTerm || selectedTopic !== 'ALL' ? 'No matching exams found' : 'No exams available right now'}
          description={
            searchTerm || selectedTopic !== 'ALL'
              ? 'Try adjusting your search criteria or clearing topic filters.'
              : 'All examinations have either been attempted or are not scheduled currently.'
          }
          actionText={searchTerm || selectedTopic !== 'ALL' ? 'Clear Filters' : 'Return to Dashboard'}
          onAction={() => {
            if (searchTerm || selectedTopic !== 'ALL') {
              setSearchTerm('');
              setSelectedTopic('ALL');
            } else {
              navigate('/student/dashboard');
            }
          }}
        />
      )}
    </AppLayout>
  );
};

export default AvailableExams;
