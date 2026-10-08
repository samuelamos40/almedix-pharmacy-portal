import React, { useState } from 'react';
import { X, Stethoscope, Video, Phone, MessageSquare, Building, Calendar, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import { useAuth } from '../../context/AuthContext';
import { SpecialistType, ConsultationFormat, Consultation } from '../../types/pharmacy';
import { formatCurrency } from '../../utils/formatters';
import { ASSETS } from '../../assets/images';
import { usePaystackPayment } from 'react-paystack';

interface ConsultationBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}


export const ConsultationBookingModal: React.FC<ConsultationBookingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { bookConsultation, consultationConfigs, consultationTimeSlots } = usePharmacy();
  const { user } = useAuth();
  
  // Set default specialist to the first one available in configs
  const [selectedSpecialist, setSelectedSpecialist] = useState<SpecialistType>(
    consultationConfigs.length > 0 ? consultationConfigs[0].type : 'Clinical Pharmacist'
  );
  
  // Update selection if configs load/change and selection is empty
  React.useEffect(() => {
    if (consultationConfigs.length > 0 && !selectedSpecialist) {
      setSelectedSpecialist(consultationConfigs[0].type);
    }
  }, [consultationConfigs, selectedSpecialist]);

  const [selectedFormat, setSelectedFormat] = useState<ConsultationFormat>('Video Call');
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [selectedTime, setSelectedTime] = useState(
    consultationTimeSlots.length > 0 ? consultationTimeSlots[0] : '09:00 AM'
  );
  const [patientName, setPatientName] = useState(user?.name || '');
  const [patientAge, setPatientAge] = useState<number>(32);
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [patientPhone, setPatientPhone] = useState(user?.phone || '');
  const [patientEmail, setPatientEmail] = useState(user?.email || '');
  const [symptomsSummary, setSymptomsSummary] = useState('');
  const [bookedConsultation, setBookedConsultation] = useState<Consultation | null>(null);

  // Sync with current user whenever modal opens or user changes
  React.useEffect(() => {
    if (isOpen) {
      setPatientName(user?.name || '');
      setPatientPhone(user?.phone || '');
      setPatientEmail(user?.email || '');
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const currentSpecialistObj = consultationConfigs.find(s => s.type === selectedSpecialist) || consultationConfigs[0];

  const paystackConfig = {
    reference: (new Date()).getTime().toString(),
    email: patientEmail || 'patient@example.com',
    amount: currentSpecialistObj.fee * 100,
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_e48975936fc1829d78c850123797ce6a59bf8774',
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!patientName.trim() || !patientPhone.trim() || !symptomsSummary.trim()) {
      return;
    }

    if (currentSpecialistObj.fee > 0) {
      initializePayment({
        onSuccess: async () => {
          const newCon = await bookConsultation({
            patientName, patientAge, patientGender, patientPhone, patientEmail,
            specialistType: selectedSpecialist, consultationFormat: selectedFormat,
            appointmentDate: selectedDate, appointmentTime: selectedTime,
            symptomsSummary, fee: currentSpecialistObj.fee, paymentStatus: 'Paid',
          });
          setBookedConsultation(newCon);
        },
        onClose: () => {
          console.log('Payment modal closed');
        }
      });
    } else {
      const newCon = await bookConsultation({
        patientName, patientAge, patientGender, patientPhone, patientEmail,
        specialistType: selectedSpecialist, consultationFormat: selectedFormat,
        appointmentDate: selectedDate, appointmentTime: selectedTime,
        symptomsSummary, fee: 0, paymentStatus: 'Pending',
      });
      setBookedConsultation(newCon);
    }
  };

  const handleReset = () => {
    setBookedConsultation(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-blue-200">
            <Stethoscope className="w-4 h-4 text-blue-300" />
            <span>Almedix Telepharmacy & Doctor Consultations</span>
          </div>
          <button
            onClick={handleReset}
            className="text-blue-200 hover:text-white transition-colors p-1 rounded-lg hover:bg-blue-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {bookedConsultation ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                Appointment Confirmed
              </span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                Your Consultation is Scheduled
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                Booking Reference: <span className="font-bold text-blue-900">{bookedConsultation.referenceNumber}</span>
              </p>
            </div>

            <div className="bg-blue-50 p-5 rounded-xl border border-blue-200 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between border-b border-blue-100 pb-2">
                <span className="text-slate-500">Patient Name:</span>
                <span className="font-semibold text-slate-900">{bookedConsultation.patientName}</span>
              </div>
              <div className="flex justify-between border-b border-blue-100 pb-2">
                <span className="text-slate-500">Specialist:</span>
                <span className="font-semibold text-blue-950">{bookedConsultation.specialistType}</span>
              </div>
              <div className="flex justify-between border-b border-blue-100 pb-2">
                <span className="text-slate-500">Format:</span>
                <span className="font-semibold text-slate-900">{bookedConsultation.consultationFormat}</span>
              </div>
              <div className="flex justify-between border-b border-blue-100 pb-2">
                <span className="text-slate-500">Scheduled Date & Time:</span>
                <span className="font-bold font-mono text-blue-900">
                  {bookedConsultation.appointmentDate} · {bookedConsultation.appointmentTime}
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-500">Consultation Fee:</span>
                <span className="font-bold text-slate-900 font-mono">
                  {formatCurrency(bookedConsultation.fee)} (Paid)
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              A private meeting invite and encrypted link has been prepared. Our doctor will dial or message you on {bookedConsultation.patientPhone}.
            </p>

            <button
              onClick={handleReset}
              className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Done & Return to Pharmacy
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* Banner preview with doctor image */}
            <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
              <img
                src={ASSETS.doctorConsultation}
                alt="Doctor consultation"
                className="w-16 h-16 rounded-xl object-cover border border-blue-200 shrink-0"
              />
              <div className="text-xs">
                <p className="font-bold text-slate-900 text-sm">Speak Directly With Certified Clinicians</p>
                <p className="text-slate-600 mt-0.5 leading-relaxed">
                  Avoid self-medication. Discuss symptoms, renew chronic prescriptions, and receive clinical advice via video, voice, or WhatsApp.
                </p>
              </div>
            </div>

            {/* Specialist selection */}
            {/* Specialist selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Medical Specialist *
              </label>
              {consultationConfigs.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <p className="text-sm font-medium text-slate-700">No specialists available.</p>
                  <p className="text-xs text-slate-500 mt-1">Please check back later when doctors are scheduled.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {consultationConfigs.map((spec: any) => (
                    <div
                      key={spec.type}
                      onClick={() => setSelectedSpecialist(spec.type)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all text-xs ${
                        selectedSpecialist === spec.type
                          ? 'border-blue-600 bg-blue-50/80 shadow-xs'
                          : 'border-slate-200 hover:border-blue-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-900">{spec.title}</span>
                        <span className="font-mono font-bold text-blue-900">{formatCurrency(spec.fee)}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{spec.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Consultation format */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Consultation Method *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['Video Call', 'Voice Call', 'WhatsApp Tele-Chat', 'In-Clinic Physical'] as ConsultationFormat[]).map(fmt => (
                  <button
                    type="button"
                    key={fmt}
                    onClick={() => setSelectedFormat(fmt)}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      selectedFormat === fmt
                        ? 'bg-blue-700 text-white border-blue-700'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-blue-50'
                    }`}
                  >
                    {fmt === 'Video Call' && <Video className="w-3.5 h-3.5" />}
                    {fmt === 'Voice Call' && <Phone className="w-3.5 h-3.5" />}
                    {fmt === 'WhatsApp Tele-Chat' && <MessageSquare className="w-3.5 h-3.5" />}
                    {fmt === 'In-Clinic Physical' && <Building className="w-3.5 h-3.5" />}
                    <span className="truncate">{fmt}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Time slots */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>Preferred Date *</span>
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Available Time Window *</span>
                </label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                >
                  {consultationTimeSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Patient details */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Patient Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Samuel Amos"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={patientAge}
                    onChange={(e) => setPatientAge(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+234 800 000 0000"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="patient@example.com"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Symptoms & Reason for Consultation *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Describe your current symptoms, how long you've felt this way, or medications you are currently taking..."
                  value={symptomsSummary}
                  onChange={(e) => setSymptomsSummary(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>
            </div>

            {/* Bottom summary and submit */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 block">Total Consultation Fee</span>
                <span className="text-xl font-bold text-blue-950 font-mono">
                  {formatCurrency(currentSpecialistObj.fee)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  Confirm & Schedule Consultation
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
