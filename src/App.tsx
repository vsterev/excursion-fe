import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { SiteHelmet } from './components/SiteHelmet'
import { AppLayout } from './AppLayout'
import { AdminLayout } from './AdminLayout'
import { AuthProvider, useAuth } from './AuthContext'
import { HomePage } from './pages/HomePage'
import { ExcursionsPage } from './pages/ExcursionsPage'
import { ExcursionDetailPage } from './pages/ExcursionDetailPage'
import { RepresentativesPage } from './pages/RepresentativesPage'
import { RepresentativeDetailPage } from './pages/RepresentativeDetailPage'
import { UsefulInfoPage } from './pages/UsefulInfoPage'
import { AboutPage } from './pages/AboutPage'
import { LoginPage } from './pages/LoginPage'
import { AdminExcursionsPage } from './pages/admin/AdminExcursionsPage'
import { AdminRepresentativesPage } from './pages/admin/AdminRepresentativesPage'
import { AdminUsefulInfoPage } from './pages/admin/AdminUsefulInfoPage'
import { NotFoundPage } from './pages/NotFoundPage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  return token ? <>{children}</> : <Navigate to="/admin/login" replace />
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/excursions" element={<ExcursionsPage />} />
        <Route path="/excursions/:id" element={<ExcursionDetailPage />} />
        <Route path="/representatives" element={<RepresentativesPage />} />
        <Route path="/representatives/:id" element={<RepresentativeDetailPage />} />
        {/* Public useful-info: not linked in nav/home for now; URL + admin CRUD remain for later use */}
        <Route path="/useful-info" element={<UsefulInfoPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Auth */}
      <Route path="/admin/login" element={<LoginPage />} />

      {/* Admin (protected) */}
      <Route path="/admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="/admin/excursions" replace />} />
        <Route path="excursions" element={<AdminExcursionsPage />} />
        <Route path="representatives" element={<AdminRepresentativesPage />} />
        <Route path="useful-info" element={<AdminUsefulInfoPage />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <SiteHelmet />
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  )
}
