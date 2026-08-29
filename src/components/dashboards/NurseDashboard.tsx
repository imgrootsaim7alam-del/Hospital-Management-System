import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Heart, 
  BedDouble, 
  Pill, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { vitalSignsService, admissionsService } from '../../services/firestoreService';
import { VitalSigns, Admission } from '../../types';
import { RecordVitalsModal } from '../modals/RecordVitalsModal';

export const NurseDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [vitalsList, setVitalsList] = useState<VitalSigns[]>([]);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<{ id: string; name: string }>({
    id: 'PAT-BD-1001',
    name: 'Md. Jasim Uddin'
  });

  useEffect(() => {
    const unsubVitals = vitalSignsService.subscribeVitals((list) => setVitalsList(list));
    const unsubAdmissions = admissionsService.subscribeAdmissions((list) => setAdmissions(list));

    return () => {
      unsubVitals();
      unsubAdmissions();
    };
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Banner */}
      <div className="bg-slate-950 text-white rounded-3xl p-5 sm:p-8 shadow-xl shadow-slate-950/15 border border-slate-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 mb-2">
              <Activity className="w-3.5 h-3.5 text-emerald-400" /> Nursing & Ward Station
            </span>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
              {profile?.name || 'Nurse Rabeya Khatun'}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Department: <strong className="text-emerald-300">{profile?.department || 'Intensive Care Unit & In-Patient Ward'}</strong>
            </p>
          </div>
          <button 
            onClick={() => {
              setSelectedPatient({ id: 'PAT-BD-1001', name: 'Md. Jasim Uddin' });
              setIsVitalsModalOpen(true);
            }}
            className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Heart className="w-4 h-4" /> Record Vitals
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {[
          { label: 'Assigned In-Patients', value: `${admissions.length || 2} Patients`, sub: 'Ward 4 & CCU Block', icon: BedDouble, accent: 'text-emerald-400' },
          { label: 'Logged Vital Records', value: `${vitalsList.length} Records`, sub: 'Cloud Firestore Telemetry', icon: Activity, accent: 'text-rose-400' },
          { label: 'Medication Rounds', value: '5 Due', sub: 'Due in 30 mins', icon: Pill, accent: 'text-sky-400' },
          { label: 'Discharge Approvals', value: '1 Ready', sub: 'Awaiting doctor signoff', icon: CheckCircle2, accent: 'text-amber-400' },
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

      {/* Ward Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 bg-slate-950 text-white rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BedDouble className="w-4 h-4 text-emerald-400" />
              In-Patient Real-Time Vitals (Firestore Synced)
            </h2>
            <button 
              onClick={() => setIsVitalsModalOpen(true)}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
            >
              + Log Vitals
            </button>
          </div>

          <div className="divide-y divide-slate-800/80 max-h-[380px] overflow-y-auto">
            {vitalsList.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No vital signs logged yet.
              </div>
            ) : (
              vitalsList.map((v, i) => (
                <div key={v.vitalRecordId || i} className="py-3.5 flex items-center justify-between hover:bg-slate-900/60 px-2 rounded-xl transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{v.patientName || v.patientId}</span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                        {v.dateTime || 'Today'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 font-mono mt-1">
                      BP: {v.bloodPressure} • HR: {v.pulse} • Temp: {v.temperature} • SpO2: {v.spO2}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Recorded by: {v.nurseName || 'Nurse'}</div>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedPatient({ id: v.patientId, name: v.patientName || 'Patient' });
                      setIsVitalsModalOpen(true);
                    }}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-emerald-400 rounded-lg cursor-pointer"
                  >
                    Update
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-slate-950 text-white rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-md flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Pill className="w-4 h-4 text-emerald-400" />
              Nursing & Ward Duties
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Nursing staff has live permissions for admissions, telemetry logging, and care handover.
            </p>
            <div className="space-y-2 text-xs text-slate-300 bg-slate-900 p-3.5 rounded-xl border border-slate-800">
              <div>✔ Continuous patient vitals monitoring</div>
              <div>✔ Medication administration checklists</div>
              <div>✔ Ward admission bed assignments</div>
              <div>✔ Live shift handover hospital chat</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
            Ward Station: Bed Telemetry Active
          </div>
        </div>
      </div>

      {/* Record Vitals Modal */}
      <RecordVitalsModal
        isOpen={isVitalsModalOpen}
        onClose={() => setIsVitalsModalOpen(false)}
        patientId={selectedPatient.id}
        patientName={selectedPatient.name}
      />
    </div>
  );
};

export default NurseDashboard;
