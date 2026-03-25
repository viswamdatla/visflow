import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { theme } from '../theme/editorial';
import { useFinance } from '../hooks/useFinance';
import { useTasks } from '../hooks/useTasks';
import { useHabits } from '../hooks/useHabits';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const DashboardScreen = () => {
  const navigation = useNavigation();
  const { transactions, balance, totalExpenses } = useFinance();
  const { tasks, toggleTaskStatus } = useTasks();
  const { habits, toggleHabit } = useHabits();
  const { logout, user } = useAuth();

  const tasksCompleted = (tasks || []).filter(t => t.status === 'completed').length;
  const habitStreak = (habits || []).filter(h => h.completedToday).length;

  const pendingTasks = (tasks || []).filter(t => t.status !== 'completed').slice(0, 3);
  const todaysHabits = (habits || []).slice(0, 4);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarContainer}>
               <Image 
                 source={{ uri: 'https://i.pravatar.cc/150?u=julian' }} 
                 style={styles.avatar} 
               />
            </View>
            <Text style={styles.greeting}>
              Good Morning, <Text style={styles.greetingName}>{user?.email?.split('@')[0] || 'Curator'}</Text>
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity style={styles.calendarBtn} onPress={() => navigation.navigate('Calendar')}>
              <Ionicons name="calendar-outline" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.calendarBtn, { marginLeft: 10 }]} onPress={logout}>
              <Ionicons name="log-out-outline" size={24} color="#ff4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsList}>
          {/* Available Balance */}
          <TouchableOpacity style={styles.mainMetricCard} onPress={() => navigation.navigate('Finance')}>
            <View style={styles.metricCardLeft}>
              <Text style={styles.metricLabel}>AVAILABLE BALANCE</Text>
              <Text style={styles.balanceValue}>₹{(balance || 0).toLocaleString('en-IN')}</Text>
              <Text style={styles.metricFootnote}>+2.4% from last month</Text>
            </View>
            <View style={styles.walletIconContainer}>
               <View style={styles.walletIcon}>
                 <View style={styles.walletPin} />
               </View>
            </View>
          </TouchableOpacity>

          {/* Monthly Expenses */}
          <TouchableOpacity style={styles.metricCard} onPress={() => navigation.navigate('Finance')}>
            <Text style={styles.metricLabel}>MONTHLY EXPENSES</Text>
            <View style={styles.expenseRow}>
              <Text style={styles.expenseValue}>₹{(totalExpenses || 0).toLocaleString('en-IN')}</Text>
              <Ionicons name="trending-up-outline" size={20} color="#c88a73" style={styles.trendIcon} />
            </View>
            <Text style={styles.metricFootnote}>68% of budget</Text>
          </TouchableOpacity>

          {/* Tasks Completed */}
          <TouchableOpacity style={styles.metricCard} onPress={() => navigation.navigate('Tasks')}>
            <Text style={styles.metricLabel}>TASKS COMPLETED</Text>
            <Text style={styles.taskValue}>{tasksCompleted}/{(tasks || []).length}</Text>
            <View style={styles.horizontalDivider} />
            <Text style={styles.metricFootnoteItalic}>No pending tasks today</Text>
          </TouchableOpacity>

          {/* Daily Habits */}
          <TouchableOpacity style={styles.metricCard} onPress={() => navigation.navigate('Habits')}>
            <Text style={styles.metricLabel}>DAILY HABITS</Text>
            <Text style={styles.taskValue}>{habitStreak}/{(habits || []).length}</Text>
            <View style={styles.streakRow}>
              <Ionicons name="star" size={12} color="#ccc" />
              <Text style={[styles.metricFootnote, { marginLeft: 6 }]}>START STREAK</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Today's Focus Section (Tasks) */}
        <View style={styles.sectionHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Today's Focus</Text>
            <Text style={styles.sectionLabel}>PENDING OBJECTIVES</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Tasks')}>
            <Text style={styles.viewAllBtn}>VIEW ALL TASKS</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.itemListContainer}>
          {pendingTasks.length === 0 ? (
            <Text style={styles.emptyText}>All objectives clear for today.</Text>
          ) : (
            pendingTasks.map(task => (
              <TouchableOpacity 
                key={task.id} 
                style={styles.taskItem}
                onPress={() => toggleTaskStatus(task.id, 'completed')}
              >
                <View style={styles.taskCheck}>
                  <Ionicons name="ellipse-outline" size={20} color="#eee" />
                </View>
                <View style={styles.taskInfo}>
                  <Text style={styles.itemTitle}>{task.title}</Text>
                  <Text style={styles.itemSubtitle}>{task.tag} • {task.dueDate}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Daily Rituals Section (Habits) */}
        <View style={styles.sectionHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Daily Rituals</Text>
            <Text style={styles.sectionLabel}>CONSISTENCY TRACKER</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Habits')}>
            <Text style={styles.viewAllBtn}>MANAGE HABITS</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.itemListContainer}>
          {todaysHabits.length === 0 ? (
            <Text style={styles.emptyText}>No rituals established yet.</Text>
          ) : (
            todaysHabits.map(habit => (
              <TouchableOpacity 
                key={habit.id} 
                style={styles.habitItem}
                onPress={() => toggleHabit(habit.id)}
              >
                <View style={[styles.habitCheck, habit.completedToday && styles.habitCheckActive]}>
                  <Ionicons 
                    name={habit.completedToday ? "checkmark-circle" : "ellipse-outline"} 
                    size={24} 
                    color={habit.completedToday ? theme.colors.text : "#eee"} 
                  />
                </View>
                <View style={styles.habitInfo}>
                  <Text style={[styles.itemTitle, habit.completedToday && styles.completedText]}>{habit.title}</Text>
                  <Text style={styles.itemSubtitle}>{habit.subtitle} • {habit.streak || 0} DAY STREAK</Text>
                </View>
                <Text style={styles.habitIcon}>{habit.icon}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Recent Transactions Section */}
        <View style={styles.sectionHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle} numberOfLines={1}>Recent Transactions</Text>
            <Text style={styles.sectionLabel}>FINANCIAL ACTIVITY LEDGER</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Finance')} style={{ marginLeft: 10 }}>
            <Text style={styles.viewAllBtn}>VIEW ALL STATEMENT</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transactionList}>
          {(transactions || []).slice(0, 3).map(item => (
            <View key={item.id} style={styles.transactionItem}>
              <View style={styles.transactionLeft}>
                <View style={styles.transactionIconBg}>
                  <MaterialIcons name={item.icon || 'receipt'} size={20} color={theme.colors.text} />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={styles.vendorName}>{item.vendor || item.title}</Text>
                  <Text style={styles.categoryTime}>{(item.category || 'GENERAL')} • {item.time || 'JUST NOW'}</Text>
                </View>
              </View>
              <View style={styles.transactionRight}>
                <Text style={[styles.transactionAmount, { color: item.amount > 0 ? '#5e614d' : '#c88a73' }]}>
                  {item.amount > 0 ? '+' : '-'} ₹{Math.abs(item.amount).toLocaleString('en-IN')}
                </Text>
                <View style={styles.statusBadge}>
                   <Text style={styles.statusText}>{item.amount > 0 ? 'CREDIT' : 'DEBIT'}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Curated Space Section */}
        <View style={styles.curatedSpace}>
           <Image 
             source={require('../assets/generated/dashboard_curated_space_man.png')}
             style={styles.curatedImage}
           />
           <View style={styles.curatedOverlay}>
              <Text style={styles.curatedLabel}>CURATED SPACE</Text>
              <Text style={styles.curatedTitle}>Focus on the essentials.</Text>
           </View>
        </View>

        {/* Manifesto Section */}
        <View style={styles.manifestoSection}>
          <Text style={styles.quoteIcon}>“</Text>
          <Text style={styles.manifestoText}>
            "The Digital Curator ethos treats every data point as a piece of content worth framing."
          </Text>
          <View style={styles.manifestoFooter}>
             <View style={styles.footerLine} />
             <Text style={styles.footerLabel}>LIFE OS MANIFESTO</Text>
          </View>
        </View>

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
  header: {
    paddingHorizontal: 25,
    paddingTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 15,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  greeting: {
    fontFamily: theme.fonts.serifItalic,
    fontSize: 22,
    color: theme.colors.text,
  },
  greetingName: {
    fontFamily: theme.fonts.serif,
  },
  calendarBtn: {
    padding: 5,
  },
  metricsList: {
    paddingHorizontal: 25,
    marginBottom: 50,
  },
  mainMetricCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.03,
    shadowRadius: 15,
    elevation: 2,
  },
  metricCardLeft: {
    flex: 1,
  },
  metricLabel: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 9,
    letterSpacing: 1.5,
    color: '#ccc',
    marginBottom: 15,
  },
  balanceValue: {
    fontFamily: theme.fonts.serif,
    fontSize: 52,
    color: theme.colors.text,
    marginBottom: 15,
  },
  metricFootnote: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: 10,
    color: '#ccc',
  },
  walletIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#f6f5f0',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletIcon: {
    width: 40,
    height: 30,
    backgroundColor: '#fff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 8,
  },
  walletPin: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#eee',
  },
  metricCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 30,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  expenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  expenseValue: {
    fontFamily: theme.fonts.serif,
    fontSize: 38,
    color: '#c88a73',
  },
  taskValue: {
    fontFamily: theme.fonts.serif,
    fontSize: 38,
    color: theme.colors.text,
    marginBottom: 15,
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginBottom: 15,
  },
  metricFootnoteItalic: {
    fontFamily: theme.fonts.serifItalic,
    fontSize: 12,
    color: '#ccc',
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeader: {
    paddingHorizontal: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 30,
  },
  sectionTitle: {
    fontFamily: theme.fonts.serif,
    fontSize: 32,
    color: theme.colors.text,
    marginBottom: 8,
  },
  sectionLabel: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 9,
    letterSpacing: 1.5,
    color: '#ccc',
  },
  viewAllBtn: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 9,
    color: '#ccc',
    textAlign: 'right',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 4,
  },
  transactionList: {
    paddingHorizontal: 25,
    marginBottom: 50,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIconBg: {
    width: 40,
    height: 40,
    backgroundColor: '#f6f5f0',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  vendorName: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 15,
    color: theme.colors.text,
    marginBottom: 4,
  },
  categoryTime: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: 9,
    color: '#ccc',
  },
  transactionAmount: {
    fontFamily: theme.fonts.serif,
    fontSize: 16,
    textAlign: 'right',
    marginBottom: 4,
  },
  statusBadge: {
    backgroundColor: '#f6f5f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-end',
  },
  statusText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 7,
    letterSpacing: 0.5,
    color: '#ccc',
  },
  curatedSpace: {
    marginHorizontal: 25,
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 50,
  },
  curatedImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  curatedOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-end',
    padding: 30,
  },
  curatedLabel: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 9,
    letterSpacing: 2,
    color: '#fff',
    marginBottom: 10,
    opacity: 0.8,
  },
  curatedTitle: {
    fontFamily: theme.fonts.serif,
    fontSize: 32,
    color: '#fff',
  },
  manifestoSection: {
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  quoteIcon: {
    fontFamily: theme.fonts.serif,
    fontSize: 60,
    color: '#eee',
    marginBottom: -10,
  },
  manifestoText: {
    fontFamily: theme.fonts.serifItalic,
    fontSize: 24,
    lineHeight: 34,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 30,
  },
  manifestoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  footerLine: {
    width: 40,
    height: 1,
    backgroundColor: '#eee',
  },
  footerLabel: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 9,
    letterSpacing: 2,
    color: '#ccc',
  },
  // List Item Styles
  itemListContainer: {
    paddingHorizontal: 25,
    marginBottom: 40,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  taskCheck: {
    marginRight: 15,
  },
  taskInfo: {
    flex: 1,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  habitCheck: {
    marginRight: 15,
  },
  habitCheckActive: {
    opacity: 1,
  },
  habitInfo: {
    flex: 1,
  },
  itemTitle: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 15,
    color: theme.colors.text,
    marginBottom: 4,
  },
  itemSubtitle: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: 10,
    color: '#ccc',
    letterSpacing: 0.5,
  },
  habitIcon: {
    fontSize: 20,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  emptyText: {
    fontFamily: theme.fonts.serifItalic,
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default DashboardScreen;
