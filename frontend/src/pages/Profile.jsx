import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Clock,
  Sliders,
  Activity,
  ShieldCheck,
  Save,
  X,
  Check,
  Pencil,
  Loader
} from "lucide-react";
import { authAPI } from "../services/api";
import "../styles/Profile.css";

export default function Profile() {
  const [profile, setProfile] = useState({
    displayName: "",
    email: "",
    workMode: "",
    startTime: "09:00",
    endTime: "17:00",
    scheduleType: "Flexible",
    taskComplexity: "",
    workIntensity: "",
    workdayGoal: "",
    nudgeSensitivity: "Balanced",
    flowLockEnabled: true,
  });

  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState("");
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch user profile on component mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await authAPI.getProfile();
      const userData = response.data.user;
      
      console.log('Fetched user data:', userData);

      // Map backend data to profile state
      setProfile({
        displayName: userData.displayName || '',
        email: userData.email || '',
        workMode: mapWorkMode(userData.workMode),
        startTime: userData.workHours?.start || '09:00',
        endTime: userData.workHours?.end || '17:00',
        scheduleType: mapScheduleType(userData.scheduleType),
        taskComplexity: mapTaskComplexity(userData.taskComplexity),
        workIntensity: mapWorkIntensity(userData.workIntensity),
        workdayGoal: mapWorkdayGoal(userData.workdayGoal),
        nudgeSensitivity: mapNudgeSensitivity(userData.nudgeSensitivity),
        flowLockEnabled: userData.flowLockEnabled ?? true,
      });

      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
      setIsLoading(false);
    }
  };

  // Mapping functions to convert backend values to display values
  const mapWorkMode = (mode) => {
    if (!mode) return '';
    const modeMap = {
      'wfh': 'Work from Home',
      'wfo': 'Work from Office',
      'hybrid': 'Hybrid'
    };
    
    // Handle comma-separated values
    const modes = mode.split(',').map(m => m.trim());
    return modes.map(m => modeMap[m.toLowerCase()] || m).join(', ');
  };

  const mapScheduleType = (type) => {
    if (!type) return 'Flexible';
    return type === 'fixed' ? 'Fixed' : 'Flexible';
  };

  const mapTaskComplexity = (complexity) => {
    if (!complexity) return '';
    const complexityMap = {
      'routine': 'Mostly routine',
      'mixed': 'Mixed',
      'complex': 'Mostly deep-focus'
    };
    
    const tasks = complexity.split(',').map(t => t.trim());
    return tasks.map(t => complexityMap[t.toLowerCase()] || t).join(', ');
  };

  const mapWorkIntensity = (intensity) => {
    if (!intensity) return '';
    const intensityMap = {
      'deep': 'Deep focus',
      'switching': 'Frequent switching',
      'balanced': 'Balanced'
    };
    return intensityMap[intensity.toLowerCase()] || intensity;
  };

  const mapWorkdayGoal = (goal) => {
    if (!goal) return '';
    const goalMap = {
      'calm': 'Calm & steady',
      'output': 'High-output',
      'balanced': 'Balanced'
    };
    return goalMap[goal.toLowerCase()] || goal;
  };

  const mapNudgeSensitivity = (sensitivity) => {
    if (!sensitivity) return 'Balanced';
    const sensitivityMap = {
      'minimal': 'Minimal',
      'balanced': 'Balanced',
      'active': 'Active guidance'
    };
    return sensitivityMap[sensitivity.toLowerCase()] || sensitivity;
  };

  const startEditing = (field, value) => {
    setEditingField(field);
    setTempValue(value);
  };

  const saveEdit = async (field) => {
    try {
      const updatedProfile = { ...profile, [field]: tempValue };
      
      // Prepare data for backend
      const updateData = {
        displayName: updatedProfile.displayName,
        workMode: updatedProfile.workMode,
        workHours: {
          start: updatedProfile.startTime,
          end: updatedProfile.endTime
        },
        scheduleType: updatedProfile.scheduleType,
        taskComplexity: updatedProfile.taskComplexity,
        workIntensity: updatedProfile.workIntensity,
        workdayGoal: updatedProfile.workdayGoal,
        nudgeSensitivity: updatedProfile.nudgeSensitivity,
        flowLockEnabled: updatedProfile.flowLockEnabled
      };

      await authAPI.updateProfile(updateData);
      
      setProfile(updatedProfile);
      setEditingField(null);
      setTempValue("");
      showSuccessMessage();
    } catch (err) {
      console.error('Error saving edit:', err);
      setError('Failed to save changes');
    }
  };

  const cancelEdit = () => {
    setEditingField(null);
    setTempValue("");
  };

  const showSuccessMessage = () => {
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const handleSaveAll = async () => {
    try {
      const updateData = {
        displayName: profile.displayName,
        workMode: profile.workMode,
        workHours: {
          start: profile.startTime,
          end: profile.endTime
        },
        scheduleType: profile.scheduleType,
        taskComplexity: profile.taskComplexity,
        workIntensity: profile.workIntensity,
        workdayGoal: profile.workdayGoal,
        nudgeSensitivity: profile.nudgeSensitivity,
        flowLockEnabled: profile.flowLockEnabled
      };

      await authAPI.updateProfile(updateData);
      showSuccessMessage();
      console.log("Saved profile:", updateData);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile');
    }
  };

  if (isLoading) {
    return (
      <div className="profile-container">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Loader className="spinning" size={32} />
          <p style={{ marginLeft: '10px' }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Success Toast */}
      {showSaveSuccess && (
        <div className="success-toast">
          <Check size={16} />
          <span>Profile updated successfully!</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-toast" style={{ 
          position: 'fixed', 
          top: '20px', 
          right: '20px', 
          background: '#f44336', 
          color: 'white', 
          padding: '12px 20px', 
          borderRadius: '8px',
          zIndex: 1000
        }}>
          {error}
        </div>
      )}

      {/* Header with Actions */}
      <header className="profile-header">
        <div className="header-content">
          <div>
            <h1>Profile Settings</h1>
            <p>Adjust how FlowState adapts to your work rhythm and preferences.</p>
          </div>
          <button 
            className="primary save-all-btn"
            onClick={handleSaveAll}
          >
            <Save size={16} />
            Save All Changes
          </button>
        </div>
      </header>

      <div className="profile-grid">
        {/* Identity & Context - Left Column */}
        <section className="profile-card identity-card">
          <div className="card-header">
            <div className="card-title">
              <User className="icon" size={20} />
              <h2>Identity & Context</h2>
            </div>
            <div className="card-subtitle">
              Your personal information and work setup
            </div>
          </div>

          <div className="field-group">
            <div className="field">
              <label>
                <User size={14} />
                Display Name
              </label>
              {editingField === 'displayName' ? (
                <div className="edit-field">
                  <input
                    type="text"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    autoFocus
                    className="edit-input"
                  />
                  <div className="edit-actions">
                    <button 
                      className="icon-btn confirm" 
                      onClick={() => saveEdit('displayName')}
                      aria-label="Save name"
                    >
                      <Check size={14} />
                    </button>
                    <button 
                      className="icon-btn cancel" 
                      onClick={cancelEdit}
                      aria-label="Cancel"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="value-with-edit">
                  <span className="field-value">{profile.displayName || 'Not set'}</span>
                  <button 
                    className="icon-btn edit"
                    onClick={() => startEditing('displayName', profile.displayName)}
                    aria-label="Edit name"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
              )}
            </div>

            <div className="field">
              <label>
                <Mail size={14} />
                Work Email
              </label>
              <div className="value-with-edit">
                <span className="field-value">{profile.email}</span>
              </div>
            </div>

            <div className="field">
              <label>Work Mode</label>
              <div className="select-wrapper">
                <select
                  value={profile.workMode}
                  onChange={(e) =>
                    setProfile({ ...profile, workMode: e.target.value })
                  }
                  className="styled-select"
                >
                  <option value="Work from Home">Work from Home</option>
                  <option value="Work from Office">Work from Office</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Work Rhythm - Right Column */}
        <section className="profile-card rhythm-card">
          <div className="card-header">
            <div className="card-title">
              <Clock className="icon" size={20} />
              <h2>Work Rhythm</h2>
            </div>
            <div className="card-subtitle">
              Set your preferred working hours
            </div>
          </div>

          <div className="field-group">
            <div className="time-row">
              <div className="field time-field">
                <label>Start Time</label>
                <div className="time-input-wrapper">
                  <Clock size={16} />
                  <input
                    type="time"
                    value={profile.startTime}
                    onChange={(e) =>
                      setProfile({ ...profile, startTime: e.target.value })
                    }
                    className="time-input"
                  />
                </div>
              </div>

              <div className="field time-field">
                <label>End Time</label>
                <div className="time-input-wrapper">
                  <Clock size={16} />
                  <input
                    type="time"
                    value={profile.endTime}
                    onChange={(e) =>
                      setProfile({ ...profile, endTime: e.target.value })
                    }
                    className="time-input"
                  />
                </div>
              </div>
            </div>

            <div className="field">
              <label>Schedule Type</label>
              <div className="select-wrapper">
                <select
                  value={profile.scheduleType}
                  onChange={(e) =>
                    setProfile({ ...profile, scheduleType: e.target.value })
                  }
                  className="styled-select"
                >
                  <option value="Fixed">Fixed Schedule</option>
                  <option value="Flexible">Flexible Hours</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Task & Energy Preferences - Full Width */}
        <section className="profile-card preferences-card full-width">
          <div className="card-header">
            <div className="card-title">
              <Activity className="icon" size={20} />
              <h2>Task & Energy Preferences</h2>
            </div>
            <div className="card-subtitle">
              How you like to work and feel throughout the day
            </div>
          </div>

          <div className="preferences-grid">
            <div className="field">
              <label>Task Complexity Baseline</label>
              <div className="select-wrapper">
                <select
                  value={profile.taskComplexity}
                  onChange={(e) =>
                    setProfile({ ...profile, taskComplexity: e.target.value })
                  }
                  className="styled-select"
                >
                  <option value="Mostly routine">Mostly routine tasks</option>
                  <option value="Mixed">Mixed complexity</option>
                  <option value="Mostly deep-focus">Mostly deep-focus</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label>Work Intensity Preference</label>
              <div className="select-wrapper">
                <select
                  value={profile.workIntensity}
                  onChange={(e) =>
                    setProfile({ ...profile, workIntensity: e.target.value })
                  }
                  className="styled-select"
                >
                  <option value="Deep focus">Deep focus sessions</option>
                  <option value="Frequent switching">Frequent switching</option>
                  <option value="Balanced">Balanced approach</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label>Emotional Goal for Workday</label>
              <div className="select-wrapper">
                <select
                  value={profile.workdayGoal}
                  onChange={(e) =>
                    setProfile({ ...profile, workdayGoal: e.target.value })
                  }
                  className="styled-select"
                >
                  <option value="Calm & steady">Calm & steady</option>
                  <option value="Balanced">Balanced energy</option>
                  <option value="High-output">High-output drive</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Intervention Controls */}
        <section className="profile-card controls-card">
          <div className="card-header">
            <div className="card-title">
              <Sliders className="icon" size={20} />
              <h2>Intervention Controls</h2>
            </div>
            <div className="card-subtitle">
              Adjust how FlowState interacts with you
            </div>
          </div>

          <div className="field-group">
            <div className="field">
              <label>Nudge Sensitivity</label>
              <div className="select-wrapper">
                <select
                  value={profile.nudgeSensitivity}
                  onChange={(e) =>
                    setProfile({ ...profile, nudgeSensitivity: e.target.value })
                  }
                  className="styled-select"
                >
                  <option value="Minimal">Minimal notifications</option>
                  <option value="Balanced">Balanced guidance</option>
                  <option value="Active guidance">Active guidance</option>
                </select>
              </div>
              <div className="hint">How often FlowState should suggest breaks or task switches</div>
            </div>

            <div className="toggle-field">
              <div className="toggle-label">
                <label>Flow-Lock Mode</label>
                <span className="toggle-description">Block distractions during focus sessions</span>
              </div>
              <div className="toggle-wrapper">
                <input
                  type="checkbox"
                  id="flowLock"
                  checked={profile.flowLockEnabled}
                  onChange={() =>
                    setProfile({
                      ...profile,
                      flowLockEnabled: !profile.flowLockEnabled,
                    })
                  }
                  className="toggle-checkbox"
                />
                <label htmlFor="flowLock" className="toggle-slider"></label>
              </div>
            </div>
          </div>
        </section>

        {/* Transparency */}
        <section className="profile-card transparency-card subtle">
          <div className="card-header">
            <div className="card-title">
              <ShieldCheck className="icon" size={20} />
              <h2>Transparency & Privacy</h2>
            </div>
          </div>
          <div className="transparency-content">
            <ShieldCheck size={48} className="shield-icon" />
            <div>
              <h3>Your data is safe with us</h3>
              <p>
                FlowState learns <strong>only from patterns</strong> in time, energy, and task completion — 
                never from what you type, view, or say. All data is encrypted and stored securely.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}