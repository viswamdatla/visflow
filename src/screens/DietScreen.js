import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image, Modal, TextInput, Platform } from 'react-native';
import { theme } from '../theme/editorial';
import { useDiet } from '../hooks/useDiet';
import { Ionicons } from '@expo/vector-icons';

const StatCard = ({ label, value, goal, unit, color, onPress }) => {
  const progress = Math.min(1, value / goal);
  
  return (
    <TouchableOpacity style={styles.statCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.barMainContainer}>
        <View style={styles.barValueContainer}>
          <Text style={styles.barValueText}>{value}</Text>
          <Text style={styles.barUnitText}>{unit}</Text>
        </View>
        
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarTrack, { backgroundColor: color + '15' }]} />
          <View style={[styles.progressBarFill, { 
            backgroundColor: color,
            width: `${progress * 100}%` 
          }]}>
            {progress > 0.1 && <View style={styles.progressBarGlow} />}
          </View>
        </View>
      </View>
      
      <View style={styles.statInfoRow}>
        <Text style={styles.statCardLabel}>{label}</Text>
        <Text style={styles.statCardProgress}>
          {Math.round(progress * 100)}%
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const DietScreen = () => {
  const { stats, hydration, meals, currentDate, setCurrentDate, loading, addMeal, deleteMeal, updateGoal, updateHydration, updateMeal } = useDiet();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [isGoalModalVisible, setIsGoalModalVisible] = useState(false);
  const [editingStat, setEditingStat] = useState(null);
  const [goalValue, setGoalValue] = useState('');
  const [mealType, setMealType] = useState('breakfast');
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [calories, setCalories] = useState('0');
  const [protein, setProtein] = useState('0');
  const [carbs, setCarbs] = useState('0');
  const [fat, setFat] = useState('0');
  const [showMealDropdown, setShowMealDropdown] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedLogDate, setSelectedLogDate] = useState(currentDate);
  const [expandedMeal, setExpandedMeal] = useState('breakfast');

  const mealOptions = [
    { label: 'Breakfast', value: 'breakfast', icon: '🌅' },
    { label: 'Lunch', value: 'lunch', icon: '☀️' },
    { label: 'Dinner', value: 'dinner', icon: '🌙' },
    { label: 'Snacks', value: 'snack', icon: '🍎' },
  ];

  const handleLogFood = () => {
    if (!foodName) return;
    const mealData = {
      type: mealType,
      name: foodName,
      quantity,
      calories,
      protein,
      carbs,
      fat,
      time: editingMeal ? editingMeal.time : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: selectedLogDate
    };

    if (editingMeal) {
      updateMeal(editingMeal.id, mealData);
    } else {
      addMeal(mealData);
    }
    setIsModalVisible(false);
    resetForm();
  };

  const resetForm = () => {
    setFoodName('');
    setQuantity('');
    setCalories('0');
    setProtein('0');
    setCarbs('0');
    setFat('0');
    setMealType('breakfast');
    setEditingMeal(null);
  };

  const openGoalModal = (stat, currentGoal) => {
    setEditingStat(stat);
    setGoalValue(currentGoal.toString());
    setIsGoalModalVisible(true);
  };

  const openEditMeal = (meal) => {
    setEditingMeal(meal);
    setFoodName(meal.name);
    setQuantity(meal.quantity);
    setCalories(meal.calories.toString());
    setProtein(meal.protein.toString());
    setCarbs(meal.carbs.toString());
    setFat(meal.fat.toString());
    setMealType(meal.type);
    setSelectedLogDate(meal.date || currentDate);
    setIsModalVisible(true);
  };

  const handleSaveGoal = () => {
    if (editingStat) {
      updateGoal(editingStat, goalValue);
      setIsGoalModalVisible(false);
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  };

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0(Sun) to 6(Sat)
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to Monday
    
    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(diff + i);
        const dateStr = formatDate(d);
        dates.push({
            full: dateStr,
            day: d.toLocaleString('default', { weekday: 'short' }).toUpperCase().charAt(0), // Mon -> M
            date: d.getDate(),
            isToday: dateStr === formatDate(today)
        });
    }
    return dates;
  };

  const dates = generateDates();

  if (!stats) return null;

  const renderHydrationCups = () => {
    const totalCups = 8;
    const HYDRATION_GOAL = stats?.goalHydration || 2.5;
    const cupSize = HYDRATION_GOAL / totalCups;
    const currentCupsCount = Math.round(hydration / cupSize);
    
    const cups = [];
    for (let i = 1; i <= totalCups; i++) {
        const isFilled = currentCupsCount >= i;
        cups.push(
            <TouchableOpacity 
                key={i} 
                onPress={() => updateHydration(isFilled ? -cupSize : cupSize)}
                style={[styles.cup, isFilled && styles.cupFilled]}
            >
                <Ionicons 
                    name="water" 
                    size={22} 
                    color={isFilled ? "#3b82f6" : "#e0e0e0"} 
                />
            </TouchableOpacity>
        );
    }
    return cups;
  };

  const renderMealGroup = (type, title, icon) => {
    const groupMeals = meals.filter(m => m.type === type);
    const isExpanded = expandedMeal === type;
    const totalCals = groupMeals.reduce((sum, m) => sum + (parseFloat(m.calories) || 0), 0);

    return (
      <View style={styles.mealGroupContainer}>
        <TouchableOpacity 
          style={styles.mealGroupHeader} 
          onPress={() => setExpandedMeal(isExpanded ? null : type)}
        >
          <View style={styles.mealGroupTitleRow}>
            <Text style={styles.mealGroupIcon}>{icon}</Text>
            <View>
              <Text style={styles.mealGroupTitle}>{title}</Text>
              <Text style={styles.mealGroupSubtext}>{groupMeals.length} items • {totalCals} kcal</Text>
            </View>
          </View>
          <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#999" />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedContent}>
            {groupMeals.length === 0 ? (
              <Text style={styles.emptyGroupText}>No {title.toLowerCase()} logged yet.</Text>
            ) : (
              groupMeals.map(meal => (
                <TouchableOpacity 
                  key={meal.id} 
                  style={styles.mealItem}
                  onPress={() => openEditMeal(meal)}
                >
                  <View style={styles.mealItemMainRow}>
                    <Text style={styles.mealItemName}>{meal.name}</Text>
                    <Text style={styles.mealItemCals}>{meal.calories} kcal</Text>
                  </View>
                  <View style={styles.mealItemSubRow}>
                    <Text style={styles.mealItemDetails}>{meal.quantity} • {meal.time}</Text>
                    <View style={styles.itemActionRow}>
                      <TouchableOpacity onPress={() => openEditMeal(meal)}>
                        <Ionicons name="pencil-outline" size={16} color="#999" style={styles.actionIcon} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteMeal(meal.id)}>
                        <Ionicons name="trash-outline" size={16} color="#ff4444" style={styles.actionIcon} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </View>
    );
  };

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
  const logMeal = (type) => {
    addMeal({
      type,
      name: type.charAt(0).toUpperCase() + type.slice(1) + ' Selection',
      calories: 400,
      protein: 20,
      carbs: 40,
      fat: 15,
      time: 'JUST NOW'
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.breadcrumb}>DAILY LOG / NUTRITION</Text>
          <View style={styles.headerRow}>
            <Text style={styles.greetingHeader}>DIET & NUTRITION</Text>
            <View style={styles.activeDateBadge}>
              <Text style={styles.activeDateBadgeText}>{currentDate === formatDate(new Date()) ? 'TODAY' : currentDate}</Text>
            </View>
          </View>
        </View>

        {/* Weekly Date Bar */}
        <View style={styles.dateBarContainer}>
          <Text style={styles.dateBarLabel}>THIS WEEK</Text>
          <View style={styles.dateBarRow}>
            {dates.map((item, idx) => (
              <TouchableOpacity 
                key={idx} 
                style={[
                  styles.dateCircle, 
                  currentDate === item.full && styles.dateCircleSelected,
                  item.isToday && !currentDate === item.full && styles.dateCircleToday
                ]}
                onPress={() => setCurrentDate(item.full)}
              >
                <Text style={[styles.dateCircleDay, currentDate === item.full && styles.dateCircleDaySelected]}>{item.day}</Text>
                <Text style={[styles.dateCircleNum, currentDate === item.full && styles.dateCircleNumSelected]}>{item.date}</Text>
                {item.isToday && <View style={[styles.todayDot, currentDate === item.full && styles.todayDotSelected]} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Breadcrumb & Title */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Diet <Text style={styles.serifItalic}>& nutrition</Text>
          </Text>
          <Text style={styles.subtitle}>
            Fueling the vessel for <Text style={styles.italic}>intellectual</Text> and physical endurance.
          </Text>
        </View>

        {/* Circular Stats Row */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.statsScroll}
        >
          <StatCard 
            label="CALORIES" 
            value={stats.calories} 
            goal={stats.goalCals} 
            unit="kcal" 
            color="#e67e22"
            onPress={() => openGoalModal('cals', stats.goalCals)}
          />
          <StatCard 
            label="PROTEIN" 
            value={stats.protein} 
            goal={stats.goalProtein} 
            unit="g" 
            color="#2ecc71"
            onPress={() => openGoalModal('protein', stats.goalProtein)}
          />
          <StatCard 
            label="CARBS" 
            value={stats.carbs} 
            goal={stats.goalCarbs} 
            unit="g" 
            color="#f1c40f"
            onPress={() => openGoalModal('carbs', stats.goalCarbs)}
          />
          <StatCard 
            label="FAT" 
            value={stats.fats} 
            goal={stats.goalFats} 
            unit="g" 
            color="#e74c3c"
            onPress={() => openGoalModal('fats', stats.goalFats)}
          />
        </ScrollView>

        {/* Hydration Card */}
        <TouchableOpacity 
          style={styles.hydrationCard} 
          activeOpacity={0.8}
          onPress={() => openGoalModal('hydration', stats?.goalHydration || 2.5)}
        >
          <Text style={styles.cardLabelText}>HYDRATION</Text>
          <View style={styles.hydrationHeader}>
            <Text style={styles.cardLargeTitle}>{(hydration || 0).toFixed(1)} <Text style={styles.unitText}>Liters</Text></Text>
            <Text style={styles.hydrationGoal}>Goal: {(stats?.goalHydration || 2.5).toFixed(1)}L</Text>
          </View>
          <View style={styles.cupsRow}>
            {renderHydrationCups()}
          </View>
        </TouchableOpacity>

        {/* Meals Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Meals</Text>
          <TouchableOpacity 
            style={styles.addFoodBtn}
            onPress={() => setIsModalVisible(true)}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addFoodBtnText}>LOG MEAL</Text>
          </TouchableOpacity>
        </View>

        {renderMealGroup('breakfast', 'Breakfast', '🌅')}
        {renderMealGroup('lunch', 'Lunch', '☀️')}
        {renderMealGroup('dinner', 'Dinner', '🌙')}
        {renderMealGroup('snack', 'Snacks', '🍎')}

        {/* Weekly Curation Card */}
        <View style={styles.curationCard}>
          <Text style={styles.curationTitle}>
            Weekly <Text style={styles.serifItalic}>curation</Text>
          </Text>
          <Text style={styles.curationSub}>
            Your personalized meal plan for the next 7 days is ready for review.
          </Text>
          <TouchableOpacity style={styles.viewPlanBtn}>
            <Text style={styles.viewPlanBtnText}>VIEW MEAL PLAN</Text>
          </TouchableOpacity>
        </View>

        {/* Log Food Modal */}
        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{editingMeal ? 'Edit Meal' : 'Log Food'}</Text>
              
              <View style={[styles.formRow, { zIndex: 1000, elevation: 1000 }]}>
                <View style={[styles.formGroup, { flex: 1.4, marginRight: 15 }]}>
                  <Text style={styles.inputLabel}>MEAL</Text>
                  <TouchableOpacity 
                    style={styles.dropdownTrigger}
                    onPress={() => setShowMealDropdown(!showMealDropdown)}
                  >
                    <Text style={styles.dropdownValue}>
                      {mealOptions.find(m => m.value === mealType)?.icon} {mealOptions.find(m => m.value === mealType)?.label}
                    </Text>
                    <Ionicons name="chevron-down" size={14} color="#000" />
                  </TouchableOpacity>
                  
                  {showMealDropdown && (
                    <View style={styles.dropdownMenu}>
                      {mealOptions.map(option => (
                        <TouchableOpacity 
                          key={option.value}
                          style={[styles.dropdownOption, mealType === option.value && styles.dropdownOptionSelected]}
                          onPress={() => {
                            setMealType(option.value);
                            setShowMealDropdown(false);
                          }}
                        >
                          <Text style={[styles.dropdownOptionText, mealType === option.value && styles.dropdownOptionTextSelected]}>
                            {option.icon} {option.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                <View style={[styles.formGroup, { flex: 1.2 }]}>
                  <Text style={styles.inputLabel}>DATE</Text>
                  <TouchableOpacity 
                    style={styles.datePickerTrigger}
                    onPress={() => setShowCalendar(true)}
                  >
                    <Text style={styles.datePickerValue}>{selectedLogDate}</Text>
                    <Ionicons name="calendar-outline" size={16} color="#000" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.formGroup, { zIndex: 1, elevation: 1 }]}>
                <Text style={styles.inputLabel}>FOOD NAME</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Brown Rice Bowl"
                  placeholderTextColor="#999"
                  value={foodName}
                  onChangeText={setFoodName}
                />
              </View>

              <View style={[styles.formRow, { zIndex: 1, elevation: 1 }]}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 15 }]}>
                  <Text style={styles.inputLabel}>QUANTITY</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. 1 cup / 150g"
                    placeholderTextColor="#999"
                    value={quantity}
                    onChangeText={setQuantity}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>CALORIES (KCAL)</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={calories}
                    onChangeText={setCalories}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>PROTEIN (G)</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={protein}
                    onChangeText={setProtein}
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>CARBS (G)</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={carbs}
                    onChangeText={setCarbs}
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>FAT (G)</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={fat}
                    onChangeText={setFat}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity 
                   style={styles.cancelBtn}
                   onPress={() => {
                     setIsModalVisible(false);
                     setEditingMeal(null);
                   }}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.submitBtn}
                  onPress={handleLogFood}
                >
                  <Text style={styles.submitBtnText}>{editingMeal ? 'Update Meal' : 'Log Food'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Goal Setting Modal */}
        <Modal
          visible={isGoalModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsGoalModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Set {editingStat?.toUpperCase()} Goal</Text>
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>TARGET VALUE</Text>
                <TextInput
                  style={styles.modalInput}
                  value={goalValue}
                  onChangeText={setGoalValue}
                  keyboardType="numeric"
                  autoFocus={true}
                />
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.cancelBtn}
                  onPress={() => setIsGoalModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.submitBtn}
                  onPress={handleSaveGoal}
                >
                  <Text style={styles.submitBtnText}>Update Goal</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Simple Calendar Modal */}
        <Modal
          visible={showCalendar}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCalendar(false)}
        >
          <View style={styles.calendarOverlay}>
            <View style={styles.calendarContent}>
              <View style={styles.calendarHeader}>
                <Text style={styles.calendarTitle}>Select Date</Text>
                <TouchableOpacity onPress={() => setShowCalendar(false)}>
                  <Ionicons name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.calendarGrid}>
                {/* Mock Calendar Grid for simplicity, functional enough for this UI task */}
                {[...Array(30)].map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${String(day).padStart(2, '0')}-03-2026`;
                  return (
                    <TouchableOpacity 
                      key={i} 
                      style={[styles.calendarDay, selectedLogDate === dateStr && styles.calendarDaySelected]}
                      onPress={() => {
                        setSelectedLogDate(dateStr);
                        setShowCalendar(false);
                      }}
                    >
                      <Text style={[styles.calendarDayText, selectedLogDate === dateStr && styles.calendarDayTextSelected]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </Modal>

        <View style={{ height: 100 }} />
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
    paddingHorizontal: 25,
    paddingTop: 40,
  },
  header: {
    marginBottom: 35,
  },
  breadcrumb: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 10,
    color: '#999',
    letterSpacing: 1.5,
    marginBottom: 5,
  },
  title: {
    fontFamily: theme.fonts.serif,
    fontSize: 42,
    color: theme.colors.text,
    marginBottom: 15,
  },
  serifItalic: {
    fontFamily: theme.fonts.serifItalic,
  },
  subtitle: {
    fontFamily: theme.fonts.sans,
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    maxWidth: '85%',
  },
  italic: {
    fontStyle: 'italic',
  },
  energyCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 24,
    marginBottom: 15,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLabelText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 9,
    letterSpacing: 1,
    color: theme.colors.textMuted,
  },
  goalBadge: {
    backgroundColor: '#f5f4ef',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  goalBadgeText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 10,
    color: '#2d2e28',
  },
  cardLargeTitle: {
    fontFamily: theme.fonts.serif,
    fontSize: 28,
    color: theme.colors.text,
    marginBottom: 15,
  },
  statLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  statValue: {
    fontFamily: theme.fonts.serifItalic,
    fontSize: 48,
    color: theme.colors.text,
  },
  statUnit: {
    fontFamily: theme.fonts.sans,
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: 8,
  },
  mainProgressBg: {
    height: 4,
    backgroundColor: '#f5f4ef',
    borderRadius: 2,
  },
  mainProgressFill: {
    height: '100%',
    backgroundColor: '#2d2e28',
    borderRadius: 2,
  },
  macrosRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  macroCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 20,
  },
  macroLabelText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 8,
    letterSpacing: 1,
    color: theme.colors.textMuted,
    marginBottom: 10,
  },
  macroStatLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 15,
  },
  macroValue: {
    fontFamily: theme.fonts.serif,
    fontSize: 24,
    color: theme.colors.text,
  },
  macroGoal: {
    fontFamily: theme.fonts.sans,
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  macroProgressBg: {
    height: 3,
    backgroundColor: '#f5f4ef',
    borderRadius: 1.5,
  },
  macroProgressFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  hydrationCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 25,
    marginHorizontal: 20,
    marginBottom: 35,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  hydrationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  hydrationGoal: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: 12,
    color: '#999',
  },
  cupsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cup: {
    width: 32,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cupFilled: {
    opacity: 1,
  },
  hydrationIconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dropIcon: {
    fontSize: 16,
  },
  hydrationLabelText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 9,
    letterSpacing: 1,
    color: '#2d2e28',
  },
  hydrationValueText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 11,
    color: '#2d2e28',
  },
  cupsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cup: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.3,
  },
  cupFilled: {
    opacity: 1,
  },
  cupIcon: {
    fontSize: 18,
  },
  mealsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  sectionTitle: {
    fontFamily: theme.fonts.serif,
    fontSize: 24,
    color: theme.colors.text,
  },
  logFoodBtn: {
    backgroundColor: '#2d2e28',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 4,
    gap: 8,
  },
  logFoodBtnPlus: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logFoodBtnText: {
    color: '#fff',
    fontFamily: theme.fonts.sansBold,
    fontSize: 10,
    letterSpacing: 1,
  },
  mealList: {
    gap: 15,
    marginBottom: 40,
  },
  mealCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  mealImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
    backgroundColor: '#eee',
  },
  mealInfo: {
    flex: 1,
    marginLeft: 15,
  },
  mealTypeLabel: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 4,
  },
  mealTitle: {
    fontFamily: theme.fonts.sans,
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  mealCalSection: {
    alignItems: 'flex-end',
    width: 60,
  },
  mealCalValue: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 14,
    color: theme.colors.text,
  },
  mealCalUnit: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 8,
    color: theme.colors.textMuted,
  },
  emptyMealCard: {
    backgroundColor: '#f9f7f2', // Slightly different from white
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    height: 80,
  },
  emptyMealLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  emptyMealIconBg: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#f5f4ef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyMealIcon: {
    fontSize: 18,
    opacity: 0.3,
  },
  emptyMealLabel: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  emptyMealPlus: {
    fontSize: 20,
    color: theme.colors.textMuted,
    marginRight: 10,
  },
  curationCard: {
    backgroundColor: '#f5f4ef',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
  },
  curationTitle: {
    fontFamily: theme.fonts.serif,
    fontSize: 28,
    color: theme.colors.text,
    marginBottom: 15,
  },
  curationSub: {
    fontFamily: theme.fonts.sans,
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 25,
  },
  viewPlanBtn: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.text,
    paddingBottom: 4,
  },
  viewPlanBtnText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 10,
    letterSpacing: 1,
    color: theme.colors.text,
  },
  // Weekly Date Bar Styles
  dateBarContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  dateBarLabel: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 9,
    color: '#999',
    letterSpacing: 1.5,
    marginBottom: 15,
  },
  dateBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateCircle: {
    width: 42,
    height: 55,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  dateCircleSelected: {
    backgroundColor: theme.colors.text,
    borderColor: theme.colors.text,
  },
  dateCircleToday: {
    borderColor: '#eee',
    backgroundColor: '#f9f9f9',
  },
  dateCircleDay: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 10,
    color: '#999',
    marginBottom: 2,
  },
  dateCircleDaySelected: {
    color: 'rgba(255,255,255,0.6)',
  },
  dateCircleNum: {
    fontFamily: theme.fonts.serif,
    fontSize: 14,
    color: theme.colors.text,
  },
  dateCircleNumSelected: {
    color: '#fff',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3b82f6',
    position: 'absolute',
    bottom: 6,
  },
  todayDotSelected: {
    backgroundColor: '#fff',
  },
  // Meal Group Styles
  mealGroupContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  mealGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
  },
  mealGroupTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealGroupIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  mealGroupTitle: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 16,
    color: theme.colors.text,
  },
  mealGroupSubtext: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: 12,
    color: '#999',
  },
  expandedContent: {
    paddingHorizontal: 18,
    paddingBottom: 15,
    borderTopWidth: 1,
    borderTopColor: '#f9f9f9',
  },
  mealItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9',
  },
  mealItemMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  mealItemName: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: 14,
    color: theme.colors.text,
    flex: 1,
    marginRight: 10,
  },
  mealItemSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealItemDetails: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: 11,
    color: '#999',
  },
  itemActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  actionIcon: {
    padding: 5,
  },
  mealItemCals: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 13,
    color: theme.colors.text,
  },
  emptyGroupText: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: 12,
    color: '#ccc',
    textAlign: 'center',
    marginTop: 10,
  },
  // Circular Stats Styles
  statsScroll: {
    paddingLeft: 20,
    paddingRight: 10,
    marginBottom: 25,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    marginRight: 12,
    width: 140,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  barMainContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  barValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  barValueText: {
    fontFamily: theme.fonts.serif,
    fontSize: 28,
    color: '#000',
    fontWeight: '700',
  },
  barUnitText: {
    fontFamily: theme.fonts.sans,
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressBarContainer: {
    width: '100%',
    height: 6,
    justifyContent: 'center',
  },
  progressBarTrack: {
    position: 'absolute',
    width: '100%',
    height: 6,
    borderRadius: 3,
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  progressBarGlow: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  statInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
  },
  ringValueText: {
    fontFamily: theme.fonts.serif,
    fontSize: 18,
    color: theme.colors.text,
  },
  ringUnitText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 8,
    color: '#999',
    marginTop: -2,
  },
  greetingHeader: {
    fontFamily: theme.fonts.serif,
    fontSize: 32,
    color: theme.colors.text,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  activeDateBadge: {
    backgroundColor: '#f5f4ef',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  activeDateBadgeText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 10,
    color: theme.colors.text,
    letterSpacing: 0.5,
  },
  statCardLabel: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 9,
    color: theme.colors.text,
    letterSpacing: 1,
    marginBottom: 4,
  },
  statCardProgress: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: 10,
    color: '#999',
  },
  // Section Header Styles
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontFamily: theme.fonts.serif,
    fontSize: 24,
    color: theme.colors.text,
  },
  addFoodBtn: {
    backgroundColor: '#1a1a14',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 5,
  },
  addFoodBtnText: {
    color: '#fff',
    fontFamily: theme.fonts.sansBold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  cardLargeTitle: {
    fontFamily: theme.fonts.serif,
    fontSize: 32,
    color: theme.colors.text,
  },
  unitText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 12,
    color: '#999',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
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
    fontSize: 32,
    color: theme.colors.text,
    marginBottom: 30,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 20,
    zIndex: 10,
  },
  formGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 9,
    color: '#999',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f4ef',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 48,
    borderWidth: 1,
    borderColor: '#eee',
  },
  dropdownValue: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: 14,
    color: theme.colors.text,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    maxHeight: 200,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 100,
  },
  dropdownOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  dropdownOptionSelected: {
    backgroundColor: '#3b82f6',
  },
  dropdownOptionText: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: 14,
    color: theme.colors.text,
  },
  dropdownOptionTextSelected: {
    color: '#fff',
  },
  datePickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f4ef',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 48,
    borderWidth: 1,
    borderColor: '#eee',
  },
  datePickerValue: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: 14,
    color: theme.colors.text,
  },
  modalInput: {
    backgroundColor: '#f5f4ef',
    height: 48,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontFamily: theme.fonts.sansMedium,
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
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cancelBtnText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 14,
    color: '#999',
  },
  submitBtn: {
    backgroundColor: '#1a1a14',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  submitBtnText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 14,
    color: '#fff',
  },
  calendarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  calendarContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 25,
    minHeight: 400,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarTitle: {
    fontFamily: theme.fonts.serif,
    fontSize: 24,
    color: theme.colors.text,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  calendarDay: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f4ef',
  },
  calendarDaySelected: {
    backgroundColor: theme.colors.primary,
  },
  calendarDayText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 14,
    color: theme.colors.text,
  },
  calendarDayTextSelected: {
    color: '#fff',
  },
});

export default DietScreen;
