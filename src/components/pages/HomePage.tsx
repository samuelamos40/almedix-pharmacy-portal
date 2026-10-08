import React from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  Stethoscope, 
  UploadCloud, 
  Truck, 
  Pill, 
  CheckCircle2, 
  Phone, 
  ChevronRight,
} from 'lucide-react';
import { DrugItem } from '../../types/pharmacy';
import { formatCurrency } from '../../utils/formatters';

interface HomePageProps {
  onNavigate: (page: string) => void;
  featuredDrugs: DrugItem[];
  onSelectDrug: (drug: DrugItem) => void;
  onAddToCart: (drug: DrugItem) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  featuredDrugs,
  onSelectDrug,
  onAddToCart,
}) => {
  return (
    <div className="space-y-16 pb-16">
      {/* 1. Hero Section */}
      <section className="relative bg-white border-b border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">


              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-snug">
                Professional Healthcare & Authentic Medications,{' '}
                <span className="text-blue-700">Delivered Safely.</span>
              </h1>

              <p className="text-sm text-slate-600 max-w-lg leading-relaxed">
                Almedix brings licensed clinical pharmacists and medical specialists directly to you. Order verified prescription medicines, upload hospital slips, or schedule virtual consultations.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-4">
                <button
                  onClick={() => onNavigate('shop')}
                  className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg transition-colors flex items-center gap-2 text-sm shadow-sm"
                >
                  <span>Browse Dispensary</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('consultations')}
                  className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg border border-slate-200 transition-colors flex items-center gap-2 text-sm"
                >
                  <Stethoscope className="w-4 h-4 text-blue-600" />
                  <span>Book Consult</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-8 grid grid-cols-3 gap-6 border-t border-slate-100">
                <div>
                  <p className="text-xl font-semibold text-slate-900">100%</p>
                  <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider">Verified Stock</p>
                </div>
                <div>
                  <p className="text-xl font-semibold text-blue-700">Fast</p>
                  <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider">Cold Chain Dispatch</p>
                </div>
                <div>
                  <p className="text-xl font-semibold text-slate-900">24/7</p>
                  <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider">Clinical Support</p>
                </div>
              </div>
            </div>

            {/* Right Hero Image */}
            <div className="relative">
              <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-lg bg-slate-100 h-[400px]">
                <img
                  src="/pharmacy-shelves-1.jpg"
                  alt="Al-Medix Pharmacy Shelves"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm p-4 rounded-lg border border-slate-100 shadow-sm flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    <div>
                      <p className="font-medium text-slate-900">Authentic NAFDAC Medicines</p>
                      <p className="text-xs text-slate-500">Quality assured by our pharmacists</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Key Healthcare Services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">
            Integrated Pharmacy Services
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Tailored healthcare programs for families and chronic illness patients.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div 
            onClick={() => onNavigate('shop')}
            className="p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Pill className="w-5 h-5" />
              </div>
              <h3 className="font-medium text-slate-900 text-sm mb-2">
                Prescription Dispensing
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Order genuine antibiotics and chronic care medicines sourced from certified distributors.
              </p>
            </div>
          </div>

          <div 
            onClick={() => onNavigate('consultations')}
            className="p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Stethoscope className="w-5 h-5" />
              </div>
              <h3 className="font-medium text-slate-900 text-sm mb-2">
                Specialist Telehealth
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Virtual consultations with Clinical Pharmacists and General Practitioners.
              </p>
            </div>
          </div>

          <div 
            onClick={() => onNavigate('prescriptions')}
            className="p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                <UploadCloud className="w-5 h-5" />
              </div>
              <h3 className="font-medium text-slate-900 text-sm mb-2">
                Prescription Upload
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Snap a photo of your doctor's slip. Our clinical team will validate and prepare your pack.
              </p>
            </div>
          </div>

          <div 
            onClick={() => onNavigate('track')}
            className="p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="font-medium text-slate-900 text-sm mb-2">
                Secure Delivery
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Sensitive medicines delivered in insulated pouches maintaining integrity to your doorstep.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* New Section: How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-blue-50/50 rounded-2xl border border-blue-100 p-8 sm:p-12 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            How Al-Medix Works
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto mb-10">
            A seamless experience designed to bring clinical care and authentic medications right to your doorstep.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting lines for desktop */}
            <div className="hidden md:block absolute top-8 left-1/6 right-1/6 h-0.5 bg-blue-200" />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-full border-4 border-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl mb-4 shadow-sm">
                1
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Consult or Browse</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-[200px] text-center">
                Speak with our doctors online or find your prescribed medications in our catalog.
              </p>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-full border-4 border-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl mb-4 shadow-sm">
                2
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Secure Checkout</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-[200px] text-center">
                Upload your prescription, review your order, and pay securely online.
              </p>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-full border-4 border-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl mb-4 shadow-sm">
                3
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Express Delivery</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-[200px] text-center">
                Your medications arrive in temperature-controlled packaging via trusted dispatchers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Medications Preview Strip */}
      {featuredDrugs.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Frequently Dispensed
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Explore Store</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredDrugs.slice(0, 4).map(drug => (
            <div
              key={drug.id}
              onClick={() => onSelectDrug(drug)}
              className="bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all p-4 flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="text-xs text-slate-500 flex items-center gap-1.5 mb-2">
                  <span className="font-medium text-slate-700">{drug.brand}</span>
                  <span aria-hidden="true">·</span>
                  <span>{drug.dosageForm}</span>
                </div>
                <h4 className="font-medium text-slate-900 text-sm line-clamp-1 mb-1">
                  {drug.name}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-1">
                  {drug.genericName}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">
                  {formatCurrency(drug.sellingPrice)}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(drug);
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-xs font-medium transition-colors cursor-pointer"
                >
                  Add to Bag
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
      )}

      {/* 4. Inside Almedix / Real Photos */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
            <img
              src="/pharmacist-consulting.jpg"
              alt="Pharmacist Consultation"
              className="w-full h-64 object-cover"
            />
            <div className="p-6">
              <h3 className="font-semibold text-slate-900 text-lg mb-2">
                Professional Clinical Guidance
              </h3>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                Our licensed clinical team conducts thorough therapy reviews, checks your contraindications, and optimizes your chronic regimens.
              </p>
              <button
                onClick={() => onNavigate('consultations')}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Book a Consultation</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
            <img
              src="/pharmacy-shelves-2.jpg"
              alt="Well-stocked Pharmacy Shelves"
              className="w-full h-64 object-cover"
            />
            <div className="p-6">
              <h3 className="font-semibold text-slate-900 text-lg mb-2">
                Precision Storage & Dispensing
              </h3>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                Climate-monitored shelving maintaining absolute stability for authentic, verified medicines directly from manufacturers.
              </p>
              <button
                onClick={() => onNavigate('shop')}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Browse our Dispensary</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900">
            Trusted by Patients Nationwide
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Hear from our community about their experience with Al-Medix.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm relative">
            <div className="absolute -top-3 left-6 text-4xl text-blue-200">"</div>
            <p className="text-sm text-slate-600 leading-relaxed italic mb-4 relative z-10 pt-2">
              The convenience of having my chronic meds delivered in cold-chain packs is unmatched. The pharmacist was very helpful during my consultation.
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold">
                OA
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">Oluwaseun A.</p>
                <p className="text-xs text-slate-500">Verified Patient</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm relative">
            <div className="absolute -top-3 left-6 text-4xl text-blue-200">"</div>
            <p className="text-sm text-slate-600 leading-relaxed italic mb-4 relative z-10 pt-2">
              Booking a tele-consultation was so easy. The doctor listened to me, prescribed what I needed, and the dispensary sent it right away.
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold">
                FE
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">Fatima E.</p>
                <p className="text-xs text-slate-500">Verified Patient</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm relative">
            <div className="absolute -top-3 left-6 text-4xl text-blue-200">"</div>
            <p className="text-sm text-slate-600 leading-relaxed italic mb-4 relative z-10 pt-2">
              Uploading my hospital slip was seamless. The pharmacists verified it quickly and I had my meds delivered to my doorstep within hours.
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-bold">
                CO
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">Chidi O.</p>
                <p className="text-xs text-slate-500">Verified Patient</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Emergency & Hotline Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-900 rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 text-white rounded-lg">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <p className="font-medium text-white text-base">24/7 Emergency Pharmacy Helpline</p>
              <p className="text-sm text-slate-400 mt-1">
                Need urgent medicine counseling? Call <span className="font-medium text-white">09066666814</span>.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('consultations')}
            className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-900 text-sm font-medium rounded-lg transition-colors shrink-0 cursor-pointer"
          >
            Speak With Pharmacist
          </button>
        </div>
      </section>
    </div>
  );
};

