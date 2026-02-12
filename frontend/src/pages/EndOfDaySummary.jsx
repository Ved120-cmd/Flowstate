import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/EndOfDaySummary.css';

const EndOfDaySummary = () => {
  const navigate = useNavigate();
  const [selectedFeeling, setSelectedFeeling] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false); // New state to track if user has submitted for the day
  const [tooltipVisible, setTooltipVisible] = useState(null);

  // Check localStorage for existing submission
  useEffect(() => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem('eod_submission');
    
    if (stored) {
      const { date, feeling } = JSON.parse(stored);
      if (date === today) {
        setSelectedFeeling(feeling);
        setHasSubmitted(true);
        setShowFeedback(true);
      }
    }
  }, []);

  const selectFeeling = (feeling) => {
    // If already submitted for today, don't allow changes
    if (hasSubmitted) {
      return;
    }
    
    setSelectedFeeling(feeling);
    setShowFeedback(true);
    setHasSubmitted(true);
    
    // Store in localStorage with today's date
    const today = new Date().toDateString();
    localStorage.setItem('eod_submission', JSON.stringify({
      date: today,
      feeling: feeling
    }));
    
    // Don't auto-hide the thank you message - it stays permanently
    // The setTimeout has been removed
  };

  const handleDone = () => {
    navigate('/dashboard');
  };

  const handleMouseEnter = (tooltipId) => {
    setTooltipVisible(tooltipId);
  };

  const handleMouseLeave = () => {
    setTooltipVisible(null);
  };

  return (
    <div className="eod-container">
      {/* HEADER */}
      <header className="eod-header">
        <h1 className="eod-title">That's a wrap for today</h1>
        <div className="eod-meta">
          <div className="meta-badge">
            <svg className="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
          <div className="meta-badge">
            <svg className="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Work from Home
          </div>
          <div className="meta-badge">
            <svg className="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            8h 20m session
          </div>
        </div>
      </header>

      {/* TOP GRID (2 CARDS) */}
      <div className="eod-grid">
        {/* ACCOMPLISHMENTS CARD */}
        <div className="eod-card">
          <h2 className="card-header">What You Accomplished</h2>
          
          <div className="accomplishments-visual">
            <div className="tasks-number">5</div>
            <div className="complexity-list">
              <div className="complexity-dots">
                <div className="dot filled"></div>
                <div className="dot filled"></div>
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
              <div className="complexity-dots">
                <div className="dot filled"></div>
                <div className="dot filled"></div>
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
              <div className="complexity-dots">
                <div className="dot filled"></div>
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
          </div>
          
          <div className="tasks-label">Tasks</div>
          
          <div className="complexity-tags">
            <div 
              className="tooltip-container"
              onMouseEnter={() => handleMouseEnter('low-complexity')}
              onMouseLeave={handleMouseLeave}
            >
              <div className="complexity-tag">Low complexity (2)</div>
              <div className={`tooltip tooltip-right ${tooltipVisible === 'low-complexity' ? 'visible' : ''}`}>
                <strong>Tasks:</strong> Update Documentation, Code Review
              </div>
            </div>
            
            <div 
              className="tooltip-container"
              onMouseEnter={() => handleMouseEnter('medium-complexity')}
              onMouseLeave={handleMouseLeave}
            >
              <div className="complexity-tag">Medium complexity (2)</div>
              <div className={`tooltip tooltip-right ${tooltipVisible === 'medium-complexity' ? 'visible' : ''}`}>
                <strong>Tasks:</strong> API Integration, Bug Fixes
              </div>
            </div>
            
            <div 
              className="tooltip-container"
              onMouseEnter={() => handleMouseEnter('high-complexity')}
              onMouseLeave={handleMouseLeave}
            >
              <div className="complexity-tag">High complexity (1)</div>
              <div className={`tooltip tooltip-right ${tooltipVisible === 'high-complexity' ? 'visible' : ''}`}>
                <strong>Task:</strong> Database Migration
              </div>
            </div>
          </div>
        </div>

        {/* TIME BREAKDOWN CARD */}
        <div className="eod-card">
          <h2 className="card-header">Where Your Time Went</h2>
          
          <div 
            className="energy-story-container"
            onMouseEnter={() => handleMouseEnter('energy-story')}
            onMouseLeave={handleMouseLeave}
          >
            <div className="energy-mini">
              <div>
                <div className="energy-mini-title">Energy Story</div>
                <div className="energy-mini-subtitle">Pattern detected: Stable focus</div>
              </div>
              <svg className="energy-wave" viewBox="0 0 60 30" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.4">
                <path d="M0 15 Q10 5, 20 10 T40 15 T60 10" stroke="#7faf9b" />
              </svg>
              <div className="info-icon-small">i</div>
            </div>
            <div className={`tooltip tooltip-energy ${tooltipVisible === 'energy-story' ? 'visible' : ''}`}>
              <div className="tooltip-header">
                <svg className="tooltip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Z" />
                </svg>
                <strong>Energy Analysis</strong>
              </div>
              <p>Your energy stayed stable through the afternoon, with a gentle dip after 4 PM.</p>
              <div className="tooltip-details">
                <div className="tooltip-row">
                  <span className="tooltip-label">Pattern:</span>
                  <span className="tooltip-value">Stable focus</span>
                </div>
                <div className="tooltip-row">
                  <span className="tooltip-label">Peak focus:</span>
                  <span className="tooltip-value">10 AM - 12 PM</span>
                </div>
                <div className="tooltip-row">
                  <span className="tooltip-label">Lowest energy:</span>
                  <span className="tooltip-value">4 PM - 5 PM</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="time-items">
            <div className="time-row">
              <div className="time-row-header">
                <div 
                  className="time-label tooltip-container"
                  onMouseEnter={() => handleMouseEnter('focus-time')}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="time-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                      <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Z" />
                    </svg>
                  </div>
                  Focus: 3h 40m <span className="time-percentage">(70%)</span>
                  <div className="info-icon-small">i</div>
                  <div className={`tooltip tooltip-right ${tooltipVisible === 'focus-time' ? 'visible' : ''}`}>
                    <strong>Deep Work Sessions</strong>
                    <p>Uninterrupted, focused work time. This includes periods of high concentration on complex tasks.</p>
                  </div>
                </div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '70%' }}></div>
              </div>
            </div>

            <div className="time-row">
              <div className="time-row-header">
                <div 
                  className="time-label tooltip-container"
                  onMouseEnter={() => handleMouseEnter('meetings-time')}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="time-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  Meetings: 2h 10m <span className="time-percentage">(40%)</span>
                  <div className="info-icon-small">i</div>
                  <div className={`tooltip tooltip-right ${tooltipVisible === 'meetings-time' ? 'visible' : ''}`}>
                    <strong>Collaboration Time</strong>
                    <p>This time is excluded from productivity calculations. Includes team syncs, 1:1s, and planning sessions.</p>
                  </div>
                </div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill meetings" style={{ width: '40%' }}></div>
              </div>
            </div>

            <div className="time-row">
              <div className="time-row-header">
                <div 
                  className="time-label tooltip-container"
                  onMouseEnter={() => handleMouseEnter('recovery-time')}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="time-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  Recovery: 50m
                  <div className="info-icon-small">i</div>
                  <div className={`tooltip tooltip-right ${tooltipVisible === 'recovery-time' ? 'visible' : ''}`}>
                    <strong>Mindful Breaks</strong>
                    <p>Essential recovery time. Includes short breaks, stretching, hydration, and mental reset moments.</p>
                  </div>
                </div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill recovery" style={{ width: '15%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM GRID (3 CARDS) */}
      <div className="eod-grid-bottom">
        {/* INSIGHT CARD */}
        <div className="eod-card">
          <h2 className="card-header">Today's Learning</h2>
          <span className="insight-badge">Insight</span>
          <p className="insight-text">Your energy stayed stable during medium-complexity tasks.</p>
        </div>

        {/* PATTERN CARD */}
        <div className="eod-card">
          <h2 className="card-header">Pattern Detected</h2>
          <div className="pattern-timeline">
            <div className="timeline-point"></div>
            <div className="timeline-point"></div>
            <div className="timeline-point active"></div>
            <div className="timeline-point"></div>
            <div className="timeline-point"></div>
          </div>
          <p className="pattern-description">Your energy rhythm matches previous productive days.</p>
        </div>

        {/* REFLECTION CARD - PERSISTENT STATE */}
        <div className="eod-card">
          <h2 className="card-header">How did today feel?</h2>
          <div className="feeling-options">
            <button 
              className={`feeling-btn ${selectedFeeling === 'Calm & steady' ? 'selected' : ''}`}
              onClick={() => selectFeeling('Calm & steady')}
              disabled={hasSubmitted} // Disable if already submitted
            >
              <svg className="feeling-icon-pro" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              Calm & steady
            </button>
            <button 
              className={`feeling-btn ${selectedFeeling === 'Balanced' ? 'selected' : ''}`}
              onClick={() => selectFeeling('Balanced')}
              disabled={hasSubmitted} // Disable if already submitted
            >
              <svg className="feeling-icon-pro" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              Balanced
            </button>
            <button 
              className={`feeling-btn ${selectedFeeling === 'High-output' ? 'selected' : ''}`}
              onClick={() => selectFeeling('High-output')}
              disabled={hasSubmitted} // Disable if already submitted
            >
              <svg className="feeling-icon-pro" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              High-output
            </button>
          </div>
          
          {/* Persistent thank you message - always shows after submission */}
          {hasSubmitted && (
            <div className="feedback-message show">
              <svg className="checkmark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Thanks — FlowState will adapt tomorrow
            </div>
          )}
        </div>
      </div>

      {/* CLOSURE */}
      <div className="closure-section">
        <button className="done-btn" onClick={handleDone}>
          Done for today
        </button>
      </div>

      {/* FOOTER */}
      <footer className="eod-footer">
        <svg className="lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <svg className="lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        FlowState learns from patterns — not from content or keystrokes
      </footer>

      {/* DECORATIVE SPARKLE */}
      <svg className="sparkle-accent" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="12 2 15 8.5 22 12 15 15.5 12 22 9 15.5 2 12 9 8.5 12 2" />
      </svg>
    </div>
  );
};

export default EndOfDaySummary;
