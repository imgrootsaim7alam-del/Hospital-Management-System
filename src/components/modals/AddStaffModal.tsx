import React, { useState } from 'react';
import { X, UserPlus, CheckCircle2, ShieldCheck, Stethoscope } from 'lucide-react';
import { usersService } from '../../services/firestoreService';
import { UserRole } from '../../types';

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddStaffModal: React.FC<AddStaffModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+880 1');
  const [role, setRole] = useState<UserRole>('Doctor');
  const [department, setDepartment] = useState('Cardiology');
  const [specialization, setSpecialization] = useState('MBBS, FCPS (Cardiology)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const generatedUid = `staff_${role.toLowerCase()}_${Date.now().toString().slice(-6)}`;
      await usersService.saveUserProfile(generatedUid, {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role,
        status: 'Active',
        department: role === 'Doctor' || role === 'Nurse' ? department : 'Administration',
        specialization: role === 'Doctor' ? specialization : undefined,
      });

      setSuccessMsg(`Staff member (${role}) added to Cloud Firestore!`);
      setTimeout(() => {
        setSuccessMsg('');
        if (onSuccess) onSuccess();
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Error adding staff member:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-950 text-rose-400 border border-rose-800">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Add Hospital Staff & User</h3>
              <p className="text-xs text-slate-400">Stores directly in Firestore collection <code className="text-rose-300">users</code></p>
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
              <label className="text-xs font-semibold text-slate-400">Full Name & Title</label>
              <input
                type="text"
                placeholder="e.g. Dr. Sabrina Akhter, MBBS"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-rose-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-400">Official Email</label>
                <input
                  type="email"
                  placeholder="doctor@hospital.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400">Mobile Phone</label>
                <input
                  type="text"
                  placeholder="+880 17..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-400">System Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-rose-500"
                >
                  <option value="Doctor">Doctor (Physician)</option>
                  <option value="Nurse">Nurse (Ward/ICU)</option>
                  <option value="Receptionist">Receptionist (Intake)</option>
                  <option value="Admin">Administrator</option>
                  <option value="Patient">Patient</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-rose-500"
                >
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Gynecology & Obstetrics">Gynecology & Obstetrics</option>
                  <option value="General Surgery">General Surgery</option>
                  <option value="Internal Medicine">Internal Medicine</option>
                  <option value="Emergency & Trauma">Emergency & Trauma</option>
                  <option value="Intensive Care Unit (ICU)">Intensive Care Unit (ICU)</option>
                  <option value="Hospital Administration">Hospital Administration</option>
                </select>
              </div>
            </div>

            {role === 'Doctor' && (
              <div>
                <label className="text-xs font-semibold text-slate-400">Specialization & BMDC Degrees</label>
                <input
                  type="text"
                  placeholder="e.g. MBBS, FCPS (Cardiology), Interventional Cardiologist"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-rose-500"
                />
              </div>
            )}

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
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/30 flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? 'Saving...' : 'Add Staff Member'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
