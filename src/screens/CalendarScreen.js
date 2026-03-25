import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { theme } from '../theme/editorial';
import { useCalendar } from '../hooks/useCalendar';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';

const CalendarScreen = () => {
  const navigation = useNavigation();
  const calendar = useCalendar();
  const [selectedDay, setSelectedDay] = useState('25'); // Day of the month
  const [isJournalVisible, setIsJournalVisible] = useState(false);
  const [journalContent, setJournalContent] = useState('');

  const fullDateKey = `2026-03-${selectedDay.padStart(2, '0')}`;
  const existingJournal = calendar.getJournalForDate(fullDateKey);

  const handleOpenJournal = () => {
    setJournalContent(existingJournal);
    setIsJournalVisible(true);
  };

  const handleSaveJournal = () => {
    calendar.saveJournal(fullDateKey, journalContent);
    setIsJournalVisible(false);
  };

  const [isEventVisible, setIsEventVisible] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventTime, setEventTime] = useState('09:00 AM');
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];
  const periods = ['AM', 'PM'];

  const [selHour, selMin, selPeriod] = eventTime.split(/[: ]/);

  const updateTime = (h, m, p) => {
    setEventTime(`${h}:${m} ${p}`);
  };

  const eventsForDay = calendar.getEventsForDate(fullDateKey);

  const handleCreateEvent = () => {
    if (eventTitle.trim()) {
      if (editingEventId) {
        calendar.updateEvent(editingEventId, {
          title: eventTitle,
          time: eventTime,
        });
      } else {
        calendar.addEvent({
          date: fullDateKey,
          title: eventTitle,
          time: eventTime,
        });
      }
      resetEventModal();
    }
  };

  const resetEventModal = () => {
    setEventTitle('');
    setEventTime('09:00 AM');
    setEditingEventId(null);
    setIsEventVisible(false);
    setIsTimePickerVisible(false);
  };

  const handleEditPress = (event) => {
    setEditingEventId(event.id);
    setEventTitle(event.title);
    setEventTime(event.time || '09:00 AM');
    setIsEventVisible(true);
  };

  const daysLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  
  const getDayName = (day) => {
    const date = new Date(2026, 2, parseInt(day)); // March is index 2
    return date.toLocaleString('en-US', { weekday: 'long' }).toUpperCase();
  };
  
  // Dates for March 2026 (starts on Sunday, but our mockup starts with 23 Mon)
  const dates = [
    { value: '23', muted: true }, { value: '24', muted: true }, { value: '25', muted: true }, { value: '26', muted: true }, { value: '27', muted: true }, { value: '28', muted: true }, { value: '1', current: true },
    { value: '2', current: true }, { value: '3', current: true }, { value: '4', current: true }, { value: '5', current: true }, { value: '6', current: true, dot: true }, { value: '7', current: true }, { value: '8', current: true },
    { value: '9', current: true }, { value: '10', current: true }, { value: '11', current: true }, { value: '12', current: true }, { value: '13', current: true }, { value: '14', current: true }, { value: '15', current: true },
    { value: '16', current: true }, { value: '17', current: true, dot: true }, { value: '18', current: true }, { value: '19', current: true }, { value: '20', current: true }, { value: '21', current: true }, { value: '22', current: true },
    { value: '23', current: true }, { value: '24', current: true }, { value: '25', current: true, selected: true }, { value: '26', current: true }, { value: '27', current: true }, { value: '28', current: true }, { value: '29', current: true },
    { value: '30', current: true }, { value: '31', current: true }, { value: '1', muted: true }, { value: '2', muted: true }, { value: '3', muted: true }, { value: '4', muted: true }, { value: '5', muted: true }
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Top Header */}
        <View style={styles.topHeader}>
           <View style={styles.topHeaderLeft}>
             <Image source={{ uri: 'https://i.pravatar.cc/150?u=julian' }} style={styles.avatar} />
             <Text style={styles.vishflowTitle}>vishflow</Text>
           </View>
           <TouchableOpacity style={styles.settingsIcon}>
             <Ionicons name="settings-sharp" size={20} color={theme.colors.text} />
           </TouchableOpacity>
        </View>

        {/* Section Title */}
        <View style={styles.titleSection}>
          <Text style={styles.titleLabel}>TEMPORAL VIEW</Text>
          <Text style={styles.titleText}>
            Calendar <Text style={styles.titleDivider}>/</Text> 03.26
          </Text>
          <Text style={styles.titleDescription}>
            A curated sequence of your days. Orchestrate your time with intentional pauses and focused deep work.
          </Text>
        </View>

        {/* Calendar Card */}
        <View style={styles.calendarCard}>
           <View style={styles.calendarHeader}>
              <Text style={styles.monthName}>March 2026</Text>
              <View style={styles.arrowContainer}>
                <TouchableOpacity style={styles.arrowBtn}>
                  <Ionicons name="chevron-back" size={14} color={theme.colors.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.arrowBtn, { marginLeft: 15 }]}>
                  <Ionicons name="chevron-forward" size={14} color={theme.colors.textMuted} />
                </TouchableOpacity>
              </View>
           </View>

           <View style={styles.daysLabelsRow}>
              {daysLabels.map(label => (
                <Text key={label} style={styles.dayLabelText}>{label}</Text>
              ))}
           </View>

            <View style={styles.datesGrid}>
              {dates.map((item, index) => {
                const isSelected = item.value === selectedDay && item.current;
                const hasEvent = calendar.events.some(e => e.date === `2026-03-${item.value.padStart(2, '0')}`);
                
                return (
                  <TouchableOpacity 
                     key={index} 
                     style={[
                       styles.dateCell, 
                       isSelected && styles.selectedDateCell
                     ]}
                     onPress={() => setSelectedDay(item.value)}
                  >
                    <Text style={[
                      styles.dateNumber,
                      item.muted && styles.mutedDate,
                      isSelected && styles.selectedDateText
                    ]}>
                      {item.value}
                    </Text>
                    {(item.dot || hasEvent) && !isSelected && <View style={styles.dot} />}
                  </TouchableOpacity>
                );
              })}
            </View>
        </View>

        {/* Selected Day Agenda Header */}
        <View style={styles.agendaHeader}>
            <View>
              <Text style={styles.dayLabelSmall}>{getDayName(selectedDay)}</Text>
              <Text style={styles.fullDateText}>March {selectedDay}, 2026</Text>
            </View>
            <TouchableOpacity onPress={handleOpenJournal}>
              <Text style={[
                styles.journalLink,
                existingJournal && { color: theme.colors.text, borderBottomColor: theme.colors.text }
              ]}>
                {existingJournal ? 'EDIT JOURNAL' : 'DAILY JOURNAL'}
              </Text>
            </TouchableOpacity>
        </View>

        {/* Agenda Section */}
        <View style={styles.agendaContent}>
          {eventsForDay.length > 0 ? (
            eventsForDay.map((event, index) => (
              <View key={event.id || index} style={styles.eventCard}>
                <View style={styles.eventTimeContainer}>
                  <Text style={styles.eventTimeText}>{event.time || 'All Day'}</Text>
                  <View style={styles.eventTimelineDot} />
                </View>
                <View style={styles.eventInfoContainer}>
                  <Text style={styles.eventTitleText}>{event.title}</Text>
                  <Text style={styles.eventCategoryText}>Personal Focus</Text>
                </View>

                {/* Edit / Delete Icons */}
                <View style={styles.eventActions}>
                  <TouchableOpacity 
                    style={styles.actionIconBtn} 
                    onPress={() => handleEditPress(event)}
                  >
                    <MaterialIcons name="edit" size={16} color={theme.colors.textMuted} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionIconBtn, { marginLeft: 10 }]} 
                    onPress={() => calendar.deleteEvent(event.id)}
                  >
                    <MaterialIcons name="delete-outline" size={18} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyAgendaCard}>
                <View style={styles.emptyIconContainer}>
                   <Ionicons name="calendar-outline" size={40} color="#ccc" />
                </View>
                <Text style={styles.emptyTextTitle}>No events on this day</Text>
                <Text style={styles.emptyTextDesc}>
                  Take this time for restoration or unplanned creativity.
                </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.newEventBtn} onPress={() => setIsEventVisible(true)}>
               <Ionicons name="add" size={18} color="#fff" />
               <Text style={styles.newEventText}>NEW EVENT</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.googleConnectBtn}>
               <View style={styles.googleIconContainer}>
                   <Image 
                     source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' }} 
                     style={styles.googleIcon} 
                   />
               </View>
               <Text style={styles.googleConnectText}>Connect Google Calendar</Text>
            </TouchableOpacity>
        </View>

        {/* Journal Modal */}
        <Modal
          visible={isJournalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setIsJournalVisible(false)}
        >
          <SafeAreaView style={styles.modalSafeArea}>
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1 }}
            >
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setIsJournalVisible(false)}>
                  <Text style={styles.modalCloseBtn}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Daily Reflection</Text>
                <TouchableOpacity onPress={handleSaveJournal}>
                  <Text style={styles.modalSaveBtn}>Save</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.journalScrollView}>
                <Text style={styles.journalDateHeader}>March {selectedDay}, 2026</Text>
                <TextInput
                  style={styles.journalInput}
                  multiline
                  placeholder="What's on your mind today?"
                  placeholderTextColor="#999"
                  value={journalContent}
                  onChangeText={setJournalContent}
                  autoFocus
                />
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </Modal>

        {/* New Event Modal */}
        <Modal
          visible={isEventVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={resetEventModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.eventModalContent}>
              <View style={styles.modalHeaderMinimal}>
                <Text style={styles.modalTitleMinimal}>
                  {editingEventId ? 'REVISE SEQUENCE' : 'NEW SEQUENCE'}
                </Text>
                <TouchableOpacity onPress={resetEventModal}>
                  <Ionicons name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.eventTitleInput}
                placeholder="Event Title"
                placeholderTextColor="#999"
                value={eventTitle}
                onChangeText={setEventTitle}
                autoFocus
              />

              <View style={styles.eventMetaRow}>
                <Ionicons name="time-outline" size={18} color={theme.colors.textMuted} />
                <TouchableOpacity 
                  style={styles.timeSelectorTrigger}
                  onPress={() => setIsTimePickerVisible(!isTimePickerVisible)}
                >
                  <Text style={styles.selectedTimeText}>{eventTime}</Text>
                  <Ionicons 
                    name={isTimePickerVisible ? "chevron-up" : "chevron-down"} 
                    size={14} 
                    color={theme.colors.textMuted} 
                  />
                </TouchableOpacity>
              </View>

              {isTimePickerVisible && (
                <View style={styles.timePickerDropdown}>
                  <View style={styles.timePickerColumn}>
                    <Text style={styles.columnLabel}>HR</Text>
                    <ScrollView style={styles.columnScroll} showsVerticalScrollIndicator={false}>
                      {hours.map(h => (
                        <TouchableOpacity key={h} onPress={() => updateTime(h, selMin, selPeriod)}>
                          <Text style={[styles.columnItem, h === selHour && styles.activeItem]}>{h}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                  <View style={styles.timePickerColumn}>
                    <Text style={styles.columnLabel}>MIN</Text>
                    <ScrollView style={styles.columnScroll} showsVerticalScrollIndicator={false}>
                      {minutes.map(m => (
                        <TouchableOpacity key={m} onPress={() => updateTime(selHour, m, selPeriod)}>
                          <Text style={[styles.columnItem, m === selMin && styles.activeItem]}>{m}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                  <View style={styles.timePickerColumn}>
                    <Text style={styles.columnLabel}>PERIOD</Text>
                    <View style={styles.columnAction}>
                      {periods.map(p => (
                        <TouchableOpacity key={p} onPress={() => updateTime(selHour, selMin, p)}>
                          <Text style={[styles.columnItem, p === selPeriod && styles.activeItem]}>{p}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              )}

              <TouchableOpacity 
                style={[styles.createEventSubmitBtn, isTimePickerVisible && { marginTop: 20 }]} 
                onPress={handleCreateEvent}
              >
                <Text style={styles.createEventSubmitText}>
                  {editingEventId ? 'PROTOCOL UPDATE' : 'PROTOCOL CREATE'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    paddingBottom: 40,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
    paddingTop: 20,
    marginBottom: 40,
  },
  topHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 6,
    marginRight: 15,
  },
  vishflowTitle: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: 18,
    color: theme.colors.text,
  },
  settingsIcon: {
    padding: 5,
  },
  titleSection: {
    paddingHorizontal: 25,
    marginBottom: 40,
  },
  titleLabel: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 9,
    letterSpacing: 1.5,
    color: '#ccc',
    marginBottom: 10,
  },
  titleText: {
    fontFamily: theme.fonts.serif,
    fontSize: 42,
    color: theme.colors.text,
    marginBottom: 15,
  },
  titleDivider: {
    fontFamily: theme.fonts.serifItalic,
    color: '#ccc',
  },
  titleDescription: {
    fontFamily: theme.fonts.sans,
    fontSize: 14,
    color: theme.colors.textMuted,
    lineHeight: 22,
    paddingRight: 40,
  },
  calendarCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 25,
    marginHorizontal: 25,
    marginBottom: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.03,
    shadowRadius: 15,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#eee',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  monthName: {
    fontFamily: theme.fonts.serif,
    fontSize: 24,
    color: theme.colors.text,
  },
  arrowContainer: {
    flexDirection: 'row',
  },
  arrowBtn: {
    padding: 5,
  },
  daysLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dayLabelText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 9,
    color: '#ccc',
    width: 40,
    textAlign: 'center',
  },
  datesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dateCell: {
    width: `${100 / 7}%`,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  selectedDateCell: {
    backgroundColor: theme.colors.text,
    borderRadius: 8,
  },
  dateNumber: {
    fontFamily: theme.fonts.serif,
    fontSize: 16,
    color: theme.colors.text,
  },
  mutedDate: {
    color: '#eee',
  },
  selectedDateText: {
    color: '#fff',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#333',
    position: 'absolute',
    bottom: 8,
  },
  agendaHeader: {
    paddingHorizontal: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  dayLabelSmall: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 9,
    color: '#ccc',
    marginBottom: 4,
  },
  fullDateText: {
    fontFamily: theme.fonts.serif,
    fontSize: 24,
    color: theme.colors.text,
  },
  journalLink: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 9,
    color: '#ccc',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 4,
  },
  emptyAgendaCard: {
    backgroundColor: '#f6f5f0',
    marginHorizontal: 25,
    borderRadius: 16,
    paddingVertical: 40,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginBottom: 40,
  },
  emptyIconContainer: {
    marginBottom: 20,
  },
  emptyTextTitle: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 10,
  },
  emptyTextDesc: {
    fontFamily: theme.fonts.sans,
    fontSize: 13,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionButtons: {
    paddingHorizontal: 25,
  },
  newEventBtn: {
    backgroundColor: '#343831',
    borderRadius: 12,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  newEventText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 12,
    color: '#fff',
    letterSpacing: 1,
    marginLeft: 8,
  },
  googleConnectBtn: {
    backgroundColor: '#fff',
    borderRadius: 12,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  googleIconContainer: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleIcon: {
    width: '100%',
    height: '100%',
  },
  googleConnectText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 12,
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontFamily: theme.fonts.serif,
    fontSize: 18,
    color: theme.colors.text,
  },
  modalCloseBtn: {
    fontFamily: theme.fonts.sans,
    fontSize: 16,
    color: theme.colors.textMuted,
  },
  modalSaveBtn: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: 16,
    color: '#000',
  },
  journalScrollView: {
    flex: 1,
    padding: 25,
  },
  journalDateHeader: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 10,
    color: '#ccc',
    letterSpacing: 1.5,
    marginBottom: 15,
  },
  journalInput: {
    fontFamily: theme.fonts.serif,
    fontSize: 20,
    color: theme.colors.text,
    lineHeight: 30,
    minHeight: 300,
    textAlignVertical: 'top',
  },
  agendaContent: {
    paddingHorizontal: 25,
    marginBottom: 40,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
  },
  eventTimeContainer: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#f0f0f0',
    marginRight: 20,
  },
  eventTimeText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 10,
    color: theme.colors.text,
  },
  eventTimelineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#343831',
    marginTop: 8,
  },
  eventInfoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  eventTitleText: {
    fontFamily: theme.fonts.serif,
    fontSize: 18,
    color: theme.colors.text,
    marginBottom: 4,
  },
  eventCategoryText: {
    fontFamily: theme.fonts.sans,
    fontSize: 11,
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
  },
  eventActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
  },
  actionIconBtn: {
    padding: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 25,
  },
  eventModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 10,
  },
  modalHeaderMinimal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  modalTitleMinimal: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 12,
    color: '#ccc',
    letterSpacing: 2,
  },
  eventTitleInput: {
    fontFamily: theme.fonts.serif,
    fontSize: 28,
    color: theme.colors.text,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 15,
    marginBottom: 25,
  },
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  timeSelectorTrigger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedTimeText: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: 16,
    color: theme.colors.text,
  },
  timePickerDropdown: {
    flexDirection: 'row',
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    height: 180,
    borderWidth: 1,
    borderColor: '#eee',
  },
  timePickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  columnLabel: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 8,
    color: '#ccc',
    letterSpacing: 1,
    marginBottom: 10,
  },
  columnScroll: {
    flex: 1,
    width: '100%',
  },
  columnAction: {
    flex: 1,
    justifyContent: 'center',
  },
  columnItem: {
    fontFamily: theme.fonts.sans,
    fontSize: 16,
    color: theme.colors.textMuted,
    paddingVertical: 8,
    textAlign: 'center',
  },
  activeItem: {
    fontFamily: theme.fonts.sansBold,
    color: theme.colors.text,
    fontSize: 18,
  },
  createEventSubmitBtn: {
    backgroundColor: '#000',
    borderRadius: 12,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createEventSubmitText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 12,
    color: '#fff',
    letterSpacing: 2,
  },
});

export default CalendarScreen;
