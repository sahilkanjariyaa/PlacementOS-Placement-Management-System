import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

export const OTPCountdown = ({ initialSeconds = 60, onResend, isResending = false }) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const handleResendClick = async () => {
    if (secondsLeft > 0 || isResending) return;
    await onResend();
    setSecondsLeft(60);
  };

  return (
    <div className="flex items-center justify-between text-xs text-slate-500 mt-4">
      <div>
        {secondsLeft > 0 ? (
          <span>
            Resend code in <strong className="text-slate-700 font-semibold">{secondsLeft}s</strong>
          </span>
        ) : (
          <span className="text-slate-600">Didn't receive the verification code?</span>
        )}
      </div>

      <button
        type="button"
        disabled={secondsLeft > 0 || isResending}
        onClick={handleResendClick}
        className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-700 disabled:text-slate-300 disabled:cursor-not-allowed transition"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
        Resend OTP
      </button>
    </div>
  );
};
