import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, Area, AreaChart, PieChart, Pie
} from 'recharts';
import { 
  Calendar, TrendingUp, Brain, Battery, 
  Shield, Clock, Zap, Target, 
  PieChart as PieChartIcon, Thermometer,
  Home, Building, GitBranch, AlertCircle,
  CheckCircle, BarChart3, Activity
} from 'lucide-react';
import '../styles/AnalyticsDashboard.css';

// Mock data
const weeklyData = {
  focusTime: 28.5,
  tasksCompleted: { low: 12, medium: 8, high: 5 },
  workVelocity: 4.2,
  breaks: { suggested: 18, taken: 15 },
  peakFocus: [
    { hour: '8 AM', Monday: 2, Tuesday: 3, Wednesday: 4, Thursday: 2, Friday: 3 },
    { hour: '9 AM', Monday: 4, Tuesday: 4, Wednesday: 5, Thursday: 4, Friday: 4 },
    { hour: '10 AM', Monday: 5, Tuesday: 5, Wednesday: 5, Thursday: 5, Friday: 4 },
    { hour: '11 AM', Monday: 4, Tuesday: 4, Wednesday: 4, Thursday: 4, Friday: 3 },
    { hour: '12 PM', Monday: 2, Tuesday: 2, Wednesday: 3, Thursday: 2, Friday: 2 },
    { hour: '1 PM', Monday: 3, Tuesday: 3, Wednesday: 4, Thursday: 3, Friday: 3 },
    { hour: '2 PM', Monday: 4, Tuesday: 4, Wednesday: 5, Thursday: 4, Friday: 4 },
    { hour: '3 PM', Monday: 3, Tuesday: 3, Wednesday: 4, Thursday: 3, Friday: 2 },
    { hour: '4 PM', Monday: 2, Tuesday: 2, Wednesday: 3, Thursday: 2, Friday: 1 },
  ],
  energyComplexity: [
    { time: '9 AM', energy: 8, complexity: 3 },
    { time: '10 AM', energy: 9, complexity: 5 },
    { time: '11 AM', energy: 7, complexity: 4 },
    { time: '12 PM', energy: 6, complexity: 2 },
    { time: '1 PM', energy: 7, complexity: 4 },
    { time: '2 PM', energy: 8, complexity: 5 },
    { time: '3 PM', energy: 6, complexity: 5 },
    { time: '4 PM', energy: 5, complexity: 4 },
    { time: '5 PM', energy: 4, complexity: 3 },
  ],
  burnoutZones: [
    { id: 1, day: 'Mon', period: '3-5 PM', risk: 'low', description: 'Sustained moderate load', suggestion: 'Consider a 5-minute walk break' },
    { id: 2, day: 'Wed', period: '2-4 PM', risk: 'medium', description: 'High complexity + declining energy', suggestion: 'Switch to lighter tasks or take a break' },
    { id: 3, day: 'Fri', period: '4-6 PM', risk: 'high', description: 'Extended focus with minimal breaks', suggestion: 'Critical: Take a 10-minute recovery break' },
  ],
  fragmentation: [
    { day: 'Mon', switches: 12, location: 'office' },
    { day: 'Tue', switches: 8, location: 'wfh' },
    { day: 'Wed', switches: 15, location: 'office' },
    { day: 'Thu', switches: 10, location: 'wfh' },
    { day: 'Fri', switches: 7, location: 'office' },
  ],
  recommendations: {
    breaks: { suggested: 18, accepted: 15, impact: -0.4 },
    switches: { suggested: 7, accepted: 5, impact: -0.3 },
    flowLock: { activations: 8, avgDuration: 45 },
  },
  insights: [
    { id: 1, text: "Your best focus hours are consistently 10 AM - 12 PM", type: 'info' },
    { id: 2, text: "Task complexity matches energy well in mornings", type: 'info' },
    { id: 3, text: "Following break suggestions reduces error rate by 40%", type: 'success' },
  ]
};

