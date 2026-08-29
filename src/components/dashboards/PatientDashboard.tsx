import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  Calendar, 
  FileText, 
  Clock, 
  Download, 
  ShieldCheck, 
  CalendarPlus,
  Banknote,
  Pill
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { appointmentsService, prescriptionsService, billsService } from '../../services/firestoreService';
import { Appointment, Prescription, Bill } from '../../types';
import { BookAppointmentModal } from '../modals/BookAppointmentModal';

export const PatientDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  useEffect(() => {
    const unsubAppts = appointmentsService.subscribeAppointments((list) => {
      setAppointments(list);
    });
    const unsubRx = prescriptionsService.subscribePrescriptions((list) => {
      setPrescriptions(list);
    });
    const unsubBills = billsService.subscribeBills((list) => {
      setBills(list);
    });

    return () => {
      unsubAppts();
      unsubRx();
      unsubBills();
    };
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Banner */}
      <div className="bg-slate-950 text-white rounded-3xl p-5 sm:p-8 shadow-xl shadow-slate-950/15 border border-slate-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-950 text-indigo-300 border border-indigo-800 mb-2">
              <HeartHandshake className="w-3.5 h-3.5 text-indigo-400" /> Patient Health & Care Portal
            </span>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {profile?.name || 'Patient'}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Patient ID: <span className="font-mono text-emerald-400 font-bold">{profile?.uid || 'PAT-BD-1001'}</span> | Mobile: {profile?.phone || '+880 1711-889922'}
            </p>
          </div>
          <button 
            onClick={() => setIsBookModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            <CalendarPlus className="w-4 h-4" /> Book Appointment / Token
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {[
          { label: 'Upcoming Appointments', value: `${appointments.length} Scheduled`, sub: 'Real-time appointments from Firestore', icon: Calendar, accent: 'text-indigo-400' },
          { label: 'Digital Prescriptions', value: `${prescriptions.length} Records`, sub: 'Cloud Firestore E-Prescriptions', icon: Pill, accent: 'text-emerald-400' },
          { label: 'Diagnostic Lab Reports', value: '3 Ready', sub: 'ECG & CBC Profiles Ready', icon: HeartHandshake, accent: 'text-sky-400' },
          { label: 'Billing Invoices', value: `${bills.length} Invoices`, sub: 'Live settlement status', icon: Banknote, accent: 'text-amber-400' },
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

      {/* Health Timeline & Next Visits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 bg-slate-950 text-white rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Your Appointments & OPD Tokens
            </h2>
            <button 
              onClick={() => setIsBookModalOpen(true)}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
            >
              + Book New
            </button>
          </div>

          <div className="space-y-3 mb-6">
            {appointments.map((appt, i) => (
              <div key={appt.appointmentId || i} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    {appt.tokenNumber || `Token #${i + 1}`} ({appt.status})
                  </div>
                  <div className="text-base font-bold text-white mt-1">
                    {appt.doctorName || 'Specialist Doctor'}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" /> {appt.date} • {appt.time} • Reason: {appt.reason}
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-700 rounded-full">
                  {appt.status}
                </span>
              </div>
            ))}
          </div>

          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Digital Prescriptions Stored in Firestore
          </h3>
          <div className="space-y-2.5">
            {prescriptions.map((rx, i) => (
              <div key={rx.prescriptionId || i} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <div>
                  <div className="text-xs font-mono text-emerald-400">{rx.date || 'Today'} • {rx.doctorName || 'Dr. Mosaddek Hossain'}</div>
                  <div className="text-sm font-bold text-white mt-0.5">{rx.medicine} ({rx.dosage})</div>
                  <div className="text-xs text-slate-400 mt-0.5">{rx.frequency} - {rx.duration} | {rx.instructions}</div>
                </div>
                <div className="p-2 text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 rounded-lg text-xs font-bold">
                  Active Rx
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-950 text-white rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-md flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Patient Privacy & Data Security
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              All electronic prescriptions and lab files are encrypted and synced to your unique patient identifier.
            </p>
            <div className="space-y-2 text-xs text-slate-300 bg-slate-900 p-3.5 rounded-xl border border-slate-800">
              <div>✔ Instant 24/7 Digital Prescription Downloads</div>
              <div>✔ Seamless payment receipts via bKash / Nagad / Card</div>
              <div>✔ Direct OPD token booking & queue status tracking</div>
              <div>✔ Live Hospital Chat with Doctors & Care Staff</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
            Account Status: Fully Verified
          </div>
        </div>
      </div>

      {/* Book Appointment Modal */}
      <BookAppointmentModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
      />
    </div>
  );
};

export default PatientDashboard;
