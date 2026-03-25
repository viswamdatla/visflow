import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const getTodayDate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const useHabits = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState({});

  useEffect(() => {
    if (!user) {
      setHabits([]);
      setLoading(false);
      return;
    }

    const habitsRef = collection(db, `users/${user.uid}/habits`);
    const q = query(habitsRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const habitList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHabits(habitList);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const toggleHabit = async (id) => {
    if (!user) return;
    try {
      const habit = habits.find(h => h.id === id);
      if (!habit) return;

      const isNowCompleted = !habit.completedToday;
      const habitRef = doc(db, `users/${user.uid}/habits`, id);
      
      await updateDoc(habitRef, {
        completedToday: isNowCompleted,
        streak: isNowCompleted ? (habit.streak || 0) + 1 : Math.max(0, (habit.streak || 1) - 1),
        lastUpdated: serverTimestamp()
      });

      // Update history summary in a dedicated document (optional refinement)
      // For now, we'll keep the dashboard logic local based on the habits state
    } catch (error) {
      console.error("Error toggling habit:", error);
    }
  };

  const addHabit = async (habitData) => {
    if (!user) return;
    try {
      const habitsRef = collection(db, `users/${user.uid}/habits`);
      await addDoc(habitsRef, {
        title: habitData.title,
        subtitle: habitData.subtitle || 'DAILY',
        icon: habitData.icon || '✨',
        streak: 0,
        completedToday: false,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error adding habit:", error);
    }
  };

  const updateHabit = async (id, habitData) => {
    if (!user) return;
    try {
      const habitRef = doc(db, `users/${user.uid}/habits`, id);
      await updateDoc(habitRef, { ...habitData });
    } catch (error) {
      console.error("Error updating habit:", error);
    }
  };

  const deleteHabit = async (id) => {
    if (!user) return;
    try {
      const habitRef = doc(db, `users/${user.uid}/habits`, id);
      await deleteDoc(habitRef);
    } catch (error) {
      console.error("Error deleting habit:", error);
    }
  };

  // Aggregate stats for dashboard compatibility
  const habitsDoneToday = habits.filter(h => h.completedToday).length;
  const totalHabits = habits.length;
  const weeklyCompletion = totalHabits > 0 ? Math.round((habitsDoneToday / totalHabits) * 100) : 0;

  return {
    habits,
    loading,
    weeklyCompletion,
    history, // Placeholder for now
    toggleHabit,
    addHabit,
    updateHabit,
    deleteHabit
  };
};
