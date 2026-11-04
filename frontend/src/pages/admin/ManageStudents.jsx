import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  User, 
  Calendar, 
  Award, 
  CheckCircle2, 
  Clock, 
  FileText 
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import AppLayout from '../../components/AppLayout';
import Modal from '../../components/Modal';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import StatCard from '../../components/StatCard';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected student for detailed profile modal
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loadingStudentDetail, setLoadingStudentDetail] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getStudents();
      const list = Array.isArray(res) ? res : (res?.data || []);
      setStudents(list);
    } catch (err) {
      setError('Failed to fetch candidate directory.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewStudent = async (studentId) => {
    try {
      setLoadingStudentDetail(true);
      setIsDetailModalOpen(true);
      const res = await adminApi.getStudentById(studentId);
      const data = res?.data || res;
      setSelectedStudent(data);
    } catch (err) {
      setError('Failed to load candidate profile details.');
    } finally {
      setLoadingStudentDetail(false);
    }
  };

  const filteredStudents = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return students;
    return students.filter((s) => {
      const name = (s.name || '').toLowerCase();
      const email = (s.email || '').toLowerCase();
      const phone = (s.phone || '').toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q);
    });
  }, [students, searchTerm]);

  return (
    <AppLayout
      isAdmin={true}
      title="Candidate Management"
      breadcrumbs={[{ label: 'Admin Console' }, { label: 'Candidates' }]}
    >
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2>Registered Candidates Directory</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.9375rem' }}>
            Inspect candidate enrollments, contact details, and individual examination attempt histories.
          </p>
        </div>
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
          title="Total Candidates"
          value={students.length}
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Active Filter Match"
          value={filteredStudents.length}
          icon={Search}
          variant="default"
        />
      </div>

      {/* Search Input Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', maxWidth: '420px' }}>
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
            placeholder="Search candidates by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
      </div>

      {/* Candidate Table */}
      {loading ? (
        <Loading text="Loading candidate directory..." />
      ) : filteredStudents.length > 0 ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>ID</th>
                  <th>Candidate Name</th>
                  <th>Email Address</th>
                  <th>Gender</th>
                  <th>Phone Number</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => {
                  const sId = student.student_id || student.id;
                  return (
                    <tr key={sId}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                        #{sId}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--primary-light)',
                              color: 'var(--primary-color)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.875rem',
                              flexShrink: 0,
                            }}
                          >
                            {(student.name || 'C').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                              {student.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-secondary)' }}>
                          <Mail size={14} style={{ color: 'var(--text-muted)' }} />
                          <span>{student.email}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-neutral">
                          {student.gender || 'Not specified'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-secondary)' }}>
                          <Phone size={14} style={{ color: 'var(--text-muted)' }} />
                          <span>{student.phone || '—'}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-outline"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem' }}
                          onClick={() => handleViewStudent(sId)}
                        >
                          <FileText size={14} />
                          <span>View History</span>
                        </button>
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
          icon={Users}
          title="No Candidates Found"
          description={
            searchTerm
              ? `No candidate accounts match the query "${searchTerm}".`
              : 'No candidates registered in the system yet.'
          }
          actionText={searchTerm ? 'Clear Search' : undefined}
          onAction={searchTerm ? () => setSearchTerm('') : undefined}
        />
      )}

      {/* Candidate Profile & History Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        title="Candidate Profile & Examination History"
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedStudent(null);
        }}
        size="lg"
      >
        {loadingStudentDetail ? (
          <Loading text="Loading candidate history..." />
        ) : selectedStudent ? (
          <div>
            {/* Header info */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                paddingBottom: '1.25rem',
                borderBottom: '1px solid var(--border-color)',
                marginBottom: '1.25rem',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '1.25rem',
                }}
              >
                {(selectedStudent.name || 'C').charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{selectedStudent.name}</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <span>Email: <strong>{selectedStudent.email}</strong></span>
                  <span>Phone: <strong>{selectedStudent.phone || 'N/A'}</strong></span>
                  <span>Gender: <strong>{selectedStudent.gender || 'N/A'}</strong></span>
                </div>
              </div>
            </div>

            {/* Examination History Section */}
            <div>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={18} style={{ color: 'var(--primary-color)' }} />
                <span>Test Attempts Audit Log</span>
              </h4>

              {selectedStudent.history && selectedStudent.history.length > 0 ? (
                <div className="table-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Exam Name</th>
                        <th style={{ textAlign: 'center' }}>Score</th>
                        <th style={{ textAlign: 'center' }}>Status</th>
                        <th>Started At</th>
                        <th>Submitted At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedStudent.history.map((att) => (
                        <tr key={att.attempt_id}>
                          <td style={{ fontWeight: 600 }}>{att.exam_name}</td>
                          <td style={{ textAlign: 'center', fontWeight: 600 }} className="tabular-nums">
                            {att.score ?? '—'}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span
                              className={`badge ${
                                att.status === 'SUBMITTED' ? 'badge-success' : 'badge-warning'
                              }`}
                            >
                              {att.status}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                            {att.started_at ? new Date(att.started_at).toLocaleString() : '—'}
                          </td>
                          <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                            {att.submitted_at ? new Date(att.submitted_at).toLocaleString() : 'In Progress'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div
                  style={{
                    padding: '2rem',
                    textAlign: 'center',
                    backgroundColor: 'var(--background-color)',
                    borderRadius: 'var(--border-radius-md)',
                    color: 'var(--text-muted)',
                  }}
                >
                  This candidate has not attempted any examinations yet.
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <button
                className="btn btn-outline"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setSelectedStudent(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </AppLayout>
  );
};

export default ManageStudents;
