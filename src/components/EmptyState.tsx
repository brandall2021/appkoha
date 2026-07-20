import React, { useRef, useEffect } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface Props {
  icon?: string;
  title: string;
  description?: string;
  loading?: boolean;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, loading, action }: Props) {
  const theme = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 12,
        stiffness: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle floating animation for the icon
    if (!loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, []);

  const iconTranslateY = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={[styles.iconContainer, { backgroundColor: `${theme.colors.primary}12` }]}>
          <Animated.View>
            <MaterialCommunityIcons
              name="loading"
              size={36}
              color={theme.colors.primary}
            />
          </Animated.View>
        </View>
        <Text variant="bodyLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
          {title}
        </Text>
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.iconContainer,
          {
            backgroundColor: `${theme.colors.primary}08`,
            transform: [{ translateY: iconTranslateY }],
          },
        ]}
      >
        <MaterialCommunityIcons
          name={(icon as any) || "book-open-variant"}
          size={56}
          color={theme.colors.outline}
        />
      </Animated.View>

      <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
        {title}
      </Text>

      {description && (
        <Text variant="bodyMedium" style={[styles.description, { color: theme.colors.outline }]}>
          {description}
        </Text>
      )}

      {action && <View style={styles.action}>{action}</View>}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    marginTop: 8,
    textAlign: "center",
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  description: {
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  action: {
    marginTop: 24,
  },
});
