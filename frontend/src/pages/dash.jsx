// dash.jsx - Integrated with ML Model (Updates every 10 seconds)
import React, { useState, useEffect } from 'react'; 
import { 
  AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  Brain, 
  AlertCircle, 
  CheckCircle2, 
  Zap, 
  Layout, 
  Sparkles,
  X,
  Sun,
  Coffee,
  Moon,
  Clock,
  Heart,
  Leaf,
  BrainCircuit,
  Wind,
  Feather,
  Play,
  Pause,
  Check,
  Trash2,
  Lock,
  Target,
  Shield,
  Users,
  Plus,
  Activity
} from 'lucide-react';
import '../App.css';
import CardNav from './CardNav';
import { useMLVelocity } from '../hooks/useMLVelocity';

// Main Dash Component with ML Integration
const Dash = () => {
  // ML Velocity Hook - Polls model every 10 seconds
  const {
    velocity: mlVelocity,
    suggestions: mlSuggestions,
    modelState,
    loading: mlLoading,
    error: mlError,
    isPolling,
    recordTaskStart,
    recordTaskComplete,
    recordTaskPause,
    recordFeedback
  } = useMLVelocity({
    pollingInterval: 10000, // 10 seconds
    autoStart: true,
    onSuggestion: (suggestions) => {
      console.log('📬 New ML suggestions:', suggestions);
      // Show toast for high-priority suggestions
      if (suggestions.some(s => s.priority === 'high')) {
        setShowToast(true);
      }
    },
    onVelocityChange: (newVel, oldVel) => {
      console.log(`📊 Velocity updated: ${oldVel?.toFixed(1)} → ${newVel.toFixed(1)}`);
    }
  });

  // State
  const [energy, setEnergy] = useState(75);
  const [showToast, setShowToast] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nudgeIndex, setNudgeIndex] = useState(0);
  const [showAddTask, setShowAddTask] = useState(false);
  const [flowLock, setFlowLock] = useState(false);
  const [flowLockTimer, setFlowLockTimer] = useState(0);
  const [inMeeting, setInMeeting] = useState(false);
  const [workMode, setWorkMode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [dismissedSuggestions, setDismissedSuggestions] = useState(new Set());
  const [lastDismissTime, setLastDismissTime] = useState(null);
  
  const [newTask, setNewTask] = useState({
    title: '',
    complexity: 'Medium',
    duration: ''
  });
  
  const nudges = [
    "Breathe deeply. This moment is yours to cherish.",
    "Notice the space between tasks - that's where peace grows.",
    "Your worth isn't measured by productivity. You are enough.",
    "Let your shoulders drop. Release what you don't need to carry.",
    "Drink some water. Nourish your body as you nourish your mind.",
    "Look away from the screen. Find something natural to rest your eyes on.",
    "Your pace is perfect. There's no need to rush."
  ];

  const [tasks, setTasks] = useState([
    { 
      id: 1, 
      title: "Refactor API Logic", 
      complexity: "High", 
      status: "In Progress", 
      duration: "2h",
      startTime: new Date(Date.now() - 3600000),
      isPaused: false
    },
    { 
      id: 2, 
      title: "Update Documentation", 
      complexity: "Low", 
      status: "Todo", 
      duration: "45m",
      startTime: null,
      isPaused: false
    },
    { 
      id: 3, 
      title: "Database Migration", 
      complexity: "High", 
      status: "Todo", 
      duration: "3h",
      startTime: null,
      isPaused: false
    },
    { 
      id: 4, 
      title: "Weekly Sync", 
      complexity: "Medium", 
      status: "Todo", 
      duration: "1h",
      startTime: null,
      isPaused: false
    },
  ]);

  const focusData = [
    { time: '9am', focus: 40 },
    { time: '11am', focus: 90 },
    { time: '1pm', focus: 30 },
    { time: '3pm', focus: 65 },
    { time: '5pm', focus: 20 },
  ];

  // Sync energy with ML velocity
  useEffect(() => {
    if (mlVelocity !== null && !isNaN(mlVelocity)) {
      setEnergy(Math.round(Math.min(100, Math.max(0, mlVelocity))));
    }
  }, [mlVelocity]);

  // Load user preferences and display name on component mount
  useEffect(() => {
    const preferences = localStorage.getItem('flowstate_preferences');
    if (preferences) {
      const parsed = JSON.parse(preferences);
      if (parsed.workMode && (parsed.workMode.includes('wfo') || parsed.workMode.includes('hybrid'))) {
        setWorkMode('office');
      } else {
        setWorkMode('remote');
      }
    }
    const fromStorage = localStorage.getItem('displayName');
    if (fromStorage?.trim()) {
      setDisplayName(fromStorage.trim());
      return;
    }
    try {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        if (user?.displayName?.trim()) setDisplayName(user.displayName.trim());
      }
    } catch (_) {}
  }, []);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Rotate nudges every 20 seconds
  useEffect(() => {
    const nudgeTimer = setInterval(() => {
      setNudgeIndex((prev) => (prev + 1) % nudges.length);
    }, 20000);
    return () => clearInterval(nudgeTimer);
  }, [nudges.length]);

  // Flow Lock Timer
  useEffect(() => {
    let interval;
    if (flowLock && !inMeeting) {
      interval = setInterval(() => {
        setFlowLockTimer(prev => prev + 1);
      }, 1000);
    } else {
      setFlowLockTimer(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [flowLock, inMeeting]);

  const handleAcceptSuggestion = async () => {
    setShowToast(false);
    setLastDismissTime(Date.now());
    
    if (mlSuggestions?.length > 0) {
      setDismissedSuggestions(prev => new Set([...prev, mlSuggestions[0].type]));
      await recordFeedback(mlSuggestions[0].type, true);
      
      // Clear after 5 minutes
      setTimeout(() => {
        setDismissedSuggestions(prev => {
          const newSet = new Set(prev);
          newSet.delete(mlSuggestions[0].type);
          return newSet;
        });
      }, 5 * 60 * 1000);
    }
    
    setEnergy(prev => Math.min(prev + 5, 100));
  };

  const handleDismiss = async () => {
    setShowToast(false);
    // Record rejection to ML model
    if (mlSuggestions && mlSuggestions.length > 0) {
      await recordFeedback(mlSuggestions[0].type, false);
    }
  };

  const getTimeOfDay = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return { icon: Sun, text: 'Morning', color: '#88c9a1' };
    if (hour < 17) return { icon: Coffee, text: 'Afternoon', color: '#b3a396' };
    return { icon: Moon, text: 'Evening', color: '#7fa8c9' };
  };

  // Toggle meeting mode
  const toggleMeetingMode = () => {
    if (workMode === 'office' || workMode === 'hybrid') {
      setInMeeting(!inMeeting);
      if (!inMeeting) {
        if (flowLock) {
          setFlowLock(false);
        }
        setShowToast(false);
      }
    }
  };

  // Task Management Functions with ML Integration
  const handleAddTask = () => {
    if (newTask.title.trim() && newTask.duration.trim()) {
      const task = {
        id: Date.now(),
        title: newTask.title,
        complexity: newTask.complexity,
        duration: newTask.duration,
        status: 'Todo',
        startTime: null,
        isPaused: false
      };
      setTasks([...tasks, task]);
      setNewTask({ title: '', complexity: 'Medium', duration: '' });
      setShowAddTask(false);
    }
  };

  const handleStartTask = async (taskId) => {
    if (inMeeting) return;
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    setTasks(tasks.map(t => {
      if (t.id === taskId && t.status === 'Todo') {
        return { ...t, status: 'In Progress', startTime: new Date(), isPaused: false };
      }
      return t;
    }));

    // Record task start in ML model
    await recordTaskStart(taskId, task.complexity.toLowerCase());
  };

  const handlePauseTask = async (taskId) => {
    if (inMeeting) return;
    
    setTasks(tasks.map(task => {
      if (task.id === taskId && task.status === 'In Progress') {
        return { ...task, isPaused: !task.isPaused };
      }
      return task;
    }));

    // Record pause in ML model
    await recordTaskPause(taskId);
  };

  const handleCompleteTask = async (taskId) => {
    if (inMeeting) return;
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, status: 'Completed' };
      }
      return t;
    }));

    // Record task completion in ML model (this trains the model!)
    await recordTaskComplete(taskId, task.complexity.toLowerCase());
    
    setEnergy(prev => Math.min(prev + 3, 100));
  };

  const handleDeleteTask = (taskId) => {
    if (inMeeting) return;
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const toggleFlowLock = () => {
    if (inMeeting) return;
    setFlowLock(!flowLock);
    if (!flowLock) {
      setShowToast(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const timeOfDay = getTimeOfDay();
  const TimeIcon = timeOfDay.icon;

  const activeTasks = tasks.filter(t => t.status !== 'Completed');
  const completedTasks = tasks.filter(t => t.status === 'Completed');
  const currentTask = tasks.find(t => t.status === 'In Progress');

  const showMeetingButton = workMode === 'office' || workMode === 'hybrid';

  // Use ML suggestions if available
  const displaySuggestions = mlSuggestions && mlSuggestions.length > 0 ? mlSuggestions : [];

  return (
    <div className={`app-container ${flowLock ? 'flow-lock-active' : ''} ${inMeeting ? 'in-meeting-mode' : ''}`}>
      {/* ML MODEL STATUS INDICATOR (Dev Mode Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          background: modelState.isInitialized ? '#88c9a1' : '#e6b89c',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '11px',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Activity size={14} className={isPolling ? 'pulse' : ''} />
          <div>
            <div style={{ fontWeight: 600 }}>
              ML: {modelState.isInitialized ? 'Active' : 'Learning'}
            </div>
            <div style={{ fontSize: '9px', opacity: 0.8 }}>
              {modelState.dataPointsCollected}/50 • Vel: {mlVelocity?.toFixed(0) || '—'}
            </div>
          </div>
        </div>
      )}

      {/* MEETING MODE INDICATOR */}
      {inMeeting && !flowLock && (
        <div className="meeting-indicator">
          <div className="meeting-icon-wrapper">
            <Users className="meeting-icon" />
          </div>
          <div className="meeting-content">
            <div className="meeting-message">In Meeting Mode</div>
            <div className="meeting-subtitle">Tracking paused</div>
          </div>
          <button className="meeting-exit-btn" onClick={toggleMeetingMode}>
            End Meeting
          </button>
        </div>
      )}

      {/* TOAST NOTIFICATION - Now using ML suggestions */}
      {showToast && !flowLock && !inMeeting && displaySuggestions.length > 0 && (
        <div className="toast-notification">
          <div className="toast-content">
            <div className="toast-icon-wrapper">
              <div className="toast-icon-pulse"></div>
              <Brain className="toast-icon" />
            </div>
            <div className="toast-text">
              <div className="toast-label">
                <Sparkles className="sparkle-icon" />
                {displaySuggestions[0].type === 'TAKE_BREAK' ? 'Break Suggestion' : 
                 displaySuggestions[0].type === 'PEAK_HOUR' ? 'Peak Hour Alert' : 
                 'Mindful Nudge'}
              </div>
              <div className="toast-message">
                {displaySuggestions[0].message}
              </div>
            </div>
            <div className="toast-actions">
              <button className="toast-btn accept" onClick={handleAcceptSuggestion}>
                <CheckCircle2 className="btn-icon" />
                Accept
              </button>
              <button className="toast-btn dismiss" onClick={handleDismiss}>
                <X className="btn-icon" />
              </button>
            </div>
            <div className="toast-progress"></div>
          </div>
        </div>
      )}

      {/* FLOW LOCK OVERLAY */}
      {flowLock && !inMeeting && (
        <div className="flow-lock-overlay">
          <div className="flow-lock-center">
            <div className="flow-lock-icon-large">
              <Lock size={48} />
            </div>
            <div className="flow-lock-title-large">Flow State Active</div>
            <div className="flow-lock-subtitle-large">Working in quiet focus</div>
            <div className="flow-lock-timer-large">
              {formatTime(flowLockTimer)}
            </div>
            <div className="flow-lock-task">
              {currentTask ? currentTask.title : "No active task selected"}
            </div>
            {mlVelocity !== null && (
              <div className="flow-lock-velocity" style={{ 
                marginTop: '12px', 
                fontSize: '14px', 
                opacity: 0.8 
              }}>
                Current Velocity: {Math.round(mlVelocity)}%
              </div>
            )}
            <div className="flow-lock-affirmation">
              "Calm focus yields the best results"
            </div>
            <button 
              className="flow-lock-exit-btn"
              onClick={toggleFlowLock}
            >
              Exit Flow State
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      {!flowLock && !inMeeting && (
        <header className="dashboard-header">
          <div className="header-greeting">
            <div className="greeting-content">
              <h1 className="header-title">Welcome back, {displayName || 'there'}</h1>
              <div className="header-nudge">
                <Heart className="nudge-icon" style={{ width: '16px', height: '16px', color: '#88c9a1' }} />
                {nudges[nudgeIndex]}
              </div>
            </div>
            
            <div className="card-nav-position-wrapper">
              <CardNav />
            </div>
          </div>
          
          <div className="header-meta">
            <TimeIcon style={{ width: '16px', height: '16px', color: timeOfDay.color }} />
            <span>Good {timeOfDay.text}</span>
            <span className="divider">•</span>
            <Clock style={{ width: '16px', height: '16px', color: '#b3a396' }} />
            <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span className="divider">•</span>
            <Leaf style={{ width: '16px', height: '16px', color: '#88c9a1' }} />
            <span>Mindful Mode</span>
            {workMode && (
              <>
                <span className="divider">•</span>
                <span className="work-mode-badge">
                  {workMode === 'office' ? '🏢 Office' : workMode === 'hybrid' ? '🔄 Hybrid' : '🏠 Remote'}
                </span>
              </>
            )}
            {modelState.isInitialized && (
              <>
                <span className="divider">•</span>
                <Brain style={{ width: '16px', height: '16px', color: '#7fa8c9' }} />
                <span>ML Active</span>
              </>
            )}
          </div>
        </header>
      )}

      {/* MAIN DASHBOARD LAYOUT */}
      {!flowLock && !inMeeting && (
        <div className="dashboard-layout">
          
          {/* ENERGY CARD - Now ML-Powered */}
          <div className="bento-card energy-card">
            <div className="card-header">
              <div className="header-icon-wrapper">
                <Zap className="header-icon energy-icon" />
              </div>
              <div className="header-text">
                <h3>Energy Flow</h3>
                <span className="header-badge">
                  {mlLoading ? 'Syncing...' : modelState.isInitialized ? 'ML-Powered' : 'Baseline'}
                </span>
              </div>
            </div>
            
            <div className="energy-main">
              <div className="energy-circle-compact">
                <svg className="energy-svg" viewBox="0 0 140 140">
                  <defs>
                    <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#88c9a1" />
                      <stop offset="100%" stopColor="#a8d4b5" />
                    </linearGradient>
                  </defs>
                  <circle 
                    className="circle-bg"
                    cx="70" cy="70" r="60"
                  />
                  <circle 
                    className="circle-fill"
                    cx="70" cy="70" r="60"
                    strokeDasharray={`${energy * 3.77}, 376.99`}
                  />
                </svg>
                <div className="energy-center">
                  <div className="energy-percent">{energy}%</div>
                  <div className="energy-label">
                    {mlLoading ? 'Loading...' : 'Velocity'}
                  </div>
                </div>
              </div>

              <div className="energy-stats">
                <div className="energy-stat-item">
                  <div className="stat-dot green"></div>
                  <div className="stat-info">
                    <span className="stat-title">Peak Hours</span>
                    <span className="stat-value">
                      {modelState.peakHours && modelState.peakHours.length > 0
                        ? `${modelState.peakHours[0]}-${modelState.peakHours[modelState.peakHours.length - 1]}`
                        : '10-12 AM'}
                    </span>
                  </div>
                </div>
                <div className="energy-stat-item">
                  <div className="stat-dot yellow"></div>
                  <div className="stat-info">
                    <span className="stat-title">Current</span>
                    <span className="stat-value">Steady Flow</span>
                  </div>
                </div>
                <div className="energy-stat-item">
                  <div className="stat-dot blue"></div>
                  <div className="stat-info">
                    <span className="stat-title">Baseline</span>
                    <span className="stat-value">
                      {modelState.baselineVelocity 
                        ? `${Math.round(modelState.baselineVelocity)}%`
                        : 'Learning...'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SUGGESTIONS CARD - Personalized by ML model */}
          <div className="bento-card suggestions-card">
            <div className="card-header">
              <div className="header-icon-wrapper">
                <Brain className="header-icon ai-icon" />
              </div>
              <div className="header-text">
                <h3>Mindful Suggestions</h3>
                <span className="header-badge">
                  {modelState.isInitialized ? 'Personalized' : `Learning (${modelState.dataPointsCollected}/50)`}
                </span>
              </div>
            </div>
            <div className="suggestions-list">
              {mlLoading && displaySuggestions.length === 0 ? (
                <div className="suggestion-loading">Loading suggestions…</div>
              ) : mlError ? (
                <div className="suggestion-error">{mlError}</div>
              ) : displaySuggestions.length === 0 ? (
                <div className="suggestion-item green">
                  <div className="suggestion-icon-wrapper">
                    <Feather className="suggestion-icon" />
                  </div>
                  <div className="suggestion-content">
                    <div className="suggestion-title">You're in good flow</div>
                    <div className="suggestion-desc">
                      {modelState.isInitialized 
                        ? 'No specific nudge right now. Keep going mindfully.'
                        : `Model is learning your patterns (${modelState.dataPointsCollected}/50 tasks)`}
                    </div>
                  </div>
                  <div className="suggestion-action">→</div>
                </div>
              ) : (
                displaySuggestions.map((s, i) => {
                  const isBreak = s.type === 'TAKE_BREAK';
                  const isPeak = s.type === 'PEAK_HOUR';
                  const isLowEnergy = s.type === 'LOW_ENERGY_HOUR';
                  const Icon = isBreak ? Wind : isPeak ? Zap : Feather;
                  const colorClass = isPeak ? 'green' : isBreak ? 'yellow' : 'blue';
                  const title = isBreak ? 'Take a break' : isPeak ? 'Peak hour' : isLowEnergy ? 'Low energy hour' : s.type || 'Suggestion';
                  
                  return (
                    <div
                      key={i}
                      className={`suggestion-item ${colorClass}`}
                    >
                      <div className="suggestion-icon-wrapper">
                        <Icon className="suggestion-icon" />
                      </div>
                      <div className="suggestion-content">
                        <div className="suggestion-title">{title}</div>
                        <div className="suggestion-desc">{s.message}</div>
                        {s.duration && (
                          <div className="suggestion-duration" style={{ 
                            fontSize: '12px', 
                            marginTop: '4px', 
                            opacity: 0.7 
                          }}>
                            Suggested: {s.duration} minutes
                          </div>
                        )}
                      </div>
                      <div className="suggestion-action">→</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* CURRENT TASK CARD */}
          <div className="bento-card current-task-card">
            <div className="card-header">
              <div className="header-icon-wrapper">
                <Target className="header-icon" />
              </div>
              <div className="header-text">
                <h3>Current Task</h3>
                <span className="header-badge">{currentTask ? 'Active' : 'Idle'}</span>
              </div>
            </div>

            {!currentTask ? (
              <div className="no-task-state">
                <Layout className="no-task-icon" />
                <div className="no-task-text">No task in progress</div>
              </div>
            ) : (
              <div className="task-active-state">
                <div className="task-main-info">
                  <div className="task-name">{currentTask.title}</div>
                  <div className="task-meta-row">
                    <span className={`complexity-badge ${currentTask.complexity.toLowerCase()}`}>
                      {currentTask.complexity}
                    </span>
                    <span className="task-duration">
                      <Clock className="duration-icon" />
                      {currentTask.duration}
                    </span>
                  </div>
                </div>
                
                <div className="status-indicator">
                  <div className="status-dot"></div>
                  {currentTask.isPaused ? 'Paused' : 'In Progress'}
                </div>

                <div className="task-actions-row">
                  <button 
                    className="task-btn pause" 
                    onClick={() => handlePauseTask(currentTask.id)}
                  >
                    {currentTask.isPaused ? <Play size={14} /> : <Pause size={14} />}
                    {currentTask.isPaused ? 'Resume' : 'Pause'}
                  </button>
                  <button 
                    className="task-btn complete"
                    onClick={() => handleCompleteTask(currentTask.id)}
                  >
                    <Check size={14} />
                    Complete
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ANALYTICS CARD - FOCUS RHYTHM */}
          <div className="bento-card analytics-card">
            <div className="card-header">
              <div className="header-icon-wrapper">
                <BrainCircuit className="header-icon focus-icon" />
              </div>
              <div className="header-text">
                <h3>Focus Rhythm</h3>
                <span className="header-badge">Today</span>
              </div>
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={focusData}>
                  <defs>
                    <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7fa8c9" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#7fa8c9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(140, 152, 164, 0.1)" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    stroke="#a8b6bf" 
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#a8b6bf" 
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '10px', 
                      border: '1px solid #e8e4dd',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 8px 20px rgba(140, 152, 164, 0.1)',
                      fontSize: '12px'
                    }}
                    labelStyle={{ color: '#3c3c3c', fontWeight: 500 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="focus" 
                    stroke="#7fa8c9" 
                    fill="url(#colorFocus)" 
                    strokeWidth={2} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="burnout-warning">
              <AlertCircle className="warning-icon" />
              <span>Gentle dip expected around 2pm - consider a mindful break</span>
            </div>
          </div>

          {/* TASKS CARD */}
          <div className="bento-card tasks-card">
            <div className="card-header">
              <div className="header-icon-wrapper">
                <Layout className="header-icon task-icon" />
              </div>
              <div className="header-text">
                <h3>Task Flow</h3>
                <span className="header-badge">{activeTasks.length} active</span>
              </div>
              <div className="header-actions">
                {showMeetingButton && (
                  <button 
                    className={`meeting-mode-btn ${inMeeting ? 'active' : ''}`}
                    onClick={toggleMeetingMode}
                  >
                    <Users size={14} />
                    <span>{inMeeting ? 'In Meeting' : 'Start Meeting'}</span>
                  </button>
                )}
                <button 
                  className={`flow-lock-btn ${flowLock ? 'active' : ''}`}
                  onClick={toggleFlowLock}
                  disabled={inMeeting}
                >
                  <Lock size={14} />
                  <span>Flow Lock</span>
                </button>
                <button 
                  className="add-task-btn" 
                  onClick={() => setShowAddTask(!showAddTask)}
                  disabled={inMeeting}  
                >
                  <Plus className="plus-icon" />
                  Add Task
                </button>
              </div>
            </div>

            {/* ADD TASK FORM */}
            {showAddTask && !inMeeting && (
              <div className="add-task-form">
                <input
                  type="text"
                  placeholder="Task name..."
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="task-input"
                />
                <div className="form-row">
                  <select
                    value={newTask.complexity}
                    onChange={(e) => setNewTask({...newTask, complexity: e.target.value})}
                    className="task-select"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Duration (e.g., 2h)"
                    value={newTask.duration}
                    onChange={(e) => setNewTask({...newTask, duration: e.target.value})}
                    className="task-input-small"
                  />
                </div>
                <div className="form-actions">
                  <button className="form-btn save" onClick={handleAddTask}>
                    <Check size={14} />
                    Save Task
                  </button>
                  <button className="form-btn cancel" onClick={() => setShowAddTask(false)}>
                    <X size={14} />
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* MEETING MESSAGE */}
            {inMeeting && (
              <div className="meeting-message-card">
                <Users size={24} />
                <div className="meeting-message-content">
                  <h4>Meeting Mode Active</h4>
                  <p>Task tracking and energy monitoring are paused. Focus on your meeting.</p>
                </div>
              </div>
            )}

            {/* ACTIVE TASKS */}
            {!inMeeting && (
              <div className="tasks-list">
                {activeTasks.map(task => (
                  <div key={task.id} className={`task-item ${task.status === 'In Progress' ? 'active' : ''}`}>
                    <div className="task-left">
                      <div className="task-checkbox" onClick={() => handleCompleteTask(task.id)}>
                        {task.status === 'Completed' && <Check className="check-icon" size={14} />}
                      </div>
                      <div className="task-info">
                        <div className="task-title">{task.title}</div>
                        <div className="task-meta">
                          <span className={`complexity-badge ${task.complexity.toLowerCase()}`}>
                            {task.complexity}
                          </span>
                          <span className="task-duration">
                            <Clock className="duration-icon" />
                            {task.duration}
                          </span>
                          {task.status === 'In Progress' && task.isPaused && (
                            <span className="status-badge paused">Paused</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="task-actions">
                      {task.status === 'Todo' && (
                        <button className="task-action-btn start" onClick={() => handleStartTask(task.id)}>
                          <Play size={14} />
                        </button>
                      )}
                      {task.status === 'In Progress' && (
                        <>
                          <button className="task-action-btn pause" onClick={() => handlePauseTask(task.id)}>
                            {task.isPaused ? <Play size={14} /> : <Pause size={14} />}
                          </button>
                          <button className="task-action-btn complete" onClick={() => handleCompleteTask(task.id)}>
                            <Check size={14} />
                          </button>
                        </>
                      )}
                      <button className="task-action-btn delete" onClick={() => handleDeleteTask(task.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* COMPLETED TASKS */}
            {!inMeeting && completedTasks.length > 0 && (
              <div className="completed-section">
                <div className="completed-header">
                  <span className="completed-title">Completed ({completedTasks.length})</span>
                </div>
                <div className="tasks-list">
                  {completedTasks.map(task => (
                    <div key={task.id} className="task-item completed">
                      <div className="task-left">
                        <div className="task-checkbox checked">
                          <Check className="check-icon" size={14} />
                        </div>
                        <div className="task-info">
                          <div className="task-title">{task.title}</div>
                          <div className="task-meta">
                            <span className={`complexity-badge ${task.complexity.toLowerCase()}`}>
                              {task.complexity}
                            </span>
                            <span className="task-duration">
                              <Clock className="duration-icon" />
                              {task.duration}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button className="task-action-btn delete" onClick={() => handleDeleteTask(task.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MEETING MODE VIEW */}
      {inMeeting && !flowLock && (
        <div className="meeting-overlay">
          <div className="meeting-center">
            <div className="meeting-icon-large">
              <Users size={48} />
            </div>
            <div className="meeting-title-large">Meeting Mode Active</div>
            <div className="meeting-subtitle-large">Tracking paused • Focus on your conversation</div>
            <div className="meeting-timer-large">
              <Clock size={20} />
              Meeting in progress
            </div>
            <div className="meeting-note">
              Your energy levels and task progress are preserved.
              <br />
              No idle time will be counted during this meeting.
            </div>
            <div className="meeting-affirmation">
              "Collaboration fuels innovation"
            </div>
            <button 
              className="meeting-exit-btn-large"
              onClick={toggleMeetingMode}
            >
              End Meeting & Resume Tracking
            </button>
          </div>
        </div>
      )}

      {/* PRIVACY FOOTER */}
      {!flowLock && !inMeeting && (
        <div className="privacy-footer">
          <div className="privacy-content">
            <Shield size={12} />
            <span>Privacy-first • No keystroke tracking • Data stays with you</span>
            {isPolling && (
              <span style={{ marginLeft: '10px', opacity: 0.6 }}>
                • ML updating every 10s
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dash;