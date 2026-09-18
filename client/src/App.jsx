import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { ProtectedRoute, RoleGuard, PublicOnlyRoute } from './components/auth/ProtectedRoute.jsx';
import { DashboardLayout } from './layouts/DashboardLayout.jsx';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage.jsx';
import { RegisterPage } from './pages/auth/RegisterPage.jsx';
import { VerifyOtpPage } from './pages/auth/VerifyOtpPage.jsx';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard.jsx';
import { StudentDrives } from './pages/student/StudentDrives.jsx';
import { DriveDetails } from './pages/student/DriveDetails.jsx';
import { MyApplications } from './pages/student/MyApplications.jsx';
import { StudentProfile } from './pages/student/StudentProfile.jsx';
import { StudentAnnouncements } from './pages/student/StudentAnnouncements.jsx';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard.jsx';
import { StudentsManager } from './pages/admin/StudentsManager.jsx';
import { CompaniesManager } from './pages/admin/CompaniesManager.jsx';
import { DrivesManager } from './pages/admin/DrivesManager.jsx';
import { ApplicationsManager } from './pages/admin/ApplicationsManager.jsx';
import { AnnouncementsManager } from './pages/admin/AnnouncementsManager.jsx';
import { ReportsManager } from './pages/admin/ReportsManager.jsx';

// Recruiter Pages
import { RecruiterDashboard } from './pages/recruiter/RecruiterDashboard.jsx';
import { RecruiterDrives } from './pages/recruiter/RecruiterDrives.jsx';
import { RecruiterApplications } from './pages/recruiter/RecruiterApplications.jsx';
import { RecruiterCompanyProfile } from './pages/recruiter/RecruiterCompanyProfile.jsx';

// 404
import { NotFoundPage } from './pages/NotFoundPage.jsx';

const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'recruiter') return <Navigate to="/recruiter/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

function App() {
  return (
    <Routes>
      {/* Public Authentication Routes - Redirects logged-in users to their dashboard */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
      </Route>

      {/* Root Route Smart Redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Authenticated Portal Protected Routes */}
      <Route element={<ProtectedRoute />}>
        {/* Student Portal */}
        <Route element={<RoleGuard allowedRoles={['student']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/drives" element={<StudentDrives />} />
            <Route path="/student/drives/:id" element={<DriveDetails />} />
            <Route path="/student/applications" element={<MyApplications />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/student/announcements" element={<StudentAnnouncements />} />
          </Route>
        </Route>

        {/* Admin (Placement Officer) Portal */}
        <Route element={<RoleGuard allowedRoles={['admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/students" element={<StudentsManager />} />
            <Route path="/admin/companies" element={<CompaniesManager />} />
            <Route path="/admin/drives" element={<DrivesManager />} />
            <Route path="/admin/applications" element={<ApplicationsManager />} />
            <Route path="/admin/announcements" element={<AnnouncementsManager />} />
            <Route path="/admin/reports" element={<ReportsManager />} />
          </Route>
        </Route>

        {/* Recruiter Portal */}
        <Route element={<RoleGuard allowedRoles={['recruiter']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
            <Route path="/recruiter/drives" element={<RecruiterDrives />} />
            <Route path="/recruiter/applications" element={<RecruiterApplications />} />
            <Route path="/recruiter/profile" element={<RecruiterCompanyProfile />} />
          </Route>
        </Route>
      </Route>

      {/* 404 Catch All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
