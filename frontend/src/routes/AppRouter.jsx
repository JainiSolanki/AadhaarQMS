import { Routes, Route, Navigate } from 'react-router-dom';
import { ROLES } from '@utils/constants';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

// Pages
import LandingPage from '@pages/LandingPage';
import Login from '@pages/auth/Login';
import Register from '@pages/auth/Register';
import ScanQR from '@pages/ScanQR';
import ViewQR from '@pages/ViewQR';

// Citizen
import CitizenDashboard from '@pages/citizen/Dashboard';
import BookAppointment from '@pages/citizen/BookAppointment';
import MyAppointments from '@pages/citizen/MyAppointments';
import AppointmentDetail from '@pages/citizen/AppointmentDetail';
import CitizenProfile from '@pages/citizen/Profile';

// Operator
import OperatorDashboard from '@pages/operator/Dashboard';
import OperatorTodayAppointments from '@pages/operator/TodayAppointments';
import OperatorHistory from '@pages/operator/History';
import OperatorProfile from '@pages/operator/Profile';

// Center Admin
import CenterAdminDashboard from '@pages/center-admin/Dashboard';
import CenterAppointments from '@pages/center-admin/Appointments';
import CenterOperators from '@pages/center-admin/Operators';
import CenterAnalytics from '@pages/center-admin/Analytics';
import CenterAdminProfile from '@pages/center-admin/Profile';

// Super Admin
import SuperAdminDashboard from '@pages/super-admin/Dashboard';
import ManageCenters from '@pages/super-admin/ManageCenters';
import ManageCenterAdmins from '@pages/super-admin/ManageCenterAdmins';
import ManageServices from '@pages/super-admin/ManageServices';
import ManageOperators from '@pages/super-admin/ManageOperators';
import SuperAdminAnalytics from '@pages/super-admin/Analytics';
import SuperAdminProfile from '@pages/super-admin/Profile';
import SuperAdminAppointments from '@pages/super-admin/Appointments';

const AppRouter = () => {
    return (
        <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/scan-qr" element={<ScanQR />} />
            <Route path="/qr" element={<ViewQR />} />

            {/* Citizen */}
            <Route path="/citizen/dashboard" element={<ProtectedRoute allowedRoles={[ROLES.CITIZEN]}><CitizenDashboard /></ProtectedRoute>} />
            <Route path="/citizen/book" element={<ProtectedRoute allowedRoles={[ROLES.CITIZEN]}><BookAppointment /></ProtectedRoute>} />
            <Route path="/citizen/appointments" element={<ProtectedRoute allowedRoles={[ROLES.CITIZEN]}><MyAppointments /></ProtectedRoute>} />
            <Route path="/citizen/appointments/:id" element={<ProtectedRoute allowedRoles={[ROLES.CITIZEN]}><AppointmentDetail /></ProtectedRoute>} />
            <Route path="/citizen/profile" element={<ProtectedRoute allowedRoles={[ROLES.CITIZEN]}><CitizenProfile /></ProtectedRoute>} />

            {/* Operator */}
            <Route path="/operator/dashboard" element={<ProtectedRoute allowedRoles={[ROLES.OPERATOR]}><OperatorDashboard /></ProtectedRoute>} />
            <Route path="/operator/today" element={<ProtectedRoute allowedRoles={[ROLES.OPERATOR]}><OperatorTodayAppointments /></ProtectedRoute>} />
            <Route path="/operator/history" element={<ProtectedRoute allowedRoles={[ROLES.OPERATOR]}><OperatorHistory /></ProtectedRoute>} />
            <Route path="/operator/profile" element={<ProtectedRoute allowedRoles={[ROLES.OPERATOR]}><OperatorProfile /></ProtectedRoute>} />

            {/* Center Admin */}
            <Route path="/center-admin/dashboard" element={<ProtectedRoute allowedRoles={[ROLES.CENTER_ADMIN]}><CenterAdminDashboard /></ProtectedRoute>} />
            <Route path="/center-admin/appointments" element={<ProtectedRoute allowedRoles={[ROLES.CENTER_ADMIN]}><CenterAppointments /></ProtectedRoute>} />
            <Route path="/center-admin/operators" element={<ProtectedRoute allowedRoles={[ROLES.CENTER_ADMIN]}><CenterOperators /></ProtectedRoute>} />
            <Route path="/center-admin/analytics" element={<ProtectedRoute allowedRoles={[ROLES.CENTER_ADMIN]}><CenterAnalytics /></ProtectedRoute>} />
            <Route path="/center-admin/profile" element={<ProtectedRoute allowedRoles={[ROLES.CENTER_ADMIN]}><CenterAdminProfile /></ProtectedRoute>} />

            {/* Super Admin */}
            <Route path="/super-admin/dashboard" element={<ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}><SuperAdminDashboard /></ProtectedRoute>} />
            <Route path="/super-admin/centers" element={<ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}><ManageCenters /></ProtectedRoute>} />
            <Route path="/super-admin/center-admins" element={<ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}><ManageCenterAdmins /></ProtectedRoute>} />
            <Route path="/super-admin/services" element={<ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}><ManageServices /></ProtectedRoute>} />
            <Route path="/super-admin/operators" element={<ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}><ManageOperators /></ProtectedRoute>} />
            <Route path="/super-admin/analytics" element={<ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}><SuperAdminAnalytics /></ProtectedRoute>} />
            <Route path="/super-admin/profile" element={<ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}><SuperAdminProfile /></ProtectedRoute>} />
            <Route path="/super-admin/appointments" element={<ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}><SuperAdminAppointments /></ProtectedRoute>} />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRouter;
