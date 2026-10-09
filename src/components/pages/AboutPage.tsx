import React from 'react';
import { ShieldCheck, Award, MapPin, Phone, CheckCircle2, Building, Heart } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-16 py-8 pb-16">
      {/* 1. Header Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-medium">
            <Building className="w-4 h-4 text-blue-600" />
            <span>About Al-Medix Pharmacy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Setting the Benchmark for Pharmaceutical Integrity & Patient Care
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Al-Medix was established to eliminate counterfeit medications, provide seamless telepharmacy consultations, and ensure reliable, authentic medication access for every household.
          </p>
        </div>
      </section>

      {/* 2. Pillars / Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-lg">100% Anti-Counterfeit</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              We operate a strict, verified supply chain. Every drug is procured directly from WHO-prequalified manufacturers and licensed distributors.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-lg">PCN & NAFDAC Certified</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Our clinical premises and digital fulfillment centers operate under the regulatory supervision of the Pharmacists Council of Nigeria and NAFDAC.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-lg">Patient-First Care</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              We bridge the gap between doctor visits and medicine refills. Our registered clinical specialists review patient medication records.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Clinical Story & Facilities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Quality Assurance</span>
              <h2 className="text-2xl font-bold text-slate-900">
                Good Distribution Practice (GDP) & Storage
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Many life-saving drugs lose potency when exposed to elevated tropical temperatures. Al-Medix facilities are equipped with temperature sensors and backup power systems maintaining constant safe ambient storage.
              </p>
              <ul className="space-y-3 text-sm text-slate-700 pt-4">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span>Calibrated digital data loggers with automated temperature alerts</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span>Insulated thermal dispatch totes with phase-change ice packs</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span>Zero-tolerance batch tracking with automated expiration write-off</span>
                </li>
              </ul>
            </div>

            <div>
              <div className="rounded-xl overflow-hidden border border-slate-200 shadow-md">
                <img
                  src="/pharmacy-shelves-1.jpg"
                  alt="Al-Medix Pharmaceutical Shelves"
                  className="w-full h-[400px] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3.5. Clinical Counseling */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <div className="rounded-xl overflow-hidden border border-slate-200 shadow-md">
              <img
                src="/pharmacist-consulting.jpg"
                alt="Pharmacist Counseling"
                className="w-full h-[400px] object-cover"
              />
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-4">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Clinical Care</span>
            <h2 className="text-2xl font-bold text-slate-900">
              Personalized Medication Therapy Management
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              At Al-Medix, medication dispensing is not merely transactional. Our licensed clinical pharmacists conduct one-on-one evaluations to detect contraindications, manage side-effects, and tailor regimens for hypertension, diabetes, and infectious diseases.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="font-semibold text-slate-900 text-sm">Expert Guidance</p>
                <p className="text-xs text-slate-500 mt-1">Total confidentiality for sensitive health discussions</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="font-semibold text-slate-900 text-sm">Direct Doctor Line</p>
                <p className="text-xs text-slate-500 mt-1">Inter-professional collaboration with attending physicians</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Physical Location */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl font-bold text-slate-900">
            Visit Our Center
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Walk into our licensed pharmacy or order online for same-day express delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm max-w-5xl mx-auto">
          {/* Card Info */}
          <div className="flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200">
            <div className="relative h-64 overflow-hidden bg-slate-100">
              <img
                src="/pharmacy-shelves-2.jpg"
                alt="Al-Medix HQ Dispensary"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 md:p-8 space-y-5">
              <h3 className="font-bold text-slate-900 text-xl">Al-Medix and Sons LTD HQ</h3>
              <div className="space-y-4">
                <p className="text-base text-slate-600 flex items-start gap-3 group">
                  <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <a 
                    href="https://maps.app.goo.gl/b6g5J5R49peJirXe6?g_st=ic" 
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-blue-700 transition-colors"
                  >
                    Poly Junction area, along Inec Road.<br />Bida, Niger State
                  </a>
                </p>
                <p className="text-base text-slate-600 flex items-center gap-3">
                  <Phone className="w-5 h-5 text-blue-600 shrink-0" />
                  <span className="font-medium">09066666814</span>
                </p>
                <p className="text-base text-slate-600 flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-blue-600 shrink-0"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  <a href="mailto:support@almedixnigeria.com" className="font-medium hover:text-blue-700 transition-colors">support@almedixnigeria.com</a>
                </p>
              </div>
              <div className="pt-2">
                <p className="text-sm text-blue-900 font-bold bg-blue-50 p-3 rounded-lg text-center border border-blue-100 uppercase tracking-wide">
                  Open Daily: 24/7
                </p>
              </div>
            </div>
          </div>
          
          {/* Map */}
          <div className="h-80 lg:h-auto min-h-[400px] w-full bg-slate-100 relative">
             <iframe 
                src="https://maps.google.com/maps?width=100%25&height=600&hl=en&q=AL-MEDIX%20PHARMACY,%20Poly%20Junction%20Area,%20Along%20Inec%20Road,%20Bida%20912101,%20Niger&t=&z=15&ie=UTF8&iwloc=B&output=embed" 
                className="absolute inset-0 w-full h-full"
                frameBorder="0" 
                style={{ border: 0 }} 
                allowFullScreen 
                aria-hidden="false" 
                tabIndex={0}
             ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
};
