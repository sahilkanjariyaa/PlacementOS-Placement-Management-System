import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  User,
  Mail,
  Building,
  Briefcase,
  MapPin,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export const RegisterPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // Determine initial role from query parameter (?role=recruiter) or router state
  const paramRole = searchParams.get('role') || location.state?.role;
  const [role, setRole] = useState(paramRole === 'recruiter' ? 'recruiter' : 'student');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('Technology & SaaS');
  const [locationState, setLocationState] = useState('Bengaluru, India');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { requestSignupOtp, user } = useAuth();
  const navigate = useNavigate();

  // Sync state if URL query param changes
  useEffect(() => {
    const activeRoleParam = searchParams.get('role');
    if (activeRoleParam === 'recruiter' && role !== 'recruiter') {
      setRole('recruiter');
    } else if (activeRoleParam === 'student' && role !== 'student') {
      setRole('student');
    }
  }, [searchParams]);

  React.useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'recruiter') navigate('/recruiter/dashboard');
      else navigate('/student/dashboard');
    }
  }, [user, navigate]);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setSearchParams({ role: newRole }, { replace: true });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || name.trim().length < 2) {
      setError('Please enter your full legal name.');
      return;
    }

    if (!email.trim()) {
      setError('Please provide a valid email address.');
      return;
    }

    if (role === 'recruiter' && !companyName.trim()) {
      setError('Please specify your company or organization name.');
      return;
    }

    setLoading(true);
    try {
      const res = await requestSignupOtp(name.trim(), email.trim(), role);
      if (res.success) {
        navigate('/verify-otp', {
          state: {
            name: name.trim(),
            email: email.trim(),
            role,
            companyName: companyName.trim(),
            industry: industry.trim(),
            location: locationState.trim(),
            purpose: 'signup',
            devCode: res.data?.devCode,
            isLiveEmail: res.data?.isLiveEmail,
          },
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to dispatch registration OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-500 to-teal-300 text-white shadow-xl shadow-brand-500/30 mb-4">
          <span className="font-extrabold text-2xl">P</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Create Account</h2>
        <p className="mt-2 text-sm text-slate-400">
          Sign up for the College Placement Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-white/20">
          {/* Role Switcher Tabs */}
          <div className="mb-6 p-1 bg-slate-100 rounded-xl border border-slate-200 grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => handleRoleChange('student')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition ${
                role === 'student'
                  ? 'bg-white text-teal-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Signup</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange('recruiter')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition ${
                role === 'recruiter'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>Recruiter Signup</span>
            </button>
          </div>

          <div className="mb-5">
            <h3 className="text-lg font-bold text-slate-900">
              {role === 'student' ? 'Student Registration' : 'Corporate Recruiter Onboarding'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {role === 'student'
                ? 'Register your candidate profile to apply for active placement drives.'
                : 'Register your company account to post drives and review student candidates.'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
              {error.includes('already exists') && (
                <Link
                  to="/login"
                  className="self-start inline-flex items-center gap-1 text-[11px] font-bold text-rose-900 bg-rose-100 hover:bg-rose-200 px-2.5 py-1 rounded-lg transition"
                >
                  <span>Go to Login Screen</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {role === 'student' ? 'Full Name' : 'HR Representative Full Name'} *
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="name"
                  type="text"
                  required
                  placeholder={role === 'student' ? 'e.g. Aarav Sharma' : 'e.g. Ananya Deshmukh'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {role === 'student' ? 'Student Email Address' : 'Official Corporate Email'} *
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder={role === 'student' ? 'student@gmail.com' : 'recruiter@company.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition"
                />
              </div>
            </div>

            {/* Recruiter specific fields */}
            {role === 'recruiter' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Company / Organization Name *
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Building className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. TechNova Solutions"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Industry Sector
                    </label>
                    <input
                      type="text"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      placeholder="e.g. Fintech / Cloud"
                      className="block w-full px-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Location
                    </label>
                    <input
                      type="text"
                      value={locationState}
                      onChange={(e) => setLocationState(e.target.value)}
                      placeholder="e.g. Bengaluru, India"
                      className="block w-full px-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white focus:outline-none transition ${
                role === 'recruiter'
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-brand-600 hover:bg-brand-700'
              } disabled:opacity-50`}
            >
              {loading ? (
                'Sending OTP...'
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
                Sign In with Email OTP
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Encrypted Passwordless OTP Verification</span>
          </div>
        </div>
      </div>
    </div>
  );
};
