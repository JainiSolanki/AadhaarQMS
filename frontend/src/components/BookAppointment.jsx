function BookAppointment() {
  return (
    <div style={{ maxWidth: "500px", margin: "40px auto" }}>
      <h2>Book Aadhaar Appointment</h2>

      <form>
        <input type="text" placeholder="Full Name" required />
        <br /><br />

        <select required>
          <option value="">Select Service</option>
          <option>New Aadhaar Enrollment</option>
          <option>Aadhaar Update</option>
        </select>
        <br /><br />

        <input type="date" required />
        <br /><br />

        <select required>
          <option value="">Select Time Slot</option>
          <option>10:00 - 11:00</option>
          <option>11:00 - 12:00</option>
          <option>12:00 - 01:00</option>
        </select>
        <br /><br />

        <button type="submit">Book Appointment</button>
      </form>
    </div>
  );
}

export default BookAppointment;
