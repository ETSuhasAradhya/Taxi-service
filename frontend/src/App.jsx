import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout & Guards
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import BookTaxiPage from './pages/customer/BookTaxiPage';
import CustomerBookingsPage from './pages/customer/CustomerBookingsPage';
import CustomerPaymentsPage from './pages/customer/CustomerPaymentsPage';

// Driver Pages
import DriverDashboard from './pages/driver/DriverDashboard';
import DriverTripsPage from './pages/driver/DriverTripsPage';
import DriverReviewsPage from './pages/driver/DriverReviewsPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageBookingsPage from './pages/admin/ManageBookingsPage';
import ManageCustomersPage from './pages/admin/ManageCustomersPage';
import ManageDriversPage from './pages/admin/ManageDriversPage';
import ManageVehiclesPage from './pages/admin/ManageVehiclesPage';
import FareRatesPage from './pages/admin/FareRatesPage';
import PaymentsPage from './pages/admin/PaymentsPage';
import ReviewsPage from './pages/admin/ReviewsPage';
import ReportsPage from './pages/admin/ReportsPage';
import SqlExplorerPage from './pages/admin/SqlExplorerPage';

export default function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Customer Routes */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CustomerDashboard />} />
        <Route path="book" element={<BookTaxiPage />} />
        <Route path="bookings" element={<CustomerBookingsPage />} />
        <Route path="payments" element={<CustomerPaymentsPage />} />
      </Route>

      {/* Driver Routes */}
      <Route
        path="/driver"
        element={
          <ProtectedRoute allowedRoles={['driver']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DriverDashboard />} />
        <Route path="trips" element={<DriverTripsPage />} />
        <Route path="reviews" element={<DriverReviewsPage />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="bookings" element={<ManageBookingsPage />} />
        <Route path="customers" element={<ManageCustomersPage />} />
        <Route path="drivers" element={<ManageDriversPage />} />
        <Route path="vehicles" element={<ManageVehiclesPage />} />
        <Route path="fare-rates" element={<FareRatesPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="sql-explorer" element={<SqlExplorerPage />} />
      </Route>

      {/* Catch-All Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
