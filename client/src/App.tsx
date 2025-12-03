import { Switch, Route as WouterRoute } from "wouter"; // Keep wouter import but don't use it
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/lib/auth";
import './lib/i18n'; // Initialize i18n

import Login from "@/pages/Login";
import SchoolList from "@/pages/SchoolList";
import SchoolForm from "@/pages/SchoolForm";
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
      
      <Route path="/" element={<Navigate to="/schools" replace />} />
      <Route path="/dashboard" element={<Navigate to="/schools" replace />} />
      
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
