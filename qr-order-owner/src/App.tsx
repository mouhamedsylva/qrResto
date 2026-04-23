import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import Dashboard from './pages/Dashboard';
import MenuManagement from './pages/MenuManagement';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import TablesAndQrPremium from './pages/TablesAndQrPremium';
import Staff from './pages/Staff';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ConfirmProvider } from './components/ConfirmModal';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ConfirmProvider>
          <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Internal Routes (OWNER, MANAGER, ADMIN) */}
            <Route element={<ProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'ADMIN']} />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tables" element={<TablesAndQrPremium />} />
              <Route path="/analytics" element={<Analytics />} />
            </Route>

            {/* Protected Internal Routes (All roles including STAFF) */}
            <Route element={<ProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'STAFF', 'ADMIN']} />}>
              <Route path="/orders" element={<Orders />} />
            </Route>

            {/* Protected Internal Routes (OWNER, ADMIN only) */}
            <Route element={<ProtectedRoute allowedRoles={['OWNER', 'ADMIN']} />}>
              <Route path="/menu" element={<MenuManagement />} />
              <Route path="/staff" element={<Staff />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Catch-all Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </BrowserRouter>
        </ConfirmProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
