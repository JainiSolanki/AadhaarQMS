# AadhaarQMS Backend API Documentation

## Base URL
```
http://localhost:5000/api
```

---

## 🔐 Authentication APIs

### 1. User Registration
**POST** `/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "Password@123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "USER_1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 2. User Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Password@123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "userId": "USER_1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 3. Admin Login
**POST** `/auth/admin/login`

**Request Body:**
```json
{
  "email": "admin@aadhaarqms.com",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin login successful",
  "data": {
    "adminId": "ADMIN_1234567890",
    "name": "System Administrator",
    "email": "admin@aadhaarqms.com",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 4. Create Default Admin (One-time Setup)
**POST** `/auth/admin/create-default`

**No Request Body Required**

**Response:**
```json
{
  "success": true,
  "message": "Default admin created successfully",
  "data": {
    "email": "admin@aadhaarqms.com",
    "password": "Admin@123",
    "note": "Please change the password after first login"
  }
}
```

---

## 📅 Appointment APIs (User)

### 5. Book Appointment
**POST** `/appointment`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "aadhaarNumber": "123456789012",
  "serviceType": "New Aadhaar Enrollment",
  "date": "2026-02-01",
  "timeSlot": "10:00 - 11:00"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "data": {
    "appointmentId": "APT_1234567890",
    "tokenNumber": "TKN-001",
    "date": "2026-02-01",
    "timeSlot": "10:00 - 11:00",
    "queuePosition": 1,
    "status": "Pending"
  }
}
```

---

### 6. Get My Appointments
**GET** `/my-appointments`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "appointmentId": "APT_1234567890",
      "userId": "USER_1234567890",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "aadhaarNumber": "123456789012",
      "serviceType": "New Aadhaar Enrollment",
      "date": "2026-02-01",
      "timeSlot": "10:00 - 11:00",
      "tokenNumber": "TKN-001",
      "status": "Pending",
      "queuePosition": 1,
      "createdAt": "2026-01-23T10:30:00.000Z",
      "updatedAt": "2026-01-23T10:30:00.000Z"
    }
  ]
}
```

---

### 7. Get Single Appointment
**GET** `/appointment/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "appointmentId": "APT_1234567890",
    "tokenNumber": "TKN-001",
    "status": "Pending",
    // ... other fields
  }
}
```

---

### 8. Cancel Appointment
**DELETE** `/appointment/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Appointment cancelled successfully"
}
```

---

## 👨‍💼 Admin APIs

### 9. Get All Appointments (with filters)
**GET** `/admin/appointments?date=2026-02-01&status=Pending&serviceType=New Aadhaar Enrollment`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `date` (optional): Filter by date (YYYY-MM-DD)
- `status` (optional): Filter by status
- `serviceType` (optional): Filter by service type

**Response:**
```json
{
  "success": true,
  "count": 25,
  "data": [
    {
      "appointmentId": "APT_1234567890",
      "name": "John Doe",
      "tokenNumber": "TKN-001",
      "status": "Pending",
      // ... other fields
    }
  ]
}
```

---

### 10. Update Appointment Status
**PUT** `/admin/appointment/:id/status`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "status": "Served"
}
```

**Valid Status Values:**
- `Pending`
- `In Progress`
- `Served`
- `Cancelled`
- `No Show`

**Response:**
```json
{
  "success": true,
  "message": "Appointment status updated successfully",
  "data": {
    "appointmentId": "APT_1234567890",
    "status": "Served"
  }
}
```

---

### 11. Get Dashboard Analytics
**GET** `/admin/analytics`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "total": 150,
      "pending": 45,
      "inProgress": 5,
      "served": 85,
      "cancelled": 10,
      "noShow": 5
    },
    "today": {
      "total": 25,
      "pending": 15,
      "served": 10
    },
    "serviceBreakdown": {
      "New Aadhaar Enrollment": 75,
      "Aadhaar Update": 75
    }
  }
}
```

---

## 📊 Public APIs

### 12. Get Today's Queue Status
**GET** `/queue/today`

**No Authentication Required**

**Response:**
```json
{
  "success": true,
  "date": "2026-01-23",
  "queueLength": 12,
  "data": [
    {
      "tokenNumber": "TKN-001",
      "timeSlot": "10:00 - 11:00",
      "status": "In Progress"
    },
    {
      "tokenNumber": "TKN-002",
      "timeSlot": "10:00 - 11:00",
      "status": "Pending"
    }
  ]
}
```

---

## 🔴 Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "All fields are required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Appointment not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error booking appointment",
  "error": "Detailed error message"
}
```

---

## 📝 Validation Rules

### Email
- Must be valid email format

### Phone
- Must be 10 digits
- Must start with 6-9

### Aadhaar Number
- Must be exactly 12 digits

### Password
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number

### Date
- Format: YYYY-MM-DD
- Must be today or future date

### Time Slots (Available)
- 10:00 - 11:00
- 11:00 - 12:00
- 12:00 - 01:00
- 02:00 - 03:00
- 03:00 - 04:00

### Service Types
- New Aadhaar Enrollment
- Aadhaar Update
- Biometric Update
- Mobile Number Update
- Address Update

---

## 🔧 Setup Instructions

1. **Install Dependencies**
```bash
npm install
```

2. **Configure Environment**
Create `.env` file with required variables

3. **Create Default Admin**
```bash
curl -X POST http://localhost:5000/api/auth/admin/create-default
```

4. **Start Server**
```bash
npm run dev
```

---

## 🧪 Testing the APIs

You can test using:
- **Postman** (Recommended)
- **Thunder Client** (VS Code Extension)
- **cURL**

### Example: Book Appointment using cURL
```bash
curl -X POST http://localhost:5000/api/appointment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "aadhaarNumber": "123456789012",
    "serviceType": "New Aadhaar Enrollment",
    "date": "2026-02-01",
    "timeSlot": "10:00 - 11:00"
  }'
```