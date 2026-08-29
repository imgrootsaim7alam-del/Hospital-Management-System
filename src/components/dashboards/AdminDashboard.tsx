import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Activity, 
  Building2, 
  TrendingUp, 
  UserPlus, 
  Database,
  Banknote,
  FileText,
  Heart,
  Pill,
  ClipboardList,
  CheckCircle2,
  RefreshCw,
  MessageSquare,
  Calendar,
  CalendarPlus,
  BedDouble,
  Receipt,
  Search,
  ChevronRight,
  Clock,
  Check,
  Filter,
  ArrowUpRight,
  Stethoscope,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { 
  usersService, 
  departmentsService, 
  patientsService, 
  appointmentsService, 
  admissionsService, 
  medicalRecordsService, 
  prescriptionsService, 
  vitalSignsService, 
  nursingNotesService, 
  billsService,
  messagesService,
  seedAllCollectionsIfEmpty
} from '../../services/firestoreService';
import { 
  UserProfile, 
  Department, 
  Patient, 
  Appointment, 
  Admission, 
  MedicalRecord, 
  Prescription, 
  VitalSigns, 
  NursingNote, 
  Bill 
} from '../../types';

// Modals
import { RegisterPatientModal } from '../modals/RegisterPatientModal';
import { BookAppointmentModal } from '../modals/BookAppointmentModal';
import { CreateBillModal } from '../modals/CreateBillModal';
import { RecordVitalsModal } from '../modals/RecordVitalsModal';
import { NewPrescriptionModal } from '../modals/NewPrescriptionModal';
import { AddStaffModal } from '../modals/AddStaffModal';
import { AddDepartmentModal } from '../modals/AddDepartmentModal';

