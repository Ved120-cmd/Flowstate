// dash.jsx
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
  BarChart3,
  Users,
  Plus
} from 'lucide-react';
import '../App.css';
import CardNav from './CardNav';
import { velocityAPI } from '../services/api'; 

// Main Dash Component
const Dash = () => {
  const [energy, setEnergy] = useState(75);
  const [showToast, setShowToast] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nudgeIndex, setNudgeIndex] = useState(0);
  const [showAddTask, setShowAddTask] = useState(false);
  const [flowLock, setFlowLock] = useState(false);
  const [flowLockTimer, setFlowLockTimer] = useState(0);
  const [inMeeting, setInMeeting] = useState(false);
  const [workMode, setWorkMode] = useState('');
  const [mindfulSuggestions, setMindfulSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [suggestionsError, setSuggestionsError] = useState(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [displayName, setDisplayName] = useState('');
  
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
    // Name: signup stores 'displayName'; profile may store user with displayName
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

  // Fetch personalized mindful suggestions from online learning model
  useEffect(() => {
    let cancelled = false;
    setSuggestionsLoading(true);
    setSuggestionsError(null);
    velocityAPI
      .getPersonalized()
      .then((res) => {
        if (cancelled) return;
        const data = res.data;
        setMindfulSuggestions(Array.isArray(data?.suggestions) ? data.suggestions : []);
      })
      .catch((err) => {
        if (cancelled) return;
        setSuggestionsError(err.response?.data?.error || err.message || 'Could not load suggestions');
        setMindfulSuggestions([]);
      })
      .finally(() => {
        if (!cancelled) setSuggestionsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Refetch suggestions every 2 minutes so they stay relevant
  useEffect(() => {
    const interval = setInterval(() => {
      velocityAPI.getPersonalized().then((res) => {
        const data = res.data;
        setMindfulSuggestions(Array.isArray(data?.suggestions) ? data.suggestions : []);
      }).catch(() => {});
    }, 120000);
    return () => clearInterval(interval);
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

  const handleAcceptSuggestion = () => {
    setShowToast(false);
    setEnergy(prev => Math.min(prev + 5, 100));
  };

  const handleDismiss = () => {
    setShowToast(false);
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

  // Task Management Functions
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

  const handleStartTask = (taskId) => {
    if (inMeeting) {
      return;
    }
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        if (task.status === 'Todo') {
          return { ...task, status: 'In Progress', startTime: new Date(), isPaused: false };
        }
      }
      return task;
    }));
  };

  const handlePauseTask = (taskId) => {
    if (inMeeting) {
      return;
    }
    setTasks(tasks.map(task => {
      if (task.id === taskId && task.status === 'In Progress') {
        return { ...task, isPaused: !task.isPaused };
      }
      return task;
    }));
  };

  const handleCompleteTask = (taskId) => {
    if (inMeeting) {
      return;
    }
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, status: 'Completed' };
      }
      return task;
    }));
    setEnergy(prev => Math.min(prev + 3, 100));
  };

  const handleDeleteTask = (taskId) => {
    if (inMeeting) {
      return;
    }
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const toggleFlowLock = () => {
    if (inMeeting) {
      return;
    }
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

  return (
    <div className={`app-container ${flowLock ? 'flow-lock-active' : ''} ${inMeeting ? 'in-meeting-mode' : ''}`}>
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

      {/* TOAST NOTIFICATION */}
      {showToast && !flowLock && !inMeeting && (
        <div className="toast-notification">
          <div className="toast-content">
            <div className="toast-icon-wrapper">
              <div className="toast-icon-pulse"></div>
              <Brain className="toast-icon" />
            </div>
            <div className="toast-text">
              <div className="toast-label">
                <Sparkles className="sparkle-icon" />
                Gentle Reminder
              </div>
              <div className="toast-message">
                Consider switching to <span className="highlight">"Update Documentation"</span> to maintain calm focus.
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
            
            {/* CARD NAV MENU - Now as a separate component */}
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
          </div>
        </header>
      )}

      {/* MAIN DASHBOARD LAYOUT */}
      {!flowLock && !inMeeting && (
        <div className="dashboard-layout">
          
          {/* ENERGY CARD */}
          <div className="bento-card energy-card">
            <div className="card-header">
              <div className="header-icon-wrapper">
                <Zap className="header-icon energy-icon" />
              </div>
              <div className="header-text">
                <h3>Energy Flow</h3>
                <span className="header-badge">Balanced</span>
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
                  <div className="energy-label">Calm Energy</div>
                </div>
              </div>

              <div className="energy-stats">
                <div className="energy-stat-item">
                  <div className="stat-dot green"></div>
                  <div className="stat-info">
                    <span className="stat-title">Peak Focus</span>
                    <span className="stat-value">10 AM - 12 PM</span>
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
                    <span className="stat-title">Trend</span>
                    <span className="stat-value">Stable ↑</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SUGGESTIONS CARD - Personalized by online learning model */}
          <div className="bento-card suggestions-card">
            <div className="card-header">
              <div className="header-icon-wrapper">
                <Brain className="header-icon ai-icon" />
              </div>
              <div className="header-text">
                <h3>Mindful Suggestions</h3>
                <span className="header-badge">Personalized</span>
              </div>
            </div>
            <div className="suggestions-list">
              {suggestionsLoading ? (
                <div className="suggestion-loading">Loading suggestions…</div>
              ) : suggestionsError ? (
                <div className="suggestion-error">{suggestionsError}</div>
              ) : mindfulSuggestions.length === 0 ? (
                <div className="suggestion-item green">
                  <div className="suggestion-icon-wrapper">
                    <Feather className="suggestion-icon" />
                  </div>
                  <div className="suggestion-content">
                    <div className="suggestion-title">You're in good flow</div>
                    <div className="suggestion-desc">No specific nudge right now. Keep going mindfully.</div>
                  </div>
                  <div className="suggestion-action">→</div>
                </div>
              ) : (
                mindfulSuggestions.map((s, i) => {
                  const isBreak = s.type === 'TAKE_BREAK';
                  const isPeak = s.type === 'PEAK_HOUR';
                  const isLowEnergy = s.type === 'LOW_ENERGY_HOUR';
                  const Icon = isBreak ? Wind : isPeak ? Zap : Feather;
                  const colorClass = isPeak ? 'green' : 'yellow';
                  const title = isBreak ? 'Take a break' : isPeak ? 'Peak hour' : isLowEnergy ? 'Low energy hour' : s.type || 'Suggestion';
                  return (
                    <div
                      key={i}
                      className={`suggestion-item ${colorClass}`}
                      onClick={() => setSelectedSuggestion(selectedSuggestion?.message === s.message ? null : s)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && setSelectedSuggestion(selectedSuggestion?.message === s.message ? null : s)}
                    >
                      <div className="suggestion-icon-wrapper">
                        <Icon className="suggestion-icon" />
                      </div>
                      <div className="suggestion-content">
                        <div className="suggestion-title">{title}</div>
                        <div className="suggestion-desc">{s.message}</div>
                        {selectedSuggestion?.message === s.message && (
                          <div className="suggestion-reason">Why: based on your personal baseline (explanation coming soon)</div>
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
          </div>
        </div>
      )}
    </div>
  );
};

export default Dash;