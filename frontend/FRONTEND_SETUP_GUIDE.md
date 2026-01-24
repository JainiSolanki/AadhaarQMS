# 🎨 AadhaarQMS Frontend - Complete Setup Guide

## 📋 What We're Building

A **professional, production-ready frontend** with:
- ✅ Dark/Light Mode Toggle
- ✅ User & Admin Separate Dashboards
- ✅ Modern UI with smooth animations
- ✅ Complete authentication system
- ✅ Protected routes
- ✅ Responsive design
- ✅ Real-time queue management

---

## 🗂️ Step 1: Update Project Structure

Your current structure needs reorganization. Follow these steps:

### 1.1 Delete Old Files

**Delete these files from `src/components/`:**
- `AdminDashboard.jsx`
- `BookAppointment.jsx`

**Delete these files from `src/`:**
- `App.css`
- `index.css` (we're replacing it)

### 1.2 Create New Folders

Create these folders inside `src/`:

```bash
# In your terminal (inside frontend folder)
mkdir -p src/context
mkdir -p src/services
mkdir -p src/utils
mkdir -p src/styles
mkdir -p src/pages/auth
mkdir -p src/pages/user
mkdir -p src/pages/admin
mkdir -p src/components/layout
mkdir -p src/components/common
mkdir -p src/components/ui
```

---

## 📦 Step 2: Install Dependencies

Run this command in your `frontend` folder:

```bash
npm install react-router-dom axios recharts lucide-react qrcode.react
```

**What each package does:**
- `react-router-dom` - Page routing
- `axios` - API calls to backend
- `recharts` - Charts for admin analytics
- `lucide-react` - Modern icons
- `qrcode.react` - QR codes for appointments

---

## 📁 Step 3: Create All Required Files

### 3.1 Context Files

**Create:** `src/context/ThemeContext.jsx`
- Copy the ThemeContext code I provided above

**Create:** `src/context/AuthContext.jsx`
- Copy the AuthContext code I provided above

### 3.2 Services

**Create:** `src/services/api.js`
- Copy the API service code I provided above

### 3.3 Utils

**Create:** `src/utils/constants.js`
- Copy the constants code I provided above

### 3.4 Styles

**Create:** `src/styles/global.css`
- Copy the global CSS I provided above
- This replaces your old `index.css`

### 3.5 Root Files

**Replace:** `src/App.jsx`
- Replace with the new App.jsx I provided above

**Replace:** `src/main.jsx`
- Replace with the new main.jsx I provided above

**Replace:** `package.json`
- Replace with the updated package.json I provided above

**Create:** `.env` (in frontend root, same level as package.json)
- Copy the .env content I provided above

---

## 🎯 Step 4: File Checklist

After completing the above steps, your structure should look like this:

```
frontend/
├── node_modules/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── layout/           [Empty for now]
│   │   ├── common/           [Empty for now]
│   │   └── ui/               [Empty for now]
│   ├── context/
│   │   ├── AuthContext.jsx   ✅
│   │   └── ThemeContext.jsx  ✅
│   ├── pages/
│   │   ├── auth/             [We'll create these next]
│   │   ├── user/             [We'll create these next]
│   │   └── admin/            [We'll create these next]
│   ├── services/
│   │   └── api.js            ✅
│   ├── styles/
│   │   └── global.css        ✅
│   ├── utils/
│   │   └── constants.js      ✅
│   ├── App.jsx               ✅
│   └── main.jsx              ✅
├── .env                      ✅
├── package.json              ✅
└── vite.config.js
```

---

## ▶️ Step 5: Test the Setup

### 5.1 Install Dependencies
```bash
npm install
```

### 5.2 Start Development Server
```bash
npm run dev
```

You should see:
```
VITE v7.2.4  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 5.3 Expected Behavior

When you open `http://localhost:5173/`:
- You'll see errors because we haven't created the page components yet
- This is NORMAL! We'll create all pages in the next step

---

## 🚀 Next Steps - Creating Pages

Now that the foundation is set, we need to create:

### Phase 1: Landing & Auth Pages
1. `src/pages/Landing.jsx` - Homepage
2. `src/pages/auth/UserLogin.jsx` - User login
3. `src/pages/auth/UserRegister.jsx` - User registration
4. `src/pages/auth/AdminLogin.jsx` - Admin login

### Phase 2: User Dashboard Pages
5. `src/pages/user/UserDashboard.jsx` - User home
6. `src/pages/user/BookAppointment.jsx` - Booking form
7. `src/pages/user/MyAppointments.jsx` - View appointments
8. `src/pages/user/AppointmentDetails.jsx` - Single appointment view

### Phase 3: Admin Dashboard Pages
9. `src/pages/admin/AdminDashboard.jsx` - Admin home
10. `src/pages/admin/AllAppointments.jsx` - All appointments table
11. `src/pages/admin/QueueManagement.jsx` - Queue management
12. `src/pages/admin/Analytics.jsx` - Analytics & charts

### Phase 4: Public Pages
13. `src/pages/QueueStatus.jsx` - Public queue view

### Phase 5: Reusable Components
14. `src/components/layout/Navbar.jsx` - Navigation bar
15. `src/components/layout/Sidebar.jsx` - Sidebar menu
16. `src/components/common/Button.jsx` - Reusable button
17. `src/components/common/Input.jsx` - Reusable input
18. `src/components/ui/LoadingSpinner.jsx` - Loading state
19. `src/components/ui/ErrorMessage.jsx` - Error display

---

## ✅ Current Status

**What's DONE:**
- ✅ Project structure reorganized
- ✅ Dependencies installed
- ✅ Dark/Light theme system
- ✅ Authentication context
- ✅ API service layer
- ✅ Constants & utilities
- ✅ Global styles
- ✅ Routing setup

**What's NEXT:**
- ⏳ Create all page components
- ⏳ Create reusable UI components
- ⏳ Build user dashboard
- ⏳ Build admin dashboard
- ⏳ Add animations & polish

---

## 🎨 Design Preview

Your app will have:

### Light Mode:
- Clean white backgrounds
- Blue primary color
- Subtle shadows
- Professional typography

### Dark Mode:
- Dark slate backgrounds
- Cyan/blue accents
- Reduced eye strain
- Modern aesthetic

### Features:
- Toggle button in navbar
- Smooth transitions
- Consistent across all pages
- System preference detection

---

## 📞 Troubleshooting

### Error: "Cannot find module"
**Solution:** Make sure all files are created in correct locations

### Error: "Module not found: Can't resolve './pages/Landing'"
**Solution:** We haven't created the page components yet (next step!)

### Styles not applying
**Solution:** Make sure `global.css` is imported in `App.jsx`

### Dark mode not working
**Solution:** Check if ThemeProvider is wrapping the app in `App.jsx`

---

## 🎯 Ready for Next Phase?

Once you've completed all the steps above and confirmed:
1. ✅ Dependencies installed (`node_modules` folder exists)
2. ✅ All context files created
3. ✅ All service files created
4. ✅ All utils files created
5. ✅ Global CSS created
6. ✅ App.jsx updated
7. ✅ Server starts without errors (even if pages are missing)

**Reply with "READY" and I'll start creating all the page components!** 🚀

---

## 📝 Quick Reference

**Start dev server:**
```bash
npm run dev
```

**Build for production:**
```bash
npm run build
```

**Preview production build:**
```bash
npm run preview
```