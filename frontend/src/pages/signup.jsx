import React, { useState } from 'react';
import { 
  Mail, 
  ArrowRight, 
  Brain,
  ShieldCheck,
  Lock,
  Loader,
  Building2,
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import '../styles/SignUp.css';

const SignUp = () => {
  const [step, setStep] = useState('email'); // 'email', 'name', 'otp'
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email || !emailRegex.test(email)) {
      setError('Please enter a valid work email address');
      return;
    }

    // Check for company email (adjust domain as needed)
    if (!email.endsWith('@company.com')) {
      setError('Please use your company email address');
      return;
    }

    setIsLoading(true);
    
    try {
      // Call backend to request OTP
      const response = await authAPI.requestOTP(email);
      console.log('OTP Request Response:', response.data);
      
      setIsLoading(false);
      setStep('name');
    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
      console.error('OTP Request Error:', err);
    }
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (displayName.trim().length >= 2) {
      setStep('otp');
    } else {
      setError('Please enter your name');
    }
  };

  const handleOtpSubmit = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Call backend to verify OTP
      const response = await authAPI.verifyOTP(email, otpCode);
      console.log('OTP Verification Response:', response.data);
      
      // Store token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('displayName', displayName);
      
      setIsLoading(false);
      
      // Navigate to questionnaire
      navigate('/questionnaire');
    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
      console.error('OTP Verification Error:', err);
      
      // Clear OTP inputs on error
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
    
    // Auto-submit when all digits are entered
    if (newOtp.every(digit => digit !== '') && newOtp.length === 6) {
      // Small delay to allow the last digit to render
      setTimeout(() => {
        handleOtpSubmit();
      }, 100);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setIsLoading(true);
    
    try {
      await authAPI.requestOTP(email);
      setIsLoading(false);
      alert('New OTP sent! Check your console for the code.');
    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.message || 'Failed to resend OTP');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'email':
        return (
          <form onSubmit={handleEmailSubmit} className="signup-form">
            <div className="input-group">
              <label className="input-label">Work Email</label>
              <div className="input-wrapper">
                <Mail className="input-icon-left" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="xyz@company.com"
                  className="email-input-v2"
                  disabled={isLoading}
                />
              </div>
              {error && <span className="error-message">{error}</span>}
            </div>

            <button type="submit" className="submit-btn-premium" disabled={isLoading}>
              {isLoading ? (
                <Loader className="spinning" size={18} />
              ) : (
                <>Continue <ArrowRight size={18} /></>
              )}
            </button>

            <div className="trust-footer">
              <div className="trust-item"><ShieldCheck size={14} /> Secure & Encrypted</div>
              <div className="trust-item"><Building2 size={14} /> Privacy First</div>
            </div>
          </form>
        );

      case 'name':
        return (
          <form onSubmit={handleNameSubmit} className="signup-form">
            <div className="input-group">
              <label className="input-label">Display Name</label>
              <div className="input-wrapper">
                <User className="input-icon-left" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Alex"
                  className="email-input-v2"
                  maxLength={50}
                  autoFocus
                />
              </div>
              {error && <span className="error-message">{error}</span>}
            </div>

            <button type="submit" className="submit-btn-premium">
              Continue to Verification <ArrowRight size={18} />
            </button>

            <div className="otp-actions">
              <button 
                type="button" 
                className="text-btn"
                onClick={() => {
                  const nameFromEmail = email.split('@')[0];
                  setDisplayName(nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1));
                }}
              >
                Use name from email
              </button>
            </div>
          </form>
        );

      case 'otp':
        return (
          <form onSubmit={(e) => { e.preventDefault(); handleOtpSubmit(); }} className="signup-form">
            <div className="otp-inputs">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="otp-input-v2"
                  autoFocus={index === 0}
                  disabled={isLoading}
                />
              ))}
            </div>
            
            {error && <span className="error-message">{error}</span>}
            
            <button 
              type="submit" 
              className="submit-btn-premium" 
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader className="spinning" size={18} />
              ) : (
                'Verify & Continue'
              )}
            </button>

            <div className="otp-actions">
              <button 
                type="button" 
                className="text-btn" 
                onClick={() => setStep('email')}
                disabled={isLoading}
              >
                Use different email
              </button>
              <button 
                type="button" 
                className="text-btn"
                onClick={handleResendOTP}
                disabled={isLoading}
              >
                Resend OTP
              </button>
            </div>
            
            <p style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginTop: '10px' }}>
              💡 Check your console for the OTP code
            </p>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <div className="logo-container">
            <div className="logo-icon-wrapper">
              <Brain className="logo-icon" />
            </div>
            <h1 className="logo-text">FlowState</h1>
          </div>
          <p className="signup-tagline">Your personal work rhythm companion</p>
        </div>

        <div className="welcome-section">
          <h2 className="welcome-title">
            {step === 'email' 
              ? 'Welcome to calm productivity' 
              : step === 'name'
              ? 'What should we call you?'
              : 'Verify your identity'}
          </h2>
          <p className="welcome-subtitle">
            {step === 'email' 
              ? "Let's personalize FlowState to match your unique work style" 
              : step === 'name'
              ? "This is how FlowState will address you"
              : `We've sent a 6-digit code to ${email}`}
          </p>
        </div>

        {renderStep()}
      </div>
    </div>
  );
};

export default SignUp;