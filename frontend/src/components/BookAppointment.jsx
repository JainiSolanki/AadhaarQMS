import { useState } from "react";

function BookAppointment() {
  const [formData, setFormData] = useState({
    name: "",
    serviceType: "",
    date: "",
    timeSlot: ""
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/appointment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Error booking appointment");
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "40px auto" }}>
      <h2>Book Aadhaar Appointment</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <br /><br />

        <select
          name="serviceType"
          value={formData.serviceType}
          onChange={handleChange}
          required
        >
          <option value="">Select Service</option>
          <option>Aadhaar Update</option>
          <option>New Aadhaar Enrollment</option>
        </select>
        <br /><br />

        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
        <br /><br />

        <select
          name="timeSlot"
          value={formData.timeSlot}
          onChange={handleChange}
          required
        >
          <option value="">Select Time Slot</option>
          <option>10:00 - 11:00</option>
          <option>11:00 - 12:00</option>
          <option>12:00 - 01:00</option>
        </select>
        <br /><br />

        <button type="submit">Book Appointment</button>
      </form>

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>{result.message}</h3>
          <p><strong>Token Number:</strong> {result.appointment.tokenNumber}</p>
          <p><strong>Status:</strong> {result.appointment.status}</p>
        </div>
      )}
    </div>
  );
}

export default BookAppointment;
