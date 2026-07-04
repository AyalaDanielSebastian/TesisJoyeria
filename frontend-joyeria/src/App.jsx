import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ClienteDashboard from './pages/ClienteDashboard'
import EmpleadoDashboard from './pages/EmpleadoDashboard'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute allowedRoles={['Cliente']} />}>
            <Route path="/cliente" element={<ClienteDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['Empleado']} />}>
            <Route path="/empleado" element={<EmpleadoDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['Administrador']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
