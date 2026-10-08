import React, { useState } from 'react';
import { Stethoscope, Calendar, Clock, Video, Phone, MessageSquare, CheckCircle2, FileText, Download, X } from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import { Consultation, ConsultationStatus } from '../../types/pharmacy';
import { formatCurrency } from '../../utils/formatters';
import { generateConsultationsCsv, triggerDownload } from '../../utils/dataExports';

export const ConsultationsManagement: React.FC<{ userRole?: string }> = ({ userRole }) => {
  const { consultations, updateConsultationStatus, consultationConfigs, updateConsultationConfig, addConsultationConfig, removeConsultationConfig, consultationTimeSlots, updateConsultationTimeSlots } = usePharmacy();
  const isFinanceTeam = userRole === 'admin';
  const [activeTab, setActiveTab] = useState<'appointments' | 'config'>('appointments');
  const [activeConsultation, setActiveConsultation] = useState<Consultation | null>(null);
  const [pharmacistNotes, setPharmacistNotes] = useState('');
  const [rxRecommendation, setRxRecommendation] = useState('');
  const [assignedStaff, setAssignedStaff] = useState('');

  const handleOpenConsultationRecord = (c: Consultation) => {
    setActiveConsultation(c);
    setPharmacistNotes(c.pharmacistNotes || '');
    setRxRecommendation(c.prescriptionRecommendation || '');
    setAssignedStaff(c.assignedStaffName || '');
  };

  const handleSaveNotes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConsultation) return;

    updateConsultationStatus(
      activeConsultation.id,
      'Completed',
      pharmacistNotes,
      rxRecommendation,
      undefined,
      assignedStaff
    );

    setActiveConsultation(null);
  };

  const handleAssignStaff = (id: string, currentStatus: ConsultationStatus, staffName: string) => {
    updateConsultationStatus(id, currentStatus, undefined, undefined, undefined, staffName);
  };

  const handleExportConsultations = () => {
    const csv = generateConsultationsCsv(consultations);
    triggerDownload(csv, `almedix_consultations_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Clinical Telepharmacy Management</h2>
          <p className="text-xs text-slate-500">
            Manage appointments, patient clinical notes, and telehealth pricing setup.
          </p>
        </div>

        <div className="flex gap-2">
          {userRole === 'admin' && (
            <>
              <button
                onClick={() => setActiveTab('appointments')}
                className={`px-3 py-2 border rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'appointments' ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Appointments Queue
              </button>
              <button
                onClick={() => setActiveTab('config')}
                className={`px-3 py-2 border rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'config' ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Pricing & Types Setup
              </button>
            </>
          )}
        </div>
      </div>

      {activeTab === 'appointments' && (
        <>
          {isFinanceTeam && (
            <div className="flex justify-end">
              <button
                onClick={handleExportConsultations}
                className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-blue-700" />
                <span>Export CSV</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {consultations.map(con => (
              <div
                key={con.id}
                className="bg-white p-5 rounded-xl border border-blue-100 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-sm text-slate-900">{con.patientName}</span>
                      <p className="text-[11px] text-blue-700 font-medium mt-0.5">{con.specialistType}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      con.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {con.status}
                    </span>
                  </div>

                  <div className="mt-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100 text-xs space-y-1.5">
                    <div className="flex items-center gap-2 text-slate-700 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-blue-700" />
                      <span>{con.appointmentDate} · {con.appointmentTime}</span>
                    </div>
                    <div className="flex flex-col gap-1 text-slate-600 mt-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-blue-900">{con.consultationFormat}</span>
                        <span aria-hidden="true">·</span>
                        <span>{con.patientGender}, {con.patientAge} yrs</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono mt-0.5">
                        <span className="font-bold text-slate-700">Contact:</span>
                        <a href={`tel:${con.patientPhone}`} className="text-blue-700 hover:underline">{con.patientPhone}</a>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-xs">
                    <span className="font-bold text-slate-700 block text-[11px]">Chief Complaint / Symptoms:</span>
                    <p className="text-slate-600 leading-relaxed mt-0.5 bg-slate-50 p-2.5 rounded-lg line-clamp-2">
                      "{con.symptomsSummary}"
                    </p>
                  </div>
                  
                  <div className="mt-3 text-xs flex items-center gap-2">
                    <span className="font-bold text-slate-700 text-[11px]">Assigned to:</span>
                    <input
                      type="text"
                      placeholder="Unassigned"
                      defaultValue={con.assignedStaffName || ''}
                      onBlur={(e) => handleAssignStaff(con.id, con.status, e.target.value)}
                      className="flex-1 px-2 py-1 text-[11px] border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 outline-none bg-slate-50"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-900">
                    {isFinanceTeam ? formatCurrency(con.fee) : 'Paid'}
                  </span>

                  <button
                    onClick={() => handleOpenConsultationRecord(con)}
                    className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{con.status === 'Completed' ? 'View Record' : 'Process'}</span>
                  </button>
                </div>
              </div>
            ))}
            {consultations.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500 text-sm">
                No consultations found in the database.
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'config' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-6">
          <div>
            <h3 className="font-bold text-slate-900">Consultation Pricing & Availability</h3>
            <p className="text-xs text-slate-500 mt-1">
              Changes here will immediately reflect on the patient-facing booking portal.
            </p>
          </div>
          
          <div className="space-y-4">
            {consultationConfigs.map((config) => (
              <div key={config.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex flex-col md:flex-row gap-4 relative">
                <button
                  onClick={() => removeConsultationConfig(config.id)}
                  className="absolute top-2 right-2 p-1.5 text-rose-500 hover:bg-rose-100 rounded-md transition-colors cursor-pointer"
                  title="Remove this consultation type"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex-1 space-y-3 mt-4 md:mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Consultation Title</label>
                      <input 
                        type="text" 
                        value={config.title}
                        onChange={(e) => updateConsultationConfig(config.id, { title: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded outline-none focus:border-blue-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Specialty Identifier</label>
                      <input 
                        type="text" 
                        value={config.type}
                        onChange={(e) => updateConsultationConfig(config.id, { type: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded outline-none focus:border-blue-500 bg-slate-100" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Description (Shown to patients)</label>
                    <textarea 
                      value={config.desc}
                      onChange={(e) => updateConsultationConfig(config.id, { desc: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded outline-none focus:border-blue-500"
                      rows={2}
                    />
                  </div>
                </div>
                <div className="w-full md:w-48 shrink-0">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Consultation Fee (₦)</label>
                  <input 
                    type="number" 
                    value={config.fee}
                    onChange={(e) => updateConsultationConfig(config.id, { fee: Number(e.target.value) })}
                    className="w-full text-sm font-mono font-bold px-3 py-2 border border-slate-300 rounded outline-none focus:border-blue-500 text-blue-900" 
                  />
                </div>
              </div>
            ))}
          </div>
          
          <button 
            onClick={() => addConsultationConfig({ type: 'New Specialist', title: 'New Specialist Care', fee: 0, desc: 'Description here...' })}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer mb-8"
          >
            + Add New Consultation Type
          </button>

          <h3 className="text-lg font-bold text-slate-900 mb-4 border-t pt-8">Available Time Windows</h3>
          <p className="text-xs text-slate-500 mb-4">Set the exact time slots available for patients to book consultations.</p>
          
          <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-xs mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {consultationTimeSlots.map((slot, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={slot}
                    onChange={(e) => {
                      const newSlots = [...consultationTimeSlots];
                      newSlots[idx] = e.target.value;
                      updateConsultationTimeSlots(newSlots);
                    }}
                    className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() => {
                      const newSlots = consultationTimeSlots.filter((_, i) => i !== idx);
                      updateConsultationTimeSlots(newSlots);
                    }}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded cursor-pointer transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => updateConsultationTimeSlots([...consultationTimeSlots, '00:00 AM - 00:00 PM'])}
              className="mt-4 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              + Add Time Slot
            </button>
          </div>
        </div>
      )}

      {/* Modal: Write Pharmacist Notes & Complete Consultation */}
      {activeConsultation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden my-8">
            <div className="bg-blue-900 text-white p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm">Consultation Clinical Documentation</h3>
                <p className="text-xs text-blue-200">
                  {activeConsultation.patientName} · {activeConsultation.referenceNumber}
                </p>
              </div>
              <button onClick={() => setActiveConsultation(null)} className="text-blue-200 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNotes} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-blue-50 rounded-lg text-slate-700 flex flex-col gap-2">
                <div>
                  <span className="font-bold block text-slate-900 mb-1">Patient Complaint:</span>
                  <p className="leading-relaxed">{activeConsultation.symptomsSummary}</p>
                </div>
                <div className="border-t border-blue-200 pt-2 mt-1">
                  <span className="font-bold text-slate-900">Patient Phone: </span>
                  <a href={`tel:${activeConsultation.patientPhone}`} className="text-blue-700 font-mono hover:underline">
                    {activeConsultation.patientPhone}
                  </a>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pharmacist / Clinician Assessment & Notes *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Record clinical impressions, advice provided, and counseling points..."
                  value={pharmacistNotes}
                  onChange={(e) => setPharmacistNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Prescription Recommendation (If issued)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Coartem 80/480mg (1 tab stat then bd x 3 days) + Paracetamol 1g prn"
                  value={rxRecommendation}
                  onChange={(e) => setRxRecommendation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveConsultation(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Save & Complete Consultation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
