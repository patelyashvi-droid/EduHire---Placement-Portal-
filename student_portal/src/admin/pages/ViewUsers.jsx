import  { useState , useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function ViewUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  //fetch student
    useEffect(() => {

    const fetchStudents = async () => {

      try {

        const response = await fetch(
          "http://localhost:5000/api/students"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch students");
        }

        const data = await response.json();

        console.log("REGISTERED STUDENTS:", data);

        setUsers(data);

      } catch (error) {

        console.error("FETCH STUDENTS ERROR:", error);

        setError("Unable to load registered students.");

      } finally {

        setLoading(false);

      }

    };

    fetchStudents();

  }, []);


  // LOADING

  if (loading) {
      return (
      <div className="container-xxl flex-grow-1 container-p-y">

        <div className="text-center py-5">

          <div
            className="spinner-border text-primary"
            role="status"
          ></div>

          <p className="mt-3 text-muted">
            Loading registered students...
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="container-xxl flex-grow-1 container-p-y">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">View Users</h4>
          <p className="text-muted mb-0">Browse all registered students, coordinators, and administrators</p>
        </div>
        <Link to="/admin/ManageUsers" className="btn btn-primary">
          <i className="bx bx-cog me-1"></i> Manage User Accounts
        </Link>
      </div>

      {/* error */}
       {error && (

        <div className="alert alert-danger">
          {error}
        </div>

      )}

      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">User Directory</h5>
          <span className="badge bg-label-primary">{users.length} Users Total</span>
        </div>
        <div className="table-responsive text-nowrap">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>User</th>
                <th>Enrollment </th>
                <th>Email</th>
                <th>Mobile No</th>
                <th>Department</th>
                <th>Skill</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="table-border-bottom-0">
              {users.map(user => (
                <tr key={user.id || user._id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="avatar avatar-sm me-2">
                        <span className="avatar-initial rounded-circle bg-label-info">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <strong>{user.name}</strong>
                    </div>
                  </td>
                   <td>{user.roll}</td>
                  <td>{user.email}</td>
                  <td>
                      {user.mobile}
                  </td>
                  <td>{user.department}</td>
                  <td>
                    <span className="badge bg-label-primary">
                      {user.skill || "N/A"}
                    </span>
                  </td>
                  <td>
                  <span
                      className={`badge ${
                        user.registrationStatus === "Approved"
                          ? "bg-label-success"
                          : user.registrationStatus === "Pending"
                          ? "bg-label-warning"
                          : user.registrationStatus === "Rejected"
                          ? "bg-label-danger"
                          : "bg-label-secondary"
                      }`}
                    > {user.registrationStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