const monthlyData = {
  workStyle: [
    { name: 'Deep Focus', value: 45, color: '#88c9a1' },
    { name: 'Balanced', value: 35, color: '#7fa8c9' },
    { name: 'Fragmented', value: 20, color: '#b3a396' },
  ],
  energyTrend: [
    { week: 'Week 1', energy: 7.2, recovery: 2.1 },
    { week: 'Week 2', energy: 7.8, recovery: 1.8 },
    { week: 'Week 3', energy: 6.9, recovery: 2.4 },
    { week: 'Week 4', energy: 7.5, recovery: 2.0 },
    { week: 'Week 5', energy: 7.8, recovery: 1.9 },
  ],
  taskDistribution: { low: 40, medium: 35, high: 25 },
  burnoutTrajectory: 'stable',
  personalInsights: [
    "You recover faster after movement breaks than passive breaks",
    "Error rate drops when switching tasks before energy dips",
    "Flow-Lock usage correlates with highest-quality output",
  ],
  monthlyPeakPerformance: [
    { week: 'W1', focus: 7.2, efficiency: 8.1, recovery: 6.5 },
    { week: 'W2', focus: 7.8, efficiency: 8.4, recovery: 7.2 },
    { week: 'W3', focus: 6.9, efficiency: 7.8, recovery: 5.9 },
    { week: 'W4', focus: 7.5, efficiency: 8.3, recovery: 7.0 },
  ]
};

