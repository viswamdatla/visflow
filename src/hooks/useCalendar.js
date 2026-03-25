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
  setDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export const useCalendar = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [journals, setJournals] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setEvents([]);
      setJournals({});
      setLoading(false);
      return;
    }

    // 1. Listen to Events
    const eventsRef = collection(db, `users/${user.uid}/events`);
    const qEvents = query(eventsRef, orderBy('date', 'asc'));
    const unsubscribeEvents = onSnapshot(qEvents, (snapshot) => {
      const eventList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvents(eventList);
    });

    // 2. Listen to Journals
    const journalsRef = collection(db, `users/${user.uid}/journals`);
    const unsubscribeJournals = onSnapshot(journalsRef, (snapshot) => {
      const journalMap = {};
      snapshot.forEach(doc => {
        journalMap[doc.id] = doc.data().content;
      });
      setJournals(journalMap);
      setLoading(false);
    });

    return () => {
      unsubscribeEvents();
      unsubscribeJournals();
    };
  }, [user]);

  const addEvent = async (event) => {
    if (!user) return;
    try {
      const eventsRef = collection(db, `users/${user.uid}/events`);
      await addDoc(eventsRef, {
        ...event,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const updateEvent = async (eventId, updatedEvent) => {
    if (!user) return;
    try {
      const eventRef = doc(db, `users/${user.uid}/events`, eventId);
      await updateDoc(eventRef, { ...updatedEvent });
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const deleteEvent = async (eventId) => {
    if (!user) return;
    try {
      const eventRef = doc(db, `users/${user.uid}/events`, eventId);
      await deleteDoc(eventRef);
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const saveJournal = async (date, content) => {
    if (!user) return;
    try {
      const journalRef = doc(db, `users/${user.uid}/journals`, date);
      await setDoc(journalRef, {
        content,
        date,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving journal:', error);
    }
  };

  const getEventsForDate = (dateString) => {
    return events.filter(e => e.date === dateString);
  };

  const getJournalForDate = (dateString) => {
    return journals[dateString] || '';
  };

  const hasEventOnDate = (dateString) => {
    return events.some(e => e.date === dateString);
  };

  return {
    events,
    journals,
    loading,
    addEvent,
    updateEvent,
    deleteEvent,
    saveJournal,
    getJournalForDate,
    getEventsForDate,
    hasEventOnDate,
  };
};
