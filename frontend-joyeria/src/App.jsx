import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import TiendaPage from './pages/TiendaPage'
import ProductoDetallePage from './pages/ProductoDetallePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ClienteDashboard from './pages/ClienteDashboard'
import CarritoPage from './pages/CarritoPage'
import MisOrdenesPage from './pages/MisOrdenesPage'
import EmpleadoDashboard from './pages/EmpleadoDashboard'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>  
          <Route path="/" element={<HomePage />} />
          <Route path="/tienda" element={<TiendaPage />} />
          <Route path="/tienda/producto/:id" element={<ProductoDetallePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute allowedRoles={['Cliente']} />}>
            <Route path="/cliente" element={<ClienteDashboard />} />
            <Route path="/cliente/carrito" element={<CarritoPage />} />
            <Route path="/cliente/ordenes" element={<MisOrdenesPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['Empleado']} />}>
            <Route path="/empleado" element={<EmpleadoDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['Administrador']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
