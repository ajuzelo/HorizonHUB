import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import LoginPage from '@/pages/auth/LoginPage';
import SetupPage from '@/pages/auth/SetupPage';
import AppLayout from '@/components/layout/AppLayout';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import TasksPage from '@/pages/tasks/TasksPage';
import NotesPage from '@/pages/notes/NotesPage';
import CalculatorPage from '@/pages/calculator/CalculatorPage';
import AccountsPayablePage from '@/pages/accounts-payable/AccountsPayablePage';
import XmlImporterPage from '@/pages/xml-importer/XmlImporterPage';
import NfCentralPage from '@/pages/nf-central/NfCentralPage';
import WhatsAppPage from '@/pages/whatsapp/WhatsAppPage';
import SettingsPage from '@/pages/settings/SettingsPage';
import PersonalFinancePage from '@/pages/personal-finance/PersonalFinancePage';
import LogsPage from '@/pages/logs/LogsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/setup" element={<SetupPage />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="notes" element={<NotesPage />} />
          <Route path="calculator" element={<CalculatorPage />} />
          <Route path="accounts-payable" element={<AccountsPayablePage />} />
          <Route path="xml-importer" element={<XmlImporterPage />} />
          <Route path="nf-central" element={<NfCentralPage />} />
          <Route path="whatsapp" element={<WhatsAppPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="personal-finance" element={<PersonalFinancePage />} />
          <Route path="logs" element={<LogsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

// Placeholder for routes not yet implemented
function ComingSoon({ title, phase }: { title: string; phase: number }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-4 shadow-gold">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M14 2L3 8.5V20L14 26L25 20V8.5L14 2Z" stroke="#FFD700" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-text-primary mb-2">{title}</h2>
      <p className="text-sm text-text-secondary text-center max-w-xs">
        Este módulo será implementado na <strong className="text-gold">Fase {phase}</strong> do desenvolvimento.
      </p>
      <div className="mt-4 badge-gold text-xs">Em breve</div>
    </div>
  );
}
