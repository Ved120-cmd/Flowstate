import React, { useState } from 'react';
import {
  Users,
  Battery,
  Clock,
  TrendingUp,
  Zap,
  Calendar,
  MessageCircle,
  Settings,
  Heart,
  Brain,
  Coffee,
  Moon,
  Sun,
  Shield,
  ArrowRight,
  CheckCircle,
  Activity,
  Users as UsersIcon,
  Target,
  Bell
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import '../styles/TeamCollaboration.css';

const TeamCollaboration = () => {
  const [encouragementSent, setEncouragementSent] = useState([]);
  const [hoveredMember, setHoveredMember] = useState(null);

  // Mock team data
  const teamMembers = [
    {
      id: 1,
      name: "Alex Chen",
      role: "Senior Developer",
      avatar: "/avatar1.jpg",
      status: "In Flow",
      focusTime: 4.5,
      tasksCompleted: { low: 3, medium: 2, high: 1 },
      energyLevel: 78,
      flowSessions: 2,
      peakHours: "10 AM - 12 PM",
      breakAcceptance: 85,
      lastActive: "2 mins ago",
      color: "#88c9a1"
    },
    {
      id: 2,
      name: "Sarah Martinez",
      role: "Product Designer",
      status: "Taking Break",
      focusTime: 3.2,
      tasksCompleted: { low: 5, medium: 3, high: 0 },
      energyLevel: 62,
      flowSessions: 1,
      peakHours: "9 AM - 11 AM",
      breakAcceptance: 92,
      lastActive: "5 mins ago",
      color: "#e6b89c"
    },
    {
      id: 3,
      name: "Marcus Johnson",
      role: "Engineering Manager",
      status: "In Meeting",
      focusTime: 2.8,
      tasksCompleted: { low: 2, medium: 4, high: 0 },
      energyLevel: 70,
      flowSessions: 1,
      peakHours: "11 AM - 1 PM",
      breakAcceptance: 78,
      lastActive: "8 mins ago",
      color: "#7fa8c9"
    },
    {
      id: 4,
      name: "Priya Sharma",
      role: "UX Researcher",
      status: "In Flow",
      focusTime: 5.1,
      tasksCompleted: { low: 4, medium: 3, high: 2 },
      energyLevel: 82,
      flowSessions: 3,
      peakHours: "10:30 AM - 12:30 PM",
      breakAcceptance: 88,
      lastActive: "Just now",
      color: "#88c9a1"
    }
  ];

  const teamEnergyData = [
    { time: '9 AM', energy: 72 },
    { time: '10 AM', energy: 85 },
    { time: '11 AM', energy: 80 },
    { time: '12 PM', energy: 68 },
    { time: '1 PM', energy: 71 },
    { time: '2 PM', energy: 78 },
    { time: '3 PM', energy: 75 },
    { time: '4 PM', energy: 65 }
  ];

  const teamStats = {
    totalMembers: 12,
    averageEnergy: 76,
    collectiveFocusTime: 42.5,
    activeFlowSessions: 5
  };

  const teamInsights = [
    "Team energy peaks between 10 AM - 12 PM",
    `${teamMembers.filter(m => m.status === "In Flow").length} members are currently in their flow zone`,
    "Break synchronization: 65% (team takes breaks together)",
    "Meeting load: Moderate (2.5h average today)"
  ];

  const recommendations = [
    "Consider scheduling deep work blocks between 10-12 PM when team energy is highest",
    "3 members showing fatigue signals - encourage team break at 3 PM",
    "Meeting density is high - protect afternoon focus time"
  ];

  const handleSendEncouragement = (memberId) => {
    setEncouragementSent(prev => [...prev, memberId]);
    setTimeout(() => {
      setEncouragementSent(prev => prev.filter(id => id !== memberId));
    }, 3000);
  };

  const handleScheduleSync = (memberId) => {
    alert(`Scheduling sync with ${teamMembers.find(m => m.id === memberId)?.name}`);
  };

  const getStatusColor = (status) => {
    const colors = {
      'In Flow': '#88c9a1',
      'Taking Break': '#e6b89c',
      'In Meeting': '#7fa8c9',
      'Offline': '#b3a396'
    };
    return colors[status] || '#b3a396';
  };

  const getEnergyColor = (energy) => {
    if (energy >= 80) return '#88c9a1';
    if (energy >= 60) return '#b3a396';
    return '#e6b89c';
  };

  return (
    <div className="team-collaboration-container">
      {/* Header */}
      <header className="team-header">
        <div className="header-content">
          <h1 className="header-title">Team Collaboration</h1>
          <p className="header-subtitle">Track collective wellbeing and support each other's flow</p>
        </div>
        <div className="privacy-notice">
          <Shield size={14} />
          <span>Individual performance data remains private. Only aggregated team patterns are visible.</span>
        </div>
      </header>

      {/* Team Overview Cards */}
      <div className="overview-grid">
        <div className="overview-card">
          <div className="overview-icon-wrapper">
            <Users size={20} />
          </div>
          <div className="overview-content">
            <div className="overview-label">Active Members</div>
            <div className="overview-value">{teamStats.totalMembers}</div>
          </div>
        </div>

        <div className="overview-card">
          <div className="overview-icon-wrapper">
            <Battery size={20} />
          </div>
          <div className="overview-content">
            <div className="overview-label">Avg Energy Level</div>
            <div className="overview-value-energy">
              <div className="energy-bar">
                <div 
                  className="energy-fill" 
                  style={{ 
                    width: `${teamStats.averageEnergy}%`,
                    backgroundColor: getEnergyColor(teamStats.averageEnergy)
                  }}
                />
              </div>
              <span>{teamStats.averageEnergy}%</span>
            </div>
          </div>
        </div>

        <div className="overview-card">
          <div className="overview-icon-wrapper">
            <Clock size={20} />
          </div>
          <div className="overview-content">
            <div className="overview-label">Collective Focus</div>
            <div className="overview-value">{teamStats.collectiveFocusTime}h</div>
          </div>
        </div>

        <div className="overview-card">
          <div className="overview-icon-wrapper">
            <Zap size={20} />
          </div>
          <div className="overview-content">
            <div className="overview-label">Flow Sessions</div>
            <div className="overview-value">{teamStats.activeFlowSessions} active</div>
          </div>
        </div>
      </div>

      {/* Team Members Grid */}
      <section className="members-section">
        <h2 className="section-title">Team Members</h2>
        <p className="section-subtitle">Support each other's focus and wellbeing</p>
        
        <div className="members-grid">
          {teamMembers.map((member) => (
            <div 
              key={member.id}
              className="member-card"
              onMouseEnter={() => setHoveredMember(member.id)}
              onMouseLeave={() => setHoveredMember(null)}
            >
              {/* Header */}
              <div className="member-header">
                <div className="member-avatar">
                  <div 
                    className="avatar-placeholder"
                    style={{ backgroundColor: member.color + '20' }}
                  >
                    {member.name.charAt(0)}
                  </div>
                  <div className="member-info">
                    <h3 className="member-name">{member.name}</h3>
                    <p className="member-role">{member.role}</p>
                  </div>
                </div>
                <div 
                  className="status-badge"
                  style={{ 
                    backgroundColor: getStatusColor(member.status) + '20',
                    color: getStatusColor(member.status)
                  }}
                >
                  {member.status}
                </div>
              </div>

              {/* Metrics */}
              <div className="member-metrics">
                <div className="metric-item">
                  <Clock size={14} />
                  <div className="metric-content">
                    <div className="metric-value">{member.focusTime}h</div>
                    <div className="metric-label">Focus time</div>
                  </div>
                </div>
                
                <div className="metric-item">
                  <Target size={14} />
                  <div className="metric-content">
                    <div className="metric-value">
                      {Object.values(member.tasksCompleted).reduce((a, b) => a + b, 0)}
                    </div>
                    <div className="metric-label">Tasks done</div>
                  </div>
                </div>
                
                <div className="metric-item">
                  <Battery size={14} />
                  <div className="metric-content">
                    <div className="energy-indicator">
                      <div 
                        className="energy-level" 
                        style={{ 
                          width: `${member.energyLevel}%`,
                          backgroundColor: getEnergyColor(member.energyLevel)
                        }}
                      />
                    </div>
                    <div className="metric-label">{member.energyLevel}% energy</div>
                  </div>
                </div>
              </div>

              {/* Hover Details */}
              {hoveredMember === member.id && (
                <div className="member-details">
                  <div className="detail-row">
                    <Sun size={12} />
                    <span>Peak focus: {member.peakHours}</span>
                  </div>
                  <div className="detail-row">
                    <Coffee size={12} />
                    <span>Break acceptance: {member.breakAcceptance}%</span>
                  </div>
                  <div className="detail-row">
                    <Activity size={12} />
                    <span>Last active: {member.lastActive}</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="member-actions">
                <button 
                  className="action-btn encouragement-btn"
                  onClick={() => handleSendEncouragement(member.id)}
                >
                  {encouragementSent.includes(member.id) ? (
                    <>
                      <CheckCircle size={14} />
                      Sent!
                    </>
                  ) : (
                    <>
                      <Heart size={14} />
                      Send Encouragement
                    </>
                  )}
                </button>
                <button 
                  className="action-btn sync-btn"
                  onClick={() => handleScheduleSync(member.id)}
                >
                  <Calendar size={14} />
                  Schedule Sync
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team Insights */}
      <section className="insights-section">
        <h2 className="section-title">Team Insights</h2>
        <p className="section-subtitle">Collective patterns and rhythms</p>
        
        <div className="insights-grid">
          {/* Energy Trend Chart */}
          <div className="insight-card">
            <div className="insight-header">
              <TrendingUp size={18} />
              <h3>Team Energy Trend</h3>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={teamEnergyData}>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="rgba(140, 152, 164, 0.1)" 
                    vertical={false}
                  />
                  <XAxis 
                    dataKey="time" 
                    stroke="#a8b6bf"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#a8b6bf"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={[50, 100]}
                  />
                  <Tooltip 
                    contentStyle={{
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-card)',
                      boxShadow: 'var(--shadow-md)'
                    }}
                    formatter={(value) => [`${value}%`, 'Energy']}
                    labelStyle={{ color: 'var(--text-primary)', fontWeight: 500 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="energy" 
                    stroke="#88c9a1"
                    strokeWidth={2}
                    dot={{ fill: '#88c9a1', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Collaboration Patterns */}
          <div className="insight-card">
            <div className="insight-header">
              <UsersIcon size={18} />
              <h3>Collaboration Patterns</h3>
            </div>
            <div className="patterns-list">
              {teamInsights.map((insight, index) => (
                <div key={index} className="pattern-item">
                  <div className="pattern-bullet"></div>
                  <span className="pattern-text">{insight}</span>
                </div>
              ))}
            </div>
            <div className="pattern-summary">
              <Bell size={14} />
              <span>All metrics within healthy ranges</span>
            </div>
          </div>
        </div>
      </section>

      {/* Team Recommendations */}
      <section className="recommendations-section">
        <h2 className="section-title">Team Recommendations</h2>
        <p className="section-subtitle">AI-generated suggestions for better collective flow</p>
        
        <div className="recommendations-card">
          <div className="recommendations-header">
            <Brain size={20} />
            <h3>For Your Team's Wellbeing</h3>
          </div>
          <div className="recommendations-list">
            {recommendations.map((rec, index) => (
              <div key={index} className="recommendation-item">
                <div className="recommendation-check">
                  <CheckCircle size={14} />
                </div>
                <div className="recommendation-text">
                  <p>{rec}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="recommendations-footer">
            <MessageCircle size={14} />
            <span>These are gentle suggestions — always respect individual work styles</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="team-footer">
        <div className="footer-content">
          <div className="footer-note">
            <Shield size={14} />
            <span>Your privacy is protected. Only share what feels comfortable.</span>
          </div>
          <div className="footer-actions">
            <button className="footer-btn">
              <Settings size={14} />
              Team Settings
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TeamCollaboration;