import React from 'react';
import { Stethoscope, UploadCloud, ShieldCheck, ArrowRight, Truck, CheckCircle2 } from 'lucide-react';
import { ASSETS } from '../../assets/images';

interface HeroSectionProps {
  onOpenConsultation: () => void;
  onOpenPrescriptionUpload: () => void;
  onScrollToCatalog: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenConsultation,
  onOpenPrescriptionUpload,
  onScrollToCatalog,
}) => {
  return (
    <div className="relative bg-gradient-to-b from-blue-50/70 via-white to-white border-b border-blue-100 overflow-hidden">
      {/* Decorative ambient blue background glow */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -mb-16 w-80 h-80 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Headlines & Call to Actions */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold text-blue-900">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>Accredited Pharmacy & Telehealth Network</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
              Quality Medications & Expert Clinical Care,{' '}
              <span className="text-blue-700">Delivered With Trust.</span>
            </h1>

            <p className="text-base text-slate-600 max-w-xl leading-relaxed">
              Order verified NAFDAC-certified prescription drugs, manage chronic conditions, or consult certified medical doctors and clinical pharmacists from the comfort of your home.
            </p>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onScrollToCatalog}
                className="px-5 py-3 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-all shadow-sm hover:shadow flex items-center gap-2 cursor-pointer"
              >
                <span>Browse Pharmacy Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenConsultation}
                className="px-5 py-3 text-sm font-semibold text-blue-900 bg-white hover:bg-blue-50 rounded-xl transition-colors border border-blue-200 flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Stethoscope className="w-4 h-4 text-blue-700" />
                <span>Book Doctor Consultation</span>
              </button>

              <button
                onClick={onOpenPrescriptionUpload}
                className="px-4 py-3 text-sm font-medium text-slate-700 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <UploadCloud className="w-4 h-4 text-blue-600" />
                <span>Upload Prescription</span>
              </button>
            </div>

            {/* Trust points */}
            <div className="pt-4 grid grid-cols-3 gap-3 border-t border-blue-100/80">
              <div>
                <p className="text-lg font-bold text-slate-900 font-mono tabular-nums">100%</p>
                <p className="text-xs text-slate-500">NAFDAC Certified</p>
              </div>
              <div>
                <p className="text-lg font-bold text-blue-800 font-mono tabular-nums">45 Mins</p>
                <p className="text-xs text-slate-500">Express Delivery</p>
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900 font-mono tabular-nums">24 / 7</p>
                <p className="text-xs text-slate-500">Pharmacist On-Call</p>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Image with Fallback */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-blue-200/80 shadow-lg bg-blue-100">
              <img
                src={ASSETS.almedixStorefront}
                alt="Modern Almedix Pharmacy Interior & Dispensary"
                className="w-full h-80 sm:h-96 object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              
              {/* Fallback container if image fails to load */}
              <div className="hidden only:flex w-full h-80 sm:h-96 bg-gradient-to-tr from-blue-800 to-blue-600 p-8 flex-col justify-end text-white">
                <p className="text-xl font-bold">Almedix Clinical Pharmacy</p>
                <p className="text-xs text-blue-200 mt-1">Dispensing excellence and compassionate healthcare</p>
              </div>

              {/* Floating Overlays */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs py-1.5 px-3 rounded-lg border border-blue-100 shadow-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold text-slate-800">Licensed Pharmacist Verified</span>
              </div>

              <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-xs py-2 px-3 rounded-lg border border-blue-100 shadow-xs flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-700" />
                <span className="text-xs font-semibold text-slate-800">Temperature Controlled Dispatch</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
