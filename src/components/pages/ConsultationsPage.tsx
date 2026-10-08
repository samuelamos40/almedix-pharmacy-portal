import React from 'react';
import { Stethoscope, Video, Phone, MessageSquare, Building, Calendar, CheckCircle2, ShieldCheck, Heart } from 'lucide-react';

interface ConsultationsPageProps {
  onOpenBookingModal: () => void;
}

export const ConsultationsPage: React.FC<ConsultationsPageProps> = ({
  onOpenBookingModal,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-16 pb-16">
      {/* Top Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-medium">
            <Stethoscope className="w-4 h-4 text-blue-600" />
            <span>Virtual Clinic & Telepharmacy</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-snug">
            Consult Qualified Medical Doctors & Clinical Pharmacists From Anywhere
          </h1>

          <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
            Skip long hospital waiting rooms. Book private, one-on-one virtual consultations with certified clinicians. Receive prescription recommendations, laboratory requisitions, and dedicated medication therapy reviews.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onOpenBookingModal}
              className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg text-sm transition-colors shadow-sm cursor-pointer"
            >
              Book an Appointment Now
            </button>
            <div className="text-xs text-slate-500 flex items-center gap-2 font-medium">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>MDCN & PCN Licensed Clinicians Only</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-xl overflow-hidden border border-slate-200 shadow-lg">
            <img
              src="/pharmacist-consulting.jpg"
              alt="Clinical Pharmacist Consultation"
              className="w-full h-[350px] object-cover"
            />
          </div>
        </div>
      </div>

      {/* Available Specialties */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Clinical Departments</span>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">
            Choose Your Clinical Specialty
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Primary Care</span>
            <h3 className="font-semibold text-slate-900 text-lg">General Medical Practice</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Diagnosis and treatment for acute fevers, respiratory tract infections, digestive issues, and formal hospital prescriptions.
            </p>
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-sm">
              <span className="font-medium text-slate-900">₦8,000 / Session</span>
              <button
                onClick={onOpenBookingModal}
                className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                Schedule →
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Medication Review</span>
            <h3 className="font-semibold text-slate-900 text-lg">Clinical Pharmacist</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Drug interaction checks, side-effect resolution, dosage tailoring, and comprehensive polypharmacy counseling.
            </p>
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-sm">
              <span className="font-medium text-slate-900">₦5,000 / Session</span>
              <button
                onClick={onOpenBookingModal}
                className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                Schedule →
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Chronic Care</span>
            <h3 className="font-semibold text-slate-900 text-lg">Cardiology & Diabetes</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Hypertension monitoring, glycemic index management, cardiovascular screening, and routine chronic refills.
            </p>
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-sm">
              <span className="font-medium text-slate-900">₦10,000 / Session</span>
              <button
                onClick={onOpenBookingModal}
                className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                Schedule →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Consultation Formats */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 sm:p-12 text-center space-y-8">
        <h3 className="text-2xl font-bold text-slate-900">
          Consult Across Flexible Formats
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-2">
            <Video className="w-6 h-6 text-blue-600 mx-auto" />
            <p className="font-medium text-slate-900 text-sm">Secure Video Call</p>
            <p className="text-xs text-slate-500">Face-to-face encrypted HD video</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-2">
            <Phone className="w-6 h-6 text-blue-600 mx-auto" />
            <p className="font-medium text-slate-900 text-sm">Direct Audio Call</p>
            <p className="text-xs text-slate-500">Private phone call consultation</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-2">
            <MessageSquare className="w-6 h-6 text-blue-600 mx-auto" />
            <p className="font-medium text-slate-900 text-sm">WhatsApp Tele-Chat</p>
            <p className="text-xs text-slate-500">Convenient messaging & audio notes</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-2">
            <Building className="w-6 h-6 text-blue-600 mx-auto" />
            <p className="font-medium text-slate-900 text-sm">In-Clinic Physical</p>
            <p className="text-xs text-slate-500">Visit our Lekki or Ikeja centers</p>
          </div>
        </div>

        <button
          onClick={onOpenBookingModal}
          className="px-8 py-3 bg-blue-700 hover:bg-blue-800 text-white font-medium text-sm rounded-lg shadow-sm cursor-pointer transition-colors"
        >
          Open Consultation Scheduler
        </button>
      </div>

      {/* In-Clinic Physical Centers */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Walk-In Clinical Care</span>
            <h3 className="text-2xl font-bold text-slate-900">
              Prefer An In-Person Clinical Visit?
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Our clinical consultation suites at Lekki Phase 1 and Ikeja GRA offer on-site diagnostic vital checks (Blood Pressure, Blood Glucose, BMI), private counseling, and immediate dispensary dispensing under one roof.
            </p>
            <div className="flex flex-col gap-3 pt-2 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                <span>Zero wait-time with scheduled appointments</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                <span>Immediate dispensary fulfillment</span>
              </div>
            </div>
            <button
              onClick={onOpenBookingModal}
              className="mt-4 px-6 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-sm rounded-lg transition-colors cursor-pointer"
            >
              Book In-Clinic Walk-In Appointment
            </button>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-xl overflow-hidden border border-slate-200 shadow-md">
              <img
                src="/blood-pressure-check.jpg"
                alt="Pharmacist checking blood pressure"
                className="w-full h-80 object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
