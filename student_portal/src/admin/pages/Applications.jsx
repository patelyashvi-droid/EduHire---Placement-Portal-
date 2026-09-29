import React, { useState, useEffect } from 'react';

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState('');

  // Fetch status options master list
  const fetchStatusOptions = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/statuses');
      if (res.ok) {
        const data = await res.json();
        if (data.statuses && Array.isArray(data.statuses)) {
          setStatusOptions(data.statuses);
        }
      }
    } catch (err) {
      console.error('Error fetching status options:', err);
    }
  };

  // Fetch applications from backend
  const fetchApplications = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/applications');
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatusOptions();
    fetchApplications();
  }, []);

  // Update application status via statusId
  const updateStatus = async (id, newStatusId) => {
    try {
      const numericStatusId = Number(newStatusId);
      const res = await fetch(`http://localhost:5000/api/applications/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statusId: numericStatusId }),
      });

      const data = await res.json();

      if (res.ok && data.application) {
        const updatedApp = data.application;
        setApplications(prev =>
          prev.map(app => (app._id === id || app.applicationId === id ? updatedApp : app))
        );
        setToastMessage(`Status updated to '${updatedApp.status}' (Status ID: ${updatedApp.statusId})! Student notified.`);
        setTimeout(() => setToastMessage(''), 3500);
      } else {
        alert(data.message || 'Unable to update status.');
      }
    } catch (err) {
      console.error('Update status error:', err);
      alert('Server error while updating status.');
    }
  };

  // Filter logic
  const filteredApps = applications.filter(app => {
    const matchesSearch =
      (app.studentName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.studentRoll || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.role || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter !== 'All') {
      if (typeof statusFilter === 'number') {
        return Number(app.statusId) === statusFilter;
      }
      return app.status === statusFilter || String(app.statusId) === String(statusFilter);
    }

    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Selected':
        return 'bg-success text-white';
      case 'Shortlisted':
        return 'bg-info text-white';
      case 'Applied':
        return 'bg-warning text-dark';
      case 'Rejected':
        return 'bg-danger text-white';
      default:
        return 'bg-secondary text-white';
    }
  };

  // Default fallback statuses if API loading
  const displayStatuses = statusOptions.length > 0 ? statusOptions : [
    { statusId: 1, applicationStatus: "Applied", description: "Application submitted" },
    { statusId: 2, applicationStatus: "Shortlisted", description: "Student shortlisted" },
    { statusId: 3, applicationStatus: "Selected", description: "Student selected" },
    { statusId: 4, applicationStatus: "Rejected", description: "Application rejected" }
  ];

  return (
    <div className="container-xxl flex-grow-1 container-p-y">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1100 }}>
          <div className="toast show align-items-center text-white bg-success border-0 shadow-lg p-2">
            <div className="d-flex align-items-center justify-content-between">
              <div className="toast-body fw-semibold">
                <i className="bi bi-check-circle-fill me-2"></i>
                {toastMessage}
              </div>
              <button
                type="button"
                className="btn-close btn-close-white me-2"
                onClick={() => setToastMessage('')}
              ></button>
            </div>
          </div>
        </div>
      )}

      {/* Page Heading */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Student Job Applications</h4>
          <p className="text-muted mb-0">Manage applicant status IDs & notify candidates live</p>
        </div>
      </div>

      {/* Main Card */}
      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-header border-bottom bg-white py-3">
          <div className="row align-items-center g-3">
            <div className="col-md-5">
              <div className="input-group input-group-merge">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0 ps-0"
                  placeholder="Search student, roll no, company, role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="col-md-7 text-md-end">
              <div className="btn-group flex-wrap" role="group" aria-label="Status filters">
                <button
                  type="button"
                  className={`btn btn-sm px-3 fw-semibold ${statusFilter === 'All' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setStatusFilter('All')}
                >
                  All ({applications.length})
                </button>
                {displayStatuses.map(st => (
                  <button
                    key={st.statusId}
                    type="button"
                    className={`btn btn-sm px-3 fw-semibold ${statusFilter === st.applicationStatus || statusFilter === st.statusId ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setStatusFilter(st.applicationStatus)}
                  >
                    {st.applicationStatus} ({applications.filter(a => Number(a.statusId) === st.statusId || a.status === st.applicationStatus).length})
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="table-responsive text-nowrap">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2 text-muted">Loading applications...</p>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox fs-1 text-muted"></i>
              <h5 className="mt-2">No Applications Found</h5>
              <p className="text-muted fs-7">No applicant records match your selected filter.</p>
            </div>
          ) : (
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Student Name</th>
                  <th>Roll No</th>
                  <th>Company Name</th>
                  <th>Role</th>
                  <th>Applied Date</th>
                  <th>Status ID & Name</th>
                  <th className="text-center">Action (Update Status ID)</th>
                </tr>
              </thead>
              <tbody className="table-border-bottom-0">
                {filteredApps.map(app => (
                  <tr key={app._id || app.applicationId}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="avatar-sm bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '36px', height: '36px' }}>
                          {(app.studentName || 'S').substring(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <strong className="d-block text-dark">{app.studentName}</strong>
                          <small className="text-muted fs-8">{app.studentEmail}</small>
                        </div>
                      </div>
                    </td>
                    <td><span className="fw-semibold text-secondary">{app.studentRoll}</span></td>
                    <td><strong className="text-primary">{app.companyName}</strong></td>
                    <td>{app.role}</td>
                    <td><small className="text-muted">{app.appliedDate || new Date(app.appliedAt).toISOString().split('T')[0]}</small></td>
                    <td>
                      <div className="d-flex flex-column">
                        <span className={`badge rounded-pill px-3 py-1.5 fs-8 ${getStatusBadge(app.status)}`}>
                          ID: {app.statusId || 1} - {app.status || "Applied"}
                        </span>
                        {app.description && (
                          <small className="text-muted fs-9 mt-1 text-wrap" style={{ maxWidth: "180px" }}>
                            {app.description}
                          </small>
                        )}
                      </div>
                    </td>
                    <td className="text-center">
                      <select
                        className="form-select form-select-sm d-inline-block w-auto fw-semibold"
                        value={app.statusId || 1}
                        onChange={(e) => updateStatus(app._id || app.applicationId, e.target.value)}
                        style={{ minWidth: '160px' }}
                      >
                        {displayStatuses.map(st => (
                          <option key={st.statusId} value={st.statusId}>
                            {st.statusId} - {st.applicationStatus}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
