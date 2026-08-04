import Animated, {
  type SharedValue,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  runOnJS,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { motion } from "../theme";
import { Pressable, Dimensions } from "react-native";
import React from "react";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function useFadeIn(delay = 0) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);

  React.useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: motion.timing.normal }));
    translateY.value = withDelay(delay, withSpring(0, motion.spring.gentle));
  }, []);

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
}

export function useStaggeredReveal(count: number, baseDelay = 0) {
  const animatedValues = Array.from({ length: count }, (_, i) => ({
    opacity: useSharedValue(0),
    translateY: useSharedValue(20),
  }));

  React.useEffect(() => {
    animatedValues.forEach((val, i) => {
      const delay = baseDelay + i * motion.stagger.normal;
      val.opacity.value = withDelay(delay, withTiming(1, { duration: motion.timing.normal }));
      val.translateY.value = withDelay(delay, withSpring(0, motion.spring.gentle));
    });
  }, [count]);

  return animatedValues.map((val) =>
    useAnimatedStyle(() => ({
      opacity: val.opacity.value,
      transform: [{ translateY: val.translateY.value }],
    }))
  );
}

export function usePressAnimation() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const onPressIn = () => {
    scale.value = withSpring(0.96, motion.spring.snappy);
    opacity.value = withTiming(0.85, { duration: motion.timing.fast });
  };

  const onPressOut = () => {
    scale.value = withSpring(1, motion.spring.bouncy);
    opacity.value = withTiming(1, { duration: motion.timing.fast });
  };

  return { animatedStyle, onPressIn, onPressOut };
}

export function useShimmer(width: number) {
  const translateX = useSharedValue(-width);

  React.useEffect(() => {
    translateX.value = withTiming(width, {
      duration: 1200,
    });
  }, []);

  return useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));
}

export function useParallax(scrollY: SharedValue<number>, speed = 0.5) {
  return useAnimatedStyle(() => ({
    transform: [{ translateY: scrollY.value * speed }],
  }));
}

export function AnimatedPressable({
  children,
  onPress,
  style,
  hitSlop,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
  hitSlop?: number;
}) {
  const { animatedStyle, onPressIn, onPressOut } = usePressAnimation();

  return React.createElement(
    Pressable,
    { onPress, onPressIn, onPressOut, hitSlop },
    React.createElement(Animated.View, { style: [style, animatedStyle] }, children)
  );
}

export { Animated, SCREEN_WIDTH };
