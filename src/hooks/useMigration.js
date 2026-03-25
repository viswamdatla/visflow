import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../services/firebase';
import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const MIGRATION_KEY = '@vishflow_migrated';

export const useMigration = () => {
  const { user } = useAuth();
  const [isMigrating, setIsMigrating] = useState(false);

  const migrate = async () => {
    if (!user || isMigrating) return;

    const alreadyMigrated = await AsyncStorage.getItem(MIGRATION_KEY);
    if (alreadyMigrated === 'true') return;

    setIsMigrating(true);
    console.log('Starting data migration to Firebase (vishflow)...');

    try {
      const batch = writeBatch(db);
      
      const getLegacyData = async (key) => {
        // Check current prefix, then recent rebrand, then legacy
        const vishKey = `@vishflow_${key}`;
        const visKey = `@visflow_${key}`;
        const lifeKey = `@lifeos_${key}`;
        
        const data = await AsyncStorage.getItem(vishKey) || 
                     await AsyncStorage.getItem(visKey) || 
                     await AsyncStorage.getItem(lifeKey);
        return data;
      };

      // 1. Migrate Tasks
      const tasksStr = await getLegacyData('tasks');
      if (tasksStr) {
        const tasks = JSON.parse(tasksStr);
        tasks.forEach(task => {
          const ref = doc(db, `users/${user.uid}/tasks`, task.id || Date.now().toString());
          batch.set(ref, task);
        });
      }

      // 2. Migrate Habits
      const habitsStr = await getLegacyData('habits');
      if (habitsStr) {
        const habits = JSON.parse(habitsStr);
        habits.forEach(habit => {
          const ref = doc(db, `users/${user.uid}/habits`, habit.id || Date.now().toString());
          batch.set(ref, habit);
        });
      }

      // 3. Migrate Calendar Events
      const eventsStr = await getLegacyData('calendar_events');
      if (eventsStr) {
        const events = JSON.parse(eventsStr);
        events.forEach(event => {
          const ref = doc(db, `users/${user.uid}/events`, event.id || Date.now().toString());
          batch.set(ref, event);
        });
      }

      // 4. Migrate Journals
      const journalsStr = await getLegacyData('calendar_journals');
      if (journalsStr) {
        const journals = JSON.parse(journalsStr);
        Object.entries(journals).forEach(([date, content]) => {
          const ref = doc(db, `users/${user.uid}/journals`, date);
          batch.set(ref, { content, date });
        });
      }

      await batch.commit();
      await AsyncStorage.setItem(MIGRATION_KEY, 'true');
      console.log('Migration complete!');
    } catch (error) {
      console.error('Migration failed:', error);
    } finally {
      setIsMigrating(false);
    }
  };

  useEffect(() => {
    if (user) {
      migrate();
    }
  }, [user]);

  return { isMigrating };
};
