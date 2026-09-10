import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../features/landing/LandingPage';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import ResetPasswordPage from '../features/auth/ResetPasswordPage';
import UpdatePasswordPage from '../features/auth/UpdatePasswordPage';
import AuthCallbackPage from '../features/auth/AuthCallbackPage';
import AppShell from '../components/layout/AppShell';
import DashboardPage from '../features/dashboard/DashboardPage';
import TasksPage from '../features/tasks/TasksPage';
import CalendarPage from '../features/calendar/CalendarPage';
import ListsPage from '../features/lists/ListsPage';
import GoalsPage from '../features/goals/GoalsPage';
import LearningPage from '../features/learning/LearningPage';
import FamilyPage from '../features/family/FamilyPage';
import SettingsPage from '../features/settings/SettingsPage';
import HelpPage from '../features/help/HelpPage';
import AdminPage from '../features/admin/AdminPage';
import StudentsPage from '../features/students/StudentsPage';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicOnlyRoute } from './PublicOnlyRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Landing Page Institucional */}
      <Route path="/" element={<LandingPage />} />

      {/* Autenticação (Pública Apenas) */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />

      {/* Recuperação de Password & Callbacks OAuth */}
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/update-password" element={<UpdatePasswordPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* Aplicação Privada / App Shell */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="lists" element={<ListsPage />} />
        <Route path="goals" element={<GoalsPage />} />
        <Route path="learning" element={<LearningPage />} />
        <Route path="family" element={<FamilyPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="help" element={<HelpPage />} />
        <Route path="admin" element={<AdminPage />} />
      </Route>

      {/* Fallback 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
