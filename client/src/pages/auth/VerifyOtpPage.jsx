import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { OTPInput } from '../../components/auth/OTPInput.jsx';
import { OTPCountdown } from '../../components/auth/OTPCountdown.jsx';
import { KeyRound, ArrowRight, ShieldCheck, AlertCircle, Sparkles, Mail, Check } from 'lucide-react';

export const VerifyOtpPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyLoginOtp, verifySignupOtp, resendOtp } = useAuth();

  const email = location.state?.email || '';
  const name = location.state?.name || '';
  const purpose = location.state?.purpose || 'login';
  const isLiveEmail = location.state?.isLiveEmail || false;

  const [devCode, setDevCode] = useState(location.state?.devCode || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  React.useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      let res;
      if (purpose === 'signup') {
        res = await verifySignupOtp({
          name,
          email,
          otp,
          role: location.state?.role || 'student',
          companyName: location.state?.companyName,
          industry: location.state?.industry,
          location: location.state?.location,
        });
      } else {
        res = await verifyLoginOtp(email, otp);
      }

      if (res.success) {
        const userRole = res.data.user.role;
        if (userRole === 'admin') navigate('/admin/dashboard');
        else if (userRole === 'recruiter') navigate('/recruiter/dashboard');
        else navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please check the code and retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError('');
    setSuccessMessage('');
    try {
      const res = await resendOtp(email, purpose);
      if (res.success) {
        setSuccessMessage('A fresh real-time verification code has been generated.');
        if (res.data?.devCode) {
          setDevCode(res.data.devCode);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-500 to-teal-300 text-white shadow-xl shadow-brand-500/30 mb-4">
          <KeyRound className="w-7 h-7" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Enter Verification Code</h2>
        <p className="mt-2 text-sm text-slate-300">
          Sent to <span className="font-semibold text-teal-300">{email}</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-white/20">
          {/* Real-Time Security Code Display (when in local mode or live email) */}
          {devCode ? (
            <div className="mb-6 p-3.5 bg-teal-50 border border-teal-300 text-teal-950 text-xs rounded-xl flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <div>
                  <span className="text-[11px] text-teal-700 block font-medium">Real-Time Security Code:</span>
                  <span className="font-mono font-extrabold text-base tracking-widest text-teal-900">
                    {devCode}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOtp(devCode)}
                className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition shadow-xs flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Fill Code</span>
              </button>
            </div>
          ) : (
            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 text-blue-950 text-xs rounded-xl flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>A real-time verification code has been dispatched to your email inbox.</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3 text-center">
                6-Digit Security Code
              </label>
              <OTPInput length={6} value={otp} onChange={setOtp} disabled={loading} />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                'Verifying Code & Generating JWT...'
              ) : (
                <>
                  <span>Verify Code & Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
            <OTPCountdown initialSeconds={60} onResend={handleResend} isResending={isResending} />
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
              Change Email
            </Link>
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
