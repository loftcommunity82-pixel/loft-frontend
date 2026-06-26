import { Routes, Route, useLocation } from 'react-router-dom'
import ScrollToTop from '@/components/ScrollToTop'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/providers/AuthProvider'
import ProtectedRoute from '@/components/ui/ProtectedRoute'
import DashboardShell from '@/components/layout/DashboardShell'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import About from './pages/About'
import Contact from './pages/Contact'
import Dashboard from './pages/Dashboard'
import BrowseJobs from './pages/BrowseJobs'
import JobDetail from './pages/JobDetail'
import CreateJob from './pages/CreateJob'
import Applications from './pages/Applications'
import ApplicationDetail from './pages/ApplicationDetail'
import Profile from './pages/Profile'
import Messages from './pages/Messages'
import Settings from './pages/Settings'
import Notifications from './pages/Notifications'
import Onboarding from './pages/Onboarding'
import Blocked from './pages/Blocked'
import ForgotPassword from './pages/ForgotPassword'
import SavedJobs from './pages/SavedJobs'
import FAQ from './pages/FAQ'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import NotFound from './pages/NotFound'
import HiringWorkflow from './pages/HiringWorkflow'
import EmployerDashboard from './pages/EmployerDashboard'
import CompanyProfile from './pages/CompanyProfile'
import JobCandidates from './pages/JobCandidates'
import Guide from './pages/Guide'
import Admin from './pages/Admin'
import AdminSettings from './pages/AdminSettings'
import AdminEmployers from './pages/AdminEmployers'
import EditJob from './pages/EditJob'
import ErrorPage from './pages/ErrorPage'

export default function App() {
  const location = useLocation()

  return (
    <AuthProvider>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/jobs" element={<BrowseJobs />} />
          <Route path="/jobs/:slug" element={<JobDetail />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/blocked" element={<Blocked />} />

          <Route element={<DashboardShell />}>
            <Route path="/dashboard" element={<ProtectedRoute requiredRole="applicant"><Dashboard /></ProtectedRoute>} />
            <Route path="/jobs/create" element={<ProtectedRoute requiredRole="employer"><CreateJob /></ProtectedRoute>} />
            <Route path="/applications" element={<ProtectedRoute requiredRole="applicant"><Applications /></ProtectedRoute>} />
            <Route path="/applications/:id" element={<ProtectedRoute requiredRole="applicant"><ApplicationDetail /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/saved-jobs" element={<ProtectedRoute requiredRole="applicant"><SavedJobs /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/hiring-workflow" element={<ProtectedRoute requiredRole="employer"><HiringWorkflow /></ProtectedRoute>} />
            <Route path="/employer/dashboard" element={<ProtectedRoute requiredRole="employer"><EmployerDashboard /></ProtectedRoute>} />
            <Route path="/employer/company" element={<ProtectedRoute requiredRole="employer"><CompanyProfile /></ProtectedRoute>} />
            <Route path="/employer/jobs/:id/candidates" element={<ProtectedRoute requiredRole="employer"><JobCandidates /></ProtectedRoute>} />
            <Route path="/employer/jobs/:id/edit" element={<ProtectedRoute requiredRole="employer"><EditJob /></ProtectedRoute>} />
            <Route path="/guide" element={<ProtectedRoute><Guide /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
            <Route path="/admin/employers" element={<ProtectedRoute><AdminEmployers /></ProtectedRoute>} />
            <Route path="/error" element={<ErrorPage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          },
        }}
      />
    </AuthProvider>
  )
}
