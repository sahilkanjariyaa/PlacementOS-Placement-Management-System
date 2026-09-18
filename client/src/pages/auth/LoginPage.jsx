import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  GraduationCap,
  Building,
  Shield,
} from 'lucide-react';

const ROLES = [
  {
    id: 'student',
    label: 'Student',
    icon: GraduationCap,
    activeTabClass: 'bg-white text-teal-900 shadow-sm border border-slate-200 font-bold',
    title: 'Student Placement Login',
    subtitle: 'Sign in with your registered college student email address.',
    inputLabel: 'Student Email Address',
    placeholder: 'Enter your student email (e.g. name@student.college.edu)',
  },
  {
    id: 'admin',
    label: 'Admin / Officer',
    icon: Shield,
    activeTabClass: 'bg-white text-indigo-900 shadow-sm border border-slate-200 font-bold',
    title: 'Placement Officer Login',
    subtitle: 'Sign in with authorized institutional administrative credentials.',
    inputLabel: 'Placement Cell Admin Email',
    placeholder: 'Enter your admin email (e.g. admin@college.edu)',
  },
  {
    id: 'recruiter',
    label: 'Recruiter',
    icon: Building,
    activeTabClass: 'bg-white text-purple-900 shadow-sm border border-slate-200 font-bold',
    title: 'Corporate Recruiter Login',
    subtitle: 'Sign in with your verified company recruiter email address.',
    inputLabel: 'Corporate Recruiter Email',
    placeholder: 'Enter your corporate work email (e.g. hr@company.com)',
  },
];

export const LoginPage = () => {
  const [selectedRole, setSelectedRole] = useState('student');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestedRole, setSuggestedRole] = useState(null);
  const { requestLoginOtp, user } = useAuth();
  const navigate = useNavigate();

  const currentRoleConfig = ROLES.find((r) => r.id === selectedRole) || ROLES[0];

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'recruiter') navigate('/recruiter/dashboard');
      else navigate('/student/dashboard');
    }
  }, [user, navigate]);

  const handleTabChange = (roleId) => {
    setSelectedRole(roleId);
    setError('');
    setSuggestedRole(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuggestedRole(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await requestLoginOtp(email.trim(), selectedRole);
      if (res.success) {
        navigate('/verify-otp', {
          state: {
            email: email.trim(),
            purpose: 'login',
            devCode: res.data?.devCode,
            isLiveEmail: res.data?.isLiveEmail,
            role: res.data?.role || selectedRole,
          },
        });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to dispatch verification OTP.';
      setError(errorMsg);

      // Detect role suggestion from backend message
      if (errorMsg.includes('STUDENT')) setSuggestedRole('student');
      else if (errorMsg.includes('ADMIN')) setSuggestedRole('admin');
      else if (errorMsg.includes('RECRUITER')) setSuggestedRole('recruiter');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4 relative overflow-hidden">
      {/* Decorative background blurs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-500 to-teal-300 text-white shadow-xl shadow-brand-500/30 mb-4">
          <span className="font-extrabold text-2xl">P</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">PlacementOS</h2>
        <p className="mt-2 text-sm text-slate-400">
          College Placement Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-white/20">
          {/* Role Selection Tabs */}
          <div className="mb-6 p-1 bg-slate-100/90 rounded-xl border border-slate-200 grid grid-cols-3 gap-1">
            {ROLES.map((r) => {
              const Icon = r.icon;
              const isActive = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleTabChange(r.id)}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-1 text-[11px] sm:text-xs rounded-lg transition ${
                    isActive ? r.activeTabClass : 'text-slate-500 hover:text-slate-900 font-medium'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Header Description */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900">{currentRoleConfig.title}</h3>
            <p className="text-xs text-slate-500 mt-1">{currentRoleConfig.subtitle}</p>
          </div>

          {/* Error Message with Smart Switch Button */}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
              {suggestedRole && suggestedRole !== selectedRole && (
                <button
                  type="button"
                  onClick={() => handleTabChange(suggestedRole)}
                  className="self-start inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-900 text-[11px] font-bold transition mt-1"
                >
                  <span>Switch to {ROLES.find((r) => r.id === suggestedRole)?.label} Tab</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {currentRoleConfig.inputLabel} *
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder={currentRoleConfig.placeholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                'Dispatching Real-Time Code...'
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Registration Footer */}
          <div className="mt-6 text-center">
            {selectedRole === 'student' ? (
              <p className="text-xs text-slate-600">
                New Student?{' '}
                <Link
                  to="/register?role=student"
                  state={{ role: 'student' }}
                  className="font-bold text-brand-600 hover:text-brand-700"
                >
                  Create Student Account
                </Link>
              </p>
            ) : selectedRole === 'recruiter' ? (
              <p className="text-xs text-slate-600">
                New Hiring Partner?{' '}
                <Link
                  to="/register?role=recruiter"
                  state={{ role: 'recruiter' }}
                  className="font-bold text-purple-600 hover:text-purple-700"
                >
                  Register as Corporate Recruiter
                </Link>
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                Admin accounts are provisioned by institutional administrators.
              </p>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Role-Verified • Real-Time OTP • JWT Session Security</span>
          </div>
        </div>
      </div>
    </div>
  );
};
