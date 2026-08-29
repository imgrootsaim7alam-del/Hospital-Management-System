import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  UserPlus, 
  CalendarPlus, 
  Receipt, 
  Search, 
  ChevronRight,
  ShieldCheck,
  Banknote,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { patientsService, appointmentsService, billsService } from '../../services/firestoreService';
import { Patient, Appointment, Bill } from '../../types';
import { RegisterPatientModal } from '../modals/RegisterPatientModal';
import { BookAppointmentModal } from '../modals/BookAppointmentModal';
import { CreateBillModal } from '../modals/CreateBillModal';

export const ReceptionistDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isTokenOpen, setIsTokenOpen] = useState(false);
  const [isBillOpen, setIsBillOpen] = useState(false);
  const [selectedPatientForBill, setSelectedPatientForBill] = useState<{ id: string; name: string }>({
    id: 'PAT-BD-1001',
    name: 'Md. Jasim Uddin'
  });

  useEffect(() => {
    const unsubPatients = patientsService.subscribePatients((list) => setPatients(list));
    const unsubAppts = appointmentsService.subscribeAppointments((list) => setAppointments(list));
    const unsubBills = billsService.subscribeBills((list) => setBills(list));

    return () => {
      unsubPatients();
      unsubAppts();
      unsubBills();
    };
  }, []);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm) ||
    p.patientId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCollected = bills
    .filter(b => b.paymentStatus === 'Paid')
    .reduce((sum, b) => sum + (b.total || 0), 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Banner */}
      <div className="bg-slate-950 text-white rounded-3xl p-5 sm:p-8 shadow-xl shadow-slate-950/15 border border-slate-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800 mb-2">
              <Building2 className="w-3.5 h-3.5 text-amber-400" /> Patient Intake & Admissions Desk
            </span>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {profile?.name || 'Reception Staff'}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Station: <strong className="text-amber-300">{profile?.department || 'Main OPD Admissions & Token Desk #1'}</strong>
            </p>
          </div>
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
            <button 
              onClick={() => setIsRegisterOpen(true)}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-amber-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" /> Register New Patient
            </button>
            <button 
              onClick={() => setIsTokenOpen(true)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CalendarPlus className="w-4 h-4 text-emerald-400" /> Issue Consultation Token
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {[
          { label: "Registered Patients", value: `${patients.length} Total`, sub: 'Cloud Firestore Patients', icon: Users, accent: 'text-amber-400' },
          { label: "Issued OPD Tokens", value: `${appointments.length} Tokens`, sub: 'Live appointments synced', icon: CalendarPlus, accent: 'text-rose-400' },
          { label: 'Counter Collections', value: `৳ ${totalCollected.toLocaleString()}`, sub: 'bKash, Nagad & Cash Receipts', icon: Banknote, accent: 'text-emerald-400' },
          { label: 'Billed Invoices', value: `${bills.length} Invoices`, sub: 'Firestore billing records', icon: Receipt, accent: 'text-indigo-400' },
        ].map((m, idx) => (
          <div key={idx} className="bg-slate-950 text-white p-5 rounded-2xl border border-slate-800 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{m.label}</span>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <m.icon className={`w-4 h-4 ${m.accent}`} />
              </div>
            </div>
            <div className="mt-3 text-2xl font-black text-white">{m.value}</div>
            <div className="text-xs text-slate-400 mt-1">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 bg-slate-950 text-white rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-md">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-amber-400" />
              Live Patient Registry (Firestore Data)
            </h2>
            <input 
              type="text"
              placeholder="Search by Mobile #, Name, or Patient ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="divide-y divide-slate-800/80 max-h-[380px] overflow-y-auto">
            {filteredPatients.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No patients found matching your search.
              </div>
            ) : (
              filteredPatients.map((p, i) => (
                <div key={p.patientId || i} className="py-3.5 flex items-center justify-between hover:bg-slate-900/60 px-2 rounded-xl transition-colors">
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      {p.name}
                      <span className="font-mono text-[10px] bg-slate-900 text-amber-300 border border-amber-800 px-1.5 py-0.5 rounded">
                        {p.patientId}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">Phone: {p.phone} • Address: {p.address}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Emergency: {p.emergencyContact}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedPatientForBill({ id: p.patientId, name: p.name });
                        setIsBillOpen(true);
                      }}
                      className="px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      + Bill
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-slate-950 text-white rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-md flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Counter & Billing Actions
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Integrated billing workflows with instant electronic receipt generation.
            </p>
            <div className="space-y-2 text-xs text-slate-300 bg-slate-900 p-3.5 rounded-xl border border-slate-800">
              <button 
                onClick={() => setIsTokenOpen(true)}
                className="w-full text-left py-1 hover:text-amber-400 cursor-pointer"
              >
                ✔ Print Digital Consultation Token
              </button>
              <button 
                onClick={() => setIsBillOpen(true)}
                className="w-full text-left py-1 hover:text-amber-400 cursor-pointer"
              >
                ✔ Collect bKash / Nagad / POS Payments
              </button>
              <button 
                onClick={() => setIsRegisterOpen(true)}
                className="w-full text-left py-1 hover:text-amber-400 cursor-pointer"
              >
                ✔ Instant Patient Intake Registration
              </button>
              <div>✔ Live Staff & Patient Hospital Chat</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
            Counter Operator ID: BD-REC-01
          </div>
        </div>
      </div>

      {/* Modals */}
      <RegisterPatientModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      />
      <BookAppointmentModal
        isOpen={isTokenOpen}
        onClose={() => setIsTokenOpen(false)}
      />
      <CreateBillModal
        isOpen={isBillOpen}
        onClose={() => setIsBillOpen(false)}
        patientId={selectedPatientForBill.id}
        patientName={selectedPatientForBill.name}
      />
    </div>
  );
};

export default ReceptionistDashboard;
