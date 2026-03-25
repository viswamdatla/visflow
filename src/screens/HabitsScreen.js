import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Modal, TextInput, Alert, Platform } from 'react-native';
import { theme } from '../theme/editorial';
import { useHabits } from '../hooks/useHabits';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const HabitsScreen = () => {
  const { 
    habits,
    history,
    toggleHabit, 
    weeklyCompletion, 
    bestHabit, 
    thisWeekChecks,
    addHabit,
    updateHabit,
    deleteHabit
  } = useHabits();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState(null);
  const [habitTitle, setHabitTitle] = useState('');
  const [habitSubtitle, setHabitSubtitle] = useState('');
  const [habitIcon, setHabitIcon] = useState('✨');
  const [showIconPicker, setShowIconPicker] = useState(false);

  const ICON_PRESETS = ['✨', '💧', '🧘', '📖', '🍎', '🏃', '💻', '🎸', '🎨', '🧹'];

  const handleSaveHabit = async () => {
    if (!habitTitle) return;
    try {
      if (editingHabitId) {
        await updateHabit(editingHabitId, {
          title: habitTitle,
          subtitle: habitSubtitle.toUpperCase() || 'DAILY',
          icon: habitIcon
        });
      } else {
        await addHabit({
          title: habitTitle,
          subtitle: habitSubtitle.toUpperCase() || 'DAILY',
          icon: habitIcon
        });
      }
      setIsModalVisible(false);
      resetForm();
    } catch (error) {
      console.error("Error saving habit:", error);
    }
  };

  const handleEditPress = (habit) => {
    setEditingHabitId(habit.id);
    setHabitTitle(habit.title);
    setHabitSubtitle(habit.subtitle);
    setHabitIcon(habit.icon || '✨');
    setIsModalVisible(true);
  };

  const handleDeleteHabit = (id) => {
    console.log("HabitsScreen: handleDeleteHabit triggered for id:", id);
    if (Platform.OS === 'web') {
      const confirmed = window.confirm("Are you sure you want to remove this habit?");
      if (confirmed) {
        deleteHabit(id);
      }
      return;
    }

    Alert.alert(
      "Delete Habit",
      "Are you sure you want to remove this habit?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => deleteHabit(id)
        }
      ]
    );
  };

  const resetForm = () => {
    setHabitTitle('');
    setHabitSubtitle('');
    setHabitIcon('✨');
    setEditingHabitId(null);
  };

  const getWeeklyChartData = () => {
    const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const result = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayLabel = dayLabels[d.getDay()];
      const percentage = (history && history[dateKey]) || 0;
      result.push({
        label: dayLabel,
        percentage: percentage * 100,
        isToday: i === 0
      });
    }
    return result;
  };

  const weeklyChartData = getWeeklyChartData();

  const habitsDoneToday = (habits || []).filter(h => h.completedToday).length;
  const totalHabits = (habits || []).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.topHeader}>
          <View style={styles.profileBadge}>
            <View style={styles.innerProfile} />
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-sharp" size={18} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.headerTitle}>
            Habits <Text style={styles.headerItalic}>& streaks</Text>
          </Text>
          <Text style={styles.headerSub}>CURATING CONSISTENCY DAILY</Text>
        </View>

        {/* Weekly Completion Card */}
        <View style={styles.weeklyCard}>
          <View style={styles.daysContainer}>
            {weeklyChartData.map((day, index) => (
              <View key={index} style={styles.dayColumn}>
                <View style={styles.barContainer}>
                  <View style={[
                    styles.bar, 
                    { 
                      height: Math.max(5, (day.percentage / 100) * 40), 
                      opacity: day.isToday ? 1 : 0.3 + (day.percentage / 150)
                    }
                  ]} />
                </View>
                <Text style={[styles.dayText, day.isToday && { color: theme.colors.primary, fontFamily: theme.fonts.sansBold }]}>
                  {day.label}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.weeklyFooter}>
            <Text style={styles.weeklyLabel}>WEEKLY COMPLETION</Text>
            <Text style={styles.weeklyValue}>{weeklyCompletion || 0}%</Text>
          </View>
        </View>

        {/* Metrics Row */}
        <View style={styles.metricsRow}>
          <View style={styles.metricHalfCard}>
            <Text style={styles.metricSmallLabel}>TODAY DONE</Text>
            <Text style={styles.metricLargeValue}>
              {habitsDoneToday} <Text style={styles.metricSlash}>/ {totalHabits}</Text>
            </Text>
          </View>
          <View style={styles.metricHalfCard}>
            <Text style={styles.metricSmallLabel}>BEST HABIT</Text>
            <Text style={styles.bestHabitTitle}>{bestHabit?.title || 'None'}</Text>
            <View style={styles.streakBadge}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={styles.streakText}>{bestHabit?.streak || 0}D</Text>
            </View>
          </View>
        </View>

        {/* This Week Checks Card */}
        <View style={styles.checksCard}>
          <View>
            <Text style={styles.metricSmallLabel}>THIS WEEK CHECKS</Text>
            <Text style={styles.checksValue}>
              {thisWeekChecks || 0} <Text style={styles.checksSub}>completions</Text>
            </Text>
          </View>
          <TouchableOpacity style={styles.checkIconBtn}>
            <Ionicons name="checkmark-circle" size={24} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Daily Routine Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Daily Routine</Text>
          <TouchableOpacity onPress={() => setIsModalVisible(true)}>
            <Text style={styles.manageText}>ADD NEW</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.habitList}>
          {totalHabits > 0 ? (
            habits.map(item => (
              <HabitItem 
                key={item.id}
                title={item.title} 
                subtitle={item.subtitle} 
                streak={item.streak} 
                completed={item.completedToday}
                icon={item.icon}
                onPress={() => toggleHabit(item.id)}
                onEdit={() => handleEditPress(item)}
                onDelete={() => handleDeleteHabit(item.id)}
              />
            ))
          ) : (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="leaf-outline" size={48} color={theme.colors.textMuted} style={{ marginBottom: 15, opacity: 0.5 }} />
              <Text style={styles.emptyStateTitle}>Cultivating Consistency</Text>
              <Text style={styles.emptyStateText}>No habits active yet. Tap the button below to start your new daily routine.</Text>
            </View>
          )}
        </View>

        {/* Create Habit Modal */}
        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{editingHabitId ? 'Edit Habit' : 'New Habit'}</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>HABIT ICON</Text>
                <View style={styles.iconPickerRow}>
                  {ICON_PRESETS.map(icon => (
                    <TouchableOpacity 
                      key={icon} 
                      style={[styles.iconOption, habitIcon === icon && styles.iconOptionSelected]}
                      onPress={() => setHabitIcon(icon)}
                    >
                      <Text style={{ fontSize: 20 }}>{icon}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>HABIT TITLE</Text>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder="e.g. Early Morning Run"
                  placeholderTextColor={theme.colors.textMuted}
                  value={habitTitle}
                  onChangeText={setHabitTitle}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>FREQUENCY / SUBTITLE</Text>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder="e.g. 5KM DAILY"
                  placeholderTextColor={theme.colors.textMuted}
                  value={habitSubtitle}
                  onChangeText={setHabitSubtitle}
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.modalCancelBtn}
                  onPress={() => setIsModalVisible(false)}
                >
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.modalCreateBtn}
                  onPress={handleSaveHabit}
                >
                  <Text style={styles.modalCreateBtnText}>{editingHabitId ? 'Save Changes' : 'Create Habit'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </ScrollView>

      {/* Simplified Bottom Nav placeholder if needed, but App.js handles it */}
    </SafeAreaView>
  );
};

const HabitItem = ({ title, subtitle, streak, completed, icon, onPress, onEdit, onDelete }) => (
  <View style={styles.habitItemWrapper}>
    <TouchableOpacity 
      style={[styles.habitItem, completed && styles.habitItemCompleted]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.habitIconContainer}>
        <Text style={styles.habitIconEmoji}>{icon}</Text>
      </View>
      <View style={styles.habitDetails}>
        <Text style={styles.habitTitleText}>{title}</Text>
        <Text style={styles.habitSubtitleText}>
          {subtitle || 'DAILY'} • <Text style={[styles.streakInline, streak > 0 && { color: theme.colors.danger }]}>{streak}D STREAK</Text>
        </Text>
      </View>
      <View style={[styles.actionBtn, completed && styles.actionBtnCompleted]}>
        <Ionicons 
          name={completed ? "checkmark" : "add"} 
          size={20} 
          color={completed ? "#fff" : theme.colors.textMuted} 
        />
      </View>
    </TouchableOpacity>
    <View style={styles.habitActions}>
      <TouchableOpacity 
        style={styles.habitActionBtn} 
        onPress={onEdit}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="create-outline" size={16} color={theme.colors.textMuted} />
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.habitActionBtn} 
        onPress={onDelete}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="trash-outline" size={16} color="#e74c3c" />
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    paddingBottom: 100,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: 20,
    marginBottom: 30,
  },
  profileBadge: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  innerProfile: {
    width: 20,
    height: 20,
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    paddingHorizontal: 25,
    marginBottom: 30,
  },
  headerTitle: {
    fontFamily: theme.fonts.serif,
    fontSize: 42,
    color: theme.colors.text,
    lineHeight: 46,
  },
  headerItalic: {
    fontFamily: theme.fonts.serifItalic,
    color: theme.colors.textMuted,
  },
  headerSub: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 10,
    letterSpacing: 2,
    color: theme.colors.textMuted,
    marginTop: 8,
  },
  weeklyCard: {
    marginHorizontal: 25,
    backgroundColor: '#f6f5f0',
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
    paddingBottom: 10,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  dayColumn: {
    alignItems: 'center',
    width: 30,
  },
  barContainer: {
    height: 60,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: 4,
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  dayText: {
    fontFamily: theme.fonts.sans,
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  weeklyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weeklyLabel: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 10,
    letterSpacing: 1,
    color: theme.colors.textMuted,
  },
  weeklyValue: {
    fontFamily: theme.fonts.serifItalic,
    fontSize: 24,
    color: theme.colors.text,
  },
  metricsRow: {
    flexDirection: 'row',
    paddingHorizontal: 25,
    gap: 15,
    marginBottom: 15,
  },
  metricHalfCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  metricSmallLabel: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 9,
    letterSpacing: 1.5,
    color: theme.colors.textMuted,
    marginBottom: 12,
  },
  metricLargeValue: {
    fontFamily: theme.fonts.serif,
    fontSize: 32,
    color: theme.colors.text,
  },
  metricSlash: {
    fontSize: 18,
    color: '#ccc',
  },
  bestHabitTitle: {
    fontFamily: theme.fonts.serif,
    fontSize: 18,
    color: theme.colors.text,
    marginBottom: 8,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  streakText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  checksCard: {
    marginHorizontal: 25,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#eee',
  },
  checksValue: {
    fontFamily: theme.fonts.serif,
    fontSize: 24,
    color: theme.colors.text,
  },
  checksSub: {
    fontFamily: theme.fonts.serifItalic,
    fontSize: 20,
    color: theme.colors.textMuted,
  },
  checkIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: theme.fonts.serif,
    fontSize: 28,
    color: theme.colors.text,
  },
  manageText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 10,
    letterSpacing: 1,
    color: theme.colors.textMuted,
    textDecorationLine: 'underline',
  },
  habitList: {
    paddingHorizontal: 25,
  },
  habitItemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  habitItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f6',
    borderRadius: 12,
    padding: 16,
  },
  habitItemCompleted: {
    opacity: 0.8,
  },
  habitIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  habitIconEmoji: {
    fontSize: 20,
  },
  habitDetails: {
    flex: 1,
  },
  habitTitleText: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 2,
  },
  habitSubtitleText: {
    fontFamily: theme.fonts.sans,
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  streakInline: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 10,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#00000010',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnCompleted: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  habitActions: {
    flexDirection: 'row',
    marginLeft: 10,
    gap: 8,
  },
  habitActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: 24,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  modalTitle: {
    fontFamily: theme.fonts.serif,
    fontSize: 28,
    color: theme.colors.text,
    marginBottom: 25,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 9,
    color: theme.colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  iconPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  iconOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: '#f6f5f0',
  },
  modalTextInput: {
    backgroundColor: '#fff',
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: 14,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: '#eee',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 15,
  },
  modalCancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  modalCancelBtnText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  modalCreateBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  modalCreateBtnText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 14,
    color: '#fff',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 30,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eee',
    borderStyle: 'dashed',
  },
  emptyStateTitle: {
    fontFamily: theme.fonts.serif,
    fontSize: 20,
    color: theme.colors.text,
    marginBottom: 8,
  },
  emptyStateText: {
    fontFamily: theme.fonts.sans,
    fontSize: 13,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default HabitsScreen;