const AnalyticsDashboard = () => {
  const [timeFrame, setTimeFrame] = useState('weekly');
  const [locationFilter, setLocationFilter] = useState('all');

  const filteredFragmentation = useMemo(() => {
    if (locationFilter === 'all') return weeklyData.fragmentation;
    return weeklyData.fragmentation.filter(f => f.location === locationFilter);
  }, [locationFilter]);

  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => {
    const colorMap = {
      blue: { bg: 'rgba(127, 168, 201, 0.1)', border: 'rgba(127, 168, 201, 0.2)', icon: '#7fa8c9' },
      green: { bg: 'rgba(136, 201, 161, 0.1)', border: 'rgba(136, 201, 161, 0.2)', icon: '#88c9a1' },
      purple: { bg: 'rgba(179, 163, 150, 0.15)', border: 'rgba(179, 163, 150, 0.3)', icon: '#b3a396' },
      amber: { bg: 'rgba(230, 184, 156, 0.15)', border: 'rgba(230, 184, 156, 0.3)', icon: '#e6b89c' },
      sage: { bg: 'rgba(136, 201, 161, 0.1)', border: 'rgba(136, 201, 161, 0.2)', icon: '#88c9a1' },
      beige: { bg: 'rgba(216, 201, 182, 0.15)', border: 'rgba(216, 201, 182, 0.3)', icon: '#b3a396' },
      orange: { bg: 'rgba(230, 184, 156, 0.15)', border: 'rgba(230, 184, 156, 0.3)', icon: '#e6b89c' }
    };
    
    const colors = colorMap[color] || colorMap.blue;
    
    return (
      <div className="stat-card">
        <div className="stat-card-header">
          <div className="stat-icon" style={{ 
            backgroundColor: colors.bg,
            border: `1px solid ${colors.border}`
          }}>
            <Icon size={24} style={{ color: colors.icon }} />
          </div>
          <h3 className="stat-title">{title}</h3>
        </div>
        <div className="stat-content">
          <div className="stat-value">{value}</div>
          <p className="stat-subtitle">{subtitle}</p>
        </div>
      </div>
    );
  };

  const InsightCard = ({ children, type = 'info' }) => {
    const config = {
      info: { bg: 'rgba(127, 168, 201, 0.08)', border: 'rgba(127, 168, 201, 0.2)', icon: Brain, iconColor: '#7fa8c9' },
      success: { bg: 'rgba(136, 201, 161, 0.08)', border: 'rgba(136, 201, 161, 0.2)', icon: CheckCircle, iconColor: '#88c9a1' },
      warning: { bg: 'rgba(230, 184, 156, 0.08)', border: 'rgba(230, 184, 156, 0.2)', icon: AlertCircle, iconColor: '#e6b89c' }
    }[type];
    
    const Icon = config.icon;
    
    return (
      <div className="insight-card" style={{ 
        backgroundColor: config.bg, 
        borderColor: config.border 
      }}>
        <div className="insight-content">
          <Icon size={20} className="insight-icon" style={{ color: config.iconColor }} />
          <p className="insight-text">{children}</p>
        </div>
      </div>
    );
  };

  const getRiskColor = (risk) => {
    switch(risk) {
      case 'high': return 'rgba(230, 162, 162, 0.08)';
      case 'medium': return 'rgba(230, 184, 156, 0.08)';
      default: return 'rgba(136, 201, 161, 0.05)';
    }
  };

  const getRiskBorder = (risk) => {
    switch(risk) {
      case 'high': return 'rgba(230, 162, 162, 0.4)';
      case 'medium': return 'rgba(230, 184, 156, 0.4)';
      default: return 'rgba(136, 201, 161, 0.3)';
    }
  };

  const getRiskDot = (risk) => {
    switch(risk) {
      case 'high': return '#e6a2a2';
      case 'medium': return '#e6b89c';
      default: return '#88c9a1';
    }
  };

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">
              {timeFrame === "weekly" ? "Your Week" : "Your Work Over Time"}
            </h1>

            <p className="dashboard-subtitle">
              {timeFrame === 'weekly' 
                ? "Weekly insights to design better workdays" 
                : "Monthly trends for sustainable planning"}
            </p>
          </div>
          
          {/* Time Frame Toggle */}
          <div className="time-toggle">
            <button
              onClick={() => setTimeFrame('weekly')}
              className={`toggle-btn ${timeFrame === 'weekly' ? 'active' : ''}`}
            >
              <Clock size={16} />
              Weekly
            </button>
            <button
              onClick={() => setTimeFrame('monthly')}
              className={`toggle-btn ${timeFrame === 'monthly' ? 'active' : ''}`}
            >
              <Calendar size={16} />
              Monthly
            </button>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="privacy-notice">
          <div className="privacy-content">
            <Shield size={20} />
            <p>Your wellbeing data is private and stored locally on your device. Analytics are generated on-device to protect your privacy.</p>
          </div>
        </div>

        {timeFrame === 'weekly' ? (
          /* WEEKLY ANALYTICS */
          <div className="analytics-content">
            {/* Row 1: Focus Overview & Peak Focus */}
            <div className="analytics-row">
              {/* Focus Overview */}
              <div className="overview-section">
                <h2 className="section-title">Weekly Overview</h2>
                <div className="stats-grid">
                  <StatCard
                    icon={Target}
                    title="Focused Time"
                    value="28.5h"
                    subtitle="Deep work this week"
                    color="sage"
                  />
                  <StatCard
                    icon={Brain}
                    title="Tasks Completed"
                    value="25"
                    subtitle="5 high-complexity"
                    color="blue"
                  />
                  <StatCard
                    icon={TrendingUp}
                    title="Work Velocity"
                    value="4.2"
                    subtitle="Steady pace"
                    color="beige"
                  />
                  <StatCard
                    icon={Battery}
                    title="Breaks Taken"
                    value="15/18"
                    subtitle="Followed 83% suggestions"
                    color="orange"
                  />
                </div>
                
                <div className="insight-container">
                  <InsightCard type="info">
                    This week leaned slightly toward high cognitive load. You handled it well.
                  </InsightCard>
                </div>
              </div>

              {/* Peak Focus Hours */}
              <div className="chart-section">
                <div className="chart-card">
                  <div className="chart-header">
                    <div className="chart-title-group">
                      <h2 className="chart-title">Peak Focus Hours</h2>
                      <p className="chart-subtitle">When you consistently show your best focus quality</p>
                    </div>
                    <div className="location-filters">
                      <button className="location-btn">
                        <Home size={16} />
                        WFH
                      </button>
                      <button className="location-btn">
                        <Building size={16} />
                        Office
                      </button>
                    </div>
                  </div>
                  
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={weeklyData.peakFocus}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e8e4dd" />
                        <XAxis 
                          dataKey="hour" 
                          tickFormatter={(h) => `${h}:00`}
                          stroke="#7a7a7a"
                          style={{ fontSize: '12px' }}
                        />
                        <YAxis stroke="#7a7a7a" style={{ fontSize: '12px' }} />
                        <Tooltip 
                          labelFormatter={(h) => `${h}:00`}
                          formatter={(value) => [value, 'Focus Score']}
                          contentStyle={{ 
                            backgroundColor: '#ffffff', 
                            border: '1px solid #e8e4dd',
                            borderRadius: '8px',
                            fontSize: '13px'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="Monday" 
                          stackId="1"
                          stroke="#88c9a1" 
                          fill="#88c9a1" 
                          fillOpacity={0.1}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="Tuesday" 
                          stackId="1"
                          stroke="#7fa8c9" 
                          fill="#7fa8c9" 
                          fillOpacity={0.1}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Energy vs Complexity & Burnout Zones */}
            <div className="analytics-row">
              {/* Energy vs Complexity */}
              <div className="chart-card">
                <h2 className="chart-title">Energy vs Task Complexity</h2>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyData.energyComplexity}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e8e4dd" />
                      <XAxis dataKey="time" stroke="#7a7a7a" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#7a7a7a" style={{ fontSize: '12px' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          border: '1px solid #e8e4dd',
                          borderRadius: '8px',
                          fontSize: '13px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="energy" 
                        stroke="#88c9a1" 
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#88c9a1' }}
                        name="Energy Level"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="complexity" 
                        stroke="#b3a396" 
                        strokeWidth={3}
                        strokeDasharray="5 5"
                        dot={{ r: 4, fill: '#b3a396' }}
                        name="Task Complexity"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="insight-container">
                  <InsightCard type="warning">
                    High-complexity tasks after 4 PM correlated with higher error rates.
                  </InsightCard>
                </div>
              </div>

              {/* Burnout Risk Zones */}
              <div className="chart-card">
                <div className="chart-header">
                  <div className="chart-title-group">
                    <h2 className="chart-title">High Load Zones</h2>
                    <p className="chart-subtitle">Periods that may benefit from lighter tasks</p>
                  </div>
                  <div className="risk-badge">
                    Non-judgmental patterns
                  </div>
                </div>
                
                <div className="zones-container">
                  {weeklyData.burnoutZones.map((zone) => (
                    <div 
                      key={zone.id}
                      className="zone-card"
                      style={{ 
                        backgroundColor: getRiskColor(zone.risk),
                        borderColor: getRiskBorder(zone.risk)
                      }}
                    >
                      <div className="zone-header">
                        <div className="zone-indicator">
                          <span 
                            className="zone-dot"
                            style={{ backgroundColor: getRiskDot(zone.risk) }}
                          />
                          <span className="zone-day">{zone.day}</span>
                        </div>
                        <div className="zone-period">{zone.period}</div>
                      </div>
                      <p className="zone-description">{zone.description}</p>
                      <div className="zone-suggestion">
                        Consider earlier breaks
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 3: Fragmentation & Recommendations */}
            <div className="analytics-row">
              {/* Work Fragmentation */}
              <div className="chart-card">
                <div className="chart-header">
                  <div className="chart-title-group">
                    <h2 className="chart-title">Work Fragmentation</h2>
                    <p className="chart-subtitle">Task switches & environmental context</p>
                  </div>
                  <div className="fragment-filters">
                    <button 
                      onClick={() => setLocationFilter('all')}
                      className={`filter-btn ${locationFilter === 'all' ? 'active' : ''}`}
                    >
                      All
                    </button>
                    <button 
                      onClick={() => setLocationFilter('office')}
                      className={`filter-btn ${locationFilter === 'office' ? 'active' : ''}`}
                    >
                      Office
                    </button>
                    <button 
                      onClick={() => setLocationFilter('wfh')}
                      className={`filter-btn ${locationFilter === 'wfh' ? 'active' : ''}`}
                    >
                      WFH
                    </button>
                  </div>
                </div>
                
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredFragmentation}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e8e4dd" />
                      <XAxis dataKey="day" stroke="#7a7a7a" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#7a7a7a" style={{ fontSize: '12px' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          border: '1px solid #e8e4dd',
                          borderRadius: '8px',
                          fontSize: '13px'
                        }}
                      />
                      <Bar 
                        dataKey="switches" 
                        name="Task Switches" 
                        radius={[4, 4, 0, 0]}
                      >
                        {filteredFragmentation.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`}
                            fill={entry.location === 'office' ? '#88c9a1' : '#b3a396'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="insight-container">
                  <InsightCard>
                    Your focus was interrupted more frequently on WFH days — not a performance issue, just environment-driven.
                  </InsightCard>
                </div>
              </div>

              {/* Recommendation Impact */}
              <div className="chart-card">
                <h2 className="chart-title">Recommendation Impact</h2>
                
                <div className="recommendations-container">
                  <div className="recommendation-item">
                    <div className="recommendation-header">
                      <span>Break Suggestions</span>
                      <span className="recommendation-value">
                        {weeklyData.recommendations.breaks.accepted}/
                        {weeklyData.recommendations.breaks.suggested} accepted
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill sage"
                        style={{ width: `${(weeklyData.recommendations.breaks.accepted / weeklyData.recommendations.breaks.suggested) * 100}%` }}
                      />
                    </div>
                    <p className="recommendation-impact">
                      Error rate reduction: {Math.abs(weeklyData.recommendations.breaks.impact * 100).toFixed(0)}%
                    </p>
                  </div>

                  <div className="recommendation-item">
                    <div className="recommendation-header">
                      <span>Task Switch Suggestions</span>
                      <span className="recommendation-value">
                        {weeklyData.recommendations.switches.accepted}/
                        {weeklyData.recommendations.switches.suggested} accepted
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill blue"
                        style={{ width: `${(weeklyData.recommendations.switches.accepted / weeklyData.recommendations.switches.suggested) * 100}%` }}
                      />
                    </div>
                    <p className="recommendation-impact">
                      Error rate reduction: {Math.abs(weeklyData.recommendations.switches.impact * 100).toFixed(0)}%
                    </p>
                  </div>

                  <div className="flow-lock-stats">
                    <div className="flow-lock-item">
                      <p className="flow-lock-label">Flow-Lock Activations</p>
                      <p className="flow-lock-value">{weeklyData.recommendations.flowLock.activations}</p>
                    </div>
                    <div className="flow-lock-item">
                      <p className="flow-lock-label">Avg. duration</p>
                      <p className="flow-lock-value">{weeklyData.recommendations.flowLock.avgDuration}min</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Insights */}
            <div className="insights-section">
              <h2 className="section-title">This Week's Insights</h2>
              <div className="insights-grid">
                {weeklyData.insights.map((insight) => (
                  <InsightCard key={insight.id} type={insight.type}>
                    {insight.text}
                  </InsightCard>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* MONTHLY ANALYTICS - FULLY WORKING */
          <div className="analytics-content">
            {/* Monthly Overview Stats */}
            <div className="stats-grid">
              <StatCard
                icon={PieChartIcon}
                title="Work Style"
                value="Deep Focus"
                subtitle="45% of your time"
                color="green"
              />
              <StatCard
                icon={Thermometer}
                title="Burnout Trajectory"
                value="Stable"
                subtitle="Sustainable patterns"
                color="green"
              />
              <StatCard
                icon={GitBranch}
                title="Task Distribution"
                value="Balanced"
                subtitle="40% low, 35% medium, 25% high"
                color="blue"
              />
              <StatCard
                icon={Zap}
                title="Energy Baseline"
                value="7.4"
                subtitle="Good sustainability"
                color="green"
              />
            </div>

            {/* Monthly Charts Row */}
            <div className="analytics-row">
              {/* Work Rhythm Profile - FIXED */}
              <div className="chart-card">
                <div className="chart-header">
                  <div className="chart-title-group">
                    <h2 className="chart-title">Monthly Work Rhythm</h2>
                    <p className="chart-subtitle">Distribution of work styles this month</p>
                  </div>
                </div>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={monthlyData.workStyle}
                      margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e8e4dd" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#7a7a7a" 
                        style={{ fontSize: '12px' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        stroke="#7a7a7a" 
                        style={{ fontSize: '12px' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Percentage']}
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          border: '1px solid #e8e4dd',
                          borderRadius: '8px',
                          fontSize: '13px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }}
                        labelStyle={{ color: '#5a5a5a', fontWeight: '500' }}
                      />
                      <Bar 
                        dataKey="value" 
                        name="Percentage"
                        radius={[8, 8, 0, 0]}
                        barSize={60}
                      >
                        {monthlyData.workStyle.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="insight-container">
                  <InsightCard type="info">
                    You've maintained excellent deep focus time this month while keeping fragmentation low.
                  </InsightCard>
                </div>
              </div>

              {/* Energy Sustainability Trend - FIXED */}
              <div className="chart-card">
                <div className="chart-header">
                  <div className="chart-title-group">
                    <h2 className="chart-title">Energy Sustainability Trend</h2>
                    <p className="chart-subtitle">Weekly energy levels and recovery time</p>
                  </div>
                </div>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                      data={monthlyData.energyTrend}
                      margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e8e4dd" />
                      <XAxis 
                        dataKey="week" 
                        stroke="#7a7a7a" 
                        style={{ fontSize: '12px' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        stroke="#7a7a7a" 
                        style={{ fontSize: '12px' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          border: '1px solid #e8e4dd',
                          borderRadius: '8px',
                          fontSize: '13px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }}
                        labelStyle={{ color: '#5a5a5a', fontWeight: '500' }}
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="energy" 
                        stroke="#88c9a1" 
                        strokeWidth={3}
                        dot={{ r: 5, fill: '#88c9a1', strokeWidth: 2, stroke: '#ffffff' }}
                        activeDot={{ r: 7, stroke: '#88c9a1', strokeWidth: 2 }}
                        name="Avg. Energy"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="recovery" 
                        stroke="#7fa8c9" 
                        strokeWidth={3}
                        strokeDasharray="5 5"
                        dot={{ r: 5, fill: '#7fa8c9', strokeWidth: 2, stroke: '#ffffff' }}
                        activeDot={{ r: 7, stroke: '#7fa8c9', strokeWidth: 2 }}
                        name="Recovery Time (h)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="insight-container">
                  <InsightCard type="success">
                    Energy levels remained stable throughout the month, with Week 5 showing the best recovery efficiency.
                  </InsightCard>
                </div>
              </div>
            </div>

            {/* Additional Monthly Chart */}
            <div className="analytics-row">
              {/* Peak Performance Trends */}
              <div className="chart-card">
                <div className="chart-header">
                  <div className="chart-title-group">
                    <h2 className="chart-title">Peak Performance Trends</h2>
                    <p className="chart-subtitle">Weekly focus, efficiency, and recovery scores</p>
                  </div>
                </div>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                      data={monthlyData.monthlyPeakPerformance}
                      margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e8e4dd" />
                      <XAxis 
                        dataKey="week" 
                        stroke="#7a7a7a" 
                        style={{ fontSize: '12px' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        stroke="#7a7a7a" 
                        style={{ fontSize: '12px' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          border: '1px solid #e8e4dd',
                          borderRadius: '8px',
                          fontSize: '13px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }}
                        labelStyle={{ color: '#5a5a5a', fontWeight: '500' }}
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="focus" 
                        stroke="#88c9a1" 
                        strokeWidth={3}
                        dot={{ r: 5, fill: '#88c9a1', strokeWidth: 2, stroke: '#ffffff' }}
                        name="Focus Score"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="efficiency" 
                        stroke="#7fa8c9" 
                        strokeWidth={3}
                        dot={{ r: 5, fill: '#7fa8c9', strokeWidth: 2, stroke: '#ffffff' }}
                        name="Efficiency"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="recovery" 
                        stroke="#b3a396" 
                        strokeWidth={3}
                        strokeDasharray="5 5"
                        dot={{ r: 5, fill: '#b3a396', strokeWidth: 2, stroke: '#ffffff' }}
                        name="Recovery"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Task Distribution Pie Chart */}
              <div className="chart-card">
                <div className="chart-header">
                  <div className="chart-title-group">
                    <h2 className="chart-title">Task Complexity Distribution</h2>
                    <p className="chart-subtitle">Monthly breakdown by complexity level</p>
                  </div>
                </div>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Low', value: monthlyData.taskDistribution.low, color: '#88c9a1' },
                          { name: 'Medium', value: monthlyData.taskDistribution.medium, color: '#7fa8c9' },
                          { name: 'High', value: monthlyData.taskDistribution.high, color: '#b3a396' }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        strokeWidth={2}
                        stroke="#ffffff"
                      >
                        {[
                          { name: 'Low', value: monthlyData.taskDistribution.low, color: '#88c9a1' },
                          { name: 'Medium', value: monthlyData.taskDistribution.medium, color: '#7fa8c9' },
                          { name: 'High', value: monthlyData.taskDistribution.high, color: '#b3a396' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Share']}
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          border: '1px solid #e8e4dd',
                          borderRadius: '8px',
                          fontSize: '13px'
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Personal Work Insights */}
            <div className="personal-insights">
              <div className="insights-header">
                <Brain size={24} />
                <h2 className="section-title">Personal Work Insights</h2>
              </div>
              
              <div className="insights-list">
                {monthlyData.personalInsights.map((insight, idx) => (
                  <div key={idx} className="personal-insight-card">
                    <div className="insight-bullet" />
                    <p className="personal-insight-text">{insight}</p>
                  </div>
                ))}
              </div>

              <div className="monthly-summary">
                <InsightCard type="success">
                  Your system signals remained stable this month. Keep protecting your peak focus hours.
                </InsightCard>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;