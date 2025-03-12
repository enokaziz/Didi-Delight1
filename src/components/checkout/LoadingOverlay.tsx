import React from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import * as Progress from 'react-native-progress';

type Props = {
  visible: boolean;
  animations: { opacity: Animated.Value; scale: Animated.Value };
  message?: string;
};

const LoadingOverlay = ({ visible, animations, message = 'Traitement...' }: Props) => (
  <Animated.View
    style={[
      styles.loadingOverlay,
      {
        opacity: animations.opacity,
        transform: [{ scale: animations.scale }],
      },
    ]}
  >
    {visible && (
      <View style={styles.loadingContent}>
        <Progress.CircleSnail color={['#FF4952']} size={80} thickness={3} />
        <Text style={styles.loadingText}>{message}</Text>
      </View>
    )}
  </Animated.View>
);

const styles = StyleSheet.create({
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 1000,
  },
  loadingContent: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  loadingText: { marginTop: 15, fontSize: 16, color: '#495057', fontWeight: '500' },
});

export default LoadingOverlay;