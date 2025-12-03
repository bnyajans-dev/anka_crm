import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/lib/auth";
import './lib/i18n'; // Initialize i18n

import Login from "@/pages/Login";
import SchoolList from "@/pages/SchoolList";
import SchoolForm from "@/pages/SchoolForm";
import SchoolEdit from "@/pages/SchoolEdit";
import Dashboard from "@/pages/Dashboard";
import VisitsList from "@/pages/Visits/VisitsList";
import VisitCreate from "@/pages/Visits/VisitCreate";
import VisitEdit from "@/pages/Visits/VisitEdit";
import OffersList from "@/pages/Offers/OffersList";
import OfferCreate from "@/pages/Offers/OfferCreate";
import OfferEdit from "@/pages/Offers/OfferEdit";
import SalesList from "@/pages/Sales/SalesList";
import AnnouncementsList from "@/pages/Announcements/AnnouncementsList";
import LeaveRequestsList from "@/pages/Leaves/LeaveRequestsList";
import AppointmentsList from "@/pages/Appointments/AppointmentsList";
import { Layout } from "@/components/layout/Layout";
import NotFound from "@/pages/not-found";

// Protected Route Wrapper
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Layout>{children}</Layout>;
}

function Router() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/schools" element={
        <ProtectedRoute>
          <SchoolList />
        </ProtectedRoute>
      } />
      
      <Route path="/schools/new" element={
        <ProtectedRoute>
          <SchoolForm />
        </ProtectedRoute>
      } />

      <Route path="/schools/:id/edit" element={
        <ProtectedRoute>
          <SchoolEdit />
        </ProtectedRoute>
      } />

      <Route path="/visits" element={<ProtectedRoute><VisitsList /></ProtectedRoute>} />
      <Route path="/visits/new" element={<ProtectedRoute><VisitCreate /></ProtectedRoute>} />
      <Route path="/visits/:id/edit" element={<ProtectedRoute><VisitEdit /></ProtectedRoute>} />
      
      <Route path="/offers" element={<ProtectedRoute><OffersList /></ProtectedRoute>} />
      <Route path="/offers/new" element={<ProtectedRoute><OfferCreate /></ProtectedRoute>} />
      <Route path="/offers/:id/edit" element={<ProtectedRoute><OfferEdit /></ProtectedRoute>} />

      <Route path="/sales" element={<ProtectedRoute><SalesList /></ProtectedRoute>} />
      
      <Route path="/announcements" element={<ProtectedRoute><AnnouncementsList /></ProtectedRoute>} />
      <Route path="/leave-requests" element={<ProtectedRoute><LeaveRequestsList /></ProtectedRoute>} />
      <Route path="/appointments" element={<ProtectedRoute><AppointmentsList /></ProtectedRoute>} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Router />
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
