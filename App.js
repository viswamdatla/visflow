import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';

import { useFonts } from 'expo-font';
import { 
  Inter_400Regular, 
  Inter_600SemiBold, 
  Inter_700Bold 
} from '@expo-google-fonts/inter';
import { 
  DMSerifDisplay_400Regular, 
  DMSerifDisplay_400Regular_Italic 
} from '@expo-google-fonts/dm-serif-display';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { theme } from './src/theme/editorial';
import { Ionicons } from '@expo/vector-icons';

// Keep the splash screen visible while we fetch resources
try {
  SplashScreen.preventAutoHideAsync();
} catch (e) {
  console.warn('SplashScreen.preventAutoHideAsync() failed:', e);
}

// Import Screens
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import FinanceScreen from './src/screens/FinanceScreen';
import TasksScreen from './src/screens/TasksScreen';
import HabitsScreen from './src/screens/HabitsScreen';
import GoalsScreen from './src/screens/GoalsScreen';
import DietScreen from './src/screens/DietScreen';
import { CalendarScreen } from './src/screens/CalendarScreen';
import { FinanceProvider } from './src/context/FinanceContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { useMigration } from './src/hooks/useMigration';

const Tab = createBottomTabNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    DMSerifDisplay_400Regular,
    DMSerifDisplay_400Regular_Italic,
  });

  const onLayoutRootView = React.useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <AuthProvider>
        <FinanceProvider>
          <MainContent />
        </FinanceProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const MainContent = () => {
  const { user, loading } = useAuth();
  useMigration(); // Automatically handles one-time data push to Cloud
  
  if (loading) return null;

  if (!user) {
    return (
      <>
        <StatusBar style="dark" />
        <LoginScreen />
      </>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopWidth: 1,
            borderTopColor: '#f0f0f0',
            height: 85,
            paddingBottom: 25,
            paddingTop: 10,
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: '#a0a0a0',
          tabBarLabelStyle: {
            fontFamily: theme.fonts.sansSemiBold,
            fontSize: 10,
            letterSpacing: 0.5,
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused ? 'grid' : 'grid-outline';
            } else if (route.name === 'Finance') {
              iconName = focused ? 'wallet' : 'wallet-outline';
            } else if (route.name === 'Tasks') {
              iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
            } else if (route.name === 'Habits') {
              iconName = focused ? 'repeat' : 'repeat-outline';
            } else if (route.name === 'Goals') {
              iconName = focused ? 'trophy' : 'trophy-outline';
            } else if (route.name === 'Diet') {
              iconName = focused ? 'restaurant' : 'restaurant-outline';
            } else if (route.name === 'Calendar') {
              iconName = focused ? 'calendar' : 'calendar-outline';
            }

            return <Ionicons name={iconName} size={20} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={DashboardScreen} />
        <Tab.Screen name="Finance" component={FinanceScreen} />
        <Tab.Screen name="Tasks" component={TasksScreen} />
        <Tab.Screen name="Habits" component={HabitsScreen} />
        <Tab.Screen name="Goals" component={GoalsScreen} />
        <Tab.Screen name="Diet" component={DietScreen} />
        <Tab.Screen name="Calendar" component={CalendarScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
