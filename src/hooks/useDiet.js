import { useState, useEffect, useMemo } from 'react';
import { db } from '../services/firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const INITIAL_GOALS = {
  goalCals: 2000,
  goalProtein: 150,
  goalCarbs: 250,
  goalFats: 65,
  goalHydration: 2.5
};

const formatDate = (date) => {
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
};

export const useDiet = () => {
  const { user } = useAuth();
  const [dailyLogs, setDailyLogs] = useState({});
  const [currentDate, setCurrentDate] = useState(formatDate(new Date()));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setDailyLogs({});
      setLoading(false);
      return;
    }

    const logsRef = collection(db, `users/${user.uid}/dietLogs`);
    const unsubscribe = onSnapshot(logsRef, (snapshot) => {
      const logs = {};
      snapshot.forEach(doc => {
        logs[doc.id] = doc.data();
      });
      setDailyLogs(logs);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const getLogForDate = (date) => {
    return dailyLogs[date] || {
      meals: [],
      hydration: 0,
      stats: { ...INITIAL_GOALS, calories: 0, protein: 0, carbs: 0, fats: 0 }
    };
  };

  const currentLog = useMemo(() => getLogForDate(currentDate), [dailyLogs, currentDate]);

  const calculateStats = (meals) => {
    return meals.reduce((acc, meal) => ({
      calories: acc.calories + (parseInt(meal.calories) || 0),
      protein: acc.protein + (parseInt(meal.protein) || 0),
      carbs: acc.carbs + (parseInt(meal.carbs) || 0),
      fats: acc.fats + (parseInt(meal.fat) || 0),
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
  };

  const addMeal = async (mealData) => {
    if (!user) return;
    const logDate = mealData.date || currentDate;
    const log = getLogForDate(logDate);
    
    const newMeal = {
      ...mealData,
      id: Date.now().toString(),
      calories: parseInt(mealData.calories) || 0,
      protein: parseInt(mealData.protein) || 0,
      carbs: parseInt(mealData.carbs) || 0,
      fat: parseInt(mealData.fat) || 0,
    };

    const updatedMeals = [newMeal, ...log.meals];
    const newStats = calculateStats(updatedMeals);
    
    const logRef = doc(db, `users/${user.uid}/dietLogs`, logDate);
    await setDoc(logRef, {
      ...log,
      meals: updatedMeals,
      stats: { ...log.stats, ...newStats, updatedAt: serverTimestamp() }
    }, { merge: true });
  };

  const deleteMeal = async (id, date = currentDate) => {
    if (!user) return;
    const log = getLogForDate(date);
    const updatedMeals = log.meals.filter(m => m.id !== id);
    const newStats = calculateStats(updatedMeals);
    
    const logRef = doc(db, `users/${user.uid}/dietLogs`, date);
    await updateDoc(logRef, {
      meals: updatedMeals,
      stats: { ...log.stats, ...newStats, updatedAt: serverTimestamp() }
    });
  };

  const updateMeal = async (id, mealData, date = currentDate) => {
    if (!user) return;
    const log = getLogForDate(date);
    const updatedMeals = log.meals.map(m => 
      m.id === id ? { 
        ...m, 
        ...mealData, 
        calories: parseInt(mealData.calories) || 0,
        protein: parseInt(mealData.protein) || 0,
        carbs: parseInt(mealData.carbs) || 0,
        fat: parseInt(mealData.fat) || 0
      } : m
    );
    const newStats = calculateStats(updatedMeals);
    
    const logRef = doc(db, `users/${user.uid}/dietLogs`, date);
    await updateDoc(logRef, {
      meals: updatedMeals,
      stats: { ...log.stats, ...newStats, updatedAt: serverTimestamp() }
    });
  };

  const updateGoal = async (stat, value, date = currentDate) => {
    if (!user) return;
    const log = getLogForDate(date);
    const goalKey = stat === 'hydration' ? 'goalHydration' : `goal${stat.charAt(0).toUpperCase() + stat.slice(1)}`;
    
    const logRef = doc(db, `users/${user.uid}/dietLogs`, date);
    await setDoc(logRef, {
      stats: { ...log.stats, [goalKey]: parseFloat(value) || 0, updatedAt: serverTimestamp() }
    }, { merge: true });
  };

  const updateHydration = async (amount, date = currentDate) => {
    if (!user) return;
    const log = getLogForDate(date);
    const newHydration = Math.max(0, log.hydration + amount);
    
    const logRef = doc(db, `users/${user.uid}/dietLogs`, date);
    await setDoc(logRef, {
      hydration: newHydration,
      updatedAt: serverTimestamp()
    }, { merge: true });
  };

  return {
    stats: currentLog.stats,
    hydration: currentLog.hydration,
    meals: currentLog.meals,
    currentDate,
    setCurrentDate,
    loading,
    addMeal,
    deleteMeal,
    updateMeal,
    updateGoal,
    updateHydration,
  };
};
