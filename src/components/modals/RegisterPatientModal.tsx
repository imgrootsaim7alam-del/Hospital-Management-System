import React, { useState } from 'react';
import { X, UserPlus, CheckCircle2 } from 'lucide-react';
import { patientsService } from '../../services/firestoreService';

interface RegisterPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RegisterPatientModal: React.FC<RegisterPatientModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('1990-01-01');
  const [gender, setGender] = useState('Male');
  const [phone, setPhone] = useState('+880 1');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const generatedId = `PAT-BD-${Math.floor(1000 + Math.random() * 9000)}`;
      await patientsService.createPatient({
        patientId: generatedId,
        name: name.trim(),
        dob,
        gender,
        phone: phone.trim(),
        address: address.trim() || 'Dhaka, Bangladesh',
        emergencyContact: emergencyContact.trim() || 'Family Member',
        email: email.trim(),
      });

      setSuccessMsg(`Patient registered successfully! ID: ${generatedId}`);
      setTimeout(() => {
        setSuccessMsg('');
        if (onSuccess) onSuccess();
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Error registering patient:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-950 text-amber-400 border border-amber-800">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Register New Patient</h3>
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
            <div>
              <label className="text-xs font-semibold text-slate-400">Full Legal Name</label>
              <input
                type="text"
                placeholder="e.g. Md. Tariqul Islam"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-400">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-400">Mobile Phone</label>
                <input
                  type="text"
                  placeholder="+880 17..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400">Email (Optional)</label>
                <input
                  type="email"
                  placeholder="patient@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">Residential Address</label>
              <input
                type="text"
                placeholder="House, Road, Area, City"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full mt-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">Emergency Contact (Name & Phone)</label>
              <input
                type="text"
                placeholder="e.g. Spouse / Brother (+880 18...)"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className="w-full mt-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-amber-500"
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
                disabled={isSubmitting || !name.trim()}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-600/30 flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? 'Registering...' : 'Register Patient'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