export const AdminDashboard: React.FC = () => {
  const { profile } = useAuth();
  const { activeSection, setActiveSection, activeModal, openModal, closeModal } = useNavigation();

  // Data States
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [vitals, setVitals] = useState<VitalSigns[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<{ id: string; name: string }>({
    id: 'PAT-BD-1001',
    name: 'Md. Jasim Uddin'
  });

  // Real-time Firestore subscriptions for live data
  useEffect(() => {
    const unsubUsers = usersService.subscribeUsers((list) => setUsers(list));
    const unsubDepts = departmentsService.subscribeDepartments((list) => setDepartments(list));
    const unsubPatients = patientsService.subscribePatients((list) => setPatients(list));
    const unsubAppts = appointmentsService.subscribeAppointments((list) => setAppointments(list));
    const unsubAdmissions = admissionsService.subscribeAdmissions((list) => setAdmissions(list));
    const unsubRecords = medicalRecordsService.subscribeMedicalRecords((list) => setRecords(list));
    const unsubRx = prescriptionsService.subscribePrescriptions((list) => setPrescriptions(list));
    const unsubVitals = vitalSignsService.subscribeVitals((list) => setVitals(list));
    const unsubBills = billsService.subscribeBills((list) => setBills(list));

    return () => {
      unsubUsers();
      unsubDepts();
      unsubPatients();
      unsubAppts();
      unsubAdmissions();
      unsubRecords();
      unsubRx();
      unsubVitals();
      unsubBills();
    };
  }, []);

  const handleSyncSeed = async () => {
    setSyncing(true);
    await seedAllCollectionsIfEmpty();
    setSyncing(false);
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      await appointmentsService.updateAppointmentStatus(appointmentId, newStatus);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Calculations
  const totalRevenue = bills
    .filter(b => b.paymentStatus === 'Paid')
    .reduce((sum, b) => sum + (b.total || 0), 0);

  const pendingRevenue = bills
    .filter(b => b.paymentStatus === 'Pending')
    .reduce((sum, b) => sum + (b.total || 0), 0);

  const collectionsList = [
    { name: 'users', label: 'Users & Staff', count: users.length, desc: 'uid, name, email, phone, role, status', icon: Users, accent: 'text-rose-400' },
    { name: 'departments', label: 'Departments', count: departments.length, desc: 'departmentId, departmentName, description, contactInformation', icon: Building2, accent: 'text-indigo-400' },
    { name: 'patients', label: 'Patients', count: patients.length, desc: 'patientId, name, dob, gender, phone, address, emergencyContact', icon: Activity, accent: 'text-emerald-400' },
    { name: 'appointments', label: 'Appointments', count: appointments.length, desc: 'appointmentId, patientId, doctorId, departmentId, date, time, reason, status', icon: CheckCircle2, accent: 'text-sky-400' },
    { name: 'admissions', label: 'Admissions & Beds', count: admissions.length, desc: 'admissionId, patientId, doctorId, wardBed, admissionDate, reason, status', icon: BedDouble, accent: 'text-amber-400' },
    { name: 'medical_records', label: 'Medical Records', count: records.length, desc: 'recordId, patientId, doctorId, symptoms, diagnosis, treatment, notes', icon: FileText, accent: 'text-purple-400' },
    { name: 'prescriptions', label: 'Prescriptions', count: prescriptions.length, desc: 'prescriptionId, patientId, doctorId, medicine, dosage, frequency', icon: Pill, accent: 'text-teal-400' },
    { name: 'vital_signs', label: 'Vital Signs', count: vitals.length, desc: 'vitalRecordId, patientId, nurseId, temperature, pulse, BP, spO2', icon: Heart, accent: 'text-rose-400' },
    { name: 'bills', label: 'Hospital Bills & Invoices', count: bills.length, desc: 'billId, patientId, services, amount, discount, total, paymentStatus', icon: Banknote, accent: 'text-yellow-400' },
  ];

  /* ------------------------------------------------------------- */
  /* SECTION 1: OVERVIEW DASHBOARD VIEW                            */
  /* ------------------------------------------------------------- */
  const renderOverviewSection = () => (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-slate-950 text-white rounded-3xl p-5 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-950 text-rose-300 border border-rose-800">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-400" /> Hospital Executive Administration
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                <Database className="w-3 h-3" /> Live Firestore Connected
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {profile?.name || 'Administrator'}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Direct administrative control over clinical chambers, patients, doctors, admissions, billing, and staff.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={() => openModal('register_patient')}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" /> Register Patient
            </button>
            <button 
              onClick={handleSyncSeed}
              disabled={syncing}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Sync Firestore'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hospital KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: 'Total Registered Patients', 
            value: `${patients.length} Patients`, 
            sub: 'Stored in Cloud Firestore', 
            icon: Users, 
            accent: 'text-emerald-400',
            onClick: () => setActiveSection('patients')
          },
          { 
            label: 'Active OPD Appointments', 
            value: `${appointments.length} Tokens`, 
            sub: 'Live consultation chamber queue', 
            icon: Calendar, 
            accent: 'text-sky-400',
            onClick: () => setActiveSection('appointments')
          },
          { 
            label: 'Collected Hospital Revenue', 
            value: `৳ ${totalRevenue.toLocaleString()}`, 
            sub: `৳ ${pendingRevenue.toLocaleString()} pending receivables`, 
            icon: Banknote, 
            accent: 'text-amber-400',
            onClick: () => setActiveSection('billing')
          },
          { 
            label: 'In-Patient Ward Beds', 
            value: `${admissions.length} Admitted`, 
            sub: 'Bed telemetry & vitals tracking', 
            icon: BedDouble, 
            accent: 'text-rose-400',
            onClick: () => setActiveSection('wards')
          },
        ].map((m, idx) => (
          <div 
            key={idx} 
            onClick={m.onClick}
            className="bg-slate-950 text-white p-5 rounded-2xl border border-slate-800 shadow-md hover:border-slate-700 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{m.label}</span>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 group-hover:bg-slate-800 transition-colors">
                <m.icon className={`w-4 h-4 ${m.accent}`} />
              </div>
            </div>
            <div className="mt-3 text-2xl font-black text-white">{m.value}</div>
            <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
              <span>{m.sub}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </div>
          </div>
        ))}
      </div>

      {/* Live OPD Queue & Quick Navigation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-950 text-white rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-400" />
              Live Consultation & OPD Queue (Real-Time)
            </h2>
            <button 
              onClick={() => setActiveSection('appointments')}
              className="text-xs text-sky-400 hover:text-sky-300 font-semibold cursor-pointer flex items-center gap-1"
            >
              View Full Queue <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-800/80">
            {appointments.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No appointments queued.
              </div>
            ) : (
              appointments.slice(0, 4).map((p, i) => (
                <div key={p.appointmentId || i} className="py-3.5 flex items-center justify-between hover:bg-slate-900/60 px-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="text-xs font-mono font-bold text-sky-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                      {p.tokenNumber || `Token #${i + 1}`}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">
                        {p.patientName || p.patientId}
                      </div>
                      <div className="text-xs text-slate-400">
                        Doctor: {p.doctorName || 'Specialist Doctor'} • Time: {p.time} ({p.date})
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                    p.status === 'Completed' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                    p.status === 'In Consultation' ? 'bg-sky-950 text-sky-300 border-sky-800' :
                    'bg-slate-900 text-slate-300 border-slate-700'
                  }`}>
                    {p.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Access Modules Navigation */}
        <div className="bg-slate-950 text-white rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-md flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-rose-400" />
              Hospital Management Modules
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Click to jump straight into any department or operations page:
            </p>

            <div className="space-y-2">
              {[
                { label: 'Patient Admissions & Intake', section: 'patients' as const, icon: Users, count: `${patients.length} records` },
                { label: 'Doctor Chambers & E-Prescriptions', section: 'doctors' as const, icon: Stethoscope, count: `${prescriptions.length} Rx issued` },
                { label: 'Ward Telemetry & Vital Signs', section: 'wards' as const, icon: BedDouble, count: `${vitals.length} vitals` },
                { label: 'Counter Billing & Invoices', section: 'billing' as const, icon: Banknote, count: `৳ ${totalRevenue.toLocaleString()}` },
                { label: 'Hospital Staff & Departments', section: 'staff' as const, icon: Building2, count: `${users.length} staff` },
                { label: 'Cloud Firestore Database Explorer', section: 'database' as const, icon: Database, count: '9 collections' },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveSection(item.section)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold">{item.label}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Project: hospital-management-syst-66109</span>
            <span className="text-emerald-400 font-bold">Online</span>
          </div>
        </div>
      </div>
    </div>
  );

  /* ------------------------------------------------------------- */
  /* SECTION 2: PATIENTS & INTAKE PAGE                             */
  /* ------------------------------------------------------------- */
  const renderPatientsSection = () => {
    const filtered = patients.filter(p => 
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone?.includes(searchTerm)
    );

    return (
      <div className="space-y-6">
        <div className="bg-slate-950 text-white rounded-3xl p-5 sm:p-8 shadow-xl border border-slate-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 mb-2">
                <Users className="w-3.5 h-3.5 text-emerald-400" /> Patient Registry & Clinical Directory
              </span>
              <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
                Patients Management ({patients.length} Records)
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Direct integration with Firestore collection <code className="text-emerald-300">patients</code>.
              </p>
            </div>
            <button 
              onClick={() => openModal('register_patient')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-emerald-600/30 flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" /> Register New Patient
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input 
              type="text"
              placeholder="Search by Patient ID, Name, Mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="text-xs text-slate-400">
            Showing {filtered.length} of {patients.length} patients
          </div>
        </div>

        {/* Patients Table */}
        <div className="bg-slate-950 text-white rounded-2xl border border-slate-800 overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4">Patient ID & Name</th>
                  <th className="p-4">DOB / Gender</th>
                  <th className="p-4">Mobile & Email</th>
                  <th className="p-4">Address</th>
                  <th className="p-4">Emergency Contact</th>
                  <th className="p-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No patients found matching your search.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.patientId} className="hover:bg-slate-900/60 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white text-sm">{p.name}</div>
                        <span className="font-mono text-[10px] text-emerald-400 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
                          {p.patientId}
                        </span>
                      </td>
                      <td className="p-4 text-slate-300">
                        {p.dob} <br />
                        <span className="text-[11px] text-slate-400">{p.gender}</span>
                      </td>
                      <td className="p-4">
                        <div className="font-mono text-slate-200">{p.phone}</div>
                        <div className="text-[11px] text-slate-400">{p.email || 'N/A'}</div>
                      </td>
                      <td className="p-4 text-slate-300 max-w-[180px] truncate">
                        {p.address}
                      </td>
                      <td className="p-4 text-slate-300 text-[11px]">
                        {p.emergencyContact}
                      </td>
                      <td className="p-4 text-right space-x-1.5">
                        <button
                          onClick={() => {
                            setSelectedPatient({ id: p.patientId, name: p.name });
                            openModal('create_bill');
                          }}
                          className="px-2.5 py-1 bg-amber-950 text-amber-300 border border-amber-800 hover:bg-amber-900 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          + Bill
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPatient({ id: p.patientId, name: p.name });
                            openModal('record_vitals');
                          }}
                          className="px-2.5 py-1 bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          + Vitals
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPatient({ id: p.patientId, name: p.name });
                            openModal('new_prescription');
                          }}
                          className="px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          + Rx
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  /* ------------------------------------------------------------- */
  /* SECTION 3: APPOINTMENTS & OPD QUEUE PAGE                      */
  /* ------------------------------------------------------------- */
  const renderAppointmentsSection = () => (
    <div className="space-y-6">
      <div className="bg-slate-950 text-white rounded-3xl p-5 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-950 text-sky-300 border border-sky-800 mb-2">
              <Calendar className="w-3.5 h-3.5 text-sky-400" /> OPD Queue & Consultation Scheduling
            </span>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
              Chamber Appointments & Tokens ({appointments.length})
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Live updates synced directly to Firestore collection <code className="text-sky-300">appointments</code>.
            </p>
          </div>
          <button 
            onClick={() => openModal('book_appointment')}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-sky-600/30 flex items-center gap-2 cursor-pointer"
          >
            <CalendarPlus className="w-4 h-4" /> Book Appointment / Token
          </button>
        </div>
      </div>

      <div className="bg-slate-950 text-white rounded-2xl border border-slate-800 overflow-hidden shadow-md">
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-sm text-white">Live Chamber Queue Management</h3>
          <span className="text-xs text-slate-400">{appointments.length} Total Tokens</span>
        </div>
        <div className="divide-y divide-slate-800/80">
          {appointments.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No appointments scheduled in Firestore.
            </div>
          ) : (
            appointments.map((appt, idx) => (
              <div key={appt.appointmentId || idx} className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-900/60 transition-colors">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="text-sm font-mono font-bold text-sky-400 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 shrink-0">
                    {appt.tokenNumber || `Token #${idx + 1}`}
                  </div>
                  <div>
                    <div className="text-base font-bold text-white flex items-center gap-2">
                      {appt.patientName || appt.patientId}
                      <span className="text-[10px] font-mono text-slate-400">ID: {appt.patientId}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                      <span>Doctor: <strong className="text-sky-300">{appt.doctorName || 'Specialist'}</strong></span>
                      <span>•</span>
                      <span>Department: {appt.departmentId || 'OPD'}</span>
                      <span>•</span>
                      <span>Reason: {appt.reason}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> {appt.date} at {appt.time}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <select
                    value={appt.status}
                    onChange={(e) => handleStatusChange(appt.appointmentId, e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs font-semibold focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Waiting">Waiting</option>
                    <option value="In Consultation">In Consultation</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>

                  <button
                    onClick={() => {
                      setSelectedPatient({ id: appt.patientId, name: appt.patientName || 'Patient' });
                      openModal('new_prescription');
                    }}
                    className="px-3 py-1.5 bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Prescribe
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  /* ------------------------------------------------------------- */
  /* SECTION 4: DOCTORS & PRESCRIPTIONS PAGE                       */
  /* ------------------------------------------------------------- */
  const renderDoctorsSection = () => {
    const doctorsList = users.filter(u => u.role === 'Doctor');

    return (
      <div className="space-y-6">
        <div className="bg-slate-950 text-white rounded-3xl p-5 sm:p-8 shadow-xl border border-slate-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-950 text-teal-300 border border-teal-800 mb-2">
                <Stethoscope className="w-3.5 h-3.5 text-teal-400" /> Specialist Physicians & Digital Rx
              </span>
              <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
                Doctors & E-Prescriptions ({prescriptions.length} Issued)
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Consultant doctors roster and digital prescriptions stored in collection <code className="text-teal-300">prescriptions</code>.
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => openModal('add_staff')}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                + Add Doctor
              </button>
              <button 
                onClick={() => openModal('new_prescription')}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-teal-600/30 flex items-center gap-1.5 cursor-pointer"
              >
                <Pill className="w-4 h-4" /> Write Prescription
              </button>
            </div>
          </div>
        </div>

        {/* Doctors Grid */}
        <div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
            Consultant Physicians & Doctors ({doctorsList.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctorsList.map((doc) => (
              <div key={doc.uid} className="bg-slate-950 text-white p-5 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
                      {doc.department || 'Cardiology'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">BMDC Reg Verified</span>
                  </div>
                  <h3 className="font-extrabold text-base text-white">{doc.name}</h3>
                  <p className="text-xs text-teal-400 mt-0.5">{doc.specialization || 'Consultant Specialist'}</p>
                  <p className="text-xs text-slate-400 mt-2">Email: {doc.email} • Phone: {doc.phone}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-xs text-emerald-400 font-semibold">Status: {doc.status}</span>
                  <button 
                    onClick={() => {
                      setSelectedPatient({ id: 'PAT-BD-1001', name: 'Md. Jasim Uddin' });
                      openModal('new_prescription');
                    }}
                    className="text-xs text-teal-300 hover:text-white font-bold cursor-pointer"
                  >
                    Prescribe &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Issued Prescriptions Table */}
        <div className="bg-slate-950 text-white rounded-2xl border border-slate-800 overflow-hidden shadow-md">
          <div className="p-4 bg-slate-900 border-b border-slate-800">
            <h3 className="font-bold text-sm text-white">Live E-Prescriptions Issued (Firestore Records)</h3>
          </div>
          <div className="divide-y divide-slate-800/80 max-h-96 overflow-y-auto">
            {prescriptions.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No prescriptions issued yet.
              </div>
            ) : (
              prescriptions.map((rx, idx) => (
                <div key={rx.prescriptionId || idx} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <div className="text-xs font-mono text-teal-400 font-bold">
                      {rx.prescriptionId} • Date: {rx.date || 'Today'}
                    </div>
                    <div className="text-sm font-bold text-white mt-1">
                      Medicine: {rx.medicine} ({rx.dosage})
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Instructions: {rx.frequency} for {rx.duration} | {rx.instructions}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Patient: <strong className="text-slate-300">{rx.patientName || rx.patientId}</strong> | Doctor: {rx.doctorName || 'Dr. Mosaddek Hossain'}
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-teal-950 text-teal-300 border border-teal-800 rounded-lg">
                    Active Rx
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  /* ------------------------------------------------------------- */
  /* SECTION 5: WARD, ADMISSIONS & VITALS PAGE                     */
  /* ------------------------------------------------------------- */
  const renderWardsSection = () => (
    <div className="space-y-6">
      <div className="bg-slate-950 text-white rounded-3xl p-5 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-950 text-rose-300 border border-rose-800 mb-2">
              <BedDouble className="w-3.5 h-3.5 text-rose-400" /> In-Patient Wards & Telemetry Station
            </span>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
              Admissions & Vitals Monitoring ({admissions.length} Beds)
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Synced with Firestore collections <code className="text-rose-300">admissions</code> and <code className="text-rose-300">vital_signs</code>.
            </p>
          </div>
          <button 
            onClick={() => openModal('record_vitals')}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-rose-600/30 flex items-center gap-2 cursor-pointer"
          >
            <Heart className="w-4 h-4" /> Record Vital Telemetry
          </button>
        </div>
      </div>

      {/* Vitals Telemetry List */}
      <div className="bg-slate-950 text-white rounded-2xl border border-slate-800 overflow-hidden shadow-md">
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-sm text-white">Live Patient Vitals Telemetry</h3>
          <span className="text-xs text-rose-400 font-semibold">{vitals.length} Logged Telemetry Records</span>
        </div>
        <div className="divide-y divide-slate-800/80 max-h-96 overflow-y-auto">
          {vitals.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No vital records logged yet.
            </div>
          ) : (
            vitals.map((v, i) => (
              <div key={v.vitalRecordId || i} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-slate-900/60 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{v.patientName || v.patientId}</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                      {v.dateTime || 'Today'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 font-mono mt-1">
                    BP: <strong className="text-rose-400">{v.bloodPressure}</strong> • Pulse: <strong className="text-sky-400">{v.pulse} bpm</strong> • Temp: <strong className="text-amber-400">{v.temperature}</strong> • SpO2: <strong className="text-emerald-400">{v.spO2}</strong>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Recorded by: {v.nurseName || 'Ward Nurse'}</div>
                </div>
                <button 
                  onClick={() => {
                    setSelectedPatient({ id: v.patientId, name: v.patientName || 'Patient' });
                    openModal('record_vitals');
                  }}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-rose-400 rounded-lg cursor-pointer"
                >
                  Update Vitals
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  /* ------------------------------------------------------------- */
  /* SECTION 6: BILLING & ACCOUNTS PAGE                            */
  /* ------------------------------------------------------------- */
  const renderBillingSection = () => (
    <div className="space-y-6">
      <div className="bg-slate-950 text-white rounded-3xl p-5 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800 mb-2">
              <Banknote className="w-3.5 h-3.5 text-amber-400" /> Counter Ledger & Digital Receipts
            </span>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
              Hospital Billing & Invoices ({bills.length})
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Live payment processing via bKash, Nagad, Cash, POS. Synced with collection <code className="text-amber-300">bills</code>.
            </p>
          </div>
          <button 
            onClick={() => openModal('create_bill')}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-amber-600/30 flex items-center gap-2 cursor-pointer"
          >
            <Receipt className="w-4 h-4" /> Issue Hospital Invoice
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-white">
          <span className="text-xs text-slate-400 uppercase font-semibold">Total Paid Collections</span>
          <div className="text-2xl font-black text-emerald-400 mt-2">৳ {totalRevenue.toLocaleString()}</div>
          <p className="text-xs text-slate-400 mt-1">Directly cleared & settled</p>
        </div>
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-white">
          <span className="text-xs text-slate-400 uppercase font-semibold">Pending Receivables</span>
          <div className="text-2xl font-black text-rose-400 mt-2">৳ {pendingRevenue.toLocaleString()}</div>
          <p className="text-xs text-slate-400 mt-1">Due invoices awaiting payment</p>
        </div>
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-white">
          <span className="text-xs text-slate-400 uppercase font-semibold">Total Issued Invoices</span>
          <div className="text-2xl font-black text-amber-400 mt-2">{bills.length} Invoices</div>
          <p className="text-xs text-slate-400 mt-1">Itemized clinical charges</p>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-slate-950 text-white rounded-2xl border border-slate-800 overflow-hidden shadow-md">
        <div className="p-4 bg-slate-900 border-b border-slate-800">
          <h3 className="font-bold text-sm text-white">Invoices & Receipts Ledger</h3>
        </div>
        <div className="divide-y divide-slate-800/80 max-h-96 overflow-y-auto">
          {bills.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No bills created yet.
            </div>
          ) : (
            bills.map((b, i) => (
              <div key={b.billId || i} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400">{b.billId}</span>
                    <span className="text-xs text-slate-400">Date: {b.paymentDate}</span>
                  </div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    Patient: {b.patientName || b.patientId}
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    Services: {b.services}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Method: {b.paymentMethod || 'bKash'} | Subtotal: ৳{b.amount} (Discount: ৳{b.discount || 0})
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-extrabold text-emerald-400">
                    ৳ {b.total}
                  </div>
                  <span className={`inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                    b.paymentStatus === 'Paid' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                    'bg-rose-950 text-rose-300 border-rose-800'
                  }`}>
                    {b.paymentStatus}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  /* ------------------------------------------------------------- */
  /* SECTION 7: STAFF & DEPARTMENTS PAGE                           */
  /* ------------------------------------------------------------- */
  const renderStaffSection = () => (
    <div className="space-y-6">
      <div className="bg-slate-950 text-white rounded-3xl p-5 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-950 text-indigo-300 border border-indigo-800 mb-2">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" /> Human Resources & Departments
            </span>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
              Hospital Staff ({users.length}) & Departments ({departments.length})
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Manage system access roles (Admin, Doctor, Nurse, Receptionist) and hospital clinics.
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => openModal('add_staff')}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <UserPlus className="w-4 h-4" /> Add Staff
            </button>
            <button 
              onClick={() => openModal('add_dept')}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" /> Add Department
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staff Table */}
        <div className="bg-slate-950 text-white rounded-2xl border border-slate-800 overflow-hidden shadow-md">
          <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-sm text-white">System Users & Staff Directory</h3>
            <span className="text-xs text-slate-400">{users.length} Users</span>
          </div>
          <div className="divide-y divide-slate-800/80 max-h-96 overflow-y-auto">
            {users.map((u, i) => (
              <div key={u.uid || i} className="p-3.5 flex justify-between items-center hover:bg-slate-900/60 transition-colors">
                <div>
                  <div className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
                    {u.name}
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                      {u.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{u.email} • {u.phone}</div>
                </div>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  {u.status || 'Active'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Departments Table */}
        <div className="bg-slate-950 text-white rounded-2xl border border-slate-800 overflow-hidden shadow-md">
          <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-sm text-white">Hospital Departments</h3>
            <span className="text-xs text-slate-400">{departments.length} Clinics</span>
          </div>
          <div className="divide-y divide-slate-800/80 max-h-96 overflow-y-auto">
            {departments.map((d, i) => (
              <div key={d.departmentId || i} className="p-3.5 hover:bg-slate-900/60 transition-colors">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-white text-xs sm:text-sm">{d.departmentName}</h4>
                  <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950 border border-indigo-800 px-2 py-0.5 rounded">
                    {d.departmentId}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{d.description}</p>
                <div className="text-[11px] text-slate-500 mt-1">Contact: {d.contactInformation}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  /* ------------------------------------------------------------- */
  /* SECTION 8: CLOUD DATABASE SCHEMA VIEW                         */
  /* ------------------------------------------------------------- */
  const renderDatabaseSection = () => (
    <div className="space-y-6">
      <div className="bg-slate-950 text-white rounded-3xl p-5 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 mb-2">
              <Database className="w-3.5 h-3.5 text-emerald-400" /> Cloud Firestore Live Collections
            </span>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
              Firestore Schema & Database Explorer
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Project ID: <code className="text-emerald-300 font-bold">hospital-management-syst-66109</code>
            </p>
          </div>
          <button 
            onClick={handleSyncSeed}
            disabled={syncing}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-emerald-600/30 flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing Collections...' : 'Sync & Seed Live Data'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {collectionsList.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.name} className="p-4 bg-slate-950 text-white rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <Icon className={`w-4 h-4 ${c.accent}`} />
                    </div>
                    <span className="text-sm font-bold text-white">{c.label}</span>
                  </div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-emerald-400 border border-slate-800">
                    {c.count} docs
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 mb-2">
                  Collection: <strong className="text-slate-200">{c.name}</strong>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {c.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  /* ------------------------------------------------------------- */
  /* RENDER ACTIVE SECTION BASED ON NAVIGATION                     */
  /* ------------------------------------------------------------- */
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverviewSection();
      case 'patients':
        return renderPatientsSection();
      case 'appointments':
        return renderAppointmentsSection();
      case 'doctors':
        return renderDoctorsSection();
      case 'wards':
        return renderWardsSection();
      case 'billing':
        return renderBillingSection();
      case 'staff':
        return renderStaffSection();
      case 'database':
        return renderDatabaseSection();
      default:
        return renderOverviewSection();
    }
  };

  return (
    <div className="space-y-6">
      {renderActiveSection()}

      {/* Modals triggered from navigation or quick actions */}
      <RegisterPatientModal
        isOpen={activeModal === 'register_patient'}
        onClose={closeModal}
      />
      <BookAppointmentModal
        isOpen={activeModal === 'book_appointment'}
        onClose={closeModal}
      />
      <CreateBillModal
        isOpen={activeModal === 'create_bill'}
        onClose={closeModal}
        patientId={selectedPatient.id}
        patientName={selectedPatient.name}
      />
      <RecordVitalsModal
        isOpen={activeModal === 'record_vitals'}
        onClose={closeModal}
        patientId={selectedPatient.id}
        patientName={selectedPatient.name}
      />
      <NewPrescriptionModal
        isOpen={activeModal === 'new_prescription'}
        onClose={closeModal}
        patientId={selectedPatient.id}
        patientName={selectedPatient.name}
      />
      <AddStaffModal
        isOpen={activeModal === 'add_staff'}
        onClose={closeModal}
      />
      <AddDepartmentModal
        isOpen={activeModal === 'add_dept'}
        onClose={closeModal}
      />
    </div>
  );
};

export default AdminDashboard;
