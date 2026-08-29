import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NavigationProvider } from './context/NavigationContext';
import { Login } from './components/Login';
import { DashboardHeader } from './components/DashboardHeader';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { DoctorDashboard } from './components/dashboards/DoctorDashboard';
import { ReceptionistDashboard } from './components/dashboards/ReceptionistDashboard';
import { NurseDashboard } from './components/dashboards/NurseDashboard';
import { PatientDashboard } from './components/dashboards/PatientDashboard';
import { HospitalChat } from './components/HospitalChat';
import { seedAllCollectionsIfEmpty } from './services/firestoreService';

const MainAppContent: React.FC = () => {
  const { role, profile, loading } = useAuth();

  useEffect(() => {
    // Automatically verify and seed initial schema documents for all collections
    seedAllCollectionsIfEmpty().catch((err) => console.warn('Seeding note:', err));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-400">Initializing ShebaCare Cloud Firestore...</span>
        </div>
      </div>
    );
  }

  // If user is not authenticated, display the Login screen
  if (!role || !profile) {
    return <Login />;
  }

  // Render role-specific dashboard based on user's resolved role
  const renderRoleDashboard = () => {
    switch (role) {
      case 'Admin':
        return <AdminDashboard />;
      case 'Doctor':
        return <DoctorDashboard />;
      case 'Nurse':
        return <NurseDashboard />;
      case 'Receptionist':
        return <ReceptionistDashboard />;
      case 'Patient':
        return <PatientDashboard />;
      default:
        return <PatientDashboard />;
    }
  };

  return (
    <NavigationProvider>
      <div className="min-h-screen bg-[#F4F7F6] text-slate-900 flex flex-col font-sans antialiased">
        <DashboardHeader />
        <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-7">
          {renderRoleDashboard()}
        </main>
        {/* Real-time Hospital Live Chat for Patients & Healthcare Staff */}
        <HospitalChat />
      </div>
    </NavigationProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
