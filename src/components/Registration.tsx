import React, { useState } from 'react';
import { 
  Activity, 
  ShieldCheck, 
  Stethoscope, 
  HeartHandshake, 
  Building2, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Sparkles,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface RegistrationProps {
  onSuccessRedirect?: (role: UserRole) => void;
}

export const Registration: React.FC<RegistrationProps> = ({ onSuccessRedirect }) => {
  const { register, error, clearError } = useAuth();

  // Selected Role
  const [selectedRole, setSelectedRole] = useState<UserRole>('Patient');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Role-Specific Attributes
  const [department, setDepartment] = useState('');
  const [bmdcRegNo, setBmdcRegNo] = useState('');
  const [nidNumber, setNidNumber] = useState('');
  const [division, setDivision] = useState('Dhaka');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [address, setAddress] = useState('');

  const divisions = [
    'Dhaka',
    'Chattogram',
    'Rajshahi',
    'Khulna',
    'Barishal',
    'Sylhet',
    'Rangpur',
    'Mymensingh',
  ];

  const roles: { 
    role: UserRole; 
    title: string;
    tagline: string; 
    icon: React.ReactNode;
    colorBadge: string;
    activeBorder: string;
  }[] = [
    { 
      role: 'Patient', 
      title: 'Patient',
      tagline: 'Appointments, Prescriptions & Reports',
      icon: <HeartHandshake className="w-5 h-5 text-emerald-700" />,
      colorBadge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      activeBorder: 'border-emerald-600 bg-emerald-100/80 shadow-emerald-950/10 text-emerald-950'
    },
    { 
      role: 'Doctor', 
      title: 'Doctor',
      tagline: 'Diagnosis, E-Prescriptions & OPD Queue',
      icon: <Stethoscope className="w-5 h-5 text-teal-700" />,
      colorBadge: 'bg-teal-100 text-teal-900 border-teal-300',
      activeBorder: 'border-emerald-600 bg-emerald-100/80 shadow-emerald-950/10 text-emerald-950'
    },
    { 
      role: 'Nurse', 
      title: 'Nurse',
      tagline: 'In-Patient Vitals & Ward Management',
      icon: <Activity className="w-5 h-5 text-emerald-700" />,
      colorBadge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      activeBorder: 'border-emerald-600 bg-emerald-100/80 shadow-emerald-950/10 text-emerald-950'
    },
    { 
      role: 'Receptionist', 
      title: 'Receptionist',
      tagline: 'Intake, Tokens & Bill Collections',
      icon: <Building2 className="w-5 h-5 text-emerald-800" />,
      colorBadge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      activeBorder: 'border-emerald-600 bg-emerald-100/80 shadow-emerald-950/10 text-emerald-950'
    },
    { 
      role: 'Admin', 
      title: 'Admin',
      tagline: 'Staff, Inventory, Cloud & Governance',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-700" />,
      colorBadge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      activeBorder: 'border-emerald-600 bg-emerald-100/80 shadow-emerald-950/10 text-emerald-950'
    }
  ];

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    clearError();
    if (role === 'Doctor') {
      setDepartment('Cardiology & Internal Medicine');
    } else if (role === 'Nurse') {
      setDepartment('Ward & Intensive Care Unit');
    } else if (role === 'Receptionist') {
      setDepartment('Front Desk Intake');
    } else if (role === 'Admin') {
      setDepartment('Hospital Operations');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!name.trim()) {
      alert('Please enter your full legal name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      alert('Please provide a valid email address');
      return;
    }
    if (password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      const registered = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role: selectedRole,
        phone: phone ? (phone.startsWith('+880') ? phone : `+880${phone.trim()}`) : '+880 1711-000000',
        department: department.trim(),
        specialization: selectedRole === 'Doctor' ? (bmdcRegNo ? `BMDC: ${bmdcRegNo}` : 'Specialist Physician') : undefined,
        dob: dob || undefined,
        gender: gender || 'Male',
        address: address ? `${address}, ${division}` : division,
      });

      if (onSuccessRedirect) {
        onSuccessRedirect(registered.role);
      }
    } catch (err: any) {
      console.error('Registration failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F8F5] text-slate-900 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Mint Blurs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-100/90 border border-emerald-300 text-emerald-900 text-xs font-bold tracking-wide">
            <Activity className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>ApexCare Health Management</span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 tracking-tight">
              Hospital Registration Portal
            </h1>
          </div>
          <p className="text-emerald-800/80 text-xs sm:text-sm font-medium mt-1">
            Enterprise Hospital Information & Management System (HMS)
          </p>
        </div>

        {/* Light Green Card */}
        <div className="bg-[#EBF7EE] text-slate-900 rounded-3xl p-5 sm:p-8 shadow-xl shadow-emerald-950/5 border border-emerald-200/90 ring-1 ring-emerald-400/20 relative overflow-hidden">
          
          {/* Subtle Accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none -z-0" />
          
          {/* Section 1: Role Selector */}
          <div className="relative z-10 mb-6 sm:mb-7">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-emerald-950 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Select Your Role / Actor:
              </span>
              <span className="text-[11px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                {selectedRole}
              </span>
            </div>

            {/* Responsive Role Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-2.5">
              {roles.map((item) => {
                const isSelected = selectedRole === item.role;
                return (
                  <button
                    key={item.role}
                    type="button"
                    id={`role-opt-${item.role.toLowerCase()}`}
                    onClick={() => handleRoleChange(item.role)}
                    className={`min-h-[72px] sm:min-h-[82px] flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer active:scale-95 ${
                      isSelected
                        ? `${item.activeBorder} ring-2 ring-emerald-500/40 shadow-sm font-bold`
                        : 'border-emerald-200/80 bg-white/90 hover:bg-white text-slate-700 hover:text-emerald-950'
                    }`}
                  >
                    <div className={`p-1.5 rounded-xl mb-1.5 ${isSelected ? 'bg-white shadow-xs' : 'bg-emerald-50'}`}>
                      {item.icon}
                    </div>
                    <span className="text-xs font-bold tracking-tight">{item.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-rose-800 text-xs font-medium animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 2: Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-emerald-950 mb-1.5">
                Full Legal Name *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-emerald-700/60" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    clearError();
                  }}
                  placeholder={selectedRole === 'Doctor' ? 'Dr. Rafiqul Islam, MBBS, FCPS' : 'Mohammad Kamrul Hasan'}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-emerald-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-emerald-950 mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-emerald-700/60" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearError();
                    }}
                    placeholder="user@hospital.com"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-emerald-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-950 mb-1.5">
                  Mobile Number *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-xs font-bold text-emerald-700">
                    +880
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone.replace(/^\+880\s?/, '')}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01711-XXXXXX"
                    className="w-full pl-14 pr-4 py-3 bg-white border border-emerald-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* DOCTOR SPECIFIC */}
            {selectedRole === 'Doctor' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-emerald-100/50 border border-emerald-200">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-950 mb-1">
                    BMDC Registration No *
                  </label>
                  <div className="relative">
                    <FileCheck className="absolute left-3 top-3 w-3.5 h-3.5 text-emerald-600" />
                    <input
                      type="text"
                      required
                      value={bmdcRegNo}
                      onChange={(e) => setBmdcRegNo(e.target.value)}
                      placeholder="BMDC Reg: A-45210"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-emerald-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-950 mb-1">
                    Medical Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Cardiology / Internal Medicine"
                    className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* PATIENT SPECIFIC */}
            {selectedRole === 'Patient' && (
              <div className="space-y-3 p-3.5 rounded-2xl bg-emerald-100/50 border border-emerald-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-950 mb-1">
                      Region / Division
                    </label>
                    <select
                      value={division}
                      onChange={(e) => setDivision(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      {divisions.map((div) => (
                        <option key={div} value={div}>{div}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-950 mb-1">
                      National ID / Health Card ID
                    </label>
                    <input
                      type="text"
                      value={nidNumber}
                      onChange={(e) => setNidNumber(e.target.value)}
                      placeholder="NID-1995XXXXXXXXXX"
                      className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-950 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-950 mb-1">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-950 mb-1">
                    Present Residential Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House #12, Road #7, Dhanmondi, Dhaka"
                    className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* NURSE & RECEPTIONIST & ADMIN DEPT */}
            {(selectedRole === 'Nurse' || selectedRole === 'Receptionist' || selectedRole === 'Admin') && (
              <div className="p-3.5 rounded-2xl bg-emerald-100/50 border border-emerald-200">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-950 mb-1">
                  Assigned Ward / Department (Duty Station)
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder={
                    selectedRole === 'Nurse' 
                      ? 'CCU & Ward 3 (Coronary Care)' 
                      : selectedRole === 'Receptionist' 
                      ? 'Main OPD Admissions Counter #1' 
                      : 'Hospital Operations & Governance'
                  }
                  className="w-full px-3 py-2.5 bg-white border border-emerald-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-emerald-950 mb-1.5">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-emerald-700/60" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError();
                  }}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-11 py-3 bg-white border border-emerald-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-emerald-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Primary CTA Button */}
            <div className="pt-2">
              <button
                type="submit"
                id="register-submit-btn"
                disabled={isSubmitting}
                className="w-full min-h-[48px] flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm sm:text-base shadow-md shadow-emerald-700/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Creating {selectedRole} Account...</span>
                  </div>
                ) : (
                  <>
                    <span>Register & Sign In as {selectedRole}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

        </div>

        {/* Footer */}
        <div className="text-center text-xs text-emerald-800/70 flex items-center justify-center gap-1.5 pb-4">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Protected with Role-Based Access Control (RBAC) & Cloud Firestore</span>
        </div>

      </div>
    </div>
  );
};

export default Registration;
