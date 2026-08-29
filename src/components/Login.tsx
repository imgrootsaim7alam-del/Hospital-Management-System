import React, { useState } from 'react';
import { 
  Activity, 
  ShieldCheck, 
  Stethoscope, 
  HeartHandshake, 
  Building2, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ArrowRight,
  User,
  Phone,
  CheckCircle2,
  Sparkles,
  Check,
  UserCheck,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface LoginProps {
  onSuccessRedirect?: (role: UserRole) => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccessRedirect }) => {
  const { login, register, error, clearError } = useAuth();
  
  // Tab state: 'login' or 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Selected Role for Registration & Login verification
  const [selectedRole, setSelectedRole] = useState<UserRole>('Patient');

  // Common credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccessMsg, setRegistrationSuccessMsg] = useState<string | null>(null);

  // Role-specific registration fields
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  // Handle role switch
  const handleRoleSelection = (role: UserRole) => {
    setSelectedRole(role);
    clearError();
    setRegistrationSuccessMsg(null);

    // Preset department hints for registration based on role
    if (role === 'Doctor') {
      setDepartment('Department of Cardiology & Internal Medicine');
      setSpecialization('Specialist Physician');
    } else if (role === 'Nurse') {
      setDepartment('Ward & Intensive Care Unit');
    } else if (role === 'Receptionist') {
      setDepartment('Front Desk & Patient Admissions');
    } else if (role === 'Admin') {
      setDepartment('Hospital Operations & IT Governance');
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setRegistrationSuccessMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (authMode === 'login') {
        // Sign in using exact registered credentials
        const profile = await login(cleanEmail, password, selectedRole);
        if (onSuccessRedirect) {
          onSuccessRedirect(profile.role);
        }
      } else {
        // Registration validations
        if (!fullName.trim()) {
          throw new Error('Please enter your full legal name.');
        }
        if (!phoneNumber.trim()) {
          throw new Error('Please enter your contact phone number.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match. Please re-enter your password.');
        }

        // Register profile into Firebase Auth & Cloud Firestore
        const profile = await register({
          name: fullName.trim(),
          email: cleanEmail,
          password,
          role: selectedRole,
          phone: phoneNumber.trim(),
          department,
          specialization: specialization || licenseNumber,
          dob,
          gender,
          address,
          emergencyContact,
          bloodGroup,
        });

        // Set success feedback
        setRegistrationSuccessMsg(
          `Account registered successfully for ${profile.name} as ${profile.role}! Please sign in below using your registered credentials.`
        );

        // Switch to login tab and prefill the registered email
        setAuthMode('login');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleConfig = (role: UserRole) => {
    switch (role) {
      case 'Admin':
        return {
          icon: <ShieldCheck className="w-5 h-5 text-emerald-700" />,
          title: 'Administrator',
          desc: 'System governance, user access management & hospital auditing',
          badge: 'border-emerald-300 bg-emerald-100 text-emerald-900',
          accent: 'from-emerald-600 to-teal-700',
        };
      case 'Doctor':
        return {
          icon: <Stethoscope className="w-5 h-5 text-teal-700" />,
          title: 'Doctor / Physician',
          desc: 'Patient diagnosis, OPD tokens, e-prescriptions & clinical records',
          badge: 'border-teal-300 bg-teal-100 text-teal-900',
          accent: 'from-teal-600 to-emerald-700',
        };
      case 'Nurse':
        return {
          icon: <Activity className="w-5 h-5 text-emerald-700" />,
          title: 'Nurse / Ward Care',
          desc: 'Bed admissions, vitals recording & medication administration',
          badge: 'border-emerald-300 bg-emerald-100 text-emerald-900',
          accent: 'from-emerald-600 to-teal-700',
        };
      case 'Receptionist':
        return {
          icon: <Building2 className="w-5 h-5 text-emerald-800" />,
          title: 'Receptionist',
          desc: 'Patient intake, appointment booking & invoice payment collection',
          badge: 'border-emerald-300 bg-emerald-100 text-emerald-900',
          accent: 'from-emerald-600 to-teal-700',
        };
      case 'Patient':
        return {
          icon: <HeartHandshake className="w-5 h-5 text-teal-700" />,
          title: 'Patient',
          desc: 'Doctor appointments, health history, prescriptions & medical bills',
          badge: 'border-teal-300 bg-teal-100 text-teal-900',
          accent: 'from-teal-600 to-emerald-700',
        };
    }
  };

  const rolesList: UserRole[] = ['Patient', 'Doctor', 'Nurse', 'Receptionist', 'Admin'];
  const activeRoleConfig = getRoleConfig(selectedRole);

  return (
    <div id="hms-auth-container" className="min-h-screen bg-[#F3F8F5] flex flex-col justify-center py-10 sm:px-6 lg:px-8 relative">
      {/* Background Subtle Mint Glow Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-green-100/40 rounded-full blur-3xl" />
      </div>

      {/* Hospital Branding Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center px-4">
        <div className="flex justify-center">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-center text-white ring-4 ring-white">
            <Activity className="w-8 h-8" />
          </div>
        </div>
        
        <h2 id="login-title" className="mt-4 text-2xl sm:text-3xl font-extrabold text-emerald-950 tracking-tight">
          ApexCare Health
        </h2>
        <p className="mt-1 text-xs sm:text-sm font-medium text-emerald-800/80">
          Hospital Information & Management System (HMS)
        </p>

        {/* Auth Mode Switcher (Sign In vs Register) */}
        <div className="mt-6 inline-flex p-1 bg-emerald-100/90 rounded-xl border border-emerald-200 shadow-inner">
          <button
            type="button"
            id="tab-btn-signin"
            onClick={() => {
              setAuthMode('login');
              clearError();
              setRegistrationSuccessMsg(null);
            }}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
              authMode === 'login'
                ? 'bg-white text-emerald-900 shadow-sm border border-emerald-200/60'
                : 'text-emerald-800 hover:text-emerald-950'
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-600" />
            Sign In with Account
          </button>
          <button
            type="button"
            id="tab-btn-register"
            onClick={() => {
              setAuthMode('register');
              clearError();
              setRegistrationSuccessMsg(null);
            }}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
              authMode === 'register'
                ? 'bg-white text-emerald-900 shadow-sm border border-emerald-200/60'
                : 'text-emerald-800 hover:text-emerald-950'
            }`}
          >
            <UserPlus className="w-4 h-4 text-emerald-600" />
            Register New Account
          </button>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-2xl px-4 sm:px-0">
        {/* LIGHT GREEN CARD CONTAINER */}
        <div className="bg-[#EBF7EE] py-8 px-6 shadow-xl shadow-emerald-950/5 sm:rounded-2xl sm:px-10 border border-emerald-200/90 ring-1 ring-emerald-400/20">
          
          {/* Registration Success Banner */}
          {registrationSuccessMsg && (
            <div 
              id="registration-success-alert"
              className="mb-5 p-4 bg-emerald-100/90 border border-emerald-300 rounded-xl flex items-start gap-3 text-emerald-900 text-sm animate-fadeIn"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">{registrationSuccessMsg}</p>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Enter your password below to sign in directly.
                </p>
              </div>
            </div>
          )}

          {/* Error Alert Box */}
          {error && (
            <div 
              id="login-error-alert"
              className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 text-sm animate-fadeIn"
            >
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs sm:text-sm font-medium">{error}</div>
            </div>
          )}

          {/* 1. ROLE SELECTOR */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                {authMode === 'register' ? '1. Select Your Role to Register:' : 'Designated Role / Access Portal:'}
              </label>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-300">
                Selected: {selectedRole}
              </span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {rolesList.map((r) => {
                const config = getRoleConfig(r);
                const isSelected = selectedRole === r;
                return (
                  <button
                    key={r}
                    type="button"
                    id={`role-select-${r.toLowerCase()}`}
                    onClick={() => handleRoleSelection(r)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-100 text-emerald-950 shadow-sm ring-2 ring-emerald-500/40 font-bold'
                        : 'border-emerald-200/80 bg-white/90 hover:bg-white text-slate-700 font-medium hover:border-emerald-300'
                    }`}
                  >
                    <div className="p-1.5 rounded-xl bg-white shadow-xs mb-1.5 border border-emerald-100">
                      {config.icon}
                    </div>
                    <span className="text-xs">{r}</span>
                    {isSelected && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] text-emerald-700 mt-0.5 font-bold">
                        <Check className="w-2.5 h-2.5" /> Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Role Purpose Badge */}
            <div className="mt-3 p-2.5 rounded-xl bg-emerald-100/60 border border-emerald-200/80 flex items-center justify-between text-xs text-emerald-950">
              <span className="font-medium text-emerald-900 flex items-center gap-1.5">
                {activeRoleConfig.icon}
                <strong>{activeRoleConfig.title}:</strong> {activeRoleConfig.desc}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${activeRoleConfig.badge}`}>
                {authMode === 'login' ? 'Role Access' : 'New Registration'}
              </span>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleAuthSubmit}>

            {/* ================= REGISTER-ONLY FIELDS ================= */}
            {authMode === 'register' && (
              <div className="space-y-4 border-b border-emerald-200/80 pb-4">
                <div className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  2. Personal & Account Information
                </div>

                {/* Full Name & Phone Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-emerald-950 mb-1">
                      Full Legal Name *
                    </label>
                    <div className="relative rounded-xl shadow-xs">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-700/60">
                        <User className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={selectedRole === 'Doctor' ? 'Dr. Sarah Jenkins' : selectedRole === 'Nurse' ? 'Nurse Emily Davis' : 'John Doe'}
                        className="block w-full pl-10 pr-3 py-2.5 border border-emerald-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-emerald-950 mb-1">
                      Contact Phone Number *
                    </label>
                    <div className="relative rounded-xl shadow-xs">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-700/60">
                        <Phone className="h-4 w-4" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+880 1711-234567"
                        className="block w-full pl-10 pr-3 py-2.5 border border-emerald-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* DOCTOR & NURSE SPECIFIC FIELDS */}
                {(selectedRole === 'Doctor' || selectedRole === 'Nurse') && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-emerald-100/50 p-3 rounded-xl border border-emerald-200">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-emerald-950 mb-1">
                        Medical Department
                      </label>
                      <input
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="e.g. Cardiology, Pediatrics, ICU"
                        className="block w-full px-3 py-2 border border-emerald-200 rounded-lg text-slate-900 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-emerald-950 mb-1">
                        {selectedRole === 'Doctor' ? 'Specialization / BMDC License #' : 'Ward Assignment'}
                      </label>
                      <input
                        type="text"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        placeholder={selectedRole === 'Doctor' ? 'Cardiologist • BMDC: A-45210' : 'ICU Ward 3B'}
                        className="block w-full px-3 py-2 border border-emerald-200 rounded-lg text-slate-900 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                )}

                {/* PATIENT SPECIFIC REGISTRATION FIELDS */}
                {selectedRole === 'Patient' && (
                  <div className="space-y-3 bg-emerald-100/50 p-3.5 rounded-xl border border-emerald-200">
                    <div className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                      <HeartHandshake className="w-3.5 h-3.5 text-emerald-700" />
                      Patient Medical Record Details
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className="block w-full px-3 py-2 border border-emerald-200 rounded-lg text-slate-900 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
                          Gender
                        </label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value as any)}
                          className="block w-full px-3 py-2 border border-emerald-200 rounded-lg text-slate-900 text-xs bg-white"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
                          Blood Group
                        </label>
                        <select
                          value={bloodGroup}
                          onChange={(e) => setBloodGroup(e.target.value)}
                          className="block w-full px-3 py-2 border border-emerald-200 rounded-lg text-slate-900 text-xs bg-white"
                        >
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
                        Residential Address / City
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="House 42, Road 11, Banani, Dhaka"
                        className="block w-full px-3 py-2 border border-emerald-200 rounded-lg text-slate-900 text-xs bg-white"
                      />
                    </div>
                  </div>
                )}

                {/* RECEPTIONIST & ADMIN SPECIFIC FIELDS */}
                {(selectedRole === 'Receptionist' || selectedRole === 'Admin') && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-emerald-950 mb-1">
                      Desk / Department Unit
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder={selectedRole === 'Receptionist' ? 'Main Lobby Intake Desk' : 'Executive Hospital Governance'}
                      className="block w-full px-3 py-2 border border-emerald-200 rounded-xl text-slate-900 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                )}

              </div>
            )}

            {/* ================= COMMON EMAIL & PASSWORD ================= */}
            <div>
              <label 
                htmlFor="email-address" 
                className="block text-xs font-semibold uppercase tracking-wider text-emerald-950 mb-1"
              >
                {authMode === 'register' ? 'Register Email Address *' : 'Registered Email Address *'}
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-700/60">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearError();
                  }}
                  className="block w-full pl-10 pr-3 py-2.5 border border-emerald-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm bg-white"
                  placeholder={authMode === 'register' ? 'yourname@domain.com' : 'Enter your registered email address'}
                />
              </div>
            </div>

            <div>
              <label 
                htmlFor="password" 
                className="block text-xs font-semibold uppercase tracking-wider text-emerald-950 mb-1"
              >
                {authMode === 'register' ? 'Create Password (min 6 chars) *' : 'Password *'}
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-700/60">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError();
                  }}
                  className="block w-full pl-10 pr-10 py-2.5 border border-emerald-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm bg-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  id="toggle-password-visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-emerald-700 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (in Register mode) */}
            {authMode === 'register' && (
              <div>
                <label 
                  htmlFor="confirm-password" 
                  className="block text-xs font-semibold uppercase tracking-wider text-emerald-950 mb-1"
                >
                  Confirm Password *
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-700/60">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-emerald-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm bg-white"
                    placeholder="Re-type your password"
                  />
                </div>
              </div>
            )}

            {/* Notice / Switch Link for Sign In vs Register */}
            {authMode === 'login' ? (
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-emerald-800">
                  Don't have an account yet?
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    clearError();
                  }}
                  className="font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                >
                  Register First &rarr;
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-emerald-800">
                  Already registered your account?
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    clearError();
                  }}
                  className="font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                >
                  Sign In Here &rarr;
                </button>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                id="auth-submit-button"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-md shadow-emerald-700/20 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{authMode === 'login' ? 'Verifying registered credentials...' : 'Registering your account in Firestore...'}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>
                      {authMode === 'login'
                        ? `Sign In as ${selectedRole}`
                        : `Complete Registration as ${selectedRole}`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </button>
            </div>
          </form>

        </div>

        {/* Security & System Info Footer */}
        <div className="mt-6 text-center text-xs text-emerald-800/70 space-y-1">
          <p className="flex items-center justify-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Role-Based Access Control (RBAC) Verified in Firebase & Cloud Firestore</span>
          </p>
          <p className="text-[11px] text-emerald-700/60">Admin • Doctor • Nurse • Receptionist • Patient</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
