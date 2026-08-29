import React, { useState } from 'react';
import { X, Receipt, Banknote, CheckCircle2 } from 'lucide-react';
import { billsService } from '../../services/firestoreService';

interface CreateBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId?: string;
  patientName?: string;
  onSuccess?: () => void;
}

export const CreateBillModal: React.FC<CreateBillModalProps> = ({
  isOpen,
  onClose,
  patientId = 'PAT-BD-1001',
  patientName = 'Md. Jasim Uddin',
  onSuccess,
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState(patientId);
  const [selectedPatientName, setSelectedPatientName] = useState(patientName);
  const [services, setServices] = useState('Doctor Consultation + ECG + Fasting Lipid Profile');
  const [amount, setAmount] = useState<number>(2000);
  const [discount, setDiscount] = useState<number>(200);
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Pending' | 'Partial'>('Paid');
  const [paymentMethod, setPaymentMethod] = useState('bKash Merchant Payment');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const total = Math.max(0, amount - discount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const billId = `INV-${Date.now().toString().slice(-6)}`;
      await billsService.createBill({
        billId,
        patientId: selectedPatientId,
        patientName: selectedPatientName,
        services: services.trim(),
        amount: Number(amount),
        discount: Number(discount),
        total: Number(total),
        paymentStatus,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod,
      });

      setSuccessMsg(`Invoice created & saved! Bill ID: ${billId}`);
      setTimeout(() => {
        setSuccessMsg('');
        if (onSuccess) onSuccess();
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Error creating bill:', err);
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
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Generate Hospital Bill & Receipt</h3>
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
                  className="w-full mt-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400">Patient Name</label>
                <input
                  type="text"
                  value={selectedPatientName}
                  onChange={(e) => setSelectedPatientName(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">Itemized Services / Tests</label>
              <input
                type="text"
                value={services}
                onChange={(e) => setServices(e.target.value)}
                className="w-full mt-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-400">Subtotal (BDT)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400">Discount (BDT)</label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400">Net Total (BDT)</label>
                <div className="w-full mt-1 bg-slate-900 border border-slate-700 text-emerald-400 font-bold rounded-xl px-3 py-2 text-xs">
                  ৳ {total}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-400">Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as any)}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Partial">Partial</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500"
                >
                  <option value="bKash Merchant Payment">bKash Merchant Payment</option>
                  <option value="Nagad Digital Payment">Nagad Digital Payment</option>
                  <option value="Cash Counter">Cash Counter</option>
                  <option value="Credit / Debit Card">Credit / Debit Card</option>
                </select>
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
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-600/30 flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? 'Processing...' : 'Issue Invoice & Save'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
