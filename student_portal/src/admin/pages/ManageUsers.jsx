import  { useState ,useEffect} from 'react';
import { Link } from 'react-router-dom';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

        console.log("MANAGE USERS:", data);

        setUsers(data);

      } catch (error) {

        console.error("FETCH USERS ERROR:", error);

        setError("Unable to load registered students.");

      } finally {

        setLoading(false);

      }

    };

    fetchStudents();

  }, []);

  //block - unblock 
   const toggleStatus = async (id) => {

    const user = users.find(
      (u) => u._id === id
    );

    if (!user) return;

    const newStatus =
      user.accountStatus === "Active"
        ? "Blocked"
        : "Active";

    try {

      const response = await fetch(
        `http://localhost:5000/api/students/${id}/status`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            accountStatus: newStatus
          })
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      setUsers(
        users.map((u) =>
          u._id === id
            ? {
                ...u,
                accountStatus: newStatus
              }
            : u
        )
      );

    } catch (error) {

      console.error("STATUS UPDATE ERROR:", error);

      alert("Unable to update user status.");

    }

  };


  //loading
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

 
  const deleteUser = async (id) => {
    if (window.confirm('Are you sure you want to remove this user account?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/students/${id}`, {
          method: "DELETE"
        });

        if (!response.ok) {
          throw new Error("Failed to delete user");
        }

        setUsers(users.filter(u => u._id !== id));
        alert("Student removed successfully.");
      } catch (error) {
        console.error("DELETE USER ERROR:", error);
        alert("Unable to remove user account.");
      }
    }
  };

  return (
    <div className="container-xxl flex-grow-1 container-p-y">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Manage Users</h4>
          <p className="text-muted mb-0">Control account access, permissions, and status</p>
        </div>
        <Link to="/admin/ViewUsers" className="btn btn-outline-secondary">
          <i className="bx bx-show me-1"></i> View Directory
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
          <h5 className="mb-0">User Account Management</h5>
        </div>
        <div className="table-responsive text-nowrap">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Department</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="table-border-bottom-0">
              {users.map(user => (
                <tr key={user._id}>
                  <td>
                    <strong>{user.name}</strong>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className="badge bg-label-info">{user.department}</span>
                  </td>
                  {/* <td>
                    <span className={`badge ${user.registrationStatus === 'Active' ? 'bg-label-success' : 'bg-label-danger'}`}>
                      {user.registrationStatus}
                    </span>
                  </td> */}
                  <td>
                    <span
                        className={`badge ${
                          user.accountStatus === "Blocked"
                            ? "bg-label-danger"
                            : "bg-label-success"
                        }`}
                      >

                      {user.accountStatus || "Active"}
                    </span>
                    </td>
                    <td>
                    <button
                        className={`btn btn-sm ${
                          user.accountStatus === "Blocked"
                            ? "btn-outline-success"
                            : "btn-outline-warning"
                        } me-2`}

                        onClick={() =>
                          toggleStatus(user._id)
                        }
                      > <i
                          className={`bx ${
                            user.accountStatus === "Blocked"
                              ? "bx-lock-open"
                              : "bx-block"
                          } me-1`}
                        ></i> {user.accountStatus === "Blocked"
                          ? "Unblock"
                          : "Block"}

                      </button>
                     <button
                        className="btn btn-sm btn-outline-danger"

                        onClick={() =>
                          deleteUser(user._id)
                        }
                      >

                        <i className="bx bx-trash me-1"></i>

                        Remove

                      </button>
                   
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
