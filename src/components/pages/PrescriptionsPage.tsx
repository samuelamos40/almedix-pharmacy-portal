import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, ShieldCheck, AlertCircle, HelpCircle, Phone, ArrowRight, Truck, Check } from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import { Order } from '../../types/pharmacy';
import { supabase } from '../../lib/supabase';
import { NIGERIA_STATES } from '../../utils/constants';

interface PrescriptionsPageProps {
  onTrackOrder?: (orderNumber: string) => void;
}

export const PrescriptionsPage: React.FC<PrescriptionsPageProps> = ({
  onTrackOrder,
}) => {
  const { placeOrder } = usePharmacy();
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('Lagos');
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submittedOrder, setSubmittedOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    let fileUrl = '';
    
    // Try to upload to Supabase Storage
    const fileExt = selectedFile.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('prescriptions')
      .upload(fileName, selectedFile);

    if (uploadError) {
      console.warn("Storage upload failed, bucket might not exist:", uploadError);
      alert('Warning: Prescription bucket not found. The image could not be uploaded. Please notify the admin to create a public "prescriptions" bucket in Supabase.');
    } else if (uploadData) {
      const { data: { publicUrl } } = supabase.storage
        .from('prescriptions')
        .getPublicUrl(fileName);
      fileUrl = publicUrl;
    }

    const combinedNotes = fileUrl 
      ? `Uploaded slip: ${selectedFile.name}\nImage URL: ${fileUrl}\n\nNotes: ${notes}`
      : `Uploaded slip: ${selectedFile.name} (UPLOAD FAILED - BUCKET MISSING)\nNotes: ${notes}`;

    const order = await placeOrder({
      customerName: patientName,
      customerPhone: phone,
      customerEmail: `${patientName.toLowerCase().replace(/\s+/g, '.')}@patient.ng`,
      deliveryAddress: deliveryAddress.trim() || 'Address to be confirmed via phone dispatch',
      deliveryCity: deliveryCity,
      orderStatus: 'Pending',
      paymentStatus: 'Pending Cash on Delivery',
      paymentMethod: 'Cash on Delivery',
      items: [
        {
          drugId: `rx-${Date.now()}`,
          drugName: `Prescription Order: ${selectedFile.name}`,
          dosageForm: 'Prescription Slip',
          strength: 'To be audited by dispensary',
          unitPrice: 0,
          quantity: 1,
          lineTotal: 0,
          requiresPrescription: true,
        }
      ],
      subtotal: 0,
      deliveryFee: 0,
      totalAmount: 0,
      prescriptionUploaded: true,
      prescriptionFileName: selectedFile.name,
      prescriptionNotes: notes,
      notes: combinedNotes,
    });

    setSubmittedOrder(order);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-12 pb-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-medium">
          <UploadCloud className="w-4 h-4 text-blue-600" />
          <span>Hospital & Physician Prescription Desk</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          Upload Your Prescription for Rapid Pharmacist Dispensing
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Have an existing doctor's prescription slip, clinic discharge card, or chronic refill note? Upload it here. Our registered clinical pharmacist will review and contact you with your itemized medication schedule.
        </p>
      </div>

      {/* Main Upload Box */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {submittedOrder ? (
          <div className="p-8 sm:p-10 text-center space-y-5">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                Prescription Logged & Queued
              </span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                Your Prescription Has Been Sent To The Dispensary
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Prescription Order ID: <span className="font-semibold text-slate-900">{submittedOrder.orderNumber}</span>
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 max-w-md mx-auto text-left text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Patient:</span>
                <span className="font-medium text-slate-900">{submittedOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">File Attached:</span>
                <span className="font-medium text-slate-900">{submittedOrder.prescriptionFileName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone Verification:</span>
                <span className="font-medium text-slate-900">{submittedOrder.customerPhone}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100 mt-2">
                <span className="text-slate-500">Fulfillment Status:</span>
                <span className="font-medium text-orange-600">Pending Pharmacist Verification</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              {onTrackOrder && (
                <button
                  onClick={() => onTrackOrder(submittedOrder.orderNumber)}
                  className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-medium text-sm rounded-lg flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <Truck className="w-4 h-4" />
                  <span>Track Live Order Status</span>
                </button>
              )}
              <button
                onClick={() => {
                  setSubmittedOrder(null);
                  setSelectedFile(null);
                  setPatientName('');
                  setPhone('');
                  setDeliveryAddress('');
                  setNotes('');
                }}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-lg transition-colors cursor-pointer"
              >
                Upload Another Slip
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2 border border-red-100">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Drag & Drop Area */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                1. Upload Prescription Slip (Photo or PDF) *
              </label>
              <div className="relative border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/50 rounded-xl p-8 text-center cursor-pointer transition-colors">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-3 text-blue-900">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div className="text-left text-sm">
                      <p className="font-semibold text-slate-900">{selectedFile.name}</p>
                      <p className="text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB · File Attached</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-slate-900">Click to browse or take a photo of your slip</p>
                    <p className="text-xs text-slate-500">Supports JPG, PNG, and PDF up to 15MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Patient Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Patient Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Babatunde Johnson"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition-shadow"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone / WhatsApp Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+234 800 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition-shadow"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Address (Optional / or discuss on call)</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="e.g. Poly Junction area, along Inec Road. Bida Niger State"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full sm:w-2/3 px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition-shadow"
                />
                <select
                  value={deliveryCity}
                  onChange={(e) => setDeliveryCity(e.target.value)}
                  className="w-full sm:w-1/3 px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition-shadow bg-white"
                >
                  {NIGERIA_STATES.map(state => (
                    <option key={state} value={state}>
                      {state} State {state === 'Lagos' ? '(Same-day dispatch)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Special Instructions (Allergies, chronic refill history)
              </label>
              <textarea
                rows={3}
                placeholder="Mention any drug allergies, current brand preferences, or symptoms..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition-shadow"
              />
            </div>

            {/* Submit */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Reviewed strictly by PCN-licensed clinical pharmacists</span>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-medium text-sm rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                Submit Prescription for Dispensing
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Dispensary Fulfillment & Audit Process Showcase */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5">
            <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
              <img
                src="/pharmacy-shelves-1.jpg"
                alt="Licensed Dispensary Audit & Packaging Station"
                className="w-full h-56 object-cover"
              />
            </div>
          </div>
          <div className="md:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium border border-blue-100">
              <ShieldCheck className="w-4 h-4" />
              <span>Standard Operating Procedure (SOP)</span>
            </div>
            <h3 className="font-bold text-slate-900 text-xl">
              What Happens Once You Upload Your Prescription?
            </h3>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-medium flex items-center justify-center shrink-0 text-xs">1</span>
                <span><strong>Clinical Review:</strong> A pharmacist reviews the image, validating prescriber credentials, drug dosages, and potential contraindications.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-medium flex items-center justify-center shrink-0 text-xs">2</span>
                <span><strong>Patient Outreach:</strong> We contact you via phone or WhatsApp with your itemized medication schedule, exact costs, and brand choices.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-medium flex items-center justify-center shrink-0 text-xs">3</span>
                <span><strong>Cold-Chain Dispatch:</strong> Your medicines are barcoded, packed in tamper-proof bags, and dispatched to your home or office.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prescription Guidance FAQs */}
      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 space-y-4">
        <h3 className="font-semibold text-slate-900 text-base flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <span>Frequently Asked Questions About Prescriptions</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-600">
          <div>
            <p className="font-medium text-slate-900 mb-1">What makes a prescription slip valid?</p>
            <p className="leading-relaxed">
              A valid prescription contains the doctor's name, medical council registration number, hospital stamp, date, patient details, medication dosage, and duration.
            </p>
          </div>
          <div>
            <p className="font-medium text-slate-900 mb-1">What if I do not have a prescription?</p>
            <p className="leading-relaxed">
              If you don't have a prescription for a POM drug, click "Doctor Consultation" in the navigation bar to consult one of our certified medical doctors online who can issue a digital prescription.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
