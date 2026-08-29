import React, { useState } from 'react';
import { X, Activity, Heart, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { vitalSignsService } from '../../services/firestoreService';

interface RecordVitalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId?: string;
  patientName?: string;
  onSuccess?: () => void;
}

export const RecordVitalsModal: React.FC<RecordVitalsModalProps> = ({
  isOpen,
  onClose,
  patientId = 'PAT-BD-1001',
  patientName = 'Md. Jasim Uddin',
  onSuccess,
}) => {
  const { profile, user } = useAuth();
  const [selectedPatientId, setSelectedPatientId] = useState(patientId);
  const [selectedPatientName, setSelectedPatientName] = useState(patientName);
  const [temperature, setTemperature] = useState('98.6°F');
  const [pulse, setPulse] = useState('74 bpm');
  const [bloodPressure, setBloodPressure] = useState('120/80 mmHg');
  const [spO2, setSpO2] = useState('98%');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await vitalSignsService.recordVitals({
        patientId: selectedPatientId,
        patientName: selectedPatientName,
        nurseId: profile?.uid || user?.uid || 'nurse_1',
        nurseName: profile?.name || 'Nurse Station Staff',
        temperature: temperature.trim(),
        pulse: pulse.trim(),
        bloodPressure: bloodPressure.trim(),
        spO2: spO2.trim(),
        dateTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      });

      setSuccessMsg('Patient vital signs logged & saved to Cloud Firestore!');
      setTimeout(() => {
        setSuccessMsg('');
        if (onSuccess) onSuccess();
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Error recording vitals:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Record In-Patient Vital Signs</h3>
              <p className="text-xs text-slate-400">Stores instantly into Cloud Firestore</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMsg ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <p className="text-sm font-bold text-emerald-300">{successMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-400">Patient ID</label>
                <input
                  type="text"
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400">Patient Full Name</label>
                <input
                  type="text"
                  value={selectedPatientName}
                  onChange={(e) => setSelectedPatientName(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-400">Temperature (°F)</label>
                <input
                  type="text"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  placeholder="98.6°F"
                  className="w-full mt-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400">Pulse Rate (bpm)</label>
                <input
                  type="text"
                  value={pulse}
                  onChange={(e) => setPulse(e.target.value)}
                  placeholder="74 bpm"
                  className="w-full mt-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-400">Blood Pressure (mmHg)</label>
                <input
                  type="text"
                  value={bloodPressure}
                  onChange={(e) => setBloodPressure(e.target.value)}
                  placeholder="120/80 mmHg"
                  className="w-full mt-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400">SpO2 Oxygen Saturation</label>
                <input
                  type="text"
                  value={spO2}
                  onChange={(e) => setSpO2(e.target.value)}
                  placeholder="98%"
                  className="w-full mt-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? 'Logging...' : 'Save Vitals'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
