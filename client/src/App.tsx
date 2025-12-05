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
import SaleDetail from "@/pages/Sales/SaleDetail";
import AnnouncementsList from "@/pages/Announcements/AnnouncementsList";
import LeaveRequestsList from "@/pages/Leaves/LeaveRequestsList";
import AppointmentsList from "@/pages/Appointments/AppointmentsList";
import UsersList from "@/pages/Users/UsersList";
import TeamsList from "@/pages/Teams/TeamsList";
import MyPerformancePage from "@/pages/Performance/MyPerformancePage";
import CommissionsPage from "@/pages/Performance/CommissionsPage";
import AuditLogsPage from "@/pages/AuditLogs/AuditLogsPage";
import MobileHome from "@/pages/Mobile/MobileHome";
import MobileVisits from "@/pages/Mobile/MobileVisits";
import MobileNewVisit from "@/pages/Mobile/MobileNewVisit";
import MobileOffers from "@/pages/Mobile/MobileOffers";
import MobileProfile from "@/pages/Mobile/MobileProfile";
import { MobileLayout } from "@/components/layout/MobileLayout";
import RequireRole from "@/components/RequireRole";
import { Layout } from "@/components/layout/Layout";
import NotFound from "@/pages/not-found";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";

import TargetsList from "@/pages/Performance/TargetsList";
import PerformanceUsers from "@/pages/Performance/PerformanceUsers";
import OfferTemplateSettings from "@/pages/Settings/OfferTemplateSettings";
import ToursList from "@/pages/Settings/ToursList";
import TourForm from "@/pages/Settings/TourForm";
import SchoolDetail from "@/pages/SchoolDetail";

import SystemUsersPage from "@/pages/system/SystemUsersPage";
import UserFormPage from "@/pages/system/UserFormPage";
import SystemTeamsPage from "@/pages/system/SystemTeamsPage";
import TeamFormPage from "@/pages/system/TeamFormPage";
import SystemSettingsPage from "@/pages/system/SystemSettingsPage";
import RegionMapReportPage from "@/pages/reports/RegionMapReportPage";
import OfferDetailPage from "@/pages/Offers/OfferDetailPage";

