import { lazy, Suspense } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { View, Loader } from 'reshaped'
import { SiteHelmet } from './components/SiteHelmet'
import { AppLayout } from './AppLayout'
import { AdminLayout } from './AdminLayout'
import { AuthProvider, useAuth } from './AuthContext'
import { AdminUnauthorizedBridge } from './AdminUnauthorizedBridge'

const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })))
const ExcursionsPage = lazy(() => import('./pages/ExcursionsPage').then((m) => ({ default: m.ExcursionsPage })))
const ExcursionDetailPage = lazy(() =>
  import('./pages/ExcursionDetailPage').then((m) => ({ default: m.ExcursionDetailPage })),
)
const RepresentativesPage = lazy(() =>
  import('./pages/RepresentativesPage').then((m) => ({ default: m.RepresentativesPage })),
)
const RepresentativeDetailPage = lazy(() =>
  import('./pages/RepresentativeDetailPage').then((m) => ({ default: m.RepresentativeDetailPage })),
)
const UsefulInfoPage = lazy(() => import('./pages/UsefulInfoPage').then((m) => ({ default: m.UsefulInfoPage })))
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })))
const ResortsPage = lazy(() => import('./pages/ResortsPage').then((m) => ({ default: m.ResortsPage })))
const ResortDetailPage = lazy(() =>
  import('./pages/ResortDetailPage').then((m) => ({ default: m.ResortDetailPage })),
)
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const AdminExcursionsPage = lazy(() =>
  import('./pages/admin/AdminExcursionsPage').then((m) => ({ default: m.AdminExcursionsPage })),
)
const AdminRepresentativesPage = lazy(() =>
  import('./pages/admin/AdminRepresentativesPage').then((m) => ({ default: m.AdminRepresentativesPage })),
)
const AdminUsefulInfoPage = lazy(() =>
  import('./pages/admin/AdminUsefulInfoPage').then((m) => ({ default: m.AdminUsefulInfoPage })),
)
const AdminResortsPage = lazy(() =>
  import('./pages/admin/AdminResortsPage').then((m) => ({ default: m.AdminResortsPage })),
)
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))

function RouteFallback() {
  return (
    <View align="center" padding={16}>
      <Loader size="large" />
    </View>
  )
}

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
        <Route path="/resorts" element={<ResortsPage />} />
        <Route path="/resorts/:id" element={<ResortDetailPage />} />
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
        <Route path="resorts" element={<AdminResortsPage />} />
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
          <AdminUnauthorizedBridge />
          <Suspense fallback={<RouteFallback />}>
            <AppRoutes />
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  )
}
