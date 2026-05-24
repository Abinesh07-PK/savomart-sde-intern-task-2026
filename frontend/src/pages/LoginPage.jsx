import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { ShieldCheck, Phone, ArrowRight, Loader2, Sparkles } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { requestOtp, verifyOtp } = useAuth();
  
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 = mobile request, 2 = otp verification
  
  const [isLoading, setIsLoading] = useState(false);
  const [devOtp, setDevOtp] = useState(null); // stores OTP retrieved from response for developer easy copy

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    const cleanNum = mobileNumber.replace(/\D/g, '');
    if (cleanNum.length !== 10) {
      toast.error('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    setIsLoading(true);
    try {
      const data = await requestOtp(mobileNumber);
      setDevOtp(data.dev_otp);
      setStep(2);
      toast.success('Mock OTP generated successfully!');
    } catch (err) {
      // errors handled by AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('OTP must be exactly 6 digits');
      return;
    }

    setIsLoading(true);
    try {
      await verifyOtp(mobileNumber, otp);
      navigate('/');
    } catch (err) {
      // errors handled by AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4">
      {/* Dev OTP yellow banner */}
      {devOtp && (
        <div className="absolute top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-savomart-yellow border border-yellow-300 text-slate-800 p-3.5 rounded-xl shadow-lg flex items-center justify-between z-50 animate-bounce">
          <div className="flex items-center space-x-2">
            <Sparkles size={18} className="text-savomart-purple animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-700">
              Mock OTP Code:
            </span>
            <span className="text-base font-bold bg-white text-savomart-purple px-2 py-0.5 rounded border border-savomart-purple/10">
              {devOtp}
            </span>
          </div>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(devOtp);
              toast.success('OTP Copied to Clipboard!');
            }}
            className="text-[10px] font-bold text-savomart-purple underline hover:text-savomart-darkPurple"
          >
            Copy
          </button>
        </div>
      )}

      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden transition-all duration-300">
        
        {/* Banner with brand primary purple */}
        <div className="bg-savomart-purple p-8 text-center relative flex flex-col items-center justify-center space-y-3">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,242,0,0.15),transparent)]"></div>
          {/* Logo Icon */}
          <div className="w-16 h-16 rounded-2xl bg-savomart-yellow text-savomart-purple font-extrabold text-3xl flex items-center justify-center shadow-lg transform rotate-6 hover:rotate-12 transition-transform">
            S
          </div>
          <h1 className="text-2xl font-bold font-sans tracking-tight text-white">
            Savo<span className="text-savomart-yellow">mart</span>
          </h1>
          <p className="text-xs text-purple-200">
            Savomart Loyalty Companion Portal
          </p>
        </div>

        {/* Form Body */}
        <div className="p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-lg font-bold text-slate-800">
              {step === 1 ? 'Unlock Rewards' : 'Verify Mobile'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {step === 1 
                ? 'Enter your Indian mobile number to access your account' 
                : `Enter the 6-digit OTP code sent to your phone`
              }
            </p>
          </div>

          {step === 1 ? (
            /* STEP 1: MOBILE REQUEST */
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Mobile Number
                </label>
                <div className="relative rounded-2xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Phone size={18} />
                  </div>
                  <input
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="99999 99999"
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-savomart-purple focus:border-transparent transition-all"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block text-left">
                  Demo users: try <strong className="text-savomart-purple">9999999999</strong>, <strong className="text-savomart-purple">8888888888</strong>, or <strong className="text-savomart-purple">7777777777</strong>
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-savomart-purple text-white py-3.5 px-4 rounded-2xl font-semibold text-sm shadow-md hover:bg-savomart-darkPurple active:scale-[0.99] disabled:opacity-50 flex items-center justify-center space-x-2 transition-all"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    <span>Send OTP Code</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* STEP 2: OTP VERIFICATION */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Enter 6-Digit OTP
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="block w-full text-center tracking-[0.75em] py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-extrabold text-lg focus:outline-none focus:ring-2 focus:ring-savomart-purple focus:border-transparent transition-all"
                  autoFocus
                />
              </div>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 px-4 rounded-2xl font-semibold text-sm transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-2/3 bg-savomart-purple text-white py-3.5 px-4 rounded-2xl font-semibold text-sm shadow-md hover:bg-savomart-darkPurple active:scale-[0.99] disabled:opacity-50 flex items-center justify-center space-x-2 transition-all"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      <span>Verify Code</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
