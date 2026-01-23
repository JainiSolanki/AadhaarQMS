# 🚀 AadhaarQMS Backend - Complete Setup Guide

## 📁 Project Structure

```
backend/
├── index.js                 # Main application file
├── server.js               # Server startup file
├── package.json            # Dependencies
├── .env                    # Environment variables
├── routes/
│   ├── auth.js            # Authentication routes
│   └── appointment.js     # Appointment routes
├── middleware/
│   ├── auth.js            # JWT authentication middleware
│   └── validation.js      # Input validation middleware
└── utils/
    └── dynamodb.js        # DynamoDB configuration
```

---

## ⚙️ Step 1: Install Dependencies

```bash
cd backend
npm install
```

This installs:
- `express` - Web framework
- `cors` - Cross-origin resource sharing
- `aws-sdk` - AWS DynamoDB SDK
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing
- `dotenv` - Environment variables
- `nodemon` - Development auto-reload

---

## 🔧 Step 2: Configure AWS DynamoDB

### Option A: Using AWS Cloud (Recommended for Production)

1. **Create AWS Account** (if you don't have one)
   - Go to https://aws.amazon.com/
   - Sign up for free tier

2. **Create IAM User**
   - Go to AWS Console → IAM
   - Create new user with `Programmatic access`
   - Attach policy: `AmazonDynamoDBFullAccess`
   - Save Access Key ID and Secret Access Key

3. **Update .env file**
   ```env
   AWS_REGION=ap-south-1
   AWS_ACCESS_KEY_ID=your_actual_access_key
   AWS_SECRET_ACCESS_KEY=your_actual_secret_key
   ```

### Option B: Using DynamoDB Local (For Development)

1. **Install DynamoDB Local**
   ```bash
   # Download DynamoDB Local
   wget https://s3.ap-south-1.amazonaws.com/dynamodb-local-mumbai/dynamodb_local_latest.tar.gz
   tar -xzf dynamodb_local_latest.tar.gz
   
   # Run DynamoDB Local
   java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb
   ```

2. **Update .env for local**
   ```env
   AWS_REGION=localhost
   AWS_ACCESS_KEY_ID=fakeAccessKey
   AWS_SECRET_ACCESS_KEY=fakeSecretKey
   ```

3. **Update dynamodb.js for local endpoint**
   ```javascript
   AWS.config.update({
     region: process.env.AWS_REGION,
     endpoint: "http://localhost:8000" // Add this line
   });
   ```

---

## 🔐 Step 3: Configure Environment Variables

Create `.env` file in backend root:

```env
# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_12345
JWT_EXPIRE=7d

# AWS DynamoDB
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# Table Names
USERS_TABLE=AadhaarQMS_Users
APPOINTMENTS_TABLE=AadhaarQMS_Appointments
ADMIN_TABLE=AadhaarQMS_Admins

# CORS
FRONTEND_URL=http://localhost:5173

# Default Admin
DEFAULT_ADMIN_EMAIL=admin@aadhaarqms.com
DEFAULT_ADMIN_PASSWORD=Admin@123
```

---

## 🗄️ Step 4: Initialize Database Tables

The tables will be created automatically when you start the server.

**Tables that will be created:**

1. **AadhaarQMS_Users**
   - Primary Key: `userId`
   - Stores user registration data

2. **AadhaarQMS_Appointments**
   - Primary Key: `appointmentId`
   - Stores appointment bookings

3. **AadhaarQMS_Admins**
   - Primary Key: `adminId`
   - Stores admin credentials

---

## ▶️ Step 5: Start the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

You should see:
```
✅ Table AadhaarQMS_Users already exists
✅ Table AadhaarQMS_Appointments already exists
✅ Table AadhaarQMS_Admins already exists
✅ Database tables initialized
Server running on port 5000
```

---

## 👨‍💼 Step 6: Create Default Admin

**Method 1: Using cURL**
```bash
curl -X POST http://localhost:5000/api/auth/admin/create-default
```

**Method 2: Using Postman**
- Method: POST
- URL: `http://localhost:5000/api/auth/admin/create-default`
- Click Send

**Response:**
```json
{
  "success": true,
  "message": "Default admin created successfully",
  "data": {
    "email": "admin@aadhaarqms.com",
    "password": "Admin@123"
  }
}
```

---

## 🧪 Step 7: Test the APIs

### Test 1: Health Check
```bash
curl http://localhost:5000/health
```

### Test 2: User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "9876543210",
    "password": "Test@123"
  }'
