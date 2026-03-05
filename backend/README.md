# AadhaarQMS Backend

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your AWS credentials and settings
```

3. Initialize database:
```bash
node scripts/seedData.js
```

4. Start server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- POST /api/auth/register - Register citizen
- POST /api/auth/login - Citizen login
- POST /api/auth/admin/login - Admin login

### Centers
- GET /api/centers - Get all centers
- GET /api/centers/cities - Get cities by state
- GET /api/centers/:id - Get center details
- POST /api/centers - Create center (Super Admin)
- PUT /api/centers/:id - Update center (Super Admin)
- DELETE /api/centers/:id - Deactivate center (Super Admin)

### Services
- GET /api/services - Get all services
- GET /api/services/:id - Get service details
- POST /api/services - Create service (Super Admin)
- PUT /api/services/:id - Update service (Super Admin)

### Appointments
- POST /api/appointments - Book appointment (Citizen)
- GET /api/appointments/my - Get user's appointments (Citizen)
- GET /api/appointments/:id - Get appointment details
- DELETE /api/appointments/:id - Cancel appointment (Citizen)

### Queue
- GET /api/queue/availability - Get slot availability
- GET /api/queue/today/:centerId - Get today's queue
- GET /api/queue/my-position/:appointmentId - Get position in queue

### Operators
- GET /api/operators - Get operators
- GET /api/operators/center/:centerId - Get center operators
- POST /api/operators - Create operator
- PUT /api/operators/:id - Update operator
- DELETE /api/operators/:id - Deactivate operator

### Admin
- GET /api/admin/appointments - Get appointments (filtered)
- PUT /api/admin/appointments/:id/status - Update status
- PUT /api/admin/appointments/:id/assign-operator - Assign operator
- POST /api/admin/center-admin - Create center admin
- GET /api/admin/analytics - Get analytics

## Environment Variables

See `.env.example` for required variables.

## Project Structure
```
backend/
├── config/          # Configuration files
├── middleware/      # Express middleware
├── models/          # Data models/schemas
├── routes/          # API routes
├── services/        # Business logic
├── utils/           # Helper functions
├── uploads/         # Document uploads
├── scripts/         # Database scripts
├── .env             # Environment variables
├── server.js        # Entry point
└── package.json
```
```

---

## ✅ **BACKEND NOW 100% COMPLETE!**

### **Final Backend Structure:**
```
backend/
├── config/
│   └── dynamodb.js
├── middleware/
│   ├── auth.js
│   ├── validation.js
│   └── errorHandler.js
├── models/
│   ├── User.js
│   ├── Admin.js
│   ├── Center.js
│   ├── Appointment.js
│   ├── Service.js
│   └── Operator.js
├── routes/
│   ├── auth.js
│   ├── centers.js
│   ├── services.js
│   ├── appointments.js
│   ├── operators.js
│   ├── queue.js
│   └── admin.js
├── services/
│   ├── appointmentService.js
│   ├── userService.js
│   ├── centerService.js
│   └── queueService.js
├── utils/
│   ├── constants.js
│   ├── helpers.js
│   ├── dynamodb.js
│   └── emailService.js
├── scripts/
│   └── seedData.js
├── uploads/
│   └── .gitkeep
├── .env
├── .gitignore
├── package.json
├── server.js
└── README.md