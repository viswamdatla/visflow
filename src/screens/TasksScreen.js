import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, TextInput, Modal, Alert, Platform } from 'react-native';
import { theme } from '../theme/editorial';
import { useTasks } from '../hooks/useTasks';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const PRIORITY_OPTIONS = [
  { label: 'High', color: '#e74c3c', icon: '🔴' },
  { label: 'Medium', color: '#f1c40f', icon: '🟡' },
  { label: 'Low', color: '#2ecc71', icon: '🟢' },
];

const TAG_OPTIONS = ['Job Hunt', 'Trading', 'Learning', 'Personal', 'Finance', 'Health', 'Projects', 'Other'];

const TasksScreen = () => {
  const { tasks, toggleTaskStatus, addTask, updateTask, deleteTask } = useTasks();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  // Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [selectedPriority, setSelectedPriority] = useState(PRIORITY_OPTIONS[1]);
  const [selectedTag, setSelectedTag] = useState(TAG_OPTIONS[0]);
  const [dueDate, setDueDate] = useState('25-03-2026');

  const inProgressTasks = (tasks || []).filter(t => t.status === 'in-progress');
  const todoTasks = (tasks || []).filter(t => t.status === 'todo');
  const completedTasks = (tasks || []).filter(t => t.status === 'completed');

  const handleAddTask = async () => {
    if (!taskTitle) return;
    try {
      if (editingTaskId) {
        await updateTask(editingTaskId, {
          title: taskTitle,
          priority: selectedPriority.label,
          tag: selectedTag.toUpperCase(),
          dueDate: dueDate
        });
      } else {
        await addTask({
          title: taskTitle,
          priority: selectedPriority.label,
          tag: selectedTag.toUpperCase(),
          dueDate: dueDate
        });
      }
      setIsModalVisible(false);
      resetForm();
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  const handleEditPress = (task) => {
    setEditingTaskId(task.id);
    setTaskTitle(task.title);
    setSelectedPriority(PRIORITY_OPTIONS.find(p => p.label === task.priority) || PRIORITY_OPTIONS[1]);
    setSelectedTag(TAG_OPTIONS.find(t => t.toUpperCase() === task.tag.toUpperCase()) || TAG_OPTIONS[0]);
    setDueDate(task.dueDate || '25-03-2026');
    setIsModalVisible(true);
  };

  const handleDeleteTask = (id) => {
    console.log("TasksScreen: handleDeleteTask triggered for id:", id);
    if (Platform.OS === 'web') {
      const confirmed = window.confirm("Are you sure you want to remove this task?");
      if (confirmed) {
        console.log("TasksScreen: Web confirm successful for id:", id);
        deleteTask(id);
      }
      return;
    }

    Alert.alert(
      "Delete Task",
      "Are you sure you want to remove this task?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            console.log("TasksScreen: Alert confirm successful for id:", id);
            await deleteTask(id);
          } 
        }
      ]
    );
  };

  const resetForm = () => {
    setTaskTitle('');
    setSelectedPriority(PRIORITY_OPTIONS[1]);
    setSelectedTag(TAG_OPTIONS[0]);
    setDueDate('25-03-2026');
    setEditingTaskId(null);
  };

  const renderCalendar = () => {
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    return (
      <Modal visible={isCalendarVisible} transparent animationType="fade">
        <View style={styles.calendarOverlay}>
          <View style={styles.calendarContainer}>
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarMonthTitle}>MARCH 2026</Text>
              <TouchableOpacity onPress={() => setIsCalendarVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.calendarGrid}>
              {days.map(day => (
                <TouchableOpacity 
                  key={day} 
                  style={[styles.calendarDayCell, day === 25 && styles.calendarTodayCell]}
                  onPress={() => {
                    setDueDate(`${day.toString().padStart(2, '0')}-03-2026`);
                    setIsCalendarVisible(false);
                  }}
                >
                  <Text style={styles.calendarDayText}>{day}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.headerLabel}>CURATION HUB</Text>
          <Text style={styles.headerTitle}>
            Tasks <Text style={styles.headerItalic}>& to-dos</Text>
          </Text>
          <Text style={styles.headerSubtitle}>
            Streamlining your day through intentional movement and focused progress.
          </Text>
        </View>

        {/* In Progress Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>In Progress</Text>
            <Text style={styles.sectionBadge}>{inProgressTasks.length} ACTIVE</Text>
          </View>
          
          {inProgressTasks.map(item => (
            <InProgressCard 
            key={item.id} 
            item={item} 
            onDone={() => toggleTaskStatus(item.id, 'completed')} 
            onEdit={() => handleEditPress(item)}
            onDelete={() => {
              console.log("Card onDelete called for:", item.id);
              handleDeleteTask(item.id);
            }}
          />
          ))}
        </View>

        <View style={styles.sectionDivider} />

        {/* To Do Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>To Do</Text>
            <Text style={styles.sectionBadge}>{todoTasks.length} PENDING</Text>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.todoHorizontalList}>
            {todoTasks.map(item => (
              <ToDoCard 
                key={item.id} 
                item={item} 
                onStart={() => toggleTaskStatus(item.id, 'in-progress')} 
                onEdit={() => handleEditPress(item)}
                onDelete={() => {
                  console.log("Card onDelete called for:", item.id);
                  handleDeleteTask(item.id);
                }}
              />
            ))}
          </ScrollView>
        </View>

        {/* Completed Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Completed</Text>
          <View style={styles.completedList}>
            {completedTasks.map(item => (
              <View key={item.id} style={styles.completedItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.textMuted} style={styles.checkIcon} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.completedText}>{item.title}</Text>
                  <Text style={styles.completedTime}>{item.completedAt}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.completedDeleteBtn}
                  onPress={() => handleDeleteTask(item.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="trash-outline" size={14} color="#e74c3c" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setIsModalVisible(true)}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* New Task Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingTaskId ? 'Edit Task' : 'New Task'}</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>TASK DESCRIPTION</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="e.g. Apply for DevOps role at Infosys"
                placeholderTextColor={theme.colors.textMuted}
                value={taskTitle}
                onChangeText={setTaskTitle}
              />
            </View>

            <View style={[styles.formRow, { zIndex: 100 }]}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>PRIORITY</Text>
                <TouchableOpacity 
                  style={styles.dropdownTrigger}
                  onPress={() => setShowPriorityDropdown(!showPriorityDropdown)}
                >
                  <Text style={{ fontSize: 14, marginRight: 8 }}>{selectedPriority.icon}</Text>
                  <Text style={styles.dropdownValue}>{selectedPriority.label}</Text>
                  <Ionicons name="chevron-down" size={16} color="#666" />
                </TouchableOpacity>
                {showPriorityDropdown && (
                  <View style={styles.dropdownMenu}>
                    {PRIORITY_OPTIONS.map(p => (
                      <TouchableOpacity 
                        key={p.label} 
                        style={styles.dropdownOption}
                        onPress={() => {
                          setSelectedPriority(p);
                          setShowPriorityDropdown(false);
                        }}
                      >
                        <Text style={{ fontSize: 14, marginRight: 8 }}>{p.icon}</Text>
                        <Text style={styles.dropdownOptionText}>{p.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 15 }]}>
                <Text style={styles.inputLabel}>TAG</Text>
                <TouchableOpacity 
                  style={styles.dropdownTrigger}
                  onPress={() => setShowTagDropdown(!showTagDropdown)}
                >
                  <Text style={styles.dropdownValue}>{selectedTag}</Text>
                  <Ionicons name="chevron-down" size={16} color="#666" />
                </TouchableOpacity>
                {showTagDropdown && (
                  <View style={styles.dropdownMenu}>
                    {TAG_OPTIONS.map(tag => (
                      <TouchableOpacity 
                        key={tag} 
                        style={styles.dropdownOption}
                        onPress={() => {
                          setSelectedTag(tag);
                          setShowTagDropdown(false);
                        }}
                      >
                        <Text style={styles.dropdownOptionText}>{tag}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>DUE DATE (OPTIONAL)</Text>
              <View style={styles.dateInputContainer}>
                <TextInput
                  style={[styles.modalTextInput, { flex: 1, backgroundColor: 'transparent', borderWidth: 0 }]}
                  value={dueDate}
                  onChangeText={setDueDate}
                  placeholder="DD-MM-YYYY"
                  placeholderTextColor={theme.colors.textMuted}
                />
                <TouchableOpacity onPress={() => setIsCalendarVisible(true)}>
                  <Ionicons name="calendar-outline" size={20} color="#333" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancelBtn}
                onPress={() => {
                  setIsModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalAddBtn}
                onPress={handleAddTask}
              >
                <Text style={styles.modalAddBtnText}>{editingTaskId ? 'Save Changes' : 'Add Task'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {renderCalendar()}
    </SafeAreaView>
  );
};

const InProgressCard = ({ item, onDone, onEdit, onDelete }) => {
  const priorityIcon = PRIORITY_OPTIONS.find(p => p.label === item.priority)?.icon || '🟡';
  return (
    <View style={styles.ipCard}>
      <View style={styles.cardHeader}>
        <View style={styles.headerTopLeft}>
          <View style={styles.tagBadge}>
            <Text style={styles.tagText}>{item.tag}</Text>
          </View>
          <Text style={styles.priorityIndicator}>{priorityIcon}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerActionBtn} onPress={onEdit}>
            <Ionicons name="create-outline" size={16} color={theme.colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerActionBtn} 
            onPress={onDelete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={16} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.cardTitle}>
        {item.title} {item.titleItalic && <Text style={styles.cardTitleItalic}>{item.titleItalic}</Text>}
      </Text>
      <View style={styles.cardFooter}>
        <TouchableOpacity style={styles.doneBtn} onPress={onDone}>
          <Text style={styles.doneBtnText}>DONE</Text>
        </TouchableOpacity>
        <Text style={styles.dueDateText}>{item.dueDate}</Text>
      </View>
    </View>
  );
};

const ToDoCard = ({ item, onStart, onEdit, onDelete }) => {
  const priorityIcon = PRIORITY_OPTIONS.find(p => p.label === item.priority)?.icon || '🟡';
  return (
    <View style={styles.todoCard}>
      <View style={styles.cardHeader}>
        <View style={styles.headerTopLeft}>
          <View style={styles.tagBadge}>
            <Text style={styles.tagText}>{item.tag}</Text>
          </View>
          <Text style={styles.priorityIndicator}>{priorityIcon}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerActionBtn} onPress={onEdit}>
            <Ionicons name="create-outline" size={16} color={theme.colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerActionBtn} 
            onPress={onDelete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={16} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.todoTitle}>{item.title}</Text>
      <View style={styles.todoFooter}>
        <TouchableOpacity style={styles.startBtn} onPress={onStart}>
          <Ionicons name="play" size={12} color={theme.colors.text} />
          <Text style={styles.startBtnText}>START TASK</Text>
        </TouchableOpacity>
        <Text style={styles.dueDateText}>{item.dueDate}</Text>
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
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: 25,
    paddingTop: 30,
    marginBottom: 40,
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
    marginBottom: 15,
  },
  headerItalic: {
    fontFamily: theme.fonts.serifItalic,
    color: theme.colors.textMuted,
  },
  headerSubtitle: {
    fontFamily: theme.fonts.sans,
    fontSize: 14,
    lineHeight: 22,
    color: theme.colors.textMuted,
    maxWidth: '85%',
  },
  sectionContainer: {
    paddingHorizontal: 25,
    marginBottom: 30,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: theme.fonts.serif,
    fontSize: 28,
    color: theme.colors.text,
  },
  sectionBadge: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 9,
    letterSpacing: 1,
    color: theme.colors.textMuted,
  },
  ipCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
    borderTopWidth: 4,
    borderTopColor: '#5e614d', // Stylized accent from mockup
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerTopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityIndicator: {
    fontSize: 10,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerActionBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f9f8f3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagBadge: {
    backgroundColor: '#e8e7df',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 8,
    color: theme.colors.textMuted,
  },
  dueDateText: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: 9,
    color: theme.colors.textMuted,
  },
  cardTitle: {
    fontFamily: theme.fonts.serif,
    fontSize: 22,
    color: theme.colors.text,
    marginBottom: 20,
  },
  cardTitleItalic: {
    fontFamily: theme.fonts.serifItalic,
    color: theme.colors.textMuted,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  doneBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
  },
  doneBtnText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 10,
    letterSpacing: 1,
    color: '#fff',
  },
  completedDeleteBtn: {
    padding: 8,
    marginLeft: 10,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginHorizontal: 25,
    marginBottom: 35,
    marginTop: 10,
  },
  todoHorizontalList: {
    paddingRight: 25,
  },
  todoCard: {
    width: 240,
    backgroundColor: '#f6f5f0',
    borderRadius: 12,
    padding: 24,
    marginRight: 15,
  },
  todoTitle: {
    fontFamily: theme.fonts.serif,
    fontSize: 20,
    color: theme.colors.text,
    marginBottom: 20,
    lineHeight: 28,
  },
  todoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  startBtnText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 9,
    letterSpacing: 1,
    color: theme.colors.text,
    marginLeft: 6,
  },
  completedList: {
    marginTop: 15,
  },
  completedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  checkIcon: {
    marginRight: 12,
  },
  completedText: {
    fontFamily: theme.fonts.sans,
    fontSize: 14,
    color: theme.colors.textMuted,
    textDecorationLine: 'line-through',
    flex: 1,
  },
  completedTime: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 8,
    color: '#ccc',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 25,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
    paddingBottom: 50,
    maxHeight: '94%',
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
    marginBottom: 8,
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
  formRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  dropdownTrigger: {
    backgroundColor: '#f6f5f0',
    height: 50,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#eee',
    justifyContent: 'space-between',
  },
  dropdownValue: {
    flex: 1,
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownOptionText: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: 14,
    color: theme.colors.textSecondary,
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
  modalAddBtn: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  modalAddBtnText: {
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
});

export default TasksScreen;
