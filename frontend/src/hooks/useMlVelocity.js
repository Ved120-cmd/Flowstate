// frontend/src/hooks/useMLVelocity.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { velocityAPI } from '../services/api';

/**
 * Custom hook for real-time ML velocity tracking
 * Polls the ML model every 10 seconds and provides suggestions
 */
export const useMLVelocity = (options = {}) => {
  const {
    pollingInterval = 10000, // 10 seconds
    autoStart = true,
    onSuggestion = null,
    onVelocityChange = null
  } = options;

  // State
  const [velocity, setVelocity] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [modelState, setModelState] = useState({
    isInitialized: false,
    dataPointsCollected: 0,
    personalizedWeights: null,
    baselineVelocity: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(autoStart);

  // Refs
  const pollingIntervalRef = useRef(null);
  const lastVelocityRef = useRef(null);
  const currentTaskRef = useRef(null);

  // Fetch personalized velocity and suggestions
  const fetchVelocity = useCallback(async () => {
    try {
      const response = await velocityAPI.getPersonalized();
      const data = response.data;

      // Update velocity
      if (data.currentVelocity !== undefined) {
        setVelocity(data.currentVelocity);

        // Trigger callback if velocity changed significantly
        if (
          lastVelocityRef.current !== null &&
          Math.abs(data.currentVelocity - lastVelocityRef.current) > 5 &&
          onVelocityChange
        ) {
          onVelocityChange(data.currentVelocity, lastVelocityRef.current);
        }

        lastVelocityRef.current = data.currentVelocity;
      }

      // Update suggestions
      if (data.suggestions && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions);

        // Trigger callback for new suggestions
        if (data.suggestions.length > 0 && onSuggestion) {
          onSuggestion(data.suggestions);
        }
      }

      // Update model state
      setModelState({
        isInitialized: data.personalizedWeights !== undefined,
        dataPointsCollected: data.dataPointsCollected || 0,
        personalizedWeights: data.personalizedWeights || null,
        baselineVelocity: data.userProfile?.baselineVelocity || null,
        peakHours: data.userProfile?.peakHours || [],
        lowEnergyHours: data.userProfile?.lowEnergyHours || []
      });

      setError(null);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching velocity:', err);
      setError(err.response?.data?.error || err.message);
      setLoading(false);
    }
  }, [onSuggestion, onVelocityChange]);

  // Start polling
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      return; // Already polling
    }

    console.log('🔄 Starting ML velocity polling...');
    setIsPolling(true);

    // Fetch immediately
    fetchVelocity();

    // Then poll at interval
    pollingIntervalRef.current = setInterval(() => {
      fetchVelocity();
    }, pollingInterval);
  }, [fetchVelocity, pollingInterval]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      console.log('⏸️  Stopping ML velocity polling');
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      setIsPolling(false);
    }
  }, []);

  // Record task activity (this trains the ML model)
  const recordTaskStart = useCallback(async (taskId, complexity = 'medium') => {
    currentTaskRef.current = { taskId, complexity, startTime: Date.now() };
    try {
      await velocityAPI.recordTaskStart(taskId, complexity);
      // Fetch updated velocity immediately
      await fetchVelocity();
    } catch (err) {
      console.error('Error recording task start:', err);
    }
  }, [fetchVelocity]);

  const recordTaskComplete = useCallback(async (taskId, complexity = 'medium') => {
    const task = currentTaskRef.current;
    const duration = task?.startTime
      ? Math.round((Date.now() - task.startTime) / 60000) // Convert to minutes
      : 15; // Default 15 minutes

    try {
      await velocityAPI.recordTaskCompletion(taskId, duration, complexity);
      currentTaskRef.current = null;
      // Fetch updated velocity immediately
      await fetchVelocity();
    } catch (err) {
      console.error('Error recording task completion:', err);
    }
  }, [fetchVelocity]);

  const recordTaskPause = useCallback(async (taskId) => {
    try {
      await velocityAPI.recordTaskPause(taskId);
      await fetchVelocity();
    } catch (err) {
      console.error('Error recording task pause:', err);
    }
  }, [fetchVelocity]);

  // Record intervention feedback
  const recordFeedback = useCallback(async (interventionType, accepted) => {
    try {
      const velocityBefore = lastVelocityRef.current || 0;
      await velocityAPI.recordInterventionFeedback(
        interventionType,
        accepted,
        velocityBefore,
        null // velocityAfter will be measured in next poll
      );
      // Fetch updated velocity
      await fetchVelocity();
    } catch (err) {
      console.error('Error recording feedback:', err);
    }
  }, [fetchVelocity]);

  // Manual refresh
  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchVelocity();
  }, [fetchVelocity]);

  // Auto-start polling on mount
  useEffect(() => {
    if (autoStart) {
      startPolling();
    }

    // Cleanup on unmount
    return () => {
      stopPolling();
    };
  }, [autoStart, startPolling, stopPolling]);

  return {
    // State
    velocity,
    suggestions,
    modelState,
    loading,
    error,
    isPolling,

    // Actions
    startPolling,
    stopPolling,
    refresh,
    recordTaskStart,
    recordTaskComplete,
    recordTaskPause,
    recordFeedback
  };
};

export default useMLVelocity;