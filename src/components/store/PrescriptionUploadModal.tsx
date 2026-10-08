import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';

interface PrescriptionUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (prescriptionData: { fileName: string; patientName: string; phone: string; notes: string }) => void;
}

export const PrescriptionUploadModal: React.FC<PrescriptionUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      setError('Please provide patient name');
      return;
    }
    if (!phone.trim()) {
      setError('Please provide a contact phone number');
      return;
    }
    if (!selectedFile) {
      setError('Please select or upload a valid prescription slip file');
      return;
    }

    setIsSubmitted(true);
    setTimeout(() => {
      onSuccess({
        fileName: selectedFile.name,
        patientName,
        phone,
        notes,
      });
      setIsSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-blue-200">
            <UploadCloud className="w-4 h-4 text-blue-300" />
            <span>Prescription Upload Desk</span>
          </div>
          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white transition-colors p-1 rounded-lg hover:bg-blue-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Prescription Uploaded Successfully</h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
              Our registered clinical pharmacist is reviewing your prescription. You will receive an SMS/WhatsApp confirmation with your itemized medication schedule shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 flex items-start gap-2.5 text-xs text-blue-900">
              <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <span>
                Upload a clear photo or PDF scan of your doctor's stamped prescription. Our pharmacists verify all POM orders before dispensing.
              </span>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-lg text-xs flex items-center gap-2 border border-rose-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* File Drag / Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Upload Prescription Document (JPG, PNG, PDF) *
              </label>
              <div className="relative border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/30 hover:bg-blue-50/60 rounded-xl p-6 text-center cursor-pointer transition-colors">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-2 text-blue-900">
                    <FileText className="w-6 h-6 text-blue-600" />
                    <div className="text-left text-xs">
                      <p className="font-semibold line-clamp-1">{selectedFile.name}</p>
                      <p className="text-[10px] text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB · Ready</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <UploadCloud className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-blue-900">Click to upload prescription</p>
                    <p className="text-[11px] text-slate-500 mt-1">Supports doctor notes, hospital discharge slips & lab Rx</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Patient Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Ngozi Balogun"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone / WhatsApp Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+234 800 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Instructions for Pharmacist (Allergies, preferred brands, refill notes)
              </label>
              <textarea
                rows={3}
                placeholder="Mention any drug allergies, current dosage forms or recurring refills..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                Submit Prescription for Dispensing
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
