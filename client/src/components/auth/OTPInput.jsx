import React, { useRef, useEffect } from 'react';

export const OTPInput = ({ length = 6, value = '', onChange, disabled = false }) => {
  const inputsRef = useRef([]);

  const otpArray = value.split('').slice(0, length);
  while (otpArray.length < length) {
    otpArray.push('');
  }

  useEffect(() => {
    // Focus first empty input on mount
    const firstEmptyIndex = otpArray.findIndex((digit) => !digit);
    const targetIndex = firstEmptyIndex === -1 ? 0 : firstEmptyIndex;
    if (inputsRef.current[targetIndex] && !disabled) {
      inputsRef.current[targetIndex].focus();
    }
  }, []);

  const handleChange = (e, index) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (!val) return;

    const newOtp = [...otpArray];
    newOtp[index] = val[val.length - 1]; // take last entered digit
    const joined = newOtp.join('');
    onChange(joined);

    // Advance focus
    if (index < length - 1 && inputsRef.current[index + 1]) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otpArray[index] && index > 0 && inputsRef.current[index - 1]) {
        inputsRef.current[index - 1].focus();
      }
      const newOtp = [...otpArray];
      newOtp[index] = '';
      onChange(newOtp.join(''));
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, length);
    if (pastedData) {
      onChange(pastedData);
      const targetIndex = Math.min(pastedData.length, length - 1);
      if (inputsRef.current[targetIndex]) {
        inputsRef.current[targetIndex].focus();
      }
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
      {otpArray.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => (inputsRef.current[idx] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          className={`w-11 h-13 sm:w-13 sm:h-15 text-center text-2xl font-bold rounded-xl border transition-all outline-none ${
            digit
              ? 'border-brand-500 bg-brand-50/30 text-brand-900 shadow-sm ring-2 ring-brand-500/20'
              : 'border-slate-200 bg-white text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}`}
        />
      ))}
    </div>
  );
};
