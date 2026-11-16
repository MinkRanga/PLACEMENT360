
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'

// Layouts & Guards
import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './components/layout/ProtectedRoute'

// Public Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterStudentPage from './pages/auth/RegisterStudentPage'
import RegisterRecruiterPage from './pages/auth/RegisterRecruiterPage'
import RegisterAdminPage from './pages/auth/RegisterAdminPage'

// Admin Views
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminDrivesPage from './pages/admin/AdminDrivesPage'
import AdminStudentsPage from './pages/admin/AdminStudentsPage'
import AdminCompaniesPage from './pages/admin/AdminCompaniesPage'
import AdminReportsPage from './pages/admin/AdminReportsPage'

// Student Views
import StudentDashboard from './pages/student/StudentDashboard'
import StudentDrivesPage from './pages/student/StudentDrivesPage'
import StudentApplicationsPage from './pages/student/StudentApplicationsPage'
import StudentProfilePage from './pages/student/StudentProfilePage'

// Recruiter Views
import RecruiterDashboard from './pages/company/RecruiterDashboard'
import RecruiterDrivesPage from './pages/company/RecruiterDrivesPage'
import RecruiterApplicationsPage from './pages/company/RecruiterApplicationsPage'
import RecruiterProfilePage from './pages/company/RecruiterProfilePage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
            <Routes>

              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register/student" element={<RegisterStudentPage />} />
              <Route path="/register/recruiter" element={<RegisterRecruiterPage />} />
              <Route path="/register/admin" element={<RegisterAdminPage />} />

              {/* Admin Portal */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['TPO_ADMIN']}>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="drives" element={<AdminDrivesPage />} />
                <Route path="students" element={<AdminStudentsPage />} />
                <Route path="companies" element={<AdminCompaniesPage />} />
                <Route path="reports" element={<AdminReportsPage />} />
              </Route>

              {/* Student Portal */}
              <Route
                path="/student"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/student/dashboard" replace />} />
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="drives" element={<StudentDrivesPage />} />
                <Route path="applications" element={<StudentApplicationsPage />} />
                <Route path="profile" element={<StudentProfilePage />} />
              </Route>

              {/* Recruiter Portal */}
              <Route
                path="/recruiter"
                element={
                  <ProtectedRoute allowedRoles={['RECRUITER']}>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/recruiter/dashboard" replace />} />
                <Route path="dashboard" element={<RecruiterDashboard />} />
                <Route path="drives" element={<RecruiterDrivesPage />} />
                <Route path="applications" element={<RecruiterApplicationsPage />} />
                <Route path="profile" element={<RecruiterProfilePage />} />
              </Route>

              {/* Fallback Route */}
              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
          </div>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
