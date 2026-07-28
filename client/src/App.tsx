import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/context/AuthContext'
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

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Dashboard />} />
              </Route>
              <Route path="/validate" element={<DashboardLayout />}>
                <Route index element={<ValidateEmail />} />
              </Route>
              <Route path="/bulk" element={<DashboardLayout />}>
                <Route index element={<BulkValidate />} />
              </Route>
              <Route path="/reports" element={<DashboardLayout />}>
                <Route index element={<Reports />} />
              </Route>
              <Route path="/history" element={<DashboardLayout />}>
                <Route index element={<History />} />
              </Route>
              <Route path="/settings" element={<DashboardLayout />}>
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
