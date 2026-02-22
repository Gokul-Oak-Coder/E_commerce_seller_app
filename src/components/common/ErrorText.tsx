import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../constants';

const ErrorText = ({ message }: { message: string }) => {
  return <Text style={styles.error}>{message}</Text>;
};

const styles = StyleSheet.create({
  error: {
    color: COLORS.error,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
});

export default ErrorText;