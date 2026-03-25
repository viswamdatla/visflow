import { useState, useEffect, useCallback } from 'react';
import { getData, storeData } from '../services/storage';

const INITIAL_GOAL_DATA = {
  goals: [
    { 
      id: '1', 
      title: 'Climb Mont Blanc', 
      icon: '🏔️', 
      target: 'AUGUST 2024', 
      daysLeft: '142 DAYS LEFT', 
      progressLabel: 'OVERALL PROGRESS', 
      progress: 0.65, 
      accentColor: '#5e614d', 
      isPrimary: true, 
      inputPlaceholder: 'Add meters...', 
      actionLabel: 'ADD' 
    },
    { 
      id: '2', 
      title: 'Oil Painting Series', 
      icon: '🎨', 
      daysLeft: '42 DAYS LEFT', 
      progressLabel: '4 OF 6 UNITS', 
      progress: 0.66, 
      accentColor: '#a15d4d', 
      inputPlaceholder: 'Unit', 
      actionLabel: 'ADD PROGRESS' 
    },
    { 
      id: '3', 
      title: 'Publish Memoirs', 
      icon: '📘', 
      target: 'END OF YEAR', 
      progressLabel: 'DRAFTING STAGE', 
      progress: 0.20, 
      accentColor: '#4d8ba1', 
      inputPlaceholder: 'Words', 
      actionLabel: 'ADD PROGRESS' 
    },
    { 
      id: '4', 
      title: 'Daily Mindfulness', 
      icon: '🧘', 
      consistency: 'CONSISTENCY: 12 DAY STREAK', 
      progressLabel: 'DAILY TARGET', 
      progress: 0.90, 
      accentColor: '#4d4d4d', 
      inputPlaceholder: 'Mins', 
      actionLabel: 'LOG ACTIVITY' 
    },
  ]
};

export const useGoals = () => {
  const [data, setData] = useState(INITIAL_GOAL_DATA);
  const [loading, setLoading] = useState(true);

  const loadGoalData = useCallback(async () => {
    setLoading(true);
    const savedData = await getData('total_goals');
    if (savedData && savedData.goals) {
      setData(savedData);
    } else {
      await storeData('total_goals', INITIAL_GOAL_DATA);
      setData(INITIAL_GOAL_DATA);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadGoalData();
  }, [loadGoalData]);

  const updateGoalProgress = async (id, currentProgress) => {
    const updatedGoals = data.goals.map(goal => 
      goal.id === id ? { ...goal, progress: currentProgress } : goal
    );
    const updatedData = { ...data, goals: updatedGoals };
    setData(updatedData);
    await storeData('total_goals', updatedData);
  };

  const createGoal = async (goalData) => {
    const newGoal = {
      id: Date.now().toString(),
      title: goalData.title,
      icon: goalData.emoji || '🎯',
      target: goalData.targetDate ? `BY ${goalData.targetDate.toUpperCase()}` : 'ONGOING',
      daysLeft: goalData.targetDate ? goalData.targetDate : '',
      progressLabel: goalData.targetAmount ? `${goalData.currentProgress} OF ${goalData.targetAmount} UNITS` : 'PROGRESS',
      progress: goalData.currentProgress / (goalData.targetAmount || 1),
      accentColor: goalData.accentColor || '#1a1a1a',
      targetAmount: goalData.targetAmount,
      currentAmount: goalData.currentProgress,
      targetDate: goalData.targetDate,
      daysRemaining: '60 DAYS LEFT', // Mocking for now
      inputPlaceholder: 'Unit',
      actionLabel: 'ADD PROGRESS'
    };
    const updatedGoals = [...data.goals, newGoal];
    const updatedData = { ...data, goals: updatedGoals };
    setData(updatedData);
    await storeData('total_goals', updatedData);
  };

  const updateGoal = async (id, goalData) => {
    const updatedGoals = data.goals.map(goal => 
      goal.id === id ? {
        ...goal,
        title: goalData.title,
        icon: goalData.emoji || goal.icon,
        target: goalData.targetDate ? `BY ${goalData.targetDate.toUpperCase()}` : 'ONGOING',
        daysLeft: goalData.targetDate ? goalData.targetDate : '',
        progressLabel: goalData.targetAmount ? `${goalData.currentProgress} OF ${goalData.targetAmount} UNITS` : 'PROGRESS',
        progress: goalData.currentProgress / (goalData.targetAmount || 1),
        accentColor: goalData.accentColor || goal.accentColor,
        targetAmount: goalData.targetAmount,
        currentAmount: goalData.currentProgress,
        targetDate: goalData.targetDate,
      } : goal
    );
    const updatedData = { ...data, goals: updatedGoals };
    setData(updatedData);
    await storeData('total_goals', updatedData);
  };

  const deleteGoal = async (id) => {
    console.log("Hook: Attempting to delete goal with ID:", id);
    setData(prevData => {
      const updatedGoals = prevData.goals.filter(goal => goal.id !== id);
      const updatedData = { ...prevData, goals: updatedGoals };
      storeData('total_goals', updatedData);
      return updatedData;
    });
  };

  return {
    ...data,
    loading,
    updateGoalProgress,
    createGoal,
    updateGoal,
    deleteGoal,
    refreshData: loadGoalData
  };
};
