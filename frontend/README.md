# AadhaarQMS Frontend - Complete Architecture

## 📁 Folder Structure

```
frontend/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/              # Static assets
│   │   ├── images/
│   │   └── icons/
│   │
│   ├── components/          # Reusable UI components
│   │   ├── common/          # Generic components
│   │   │   ├── Alert.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Textarea.jsx
│   │   │   ├── DatePicker.jsx
│   │   │   ├── TimePicker.jsx
│   │   │   ├── QRCode.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   └── Tooltip.jsx
│   │   │
│   │   ├── layout/          # Layout components
│   │   │   ├── AppLayout.jsx
│   │   │   ├── AuthLayout.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── ThemeToggle.jsx
│   │   │
│   │   ├── features/        # Feature-specific components
│   │   │   ├── appointments/
│   │   │   │   ├── AppointmentCard.jsx
│   │   │   │   ├── AppointmentList.jsx
│   │   │   │   ├── BookingForm.jsx
│   │   │   │   └── StatusTimeline.jsx
│   │   │   │
│   │   │   ├── queue/
│   │   │   │   ├── QueueCard.jsx
│   │   │   │   ├── QueueProgress.jsx
│   │   │   │   └── LiveStatus.jsx
│   │   │   │
│   │   │   ├── centers/
│   │   │   │   ├── CenterCard.jsx
│   │   │   │   ├── CenterForm.jsx
│   │   │   │   └── CenterMap.jsx
│   │   │   │
│   │   │   ├── operators/
│   │   │   │   ├── OperatorCard.jsx
│   │   │   │   ├── OperatorForm.jsx
│   │   │   │   └── OperatorQueue.jsx
│   │   │   │
│   │   │   └── analytics/
│   │   │       ├── StatsCard.jsx
│   │   │       ├── Chart.jsx
│   │   │       └── Dashboard.jsx
│   │   │
│   │   └── ProtectedRoute.jsx
│   │
│   ├── pages/               # Page components
│   │   ├── Landing.jsx
│   │   ├── NotFound.jsx
│   │   │
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── AdminLogin.jsx
│   │   │
│   │   ├── user/            # Citizen pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── BookAppointment.jsx
│   │   │   ├── MyAppointments.jsx
│   │   │   ├── AppointmentDetails.jsx
│   │   │   └── QueueStatus.jsx
│   │   │
│   │   ├── operator/        # Operator pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── MyQueue.jsx
│   │   │   └── History.jsx
│   │   │
│   │   ├── center-admin/    # Center Admin pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Appointments.jsx
│   │   │   ├── Operators.jsx
│   │   │   ├── Analytics.jsx
│   │   │   └── Settings.jsx
│   │   │
│   │   └── super-admin/     # Super Admin pages
│   │       ├── Dashboard.jsx
│   │       ├── ManageCenters.jsx
│   │       ├── ManageAdmins.jsx
│   │       ├── ManageOperators.jsx
│   │       ├── ManageServices.jsx
│   │       └── Analytics.jsx
│   │
│   ├── services/            # API service layer
│   │   ├── api.js           # Axios instance & interceptors
│   │   ├── authService.js
│   │   ├── appointmentService.js
│   │   ├── centerService.js
│   │   ├── operatorService.js
│   │   ├── queueService.js
│   │   ├── adminService.js
│   │   └── serviceService.js
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useAsync.js
│   │   ├── useDebounce.js
│   │   ├── useLocalStorage.js
│   │   ├── useIntersectionObserver.js
│   │   ├── useMediaQuery.js
│   │   └── useToast.js
│   │
│   ├── context/             # React Context
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   │
│   ├── store/               # State management (Zustand)
│   │   ├── authStore.js
│   │   ├── appointmentStore.js
│   │   └── themeStore.js
│   │
│   ├── utils/               # Utility functions
│   │   ├── constants.js     # Constants & enums
│   │   ├── formatters.js    # Date, time, currency formatters
│   │   ├── validators.js    # Form validators
│   │   ├── helpers.js       # General helpers
│   │   └── api-errors.js    # API error handlers
│   │
│   ├── routes/              # Route configuration
│   │   ├── index.jsx        # Main router
│   │   ├── publicRoutes.jsx
│   │   └── privateRoutes.jsx
│   │
│   ├── App.jsx              # Root app component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
│
├── .env
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🎯 Key Architecture Decisions

### 1. **Component Organization**
- **common/**: Purely presentational, reusable across all features
- **layout/**: Structural components (header, sidebar, footer)
- **features/**: Domain-specific components grouped by feature

### 2. **State Management Strategy**
- **Zustand**: For global state (auth, theme, appointments)
- **React Context**: For theme and auth context
- **Local State**: For component-specific state (forms, UI toggles)

### 3. **Routing Strategy**
- **Public Routes**: Landing, Login, Register
- **Protected Routes**: Role-based dashboards
- **Auto-redirect**: Logged-in users redirected to dashboard
- **Role Guards**: Prevent unauthorized access

### 4. **API Service Layer**
- Centralized Axios instance with interceptors
- Automatic token management
- Request/response transformation
- Error handling

### 5. **Code Standards**
- ESLint + Prettier
- Functional components with hooks
- Named exports for utilities
- Default exports for pages/components
- PropTypes for type checking

## 🚀 User Roles & Permissions

### CITIZEN (Role: "CITIZEN")
- Book appointments
- View own appointments
- Track queue status
- Cancel appointments
- View appointment details with QR code

### OPERATOR (Role: "OPERATOR")
- View assigned queue
- Update appointment status
- Mark as completed/no-show
- View history

### CENTER_ADMIN (Role: "CENTER_ADMIN")
- View all center appointments
- Manage operators
- View center analytics
- Update center settings

### SUPER_ADMIN (Role: "SUPER_ADMIN")
- Manage all centers
- Create center admins
- Manage services
- Global analytics

## 🎨 Design System

### Colors
- Primary: #FF6B2B (Orange)
- Secondary: #1A6FD4 (Blue)
- Success: #22C55E
- Warning: #F59E0B
- Danger: #EF4444
- Info: #3B82F6

### Typography
- Headings: Syne (700, 800)
- Body: DM Sans (400, 500, 600)

### Spacing Scale
- xs: 0.25rem
- sm: 0.5rem
- md: 1rem
- lg: 1.5rem
- xl: 2rem
- 2xl: 3rem

## 📦 Dependencies

### Core
- react: ^19.2.0
- react-dom: ^19.2.0
- react-router-dom: ^7.13.0

### State & Data
- zustand: ^5.0.11
- axios: ^1.13.5

### UI & Styling
- tailwindcss: ^4.1.18
- @tailwindcss/vite: ^4.1.18
- lucide-react: ^0.564.0
- framer-motion: ^12.34.0

### Utilities
- date-fns: ^4.1.0
- qrcode.react: ^4.2.0
- react-hot-toast: ^2.6.0

### Dev Tools
- vite: ^7.3.1
- @vitejs/plugin-react: ^5.1.1
- eslint: ^9.39.1