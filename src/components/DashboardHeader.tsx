import React, { useState, useRef, useEffect } from 'react';
import { 
  Activity, 
  LogOut, 
  ShieldCheck, 
  Stethoscope, 
  Building2, 
  HeartHandshake, 
  User, 
  LayoutDashboard,
  Users,
  Calendar,
  Pill,
  BedDouble,
  Receipt,
  Database,
  MessageSquare,
  Plus,
  UserPlus,
  CalendarPlus,
  FileBadge,
  Heart,
  ChevronDown,
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigation, AdminSection } from '../context/NavigationContext';
import { UserRole } from '../types';

export const DashboardHeader: React.FC = () => {
  const { profile, role, logout } = useAuth();
  const { 
    activeSection, 
    setActiveSection, 
    openModal, 
    isChatOpen, 
    toggleChat 
  } = useNavigation();

  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const quickActionsRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target as Node)) {
        setIsQuickActionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadgeStyle = (currentRole: UserRole | null) => {
    switch (currentRole) {
      case 'Admin':
        return 'bg-rose-950 text-rose-300 border-rose-700/60';
      case 'Doctor':
        return 'bg-sky-950 text-sky-300 border-sky-700/60';
      case 'Nurse':
        return 'bg-emerald-950 text-emerald-300 border-emerald-700/60';
      case 'Receptionist':
        return 'bg-amber-950 text-amber-300 border-amber-700/60';
      case 'Patient':
        return 'bg-indigo-950 text-indigo-300 border-indigo-700/60';
      default:
        return 'bg-slate-900 text-slate-300 border-slate-700';
    }
  };

  const getRoleIcon = (currentRole: UserRole | null) => {
    switch (currentRole) {
      case 'Admin':
        return <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />;
      case 'Doctor':
        return <Stethoscope className="w-3.5 h-3.5 text-sky-400" />;
      case 'Nurse':
        return <Activity className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Receptionist':
        return <Building2 className="w-3.5 h-3.5 text-amber-400" />;
      case 'Patient':
        return <HeartHandshake className="w-3.5 h-3.5 text-indigo-400" />;
      default:
        return <User className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const adminNavItems: { id: AdminSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'doctors', label: 'Doctors & Rx', icon: Stethoscope },
    { id: 'wards', label: 'Ward & Vitals', icon: BedDouble },
    { id: 'billing', label: 'Billing & Accounts', icon: Receipt },
    { id: 'staff', label: 'Staff & Depts', icon: Building2 },
    { id: 'database', label: 'Cloud DB', icon: Database },
  ];

  return (
    <header className="bg-slate-950 text-white border-b border-slate-800 sticky top-0 z-30 shadow-lg">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center gap-2 sm:gap-4">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <button 
              onClick={() => setActiveSection('overview')}
              className="flex items-center gap-2.5 text-left cursor-pointer group focus:outline-none"
            >
              <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-emerald-600/30 group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-white text-base sm:text-lg tracking-tight group-hover:text-emerald-300 transition-colors">
                    ShebaCare Hospital
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <span className="hidden sm:inline-block text-[11px] font-medium text-emerald-400 bg-emerald-950/80 px-2 py-0.2 rounded-full border border-emerald-800">
                  Hospital Information & Management System
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links (Admin specific) */}
          {role === 'Admin' && (
            <nav className="hidden xl:flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-item-${item.id}`}
                    type="button"
                    onClick={() => setActiveSection(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Quick Actions Dropdown (Only for Admin & Healthcare Staff) */}
            {(role === 'Admin' || role === 'Receptionist' || role === 'Doctor') && (
              <div className="relative" ref={quickActionsRef}>
                <button
                  type="button"
                  id="header-quick-actions-button"
                  onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span className="hidden md:inline">Quick Action</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${isQuickActionsOpen ? 'rotate-180' : ''}`} />
                </button>

                {isQuickActionsOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1">
                      Hospital Quick Operations
                    </div>
                    <button
                      onClick={() => {
                        setIsQuickActionsOpen(false);
                        openModal('register_patient');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl transition-colors text-left cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4 text-amber-400" />
                      <span>Register New Patient</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsQuickActionsOpen(false);
                        openModal('book_appointment');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl transition-colors text-left cursor-pointer"
                    >
                      <CalendarPlus className="w-4 h-4 text-sky-400" />
                      <span>Book Consultation Token</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsQuickActionsOpen(false);
                        openModal('create_bill');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl transition-colors text-left cursor-pointer"
                    >
                      <Receipt className="w-4 h-4 text-emerald-400" />
                      <span>Issue Hospital Bill / Receipt</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsQuickActionsOpen(false);
                        openModal('new_prescription');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl transition-colors text-left cursor-pointer"
                    >
                      <Pill className="w-4 h-4 text-teal-400" />
                      <span>Write E-Prescription</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsQuickActionsOpen(false);
                        openModal('record_vitals');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl transition-colors text-left cursor-pointer"
                    >
                      <Heart className="w-4 h-4 text-rose-400" />
                      <span>Record Vital Telemetry</span>
                    </button>
                    {role === 'Admin' && (
                      <button
                        onClick={() => {
                          setIsQuickActionsOpen(false);
                          openModal('add_staff');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl transition-colors text-left border-t border-slate-800 mt-1 pt-2 cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-rose-400" />
                        <span>Add New Staff / Doctor</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Live Hospital Chat Button */}
            <button
              type="button"
              id="header-chat-toggle-button"
              onClick={toggleChat}
              title="Hospital Live Chat"
              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                isChatOpen 
                  ? 'bg-emerald-600 text-white border-emerald-500' 
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span className="hidden lg:inline text-xs font-bold">Chat</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </button>

            {/* User Profile Info & Role */}
            <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-bold text-xs">
                {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-white truncate max-w-[130px]">
                  {profile?.name || 'User'}
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
                  {profile?.email || profile?.phone}
                </div>
              </div>
            </div>

            {/* Role Badge */}
            <span className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${getRoleBadgeStyle(role)}`}>
              {getRoleIcon(role)}
              <span>{role === 'Admin' ? 'Super Admin' : role}</span>
            </span>

            {/* Sign Out Button */}
            <button
              type="button"
              id="header-logout-button"
              onClick={() => logout()}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Mobile Menu Toggle Button (For Admin on small screens) */}
            {role === 'Admin' && (
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="xl:hidden p-2 text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-xl cursor-pointer"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            )}
          </div>

        </div>

        {/* Mobile & Tablet Navigation Bar (Admin Section Scroll) */}
        {role === 'Admin' && (
          <div className={`xl:hidden pb-2.5 pt-1 overflow-x-auto no-scrollbar border-t border-slate-800/80 ${isMobileMenuOpen ? 'block' : 'flex'}`}>
            <div className="flex items-center gap-1.5">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveSection(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-xl shrink-0 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </header>
  );
};

export default DashboardHeader;
