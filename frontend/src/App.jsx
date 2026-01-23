import "./App.css";
import BookAppointment from "./components/BookAppointment";
import AdminDashboard from "./components/AdminDashboard";

function App() {
  return (
    <div className="app-container">
      <h1>AadhaarQMS</h1>
      <p>Appointment and Queue Optimization System</p>
      <BookAppointment />
      <AdminDashboard />
    </div>
  );
}

export default App;
