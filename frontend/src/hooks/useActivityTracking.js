import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

const useActivityTracking = ({ idleThreshold = 120000, activityCheckInterval = 10000, enabled = true }) => {
  const [velocity, setVelocity] = useState(100); // ✅ START AT 100%
  const [suggestions, setSuggestions] = useState([]);
  const [modelState, setModelState] = useState({
    isInitialized: false,
    dataPointsCollected: 0,
    baselineVelocity: 100, // ✅ START AT 100%
    peakHours: []
  });
  const [isIdle, setIsIdle] = useState(false);
  const [activityMetrics, setActivityMetrics] = useState({
    clicks: 0,
    keystrokes: 0,
    mouseMoves: 0,
    scrolls: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const lastActivityTime = useRef(Date.now());
  const activityBuffer = useRef({
    clicks: 0,
    keystrokes: 0,
    mouseMoves: 0,
    scrolls: 0,
    startTime: Date.now()
  });
  const idleCheckInterval = useRef(null);
  const activitySyncInterval = useRef(null);

  // ✅ Track ALL user activity
  useEffect(() => {
    if (!enabled) return;

    const handleClick = () => {
      activityBuffer.current.clicks++;
      lastActivityTime.current = Date.now();
      setIsIdle(false);
    };

    const handleKeydown = () => {
      activityBuffer.current.keystrokes++;
      lastActivityTime.current = Date.now();
      setIsIdle(false);
    };

    const handleMouseMove = () => {
      activityBuffer.current.mouseMoves++;
      lastActivityTime.current = Date.now();
      setIsIdle(false);
    };

    const handleScroll = () => {
      activityBuffer.current.scrolls++;
      lastActivityTime.current = Date.now();
      setIsIdle(false);
    };

    // Add event listeners
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('scroll', handleScroll);

    console.log('🎯 Activity tracking listeners attached');

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('scroll', handleScroll);
    };
  }, [enabled]);

  // ✅ Sync activity to backend every 10 seconds
  useEffect(() => {
    if (!enabled) return;

    activitySyncInterval.current = setInterval(async () => {
      const buffer = activityBuffer.current;
      
      // Only sync if there's activity
      if (buffer.clicks > 0 || buffer.keystrokes > 0 || buffer.mouseMoves > 0 || buffer.scrolls > 0) {
        try {
          console.log('📤 Syncing activity:', buffer);
          
          const response = await api.post('/activity', {
            activityType: 'activity',
            clicks: buffer.clicks,
            keystrokes: buffer.keystrokes,
            mouseMoves: buffer.mouseMoves,
            scrolls: buffer.scrolls,
            timestamp: Date.now()
          });

          // Update local state with response
          if (response.data.success) {
            setVelocity(response.data.velocity || 100);
            setSuggestions(response.data.suggestions || []);
            setModelState(response.data.mlModelStatus || modelState);
            
            console.log('✅ Activity synced. Velocity:', response.data.velocity);
          }

          // Update UI metrics
          setActivityMetrics({
            clicks: buffer.clicks,
            keystrokes: buffer.keystrokes,
            mouseMoves: buffer.mouseMoves,
            scrolls: buffer.scrolls
          });

          // Reset buffer
          activityBuffer.current = {
            clicks: 0,
            keystrokes: 0,
            mouseMoves: 0,
            scrolls: 0,
            startTime: Date.now()
          };

        } catch (err) {
          console.error('❌ Error syncing activity:', err);
        }
      }
    }, activityCheckInterval);

    return () => {
      if (activitySyncInterval.current) {
        clearInterval(activitySyncInterval.current);
      }
    };
  }, [enabled, activityCheckInterval, modelState]);

  // ✅ Check for idle state
  useEffect(() => {
    if (!enabled) return;

    idleCheckInterval.current = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivityTime.current;
      
      if (timeSinceLastActivity > idleThreshold) {
        if (!isIdle) {
          console.log('⏰ User went idle');
          setIsIdle(true);
          
          // Decrease velocity when idle
          setVelocity(prev => Math.max(0, prev - 10));
        }
      }
    }, 5000); // Check every 5 seconds

    return () => {
      if (idleCheckInterval.current) {
        clearInterval(idleCheckInterval.current);
      }
    };
  }, [enabled, idleThreshold, isIdle]);

  // ✅ Fetch initial velocity on mount
  useEffect(() => {
    if (!enabled) return;

    const fetchInitialVelocity = async () => {
      try {
        setLoading(true);
        const response = await api.get('/velocity/personalized');
        
        if (response.data.success) {
          // If model has data, use it. Otherwise stay at 100%
          const vel = response.data.mlModelStatus?.isInitialized 
            ? response.data.velocity 
            : 100;
          
          setVelocity(vel);
          setSuggestions(response.data.suggestions || []);
          setModelState(response.data.mlModelStatus || {
            isInitialized: false,
            dataPointsCollected: 0,
            baselineVelocity: 100,
            peakHours: []
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('❌ Error fetching initial velocity:', err);
        setVelocity(100); // ✅ Default to 100% on error
        setLoading(false);
      }
    };

    fetchInitialVelocity();
  }, [enabled]);

  const recordTaskStart = async (taskId, complexity) => {
    try {
      const response = await api.post('/activity/task/start', {
        taskId,
        complexity
      });
      
      if (response.data.success) {
        console.log('✅ Task started:', taskId);
      }
    } catch (err) {
      console.error('❌ Error starting task:', err);
    }
  };

  const recordTaskComplete = async (taskId, complexity) => {
    try {
      const buffer = activityBuffer.current;
      const duration = Math.floor((Date.now() - buffer.startTime) / 60000); // minutes
      
      const response = await api.post('/activity/task/complete', {
        taskId,
        duration: duration || 30,
        complexity
      });
      
      if (response.data.success) {
        setVelocity(response.data.velocity || velocity);
        setSuggestions(response.data.suggestions || []);
        setModelState(response.data.mlModelStatus || modelState);
        
        console.log('✅ Task completed. Velocity:', response.data.velocity);
      }
    } catch (err) {
      console.error('❌ Error completing task:', err);
    }
  };

  const recordTaskPause = async (taskId) => {
    try {
      await api.post('/activity', {
        activityType: 'task_pause',
        taskId,
        timestamp: Date.now()
      });
    } catch (err) {
      console.error('❌ Error pausing task:', err);
    }
  };

  const recordFeedback = async (suggestionType, accepted) => {
    try {
      await api.post('/velocity/feedback', {
        suggestionType,
        accepted
      });
    } catch (err) {
      console.error('❌ Error recording feedback:', err);
    }
  };

  const refreshVelocity = async () => {
    try {
      setLoading(true);
      const response = await api.get('/velocity/personalized');
      
      if (response.data.success) {
        setVelocity(response.data.velocity || 100);
        setSuggestions(response.data.suggestions || []);
        setModelState(response.data.mlModelStatus || modelState);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('❌ Error refreshing velocity:', err);
      setLoading(false);
    }
  };

  const getActivityMetrics = () => activityMetrics;

  return {
    velocity,
    suggestions,
    modelState,
    isIdle,
    activityMetrics,
    loading,
    error,
    recordTaskStart,
    recordTaskComplete,
    recordTaskPause,
    recordFeedback,
    refreshVelocity,
    getActivityMetrics
  };
};

export default useActivityTracking;