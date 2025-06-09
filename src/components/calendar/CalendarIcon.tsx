import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type CalendarIconProps = {
  size?: number;
  color?: string;
};

const CalendarIcon: React.FC<CalendarIconProps> = ({ 
  size = 24, 
  color = '#007AFF' 
}) => {
  const styles = StyleSheet.create({
    container: {
      width: size,
      height: size,
      justifyContent: 'center',
      alignItems: 'center',
    },
    icon: {
      fontSize: size * 0.8,
      color: color,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📅</Text>
    </View>
  );
};

export default CalendarIcon;