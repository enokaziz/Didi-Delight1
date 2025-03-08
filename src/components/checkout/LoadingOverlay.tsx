// components/checkout/LoadingOverlay.tsx
import React from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import * as Progress from 'react-native-progress';

type Props = {
  visible: boolean;
  animations: {
    opacity: Animated.Value;
    scale: Animated.Value;
  };
};

const LoadingOverlay = ({ visible, animations }: Props) => (
    <Animated.View style={[
      styles.loadingOverlay,
      {
        opacity: animations.opacity,
        transform: [{ scale: animations.scale }]
      }
    ]}>
      {visible && (
        <View style={styles.loadingContent}>
          <Progress.CircleSnail color={["#FF4952"]} size={80} />
          <Text style={styles.loadingText}>Traitement...</Text>
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
    },
    loadingContent: {
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 15,
      fontSize: 16,
      color: '#495057',
      fontWeight: '500' as '500', // Correction TypeScript
    }
  });
  
  export default LoadingOverlay;