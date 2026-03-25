import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(`@vishflow_${key}`, jsonValue);
  } catch (e) {
    console.error(`Error saving ${key}:`, e);
  }
};

export const getData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(`@vishflow_${key}`);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error(`Error loading ${key}:`, e);
    return null;
  }
};

export const clearData = async (key) => {
  try {
    await AsyncStorage.removeItem(`@vishflow_${key}`);
  } catch (e) {
    console.error(`Error clearing ${key}:`, e);
  }
};
