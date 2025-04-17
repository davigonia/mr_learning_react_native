import React from 'react';
import { View, StyleSheet } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import ErrorBoundary from './ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <HomeScreen />
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%'
  }
});
