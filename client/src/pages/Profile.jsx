import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Save, Shield, Ticket, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/profile');
      return;
    }
    setName(user.name || '');
    setPhone(user.phone || '');
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setErrorMsg('');

    if (newPassword && newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const payload = { name, phone };
      if (newPassword) payload.password = newPassword;

      await updateProfile(payload);
      setMsg('Profile details successfully updated!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Update profile error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">Account Profile</h1>
        <p className="text-xs text-slate-400 mt-1">Manage your personal credentials, contact info, and security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Card: Account Card */}
        <div className="p-6 rounded-3xl bg-cinema-card border border-cinema-border space-y-6 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cinema-accent via-red-600 to-amber-500 text-white flex items-center justify-center font-black text-2xl mx-auto shadow-glow-red">
            {user.name?.charAt(0).toUpperCase()}
          </div>

          <div>
            <h3 className="text-xl font-bold text-white">{user.name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
            <div className="mt-2 inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold capitalize">
              <Shield className="w-3.5 h-3.5 text-cinema-accent" />
              <span>{user.role} Member</span>
            </div>
          </div>

          <div className="pt-4 border-t border-cinema-border/50 grid grid-cols-2 gap-2 text-center">
            <div className="p-3 rounded-2xl bg-slate-900 border border-cinema-border/60">
              <Ticket className="w-4 h-4 text-cinema-accent mx-auto mb-1" />
              <p className="text-lg font-black text-white">{user.bookingsCount ?? 'Active'}</p>
              <span className="text-[10px] text-slate-400">Total Bookings</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900 border border-cinema-border/60">
              <Shield className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <p className="text-lg font-black text-emerald-400">Verified</p>
              <span className="text-[10px] text-slate-400">Account Status</span>
            </div>
          </div>
        </div>

        {/* Right Card: Edit Form */}
        <div className="md:col-span-2 p-8 rounded-3xl bg-cinema-card border border-cinema-border shadow-2xl space-y-5">
          <h3 className="text-lg font-bold text-white border-b border-cinema-border/60 pb-3">
            Personal Information
          </h3>

          {msg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/60 text-emerald-300 text-xs flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{msg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-500/60 text-red-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-cinema-border text-sm text-white focus:outline-none focus:border-cinema-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full p-3 rounded-xl bg-slate-900/50 border border-cinema-border/50 text-sm text-slate-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Email cannot be changed directly</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-cinema-border text-sm text-white focus:outline-none focus:border-cinema-accent"
              />
            </div>

            <div className="pt-4 border-t border-cinema-border/60">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Change Password (Optional)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
                  <input
                    type="password"
                    placeholder="Leave blank to keep same"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-cinema-border text-sm text-white focus:outline-none focus:border-cinema-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-cinema-border text-sm text-white focus:outline-none focus:border-cinema-accent"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="py-3 px-6 rounded-xl bg-cinema-accent hover:bg-cinema-accentHover text-white font-bold text-sm flex items-center space-x-2 shadow-glow-red transition"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Update Profile'}</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};

export default Profile;
