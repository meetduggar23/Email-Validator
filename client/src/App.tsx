import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Toaster } from '@/components/ui/toast'
import Landing from '@/pages/Landing'
import Dashboard from '@/pages/Dashboard'
import ValidateEmail from '@/pages/ValidateEmail'
import BulkValidate from '@/pages/BulkValidate'
import Reports from '@/pages/Reports'
import History from '@/pages/History'
import Settings from '@/pages/Settings'
import Favorites from '@/pages/Favorites'
import Collections from '@/pages/Collections'
import ApiPlayground from '@/pages/ApiPlayground'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import ForgotPassword from '@/pages/ForgotPassword'

const queryClient = new QueryClient()

interface ProtectedRouteProps {
  children: React.ReactNode
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { token, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0A0A0C]">
        <div className="w-10 h-10 border-4 border-[#5B5CEB] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route index element={<Dashboard />} />
              </Route>
              <Route path="/validate" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route index element={<ValidateEmail />} />
              </Route>
              <Route path="/bulk" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route index element={<BulkValidate />} />
              </Route>
              <Route path="/reports" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route index element={<Reports />} />
              </Route>
              <Route path="/history" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route index element={<History />} />
              </Route>
              <Route path="/favorites" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route index element={<Favorites />} />
              </Route>
              <Route path="/collections" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route index element={<Collections />} />
              </Route>
              <Route path="/api-playground" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route index element={<ApiPlayground />} />
              </Route>
              <Route path="/settings" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route index element={<Settings />} />
              </Route>
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
