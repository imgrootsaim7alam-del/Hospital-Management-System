import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  Calendar, 
  FileText, 
  Clock, 
  Users, 
  ChevronRight,
  ClipboardCheck,
  CheckCircle2,
  FileBadge,
  Plus,
  Pill,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { appointmentsService, prescriptionsService, medicalRecordsService } from '../../services/firestoreService';
import { Appointment, Prescription, MedicalRecord } from '../../types';
import { NewPrescriptionModal } from '../modals/NewPrescriptionModal';

export const DoctorDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<{ id: string; name: string }>({
    id: 'PAT-BD-1001',
    name: 'Md. Jasim Uddin'
  });

  useEffect(() => {
    const unsubAppts = appointmentsService.subscribeAppointments((list) => {
      setAppointments(list);
    });
    const unsubRx = prescriptionsService.subscribePrescriptions((list) => {
      setPrescriptions(list);
    });

    return () => {
      unsubAppts();
      unsubRx();
    };
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Banner */}
      <div className="bg-slate-950 text-white rounded-3xl p-5 sm:p-8 shadow-xl shadow-slate-950/15 border border-slate-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-950 text-sky-300 border border-sky-800">
                <Stethoscope className="w-3.5 h-3.5 text-sky-400" /> Consultant Physician Portal
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                <FileBadge className="w-3 h-3" /> BMDC Reg: A-45210
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
              {profile?.name || 'Dr. Mosaddek Hossain, MBBS, FCPS'}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Department: <strong className="text-sky-300">{profile?.department || 'Cardiology & Internal Medicine'}</strong> | Chamber: 3rd Floor, Room #302
            </p>
          </div>
          <button 
            onClick={() => {
              setSelectedPatient({ id: 'PAT-BD-1001', name: 'Md. Jasim Uddin' });
              setIsPrescriptionModalOpen(true);
            }}
            className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Write New Prescription
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {[
          { label: "Today's OPD Queue", value: `${appointments.length || 2} Patients`, sub: 'Live appointments synced with Firestore', icon: Calendar, accent: 'text-sky-400' },
          { label: 'E-Prescriptions Issued', value: `${prescriptions.length || 2} Issued`, sub: 'Stored in Cloud Firestore', icon: Pill, accent: 'text-emerald-400' },
          { label: 'Lab & Diagnostic Reports', value: '5 Ready', sub: 'ECG & Blood Profile Ready', icon: ClipboardCheck, accent: 'text-amber-400' },
          { label: 'Avg Consultation Time', value: '15 Mins', sub: 'Comprehensive Exam & Advice', icon: Clock, accent: 'text-indigo-400' },
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

      {/* Today's Queue & Recent Prescriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 bg-slate-950 text-white rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-400" />
              Live Consultation & Chamber Queue (Firestore Real-Time)
            </h2>
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Queue
            </span>
          </div>

          <div className="divide-y divide-slate-800/80">
            {appointments.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No appointments queued in Firestore.
              </div>
            ) : (
              appointments.map((p, i) => (
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
                        Reason: {p.reason} • Time: {p.time} ({p.date})
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedPatient({
                          id: p.patientId,
                          name: p.patientName || 'Patient'
                        });
                        setIsPrescriptionModalOpen(true);
                      }}
                      className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                    >
                      Prescribe
                    </button>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border bg-slate-900 text-slate-300 border-slate-700">
                      {p.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-slate-950 text-white rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-md flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Pill className="w-4 h-4 text-emerald-400" />
              Latest Issued Prescriptions
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Real-time prescriptions stored in Firestore collection <code className="text-emerald-300">prescriptions</code>
            </p>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {prescriptions.slice(0, 4).map((rx, idx) => (
                <div key={rx.prescriptionId || idx} className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                  <div className="font-bold text-emerald-400">{rx.medicine}</div>
                  <div className="text-slate-300 text-[11px] mt-0.5">{rx.dosage} • {rx.frequency} ({rx.duration})</div>
                  <div className="text-slate-400 text-[10px] mt-1">For: {rx.patientName || rx.patientId}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
            BMDC Verified Specialist Doctor Account
          </div>
        </div>
      </div>

      {/* Prescription Modal */}
      <NewPrescriptionModal
        isOpen={isPrescriptionModalOpen}
        onClose={() => setIsPrescriptionModalOpen(false)}
        patientId={selectedPatient.id}
        patientName={selectedPatient.name}
      />
    </div>
  );
};

export default DoctorDashboard;
