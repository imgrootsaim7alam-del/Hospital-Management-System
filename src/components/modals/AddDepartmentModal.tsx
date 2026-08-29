import React, { useState } from 'react';
import { X, Building2, CheckCircle2 } from 'lucide-react';
import { departmentsService } from '../../services/firestoreService';

interface AddDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddDepartmentModal: React.FC<AddDepartmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [departmentName, setDepartmentName] = useState('');
  const [description, setDescription] = useState('');
  const [contactInformation, setContactInformation] = useState('Ext. 401 | opd@shebacare.com');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const generatedId = `dept_${departmentName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString().slice(-4)}`;
      await departmentsService.createDepartment({
        departmentId: generatedId,
        departmentName: departmentName.trim(),
        description: description.trim() || `${departmentName} Clinical & Patient Department`,
        contactInformation: contactInformation.trim(),
        status: 'Active',
      });

      setSuccessMsg(`Department "${departmentName}" created in Cloud Firestore!`);
      setTimeout(() => {
        setSuccessMsg('');
        if (onSuccess) onSuccess();
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Error creating department:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Create Hospital Department</h3>
              <p className="text-xs text-slate-400">Stores in Firestore collection <code className="text-indigo-300">departments</code></p>
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
              <label className="text-xs font-semibold text-slate-400">Department Name</label>
              <input
                type="text"
                placeholder="e.g. Oncology & Radiation Care"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                className="w-full mt-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">Clinical Scope & Description</label>
              <textarea
                rows={2}
                placeholder="Diagnostic oncology, chemotherapy ward, palliative care..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full mt-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">Contact Information / Extension</label>
              <input
                type="text"
                placeholder="Chamber Room #408, Ext 415"
                value={contactInformation}
                onChange={(e) => setContactInformation(e.target.value)}
                className="w-full mt-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
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
                disabled={isSubmitting || !departmentName.trim()}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? 'Creating...' : 'Create Department'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
