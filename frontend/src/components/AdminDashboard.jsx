import { useEffect, useState } from "react";

function AdminDashboard() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/appointments")
      .then((res) => res.json())
      .then((data) => setAppointments(data))
      .catch((err) => console.error(err));
  }, []);

  const total = appointments.length;
  const pending = appointments.filter(a => a.status === "Pending").length;
  const served = appointments.filter(a => a.status === "Served").length;

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
        <p>Monitor Aadhaar Appointments & Queue Status</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Appointments</h3>
          <span>{total}</span>
        </div>

        <div className="stat-card pending">
          <h3>Pending</h3>
          <span>{pending}</span>
        </div>

        <div className="stat-card served">
          <h3>Served</h3>
          <span>{served}</span>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <h3>Appointment Records</h3>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Service</th>
                <th>Date</th>
                <th>Time Slot</th>
                <th>Token</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.appointmentId}>
                  <td>{a.name}</td>
                  <td>{a.serviceType}</td>
                  <td>{a.date}</td>
                  <td>{a.timeSlot}</td>
                  <td>{a.tokenNumber}</td>
                  <td>
                    <span className={`status ${a.status === "Pending" ? "pending" : "served"}`}>
                      {a.status}
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

export default AdminDashboard;
