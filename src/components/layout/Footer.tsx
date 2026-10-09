import React from 'react';
import { ShieldCheck, Phone, MapPin, Lock } from 'lucide-react';
import { PublicPage } from './Header';

interface FooterProps {
  onNavigate: (page: PublicPage) => void;
  onOpenLogin: (tab?: 'patient' | 'staff', mode?: 'login' | 'register') => void;
  onSwitchToWorkstation: () => void;
  isStaff: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenLogin,
  onSwitchToWorkstation,
  isStaff,
}) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <img src="/logo.jpg" alt="Al-Medix and Sons LTD Logo" className="h-10 w-auto rounded-lg shadow-sm bg-white p-1" />
          <p className="mt-4 text-xs leading-relaxed text-slate-400">
            Al-Medix and Sons LTD is a premier licensed pharmacy and integrated telehealth provider, ensuring safe, accessible medication therapy and specialist consultations across Nigeria.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-white mb-4">Quick Navigation</p>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">Home</button></li>
            <li><button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors">Pharmacy Catalog</button></li>
            <li><button onClick={() => onNavigate('consultations')} className="hover:text-white transition-colors">Doctor Consultation</button></li>
            <li><button onClick={() => onNavigate('prescriptions')} className="hover:text-white transition-colors">Prescription Upload</button></li>
            <li><button onClick={() => onNavigate('track')} className="hover:text-white transition-colors">Track Order</button></li>
            <li><button onClick={() => onOpenLogin('patient', 'register')} className="text-blue-400 hover:text-blue-300 font-medium">Create Account</button></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-white mb-4">Contact & Locations</p>
          <div className="space-y-3 text-sm text-slate-400">
            <div className="flex items-start gap-2 group">
              <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-slate-400 group-hover:text-blue-400 transition-colors" />
              <a 
                href="https://maps.app.goo.gl/b6g5J5R49peJirXe6?g_st=ic" 
                target="_blank" 
                rel="noreferrer"
                className="hover:text-white transition-colors block"
              >
                Poly Junction area, along Inec Road. Bida Niger State
              </a>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 shrink-0 mt-0.5" />
              <span>09066666814</span>
            </div>
            <div className="flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0 mt-0.5"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              <a href="mailto:support@almedixnigeria.com" className="hover:text-white transition-colors">support@almedixnigeria.com</a>
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-white mb-4">Staff Access</p>
          {isStaff ? (
            <button
              onClick={onSwitchToWorkstation}
              className="w-full py-2.5 px-3 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>Enter Workstation →</span>
            </button>
          ) : (
            <button
              onClick={() => onOpenLogin('staff')}
              className="w-full py-2.5 px-3 text-sm font-medium bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Staff Sign In</span>
            </button>
          )}
        </div>
      </div>

      <div className="border-t border-slate-800 py-6 px-4 sm:px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Al-Medix Pharmacy Limited. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> PCN Certified</span>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <span>GDP Cold Chain Assured</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
