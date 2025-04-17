import React from 'react';
import { View, StyleSheet } from 'react-native';

// A simple implementation of LinearGradient for React Native Web
const CustomLinearGradient = ({ colors, style, children }) => {
  const gradientBackground = {
    background: `linear-gradient(135deg, ${colors.join(', ')})`,
  };

  return (
    <View style={[styles.container, style]}>
      <div style={gradientBackground} className="gradient-background" />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
});

export default CustomLinearGradient;