```

### Test 3: User Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123"
  }'
```

**Copy the token from response!**

### Test 4: Book Appointment (Replace YOUR_TOKEN)
```bash
curl -X POST http://localhost:5000/api/appointment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "9876543210",
    "aadhaarNumber": "123456789012",
    "serviceType": "New Aadhaar Enrollment",
    "date": "2026-02-01",
    "timeSlot": "10:00 - 11:00"
  }'
```

### Test 5: Admin Login
```bash
curl -X POST http://localhost:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@aadhaarqms.com",
    "password": "Admin@123"
  }'
```

### Test 6: Get All Appointments (Admin)
```bash
curl http://localhost:5000/api/admin/appointments \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 📦 Testing with Postman

### Import Collection

Create a Postman collection with these requests:

#### 1. Register User
- **Method:** POST
- **URL:** `http://localhost:5000/api/auth/register`
- **Body (JSON):**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "password": "John@123"
  }
  ```

#### 2. Login User
- **Method:** POST
- **URL:** `http://localhost:5000/api/auth/login`
- **Body (JSON):**
  ```json
  {
    "email": "john@example.com",
    "password": "John@123"
  }
  ```
- **Save token** from response

#### 3. Book Appointment
- **Method:** POST
- **URL:** `http://localhost:5000/api/appointment`
- **Headers:**
  - Key: `Authorization`
  - Value: `Bearer {{token}}`
- **Body (JSON):**
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

---

## ❌ Common Issues & Solutions

### Issue 1: "Cannot connect to DynamoDB"
**Solution:**
- Check AWS credentials in `.env`
- Verify AWS region is correct
- Ensure IAM user has DynamoDB permissions

### Issue 2: "Token expired or invalid"
**Solution:**
- Login again to get new token
- Check if `JWT_SECRET` is same across requests

### Issue 3: "Table already exists error"
**Solution:**
- This is normal! Tables are checked before creation
- Ignore this message

### Issue 4: "Port 5000 already in use"
**Solution:**
```bash
# Kill process on port 5000
npx kill-port 5000

# Or change port in .env
PORT=5001
```

### Issue 5: "CORS error from frontend"
**Solution:**
- Update `FRONTEND_URL` in `.env`
- Restart backend server

---

## 📊 Monitoring & Logs

### View Server Logs
```bash
npm run dev
```

### Check DynamoDB Tables (AWS Console)
1. Go to AWS Console
2. Navigate to DynamoDB
3. Click "Tables"
4. View your tables

### Test Database Directly
Install AWS CLI and run:
```bash
aws dynamodb scan --table-name AadhaarQMS_Appointments
```

---

## 🔐 Security Checklist

- ✅ Passwords are hashed with bcrypt
- ✅ JWT tokens for authentication
- ✅ Input validation on all routes
- ✅ Protected routes with middleware
- ✅ Environment variables for secrets
- ✅ CORS configured properly

---

## 🚀 Next Steps

1. ✅ Backend is complete and running
2. 📱 Move to **Frontend Development**
3. 🎨 Create React components
4. 🔗 Connect frontend to backend APIs
5. 🧪 End-to-end testing
6. 📦 Deployment (AWS, Heroku, etc.)

---

## 📞 Support

If you encounter any issues:
1. Check console logs
2. Verify .env configuration
3. Test APIs with Postman
4. Check AWS Console for table status
