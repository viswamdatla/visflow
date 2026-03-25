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
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export const useTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const tasksRef = collection(db, `users/${user.uid}/tasks`);
    const q = query(tasksRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTasks(taskList);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const addTask = async (taskData) => {
    if (!user) return;
    try {
      const tasksRef = collection(db, `users/${user.uid}/tasks`);
      await addDoc(tasksRef, {
        title: taskData.title,
        tag: taskData.tag || 'PERSONAL',
        priority: taskData.priority || 'Medium',
        dueDate: taskData.dueDate || 'NO DATE',
        status: 'todo',
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const toggleTaskStatus = async (id, newStatus) => {
    if (!user) return;
    try {
      const taskRef = doc(db, `users/${user.uid}/tasks`, id);
      await updateDoc(taskRef, { 
        status: newStatus, 
        completedAt: newStatus === 'completed' ? new Date().toISOString() : null 
      });
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  const deleteTask = async (id) => {
    if (!user) return;
    try {
      const taskRef = doc(db, `users/${user.uid}/tasks`, id);
      await deleteDoc(taskRef);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const updateTask = async (id, taskData) => {
    if (!user) return;
    try {
      const taskRef = doc(db, `users/${user.uid}/tasks`, id);
      await updateDoc(taskRef, { 
        title: taskData.title,
        tag: taskData.tag || 'PERSONAL',
        priority: taskData.priority || 'Medium',
        dueDate: taskData.dueDate || 'NO DATE'
      });
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    toggleTaskStatus,
    deleteTask
  };
};
