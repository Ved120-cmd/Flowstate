import React, { useState } from 'react';
import { 
  ArrowRight, 
  ArrowLeft, 
  Home, 
  Building,
  RefreshCw,
  Target,
  Brain,
  CheckCircle,
  Loader,
  TrendingUp,
  Bell,
  Moon,
  Sun,
  Cloud,
  ShieldCheck,
  Lock,
  Clock,
  Shield,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/Questionnaire.css';

const Questionnaire = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    workMode: [],
    workHours: { start: '09:00', end: '17:00' },
    hoursType: 'flexible',
    taskTypes: [],
    workIntensity: '',
    nudgeFrequency: 'balanced',
    workDayGoal: 'balanced'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();

  const questions = [
    {
      id: 'workMode',
      title: "Where do you usually work?",
      desc: "Help us understand your work environment",
      options: [
        { id: 'wfh', name: "Work From Home", icon: <Home size={16} /> },
        { id: 'wfo', name: "Work From Office", icon: <Building size={16} /> },
        { id: 'hybrid', name: "Hybrid", icon: <RefreshCw size={16} /> }
      ],
      multi: true,
      min: 1
    },
    {
      id: 'workHours',
      title: "What's your work schedule?",
      desc: "Define your typical working hours",
      type: 'time'
    },
    {
      id: 'taskTypes',
      title: "What tasks do you work on?",
      desc: "Select all that apply",
      options: [
        { id: 'routine', name: "Routine tasks", icon: <CheckCircle size={16} /> },
        { id: 'mixed', name: "Mixed workload", icon: <Target size={16} /> },
        { id: 'complex', name: "Deep-focus work", icon: <Brain size={16} /> }
      ],
      multi: true,
      min: 1
    },
    {
      id: 'workIntensity',
      title: "How do you prefer to work?",
      desc: "Choose your work style",
      options: [
        { id: 'deep', name: "Deep focus sessions", icon: <Moon size={16} /> },
        { id: 'switching', name: "Task switching", icon: <RefreshCw size={16} /> },
        { id: 'balanced', name: "Balanced approach", icon: <Cloud size={16} /> }
      ],
      multi: false
    },
    {
      id: 'nudgeFrequency',
      title: "How often should we guide you?",
      desc: "Set your preference for interventions",
      options: [
        { id: 'minimal', name: "Minimal", icon: <Shield size={16} /> },
        { id: 'balanced', name: "Balanced", icon: <Bell size={16} /> },
        { id: 'active', name: "Active", icon: <TrendingUp size={16} /> }
      ],
      multi: false
    },
    {
      id: 'workDayGoal',
      title: "What's your ideal workday?",
      desc: "Define your productivity goal",
      options: [
        { id: 'calm', name: "Calm & steady", icon: <Sun size={16} /> },
        { id: 'output', name: "High output", icon: <Zap size={16} /> },
        { id: 'balanced', name: "Balanced", icon: <CheckCircle size={16} /> }
      ],
      multi: false
    }
  ];

  const handleSelect = (questionId, optionId, isMulti = false) => {
    setAnswers(prev => {
      if (isMulti) {
        const current = prev[questionId] || [];
        const newSelection = current.includes(optionId)
          ? current.filter(id => id !== optionId)
          : [...current, optionId];
        return { ...prev, [questionId]: newSelection };
      } else {
        return { ...prev, [questionId]: optionId };
      }
    });
  };

  const handleTimeChange = (field, value) => {
    setAnswers(prev => ({
      ...prev,
      workHours: { ...prev.workHours, [field]: value }
    }));
  };

  const isStepValid = () => {
    const question = questions[currentStep];
    
    if (question.multi) {
      return answers[question.id]?.length >= (question.min || 1);
    } else if (question.type === 'time') {
      return answers.workHours.start && answers.workHours.end && answers.hoursType;
    } else {
      return !!answers[question.id];
    }
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    localStorage.setItem('flowstate_preferences', JSON.stringify(answers));
    
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  };

  const renderQuestion = () => {
    const question = questions[currentStep];
    
    if (question.type === 'time') {
      return (
        <div className="q-content">
          <div className="q-time-row">
            <div className="q-time-group">
              <label className="input-label">Start Time</label>
              <select 
                className="q-time-select"
                value={answers.workHours.start}
                onChange={(e) => handleTimeChange('start', e.target.value)}
              >
                {Array.from({ length: 24 }, (_, i) => {
                  const hour = i.toString().padStart(2, '0');
                  return [`${hour}:00`, `${hour}:30`];
                }).flat().map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
            
            <div className="q-time-group">
              <label className="input-label">End Time</label>
              <select 
                className="q-time-select"
                value={answers.workHours.end}
                onChange={(e) => handleTimeChange('end', e.target.value)}
              >
                {Array.from({ length: 24 }, (_, i) => {
                  const hour = i.toString().padStart(2, '0');
                  return [`${hour}:00`, `${hour}:30`];
                }).flat().map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="q-options-grid">
            {[
              { id: 'fixed', name: "Fixed hours" },
              { id: 'flexible', name: "Flexible hours" }
            ].map(option => (
              <div
                key={option.id}
                className={`q-option-card ${answers.hoursType === option.id ? 'selected' : ''}`}
                onClick={() => handleSelect('hoursType', option.id, false)}
              >
                <Clock size={16} />
                <span>{option.name}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="q-content">
        <div className="q-options-grid">
          {question.options.map(option => (
            <div
              key={option.id}
              className={`q-option-card ${
                question.multi 
                  ? answers[question.id]?.includes(option.id) ? 'selected' : ''
                  : answers[question.id] === option.id ? 'selected' : ''
              }`}
              onClick={() => handleSelect(question.id, option.id, question.multi)}
            >
              {option.icon}
              <span>{option.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isSubmitting) {
    return (
      <div className="signup-container">
        <div className="signup-card">
          <div className="loading-state">
            <Loader className="spinning" size={32} />
            <p>Setting up your workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="signup-container">
      <div className="signup-card">
        {/* Header */}
        <div className="signup-header">
          <div className="logo-container">
            <div className="logo-icon-wrapper">
              <Brain className="logo-icon" />
            </div>
            <h1 className="logo-text">FlowState</h1>
          </div>
          <p className="signup-tagline">Personalizing your work rhythm</p>
        </div>

        {/* Progress */}
        <div className="progress-section">
          <div className="progress-dots">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`progress-dot ${
                  currentStep === index 
                    ? 'active' 
                    : currentStep > index 
                      ? 'completed' 
                      : ''
                }`}
              />
            ))}
          </div>
          <div className="progress-label">
            Question {currentStep + 1} of {questions.length}
          </div>
        </div>

        {/* Question */}
        <div className="welcome-section">
          <h2 className="welcome-title">{questions[currentStep].title}</h2>
          <p className="welcome-subtitle">{questions[currentStep].desc}</p>
        </div>

        {/* Options */}
        <form className="signup-form" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
          {renderQuestion()}

          {/* Navigation */}
          <div className="q-navigation">
            {currentStep > 0 && (
              <button 
                type="button"
                className="text-btn" 
                onClick={handlePrev}
              >
                <ArrowLeft size={16} /> Back
              </button>
            )}
            
            <div style={{ flex: 1 }} />
            
            <button 
              type="submit"
              className="submit-btn-premium"
              disabled={!isStepValid()}
            >
              {currentStep === questions.length - 1 ? (
                <>Complete <CheckCircle size={16} /></>
              ) : (
                <>Next <ArrowRight size={16} /></>
              )}
            </button>
          </div>

          {/* Trust Footer */}
          <div className="trust-footer">
            <div className="trust-item">
              <ShieldCheck size={12} /> Secure & Private
            </div>
            <div className="trust-item">
              <Clock size={12} /> 2 min setup
            </div>
          </div>
        </form>
      </div>
      
      <div className="compliance-tag">
        <Lock size={0} /> 
      </div>
    </div>
  );
};

export default Questionnaire;