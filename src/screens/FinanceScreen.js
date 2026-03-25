import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image, Modal, TextInput } from 'react-native';
import { theme } from '../theme/editorial';
import { useFinance } from '../hooks/useFinance';
import { FinanceContext, CATEGORIES } from '../context/FinanceContext';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const FinanceScreen = () => {
  const { 
    balance = 0, 
    accountType = 'Account', 
    totalIncome = 0, 
    totalExpenses = 0, 
    budgets = [], 
    transactions = [], 
    addTransaction,
    deleteTransaction,
    updateTransaction,
    updateBudgetLimit
  } = useFinance();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('Expense');
  const [category, setCategory] = useState('Food & Dining');
  const [date, setDate] = useState(new Date().toLocaleDateString('en-GB').replace(/\//g, '-')); // DD-MM-YYYY format

  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const resetModal = () => {
    setDescription('');
    setAmount('');
    setType('Expense');
    setCategory('Food & Dining');
    setDate(new Date().toLocaleDateString('en-GB').replace(/\//g, '-'));
    setEditingTransactionId(null);
    setShowTypeDropdown(false);
    setShowCategoryDropdown(false);
    setIsModalVisible(false);
  };

  const handleSelectDate = (day) => {
    const d = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), day);
    setDate(d.toLocaleDateString('en-GB').replace(/\//g, '-'));
    setIsCalendarVisible(false);
  };

  const renderCalendar = () => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    
    const grid = [];
    for (let i = 0; i < firstDay; i++) grid.push(null);
    for (let i = 1; i <= days; i++) grid.push(i);

    const monthName = currentCalendarDate.toLocaleString('default', { month: 'long' });

    return (
      <Modal visible={isCalendarVisible} transparent animationType="fade">
        <View style={styles.calendarOverlay}>
          <View style={styles.calendarContainer}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={() => setCurrentCalendarDate(new Date(year, month - 1))}>
                <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
              </TouchableOpacity>
              <Text style={styles.calendarMonthTitle}>{monthName.toUpperCase()} {year}</Text>
              <TouchableOpacity onPress={() => setCurrentCalendarDate(new Date(year, month + 1))}>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.calendarDaysHeader}>
              {['S','M','T','W','T','F','S'].map((d, i) => (
                <Text key={i} style={styles.calendarDayLabel}>{d}</Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {grid.map((day, i) => (
                <TouchableOpacity 
                  key={i} 
                  style={[
                    styles.calendarDayCell, 
                    day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear() && styles.calendarTodayCell
                  ]}
                  onPress={() => day && handleSelectDate(day)}
                  disabled={!day}
                >
                  <Text style={[styles.calendarDayText, !day && { color: 'transparent' }]}>{day}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.calendarCloseBtn} onPress={() => setIsCalendarVisible(false)}>
              <Text style={styles.calendarCloseText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };
  const [editingTransactionId, setEditingTransactionId] = useState(null);
  
  // Category Detail Modal State
  const [isBudgetDetailVisible, setIsBudgetDetailVisible] = useState(false);
  const [selectedBudgetCategory, setSelectedBudgetCategory] = useState(null);
  const [newBudgetLimit, setNewBudgetLimit] = useState('');

  const categories = CATEGORIES;
  const types = ['Expense', 'Income'];

  // Budget Management
  const handleOpenBudgetDetail = (budget) => {
    const cat = budget.category;
    setSelectedBudgetCategory(cat);
    setNewBudgetLimit(budget.total.toString());
    setIsBudgetDetailVisible(true);
  };

  const handleUpdateBudget = () => {
    if (selectedBudgetCategory) {
      updateBudgetLimit(selectedBudgetCategory, newBudgetLimit);
      setIsBudgetDetailVisible(false);
    }
  };

  const handleAddTransaction = () => {
    const cleanAmount = amount.replace(/[^0-9.]/g, '');
    if (!description || !cleanAmount) return;

    const transactionData = {
      vendor: description,
      category: category.toUpperCase(),
      time: editingTransactionId ? transactions.find(t => t.id === editingTransactionId)?.time : 'JUST NOW',
      amount: cleanAmount,
      status: editingTransactionId ? transactions.find(t => t.id === editingTransactionId)?.status : 'CONFIRMED',
      icon: type === 'Income' ? 'account-balance-wallet' : 'receipt',
      isIncome: type === 'Income',
      date: date // Pass user-input date
    };

    if (editingTransactionId) {
      updateTransaction(editingTransactionId, transactionData);
    } else {
      addTransaction(transactionData);
    }

    resetModal();
  };

  const handleEditPress = (item) => {
    setDescription(item.vendor);
    setAmount(Math.abs(item.amount).toString());
    setType(item.isIncome ? 'Income' : 'Expense');
    // Find matching category (it's uppercase in data, but title case in our list)
    const matchingCategory = categories.find(c => c.toUpperCase() === item.category.toUpperCase()) || 'Other';
    setCategory(matchingCategory);
    setDate(item.date || new Date().toLocaleDateString('en-GB').replace(/\//g, '-'));
    setEditingTransactionId(item.id);
    setIsModalVisible(true);
  };

  const handleOpenAddModal = () => {
    setEditingTransactionId(null);
    setDescription('');
    setAmount('');
    setType('Expense');
    setCategory('Food & Dining');
    setDate(new Date().toLocaleDateString('en-GB').replace(/\//g, '-'));
    setIsModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarContainer}>
               <Image 
                 source={{ uri: 'https://i.pravatar.cc/150?u=viswam' }} 
                 style={styles.avatar} 
               />
            </View>
            <View style={styles.headerTitles}>
              <Text style={styles.headerTitle}>Finance</Text>
              <Text style={styles.headerTitleItalic}>tracker</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.calendarBtn}>
              <Ionicons name="calendar-outline" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.addTransactionBtn}
              onPress={handleOpenAddModal}
            >
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.addBtnText}>ADD TRANSACTION</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Net Balance Card */}
        <View style={styles.netBalanceCard}>
          <Text style={styles.netBalanceLabel}>NET BALANCE</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceAmount}>{(balance || 0).toLocaleString('en-IN')}</Text>
            <Text style={styles.balanceCurrency}>INR</Text>
          </View>
          <View style={styles.balanceDetailsRow}>
            <View style={styles.growthContainer}>
              <Text style={styles.detailLabel}>TRANSACTIONS</Text>
              <View style={styles.growthValueRow}>
                <Ionicons name="receipt-outline" size={12} color={theme.colors.text} style={styles.growthIcon} />
                <Text style={styles.growthValue}>{transactions.length}</Text>
              </View>
            </View>
            <View style={styles.accountTypeContainer}>
              <Text style={styles.detailLabel}>ACCOUNT TYPE</Text>
              <Text style={styles.accountTypeValue}>{accountType}</Text>
            </View>
          </View>
        </View>

        {/* Income & Expense Row */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryInfo}>
                <Text style={styles.statLabel}>TOTAL INCOME</Text>
                <View style={styles.statRow}>
                  <Text style={styles.statValue}>
                    ₹{Math.abs(totalIncome || 0).toLocaleString('en-IN')}
                  </Text>
                  <View style={styles.trendArrowContainer}>
                    <Ionicons name="arrow-down-outline" size={14} color="#5e614d" />
                  </View>
                </View>
            </View>
          </View>
          <View style={styles.summaryCard}>
            <View style={styles.summaryInfo}>
                <Text style={styles.statLabel}>TOTAL EXPENSES</Text>
                <View style={styles.statRow}>
                  <Text style={styles.statValue}>
                    ₹{Math.abs(totalExpenses || 0).toLocaleString('en-IN')}
                  </Text>
                  <View style={[styles.trendArrowContainer, { backgroundColor: '#fdf3f0' }]}>
                    <Ionicons name="arrow-up-outline" size={14} color="#c88a73" />
                  </View>
                </View>
            </View>
          </View>
        </View>

        {/* Spending Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Spending <Text style={styles.sectionTitleItalic}>by Category</Text></Text>
          <View style={styles.sectionDivider} />
        </View>

        <View style={styles.budgetsContainer}>
                  {budgets.map((budget) => (
                    <TouchableOpacity 
                      key={budget.id} 
                      style={styles.budgetCard}
                      onPress={() => handleOpenBudgetDetail(budget)}
                    >
                      <View style={styles.budgetHeader}>
                        <Text style={styles.categoryName}>{budget.category.toUpperCase()}</Text>
                        <Text style={styles.budgetAmount}>
                          ₹{budget.spent.toFixed(0)} / ₹{budget.total.toFixed(0)}
                        </Text>
                      </View>
                      <View style={styles.progressBarBg}>
                        <View 
                          style={[
                            styles.progressBarFill, 
                            { 
                              width: `${Math.min(100, (budget.spent / (budget.total || 1)) * 100)}%`,
                              backgroundColor: budget.spent > budget.total ? '#e74c3c' : '#2ecc71' 
                            }
                          ]} 
                        />
                      </View>
                      <Text style={styles.budgetLabel}>{budget.label}</Text>
                    </TouchableOpacity>
                  ))}
        </View>

        {/* Recent Activity Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent <Text style={styles.sectionTitleItalic}>Activity</Text></Text>
          <View style={styles.sectionDivider} />
        </View>

        <View style={styles.activityList}>
          {transactions.map(item => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.activityItem}
              onPress={() => handleEditPress(item)}
            >
              <View style={styles.activityLeft}>
                <View style={styles.activityIconBg}>
                  <MaterialIcons name={item.icon} size={20} color={theme.colors.text} />
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.vendorName}>{item.vendor}</Text>
                  <Text style={styles.categoryTime}>{item.category} • {item.time}</Text>
                </View>
              </View>
              <View style={styles.activityRight}>
                <Text style={[styles.activityAmount, { color: item.isIncome ? '#5e614d' : '#c88a73' }]}>
                  {item.isIncome ? '+' : '-'}₹{Math.abs(item.amount || 0).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </Text>
                <View style={styles.activityActions}>
                  <Text style={styles.activityStatus}>{item.status}</Text>
                  <TouchableOpacity onPress={() => deleteTransaction(item.id)} style={styles.deleteBtn}>
                    <Ionicons name="trash-outline" size={14} color={theme.colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Curated Insight Section */}
        <View style={styles.insightSection}>
          <Image 
            source={require('../assets/generated/finance_curated_insight.png')}
            style={styles.insightImage}
            resizeMode="cover"
          />
          <View style={styles.insightContent}>
            <Text style={styles.insightLabel}>CURATED INSIGHT</Text>
            <Text style={styles.insightTitle}>
              Your savings are growing 15% faster than last quarter.
            </Text>
            <Text style={styles.insightDescription}>
              By maintaining your current spending velocity in the 'Entertainment' category, you are on track to reach your House Fund goal 3 months ahead of schedule.
            </Text>
            <TouchableOpacity>
              <Text style={styles.insightLink}>VIEW PROJECTION REPORT —→</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      {/* Add Transaction Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingTransactionId ? 'Edit Transaction' : 'Add Transaction'}</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>DESCRIPTION</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Swiggy dinner"
                placeholderTextColor={theme.colors.textMuted}
                value={description}
                onChangeText={setDescription}
              />
            </View>

            <View style={[styles.rowInputs, { zIndex: showTypeDropdown ? 2000 : 1 }]}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 15, zIndex: showTypeDropdown ? 2000 : 1 }]}>
                <Text style={styles.inputLabel}>AMOUNT (₹)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="0.00"
                  placeholderTextColor={theme.colors.textMuted}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, zIndex: showTypeDropdown ? 2001 : 1 }]}>
                <Text style={styles.inputLabel}>TYPE</Text>
                <TouchableOpacity 
                  style={styles.dropdownTrigger}
                  onPress={() => {
                    setShowTypeDropdown(!showTypeDropdown);
                    setShowCategoryDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownText}>{type}</Text>
                  <Ionicons name="chevron-down" size={16} color={theme.colors.text} />
                </TouchableOpacity>
                {showTypeDropdown && (
                  <View style={styles.customDropdown}>
                    {types.map(t => (
                      <TouchableOpacity 
                        key={t} 
                        style={[styles.dropdownOption, t === type && styles.dropdownOptionActive]}
                        onPress={() => { setType(t); setShowTypeDropdown(false); }}
                      >
                        <Text style={[styles.dropdownOptionText, t === type && styles.dropdownOptionTextActive]}>{t}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            <View style={[styles.rowInputs, { zIndex: showCategoryDropdown ? 1000 : 1 }]}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 15, zIndex: showCategoryDropdown ? 1001 : 1 }]}>
                <Text style={styles.inputLabel}>CATEGORY</Text>
                <TouchableOpacity 
                  style={styles.dropdownTrigger}
                  onPress={() => {
                    setShowCategoryDropdown(!showCategoryDropdown);
                    setShowTypeDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownText} numberOfLines={1}>{category}</Text>
                  <Ionicons name="chevron-down" size={16} color={theme.colors.text} />
                </TouchableOpacity>
                {showCategoryDropdown && (
                  <View style={[styles.customDropdown, { height: 200, zIndex: 1002 }]}>
                    <ScrollView nestedScrollEnabled={true}>
                      {categories.map(c => (
                        <TouchableOpacity 
                          key={c} 
                          style={[styles.dropdownOption, c === category && styles.dropdownOptionActive]}
                          onPress={() => { setCategory(c); setShowCategoryDropdown(false); }}
                        >
                          <Text style={[styles.dropdownOptionText, c === category && styles.dropdownOptionTextActive]}>{c}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>DATE</Text>
                <View style={styles.dateInputContainer}>
                  <TextInput
                    style={[styles.textInput, { paddingRight: 35 }]}
                    value={date}
                    onChangeText={setDate}
                    placeholder="DD-MM-YYYY"
                  />
                  <TouchableOpacity 
                    style={styles.dateIconContainer} 
                    onPress={() => setIsCalendarVisible(true)}
                  >
                    <Ionicons name="calendar-outline" size={16} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelBtn}
                onPress={resetModal}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.submitBtn}
                onPress={handleAddTransaction}
              >
                <Text style={styles.submitBtnText}>{editingTransactionId ? 'Update Transaction' : 'Add Transaction'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Category Detail Modal */}
      <Modal
        visible={isBudgetDetailVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsBudgetDetailVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '94%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedBudgetCategory?.toUpperCase()}</Text>
              <TouchableOpacity onPress={() => setIsBudgetDetailVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Set Budget Section */}
              <View style={styles.budgetManagementSection}>
                <Text style={styles.inputLabel}>MONTHLY BUDGET LIMIT</Text>
                <View style={styles.budgetInputContainer}>
                  <Text style={styles.currencyPrefix}>₹</Text>
                  <TextInput
                    style={styles.budgetTextInput}
                    placeholder="0"
                    placeholderTextColor={theme.colors.text.secondary}
                    value={newBudgetLimit}
                    onChangeText={setNewBudgetLimit}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity style={styles.saveBudgetBtn} onPress={handleUpdateBudget}>
                    <Text style={styles.saveBudgetBtnText}>SET</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Transactions Section */}
              <View style={styles.categoryActivitySection}>
                <Text style={styles.modalSubTitle}>RECENT {selectedBudgetCategory?.toUpperCase()} ACTIVITY</Text>
                {transactions
                  .filter(t => t.category?.toUpperCase() === selectedBudgetCategory?.toUpperCase())
                  .map(transaction => (
                    <TouchableOpacity 
                      key={transaction.id} 
                      style={styles.activityRow}
                      onPress={() => {
                        setIsBudgetDetailVisible(false);
                        handleEditPress(transaction);
                      }}
                    >
                      <View style={styles.activityIconBox}>
                        <Ionicons name={transaction.icon || 'receipt'} size={20} color={theme.colors.text.primary} />
                      </View>
                      <View style={styles.activityInfo}>
                        <Text style={styles.activityVendor}>{transaction.vendor}</Text>
                        <Text style={styles.activityTime}>{transaction.date} • {transaction.time}</Text>
                      </View>
                      <View style={styles.activityAmountContainer}>
                        <Text style={[
                          styles.activityAmount, 
                          { color: transaction.amount > 0 ? '#2ecc71' : (transaction.isIncome ? '#5e614d' : '#c88a73') }
                        ]}>
                          {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount).toFixed(0)}
                        </Text>
                        <Text style={styles.activityStatus}>{transaction.status}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                  {transactions.filter(t => t.category?.toUpperCase() === selectedBudgetCategory?.toUpperCase()).length === 0 && (
                    <Text style={styles.emptyActivityText}>No transactions in this category.</Text>
                  )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {renderCalendar()}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: 20,
    marginBottom: 30,
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
    marginRight: 12,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  headerTitles: {
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: theme.fonts.serif,
    fontSize: 20,
    color: theme.colors.text,
    lineHeight: 22,
  },
  headerTitleItalic: {
    fontFamily: theme.fonts.serifItalic,
    fontSize: 20,
    color: theme.colors.textMuted,
    lineHeight: 22,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  calendarBtn: {
    padding: 5,
  },
  addTransactionBtn: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    gap: 6,
  },
  addBtnText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 9,
    color: '#fff',
    letterSpacing: 0.5,
  },
  netBalanceCard: {
    backgroundColor: '#fff',
    marginHorizontal: 25,
    borderRadius: 16,
    padding: 30,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
    borderTopWidth: 5,
    borderTopColor: '#5e614d', // Accent derived from mockup
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.03,
    shadowRadius: 15,
    elevation: 2,
  },
  netBalanceLabel: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 9,
    letterSpacing: 2,
    color: '#ccc',
    marginBottom: 10,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 35,
  },
  balanceAmount: {
    fontFamily: theme.fonts.serif,
    fontSize: 58,
    color: theme.colors.text,
  },
  balanceCurrency: {
    fontFamily: theme.fonts.serif,
    fontSize: 24,
    color: theme.colors.textMuted,
    marginLeft: 10,
  },
  balanceDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 8,
    color: '#ccc',
    letterSpacing: 1,
    marginBottom: 8,
  },
  growthValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  growthIcon: {
    marginRight: 6,
    opacity: 0.3,
  },
  growthValue: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: 16,
    color: theme.colors.text,
  },
  accountTypeValue: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: 16,
    color: theme.colors.text,
  },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 25,
    gap: 15,
    marginBottom: 40,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#f6f5f0',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 8,
    color: '#ccc',
    letterSpacing: 1,
    marginBottom: 5,
  },
  summaryAmount: {
    fontFamily: theme.fonts.serif,
    fontSize: 24,
    color: theme.colors.text,
  },
  summaryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginBottom: 25,
  },
  sectionTitle: {
    fontFamily: theme.fonts.serif,
    fontSize: 28,
    color: theme.colors.text,
    marginRight: 15,
  },
  sectionTitleItalic: {
    fontFamily: theme.fonts.serifItalic,
    color: theme.colors.textMuted,
  },
  sectionDivider: {
    flex: 1,
    height: 1,
    backgroundColor: '#eee',
    opacity: 0.5,
  },
  budgetsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 25,
    borderRadius: 16,
    padding: 30,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#eee',
  },
  budgetItem: {
    marginBottom: 25,
  },
  budgetCard: {
    marginBottom: 35, // Added significant margin for separation
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  categoryName: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: 16,
    color: theme.colors.text,
  },
  budgetAmount: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: 11,
    color: '#ccc',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#f5f4ef',
    borderRadius: 2,
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 1,
  },
  budgetLabel: {
    color: theme.colors.text.secondary,
    fontFamily: theme.fonts.medium,
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 8,
  },
  // Budget Detail Modal Styles
  budgetManagementSection: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    paddingBottom: 15,
  },
  budgetInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  currencyPrefix: {
    color: theme.colors.text.primary,
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    marginRight: 5,
  },
  budgetTextInput: {
    flex: 1,
    height: 50,
    color: theme.colors.text.primary,
    fontFamily: theme.fonts.bold,
    fontSize: 20,
  },
  saveBudgetBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    height: 34,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBudgetBtnText: {
    color: '#000',
    fontFamily: theme.fonts.bold,
    fontSize: 12,
  },
  categoryActivitySection: {
    marginTop: 10,
  },
  emptyActivityText: {
    color: theme.colors.text.secondary,
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  activityIconBox: {
    width: 40,
    height: 40,
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
    letterSpacing: 0.2,
  },
  activityAmount: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 15,
    textAlign: 'right',
    marginBottom: 4,
  },
  activityStatus: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 8,
    color: '#ccc',
    textAlign: 'right',
    letterSpacing: 0.5,
  },
  activityList: {
    paddingHorizontal: 25,
    marginBottom: 50,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityIconBg: {
    width: 40,
    height: 40,
    backgroundColor: '#f6f5f0',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  activityInfo: {
    flex: 1,
  },
  activityRight: {
    alignItems: 'flex-end',
  },
  activityActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  deleteBtn: {
    padding: 2,
  },
  insightSection: {
    marginTop: 20,
    paddingHorizontal: 25,
  },
  insightImage: {
    width: '100%',
    height: 240,
    borderRadius: 16,
    marginBottom: 30,
  },
  insightContent: {
    paddingHorizontal: 5,
  },
  insightLabel: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 10,
    letterSpacing: 1.5,
    color: '#ccc',
    marginBottom: 20,
  },
  insightTitle: {
    fontFamily: theme.fonts.serif,
    fontSize: 34,
    lineHeight: 40,
    color: theme.colors.text,
    marginBottom: 25,
  },
  insightDescription: {
    fontFamily: theme.fonts.sans,
    fontSize: 14,
    lineHeight: 22,
    color: theme.colors.textMuted,
    marginBottom: 25,
  },
  insightLink: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 10,
    letterSpacing: 1,
    color: theme.colors.text,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 4,
    alignSelf: 'flex-start',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end', // Position it at the bottom to maximize space
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
  textInput: {
    backgroundColor: '#f5f4ef',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: 14,
    color: theme.colors.text,
  },
  rowInputs: {
    flexDirection: 'row',
    zIndex: 1, // Ensure dropdowns aren't clipped easily
  },
  dropdownTrigger: {
    backgroundColor: '#f5f4ef',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: 14,
    color: theme.colors.text,
  },
  customDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 1000,
    overflow: 'hidden',
  },
  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f9f8f3',
  },
  dropdownOptionActive: {
    backgroundColor: '#3b82f6', // Match the blue highlight in screenshot
  },
  dropdownOptionText: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: 14,
    color: theme.colors.text,
  },
  dropdownOptionTextActive: {
    color: '#fff',
  },
  dateInputContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  dateIconContainer: {
    position: 'absolute',
    right: 12,
    top: 14,
  },
  calendarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
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
  },
  calendarDaysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  calendarDayLabel: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 10,
    color: '#999',
    width: 35,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  calendarDayCell: {
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 1,
  },
  calendarDayText: {
    fontFamily: theme.fonts.sans,
    fontSize: 12,
    color: theme.colors.text,
  },
  calendarTodayCell: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  calendarCloseBtn: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  calendarCloseText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 12,
    color: theme.colors.text,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 15,
    marginTop: 10,
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
    color: theme.colors.textSecondary,
  },
  submitBtn: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 14,
    color: '#fff',
  },
  modalSubTitle: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 10,
    letterSpacing: 1,
    color: '#ccc',
    marginBottom: 15,
  },
});

export default FinanceScreen;
