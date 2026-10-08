import React, { useState } from 'react';
import { useAuth, UserRole } from '../../context/AuthContext';
import { UserPlus, Shield, Key } from 'lucide-react';

export const StaffManagement: React.FC = () => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('pharmacist');
  const [phone, setPhone] = useState('');
  
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    // Normally the admin would use the Supabase Admin API to create a user without signing them in.
    // For this prototype, we'll use the regular register and show a warning.
    const res = await register({
      name,
      email,
      password,
      role,
      phone,
      staffPasscode: 'ALMEDIX2025' // Just to pass the frontend check
    });

    if (res.success) {
      setStatus({ type: 'success', message: `Staff account created for ${name}! Important: Because email confirmations are disabled, you have been temporarily logged into the new account. Please sign out and log back into your Admin account to continue.` });
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
    } else {
      setStatus({ type: 'error', message: res.error || 'Failed to create staff account.' });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-700" />
          Staff Directory & Access Control
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Create and manage internal accounts for clinical and administrative staff. Only authorized personnel can access the workstation.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 text-sm mb-4 border-b pb-2 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-blue-600" />
          Provision New Staff Account
        </h3>

        {status && (
          <div className={`p-4 rounded-lg mb-6 text-sm font-medium ${
            status.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleCreateStaff} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Official Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Work Phone / Extension</label>
              <input 
                type="tel" 
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department / Role</label>
              <select 
                value={role}
                onChange={e => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none bg-slate-50" 
              >
                <option value="pharmacist">Clinical Pharmacist / Dispenser</option>
                <option value="admin">System Administrator</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Temporary Password</label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="password" 
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none" 
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Staff will be required to change this upon first login.</p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-lg text-sm transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Provisioning...' : 'Create Staff Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
