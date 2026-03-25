import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, TextInput, Modal, Alert, Platform } from 'react-native';
import { theme } from '../theme/editorial';
import { useGoals } from '../hooks/useGoals';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const GOAL_COLORS = [
  { name: 'Terracotta', color: '#cc7e6a' },
  { name: 'Forest', color: '#2ecc71' },
  { name: 'Sky', color: '#3498db' },
  { name: 'Gold', color: '#f1c40f' },
  { name: 'Rose', color: '#e74c3c' },
];

const EMOJI_PRESETS = ['🎯', '🏔️', '🎨', '📘', '🧘', '🎸', '🏃', '💻', '🏠', '📈'];

const GoalsScreen = () => {
  const { goals, updateGoalProgress, createGoal, updateGoal, deleteGoal } = useGoals();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState(null);
  
  // New Goal Form State
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [targetDate, setTargetDate] = useState('25-03-2026');
  const [selectedEmoji, setSelectedEmoji] = useState('🎯');
  const [selectedColor, setSelectedColor] = useState(GOAL_COLORS[0]);
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleCreateGoal = async () => {
    if (!title) return;
    try {
      if (editingGoalId) {
        await updateGoal(editingGoalId, {
          title,
          emoji: selectedEmoji,
          accentColor: selectedColor.color,
          targetAmount: parseFloat(targetAmount) || 0,
          currentProgress: parseFloat(currentAmount) || 0,
          targetDate
        });
      } else {
        await createGoal({
          title,
          emoji: selectedEmoji,
          accentColor: selectedColor.color,
          targetAmount: parseFloat(targetAmount) || 0,
          currentProgress: parseFloat(currentAmount) || 0,
          targetDate
        });
      }
      setIsModalVisible(false);
      resetForm();
    } catch (error) {
      console.error("Error saving goal:", error);
    }
  };

  const handleEditPress = (goal) => {
    setEditingGoalId(goal.id);
    setTitle(goal.title);
    setTargetAmount(goal.targetAmount?.toString() || '');
    setCurrentAmount(goal.currentAmount?.toString() || '0');
    setTargetDate(goal.targetDate || '25-03-2026');
    setSelectedEmoji(goal.icon || '🎯');
    
    const colorObj = GOAL_COLORS.find(c => c.color === goal.accentColor) || GOAL_COLORS[0];
    setSelectedColor(colorObj);
    setIsModalVisible(true);
  };

  const handleDeleteGoal = (id) => {
    console.log("GoalsScreen: handleDeleteGoal triggered for id:", id);
    if (Platform.OS === 'web') {
      const confirmed = window.confirm("Are you sure you want to remove this aspiration?");
      if (confirmed) {
        console.log("GoalsScreen: Web confirm successful for id:", id);
        deleteGoal(id);
      }
      return;
    }

    Alert.alert(
      "Delete Goal",
      "Are you sure you want to remove this aspiration?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            console.log("GoalsScreen: Alert confirm successful for id:", id);
            await deleteGoal(id);
          } 
        }
      ]
    );
  };

  const resetForm = () => {
    setTitle('');
    setTargetAmount('');
    setCurrentAmount('0');
    setSelectedEmoji('🎯');
    setSelectedColor(GOAL_COLORS[0]);
    setEditingGoalId(null);
  };

  const renderCalendar = () => {
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const dayLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    return (
      <Modal
        visible={isCalendarVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsCalendarVisible(false)}
      >
        <TouchableOpacity 
          style={styles.calendarOverlay} 
          activeOpacity={1}
          onPress={() => setIsCalendarVisible(false)}
        >
          <View style={styles.calendarContainer}>
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarMonthTitle}>MARCH 2026</Text>
              <TouchableOpacity onPress={() => setIsCalendarVisible(false)}>
                <Ionicons name="close" size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.calendarDaysHeader}>
              {dayLabels.map(label => (
                <Text key={label} style={styles.calendarDayLabel}>{label}</Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {days.map(day => (
                <TouchableOpacity 
                  key={day} 
                  style={[styles.calendarDayCell, day === 25 && styles.calendarTodayCell]}
                  onPress={() => {
                    setTargetDate(`${day < 10 ? '0' + day : day}-03-2026`);
                    setIsCalendarVisible(false);
                  }}
                >
                  <Text style={[styles.calendarDayText, day === 25 && { color: theme.colors.primary }]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={styles.calendarCloseBtn}
              onPress={() => setIsCalendarVisible(false)}
            >
              <Text style={styles.calendarCloseText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerLabel}>PERSONAL ASPIRATIONS</Text>
              <Text style={styles.headerTitle}>
                Goals <Text style={styles.headerItalic}>& milestones</Text>
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.addBtn} 
              onPress={() => setIsModalVisible(true)}
            >
              <Ionicons name="add" size={28} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Goals List */}
        <View style={styles.goalsList}>
          {goals.map(goal => (
            <GoalCard 
              key={goal.id} 
              goal={goal} 
              onAdd={() => updateGoalProgress(goal.id, Math.min(1, goal.progress + 0.1))} 
              onEdit={() => handleEditPress(goal)}
              onDelete={() => handleDeleteGoal(goal.id)}
            />
          ))}
        </View>

        {/* Quote Section */}
        <View style={styles.quoteSection}>
          <View style={styles.quoteDivider} />
          <Text style={styles.quoteText}>
            "The secret of getting ahead is getting started."
          </Text>
          <Text style={styles.quoteAuthor}>— MARK TWAIN</Text>
        </View>

      </ScrollView>

      {/* Create Goal Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingGoalId ? 'Edit Goal' : 'Create New Goal'}</Text>

            <View style={[styles.formRow, { zIndex: 100 }]}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>EMOJI</Text>
                <TouchableOpacity 
                  style={styles.emojiPicker}
                  onPress={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <Text style={{ fontSize: 24 }}>{selectedEmoji}</Text>
                </TouchableOpacity>

                {showEmojiPicker && (
                  <View style={styles.emojiDropdown}>
                    {EMOJI_PRESETS.map(e => (
                      <TouchableOpacity 
                        key={e} 
                        style={styles.emojiOption}
                        onPress={() => {
                          setSelectedEmoji(e);
                          setShowEmojiPicker(false);
                        }}
                      >
                        <Text style={{ fontSize: 20 }}>{e}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              
              <View style={[styles.inputGroup, { flex: 2, marginLeft: 15 }]}>
                <Text style={styles.inputLabel}>CATEGORY COLOR</Text>
                <TouchableOpacity 
                  style={styles.colorPickerTrigger}
                  onPress={() => setShowColorDropdown(!showColorDropdown)}
                >
                  <View style={[styles.colorCircle, { backgroundColor: selectedColor.color }]} />
                  <Text style={styles.colorName}>{selectedColor.name}</Text>
                  <Ionicons name="chevron-down" size={16} color="#666" />
                </TouchableOpacity>
                
                {showColorDropdown && (
                  <View style={styles.colorDropdown}>
                    {GOAL_COLORS.map(c => (
                      <TouchableOpacity 
                        key={c.name} 
                        style={styles.dropdownOption}
                        onPress={() => {
                          setSelectedColor(c);
                          setShowColorDropdown(false);
                        }}
                      >
                        <View style={[styles.colorCircle, { backgroundColor: c.color, width: 14, height: 14 }]} />
                        <Text style={styles.dropdownOptionText}>{c.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            <View style={[styles.inputGroup, { zIndex: 50 }]}>
              <Text style={styles.inputLabel}>GOAL TITLE</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="e.g. Emergency Fund"
                placeholderTextColor={theme.colors.textMuted}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={[styles.formRow, { zIndex: 10 }]}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>TARGET (₹ OR UNITS)</Text>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder="100000"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="numeric"
                  value={targetAmount}
                  onChangeText={setTargetAmount}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 15 }]}>
                <Text style={styles.inputLabel}>CURRENT PROGRESS</Text>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder="0"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="numeric"
                  value={currentAmount}
                  onChangeText={setCurrentAmount}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>TARGET DATE</Text>
              <View style={styles.dateInputContainer}>
                <TextInput
                  style={[styles.modalTextInput, { flex: 1, backgroundColor: 'transparent' }]}
                  value={targetDate}
                  onChangeText={setTargetDate}
                  placeholder="DD-MM-YYYY"
                  placeholderTextColor={theme.colors.textMuted}
                />
                <TouchableOpacity 
                  style={styles.dateIconContainer} 
                  onPress={() => setIsCalendarVisible(true)}
                >
                  <Ionicons name="calendar-outline" size={20} color="#333" />
                </TouchableOpacity>
              </View>
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
                onPress={handleCreateGoal}
              >
                <Text style={styles.modalCreateBtnText}>{editingGoalId ? 'Save Changes' : 'Create Goal'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {renderCalendar()}
    </SafeAreaView>
  );
};

const GoalCard = ({ goal, onAdd, onEdit, onDelete }) => {
  return (
    <View style={[styles.goalCard, { borderTopColor: goal.accentColor }]}>
      <View style={styles.cardHeader}>
        <View style={styles.headerMain}>
          <Text style={styles.goalIcon}>{goal.icon}</Text>
          <View style={styles.headerInfo}>
            {goal.isPrimary && (
              <View style={styles.primaryBadge}>
                <Text style={styles.primaryBadgeText}>PRIMARY FOCUS</Text>
              </View>
            )}
            {goal.daysLeft && !goal.isPrimary && (
              <Text style={styles.statusText}>{goal.daysLeft}</Text>
            )}
            {goal.target && goal.isPrimary && (
              <Text style={styles.statusText}>TARGET: {goal.target} • {goal.daysLeft}</Text>
            )}
            {goal.target && !goal.isPrimary && (
              <Text style={styles.statusText}>{goal.target}</Text>
            )}
            {goal.consistency && (
              <Text style={styles.statusText}>{goal.consistency}</Text>
            )}
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerActionBtn} 
            onPress={onEdit}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="create-outline" size={18} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerActionBtn} 
            onPress={onDelete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={18} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.goalTitle}>{goal.title}</Text>

      <View style={styles.progressRow}>
        <Text style={styles.progressLabel}>{goal.progressLabel}</Text>
        <Text style={styles.progressPercent}>{Math.round(goal.progress * 100)}%</Text>
      </View>

      <View style={styles.progressBarBg}>
        <View 
          style={[
            styles.progressBarFill, 
            { width: `${goal.progress * 100}%`, backgroundColor: goal.accentColor }
          ]} 
        />
      </View>

      <View style={styles.actionRow}>
        <TextInput 
          style={styles.input} 
          placeholder={goal.inputPlaceholder} 
          placeholderTextColor="#ccc"
        />
        <TouchableOpacity 
          style={[
            styles.actionBtn, 
            goal.actionLabel === 'ADD PROGRESS' ? styles.actionBtnLight : styles.actionBtnDark
          ]}
          onPress={onAdd}
        >
          <Text style={[
            styles.actionBtnText, 
            goal.actionLabel === 'ADD PROGRESS' ? styles.actionBtnTextLight : styles.actionBtnTextDark
          ]}>
            {goal.actionLabel}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    paddingBottom: 60,
  },
  header: {
    paddingHorizontal: 25,
    paddingTop: 30,
    marginBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  headerLabel: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 9,
    letterSpacing: 2,
    color: theme.colors.textMuted,
    marginBottom: 10,
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
  goalsList: {
    paddingHorizontal: 20,
  },
  goalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
    borderTopWidth: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerMain: {
    flexDirection: 'row',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 15,
  },
  headerActionBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f9f8f3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  headerInfo: {
    alignItems: 'flex-end',
  },
  primaryBadge: {
    backgroundColor: '#e8e7df',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
  },
  primaryBadgeText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 9,
    color: theme.colors.textMuted,
  },
  statusText: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: 9,
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
  },
  goalTitle: {
    fontFamily: theme.fonts.serif,
    fontSize: 28,
    color: theme.colors.text,
    marginBottom: 25,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  progressLabel: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 9,
    color: theme.colors.textMuted,
    letterSpacing: 1,
  },
  progressPercent: {
    fontFamily: theme.fonts.serif,
    fontSize: 22,
    color: theme.colors.text,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#f5f4ef',
    borderRadius: 2,
    marginBottom: 25,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  input: {
    flex: 1,
    flexShrink: 1,
    backgroundColor: '#f6f5f0',
    borderRadius: 6,
    paddingHorizontal: 15,
    fontFamily: theme.fonts.sans,
    fontSize: 14,
    height: 44,
  },
  actionBtn: {
    paddingHorizontal: 8,
    justifyContent: 'center',
    borderRadius: 6,
    height: 44,
  },
  actionBtnDark: {
    backgroundColor: theme.colors.primary,
  },
  actionBtnLight: {
    backgroundColor: '#e8e7df',
    alignItems: 'center',
  },
  actionBtnText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 8,
    letterSpacing: 0.5,
  },
  actionBtnTextDark: {
    color: '#fff',
  },
  actionBtnTextLight: {
    color: theme.colors.textMuted,
  },
  quoteSection: {
    marginTop: 40,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  quoteDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#eee',
    marginBottom: 30,
  },
  quoteText: {
    fontFamily: theme.fonts.serifItalic,
    fontSize: 20,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 15,
  },
  quoteAuthor: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 9,
    letterSpacing: 2,
    color: '#ccc',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
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
    marginBottom: 30,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    zIndex: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 9,
    color: theme.colors.textMuted,
    letterSpacing: 1,
    marginBottom: 10,
  },
  emojiPicker: {
    backgroundColor: '#f6f5f0',
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  colorPickerTrigger: {
    backgroundColor: '#f6f5f0',
    height: 50,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  colorCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 10,
  },
  colorName: {
    flex: 1,
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: 14,
    color: theme.colors.text,
  },
  colorDropdown: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 100,
    padding: 5,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  dropdownOptionText: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  modalTextInput: {
    backgroundColor: '#f6f5f0',
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: 14,
    color: theme.colors.textSecondary,
    borderWidth: 1,
    borderColor: '#eee',
  },
  dateInputContainer: {
    backgroundColor: '#f6f5f0',
    height: 50,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
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
    color: theme.colors.textSecondary,
  },
  modalCreateBtn: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  modalCreateBtnText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 14,
    color: '#fff',
  },
  // Calendar Styles
  calendarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    width: 320,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarMonthTitle: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 14,
    color: theme.colors.text,
    letterSpacing: 1,
  },
  calendarDaysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  calendarDayLabel: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 10,
    color: '#ccc',
    width: 35,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  calendarDayCell: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 1,
    borderRadius: 20,
  },
  calendarDayText: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: 13,
    color: theme.colors.text,
  },
  calendarTodayCell: {
    backgroundColor: '#f6f5f0',
    borderWidth: 1,
    borderColor: '#eee',
  },
  calendarCloseBtn: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  calendarCloseText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 12,
    color: theme.colors.text,
    letterSpacing: 1,
  },
  dateIconContainer: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  emojiDropdown: {
    position: 'absolute',
    top: 80,
    left: 0,
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 100,
    padding: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  emojiOption: {
    width: 35,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    backgroundColor: '#f9f7f2',
  },
});

export default GoalsScreen;