// Protected Route Wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
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

      <Route path="/schools/:id" element={<ProtectedRoute><SchoolDetail /></ProtectedRoute>} />
      <Route path="/schools/:id/edit" element={<ProtectedRoute><SchoolEdit /></ProtectedRoute>} />

      <Route path="/visits" element={<ProtectedRoute><VisitsList /></ProtectedRoute>} />
      <Route path="/visits/new" element={<ProtectedRoute><VisitCreate /></ProtectedRoute>} />
      <Route path="/visits/:id/edit" element={<ProtectedRoute><VisitEdit /></ProtectedRoute>} />
      
      <Route path="/offers" element={<ProtectedRoute><OffersList /></ProtectedRoute>} />
      <Route path="/offers/new" element={<ProtectedRoute><OfferCreate /></ProtectedRoute>} />
      <Route path="/offers/:id" element={<ProtectedRoute><OfferDetailPage /></ProtectedRoute>} />
      <Route path="/offers/:id/edit" element={<ProtectedRoute><OfferEdit /></ProtectedRoute>} />

      <Route path="/sales" element={<ProtectedRoute><SalesList /></ProtectedRoute>} />
      <Route path="/sales/:id" element={<ProtectedRoute><SaleDetail /></ProtectedRoute>} />
      
      <Route path="/announcements" element={<ProtectedRoute><AnnouncementsList /></ProtectedRoute>} />
      <Route path="/leave-requests" element={<ProtectedRoute><LeaveRequestsList /></ProtectedRoute>} />
      <Route path="/appointments" element={<ProtectedRoute><AppointmentsList /></ProtectedRoute>} />
      
      <Route path="/performance/me" element={<ProtectedRoute><MyPerformancePage /></ProtectedRoute>} />
      <Route path="/performance/targets" element={<ProtectedRoute><RequireRole roles={['admin', 'manager', 'system_admin']}><TargetsList /></RequireRole></ProtectedRoute>} />
      <Route path="/performance/users" element={<ProtectedRoute><RequireRole roles={['admin', 'manager', 'system_admin']}><PerformanceUsers /></RequireRole></ProtectedRoute>} />
      <Route path="/commissions" element={<ProtectedRoute><CommissionsPage /></ProtectedRoute>} />
      
      <Route path="/settings/offer-template" element={<ProtectedRoute><RequireRole roles={['admin', 'system_admin']}><OfferTemplateSettings /></RequireRole></ProtectedRoute>} />
      
      <Route path="/settings/tours" element={<ProtectedRoute><RequireRole roles={['admin', 'system_admin']}><ToursList /></RequireRole></ProtectedRoute>} />
      <Route path="/settings/tours/new" element={<ProtectedRoute><RequireRole roles={['admin', 'system_admin']}><TourForm /></RequireRole></ProtectedRoute>} />
      <Route path="/settings/tours/:id/edit" element={<ProtectedRoute><RequireRole roles={['admin', 'system_admin']}><TourForm /></RequireRole></ProtectedRoute>} />

      {/* System Admin Routes */}
      <Route path="/system/users" element={<ProtectedRoute><RequireRole roles={['system_admin']}><SystemUsersPage /></RequireRole></ProtectedRoute>} />
      <Route path="/system/users/new" element={<ProtectedRoute><RequireRole roles={['system_admin']}><UserFormPage /></RequireRole></ProtectedRoute>} />
      <Route path="/system/users/:id/edit" element={<ProtectedRoute><RequireRole roles={['system_admin']}><UserFormPage /></RequireRole></ProtectedRoute>} />
      
      <Route path="/system/teams" element={<ProtectedRoute><RequireRole roles={['system_admin']}><SystemTeamsPage /></RequireRole></ProtectedRoute>} />
      <Route path="/system/teams/new" element={<ProtectedRoute><RequireRole roles={['system_admin']}><TeamFormPage /></RequireRole></ProtectedRoute>} />
      <Route path="/system/teams/:id/edit" element={<ProtectedRoute><RequireRole roles={['system_admin']}><TeamFormPage /></RequireRole></ProtectedRoute>} />
      
      <Route path="/system/settings" element={<ProtectedRoute><RequireRole roles={['system_admin']}><SystemSettingsPage /></RequireRole></ProtectedRoute>} />
      
      {/* Reports */}
      <Route path="/reports/map" element={<ProtectedRoute><RequireRole roles={['system_admin', 'admin', 'manager']}><RegionMapReportPage /></RequireRole></ProtectedRoute>} />

      <Route path="/audit-logs" element={
        <ProtectedRoute>
          <RequireRole roles={['admin']}>
            <AuditLogsPage />
          </RequireRole>
        </ProtectedRoute>
      } />

      <Route path="/users" element={
        <ProtectedRoute>
          <RequireRole roles={['admin']}>
            <UsersList />
          </RequireRole>
        </ProtectedRoute>
      } />
      
      <Route path="/users/new" element={
        <ProtectedRoute>
          <RequireRole roles={['admin']}>
            <UserFormPage />
          </RequireRole>
        </ProtectedRoute>
      } />
      
      <Route path="/users/:id/edit" element={
        <ProtectedRoute>
          <RequireRole roles={['admin']}>
            <UserFormPage />
          </RequireRole>
        </ProtectedRoute>
      } />
      
      <Route path="/teams" element={
        <ProtectedRoute>
          <RequireRole roles={['admin']}>
            <TeamsList />
          </RequireRole>
        </ProtectedRoute>
      } />

      {/* Mobile Routes */}
      <Route path="/m" element={<ProtectedRoute><MobileLayout><MobileHome /></MobileLayout></ProtectedRoute>} />
      <Route path="/m/visits" element={<ProtectedRoute><MobileLayout><MobileVisits /></MobileLayout></ProtectedRoute>} />
      <Route path="/m/visits/new" element={<ProtectedRoute><MobileLayout><MobileNewVisit /></MobileLayout></ProtectedRoute>} />
      <Route path="/m/offers" element={<ProtectedRoute><MobileLayout><MobileOffers /></MobileLayout></ProtectedRoute>} />
      <Route path="/m/profile" element={<ProtectedRoute><MobileLayout><MobileProfile /></MobileLayout></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Router />
            <Toaster />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
