import React, { useState } from 'react';
import { X, Calendar, Clock, CheckCircle2, CalendarPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { appointmentsService } from '../../services/firestoreService';

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { profile, user } = useAuth();
  const [patientName, setPatientName] = useState(profile?.name || 'Patient');
  const [patientId, setPatientId] = useState(profile?.uid || 'PAT-BD-1001');
  const [doctorName, setDoctorName] = useState('Dr. Mosaddek Hossain, MBBS, FCPS');
  const [doctorId, setDoctorId] = useState('doc_1');
  const [departmentId, setDepartmentId] = useState('DEPT-CARDIO');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:30 AM');
  const [reason, setReason] = useState('Routine Checkup & Chest Examination');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const tokenNum = `Token #${Math.floor(10 + Math.random() * 90)}`;
      await appointmentsService.createAppointment({
        patientId,
        patientName,
        doctorId,
        doctorName,
        departmentId,
        date,
        time,
        reason,
        status: 'Scheduled',
        tokenNumber: tokenNum,
      });

      setSuccessMsg(`Appointment booked successfully! (${tokenNum})`);
      setTimeout(() => {
        setSuccessMsg('');
        if (onSuccess) onSuccess();
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Error booking appointment:', err);
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
              <CalendarPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Book Doctor Appointment / OPD Token</h3>
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
                <label className="text-xs font-semibold text-slate-400">Patient Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400">Patient ID</label>
                <input
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">Select Specialist Doctor</label>
              <select
                value={doctorName}
                onChange={(e) => {
                  setDoctorName(e.target.value);
                  if (e.target.value.includes('Mosaddek')) {
                    setDoctorId('doc_1');
                    setDepartmentId('DEPT-CARDIO');
                  } else {
                    setDoctorId('doc_2');
                    setDepartmentId('DEPT-MEDICINE');
                  }
                }}
                className="w-full mt-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Dr. Mosaddek Hossain, MBBS, FCPS">Dr. Mosaddek Hossain (Cardiology & Internal Medicine)</option>
                <option value="Dr. Farhana Ahmed, MBBS, MD">Dr. Farhana Ahmed (General Medicine & Diabetology)</option>
                <option value="Dr. Tariqul Islam, MBBS, MS">Dr. Tariqul Islam (General & Laparoscopic Surgery)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-400">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400">Preferred Slot</label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="09:30 AM">09:30 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="10:30 AM">10:30 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="05:00 PM">05:00 PM</option>
                  <option value="06:00 PM">06:00 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">Reason / Symptoms</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Chest pain, Fever, Routine follow-up..."
                className="w-full mt-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
                required
              />
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
                {isSubmitting ? 'Booking...' : 'Confirm Appointment'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
