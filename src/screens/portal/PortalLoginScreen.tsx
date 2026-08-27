import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform, Animated } from "react-native";
import {
  Text, useTheme, TextInput, Button, Surface,
} from "react-native-paper";
import { MaterialCommunityIcons as Icons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../stores/authStore";
import { shadows, borderRadius, motion } from "../../theme";

export default function PortalLoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    clearError();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, damping: 20, stiffness: 100, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, damping: 12, stiffness: 100, useNativeDriver: true }),
    ]).start();
    return () => clearError();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      return;
    }

    try {
      await login(email.trim(), password);
      router.replace("/(tabs)");
    } catch {
      // error is surfaced through the auth store state
    }
  };

  const accentBg = theme.dark
    ? "rgba(129, 199, 132, 0.08)"
    : "rgba(27, 94, 32, 0.04)";

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.backgroundAccent, { backgroundColor: accentBg }]} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Animated.View
            style={[
              styles.logoContainer,
              { backgroundColor: theme.colors.primaryContainer, transform: [{ scale: logoScale }] },
            ]}
          >
            <Icons name="school" size={44} color={theme.colors.primary} />
          </Animated.View>

          <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onBackground }]}>
            Portal Universitario
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.outline, textAlign: "center", marginBottom: 8 }}>
            Accede a tu cuenta institucional
          </Text>

          <Surface style={[styles.form, { backgroundColor: theme.colors.surface }, shadows.lg]} elevation={0}>
            <TextInput
              label="Correo institucional"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              left={<TextInput.Icon icon="email" color={theme.colors.primary} />}
              style={styles.input}
              outlineStyle={styles.inputOutline}
              theme={{ colors: { primary: theme.colors.primary, outline: theme.colors.outlineVariant } }}
            />

            <TextInput
              label="Contrasena"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry={!showPassword}
              left={<TextInput.Icon icon="lock" color={theme.colors.primary} />}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                  color={theme.colors.outline}
                />
              }
              style={styles.input}
              outlineStyle={styles.inputOutline}
              theme={{ colors: { primary: theme.colors.primary, outline: theme.colors.outlineVariant } }}
            />

            {error ? (
              <View style={[styles.errorContainer, { backgroundColor: `${theme.colors.error}12` }]}>
                <Icons name="alert-circle" size={16} color={theme.colors.error} />
                <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
                  {error}
                </Text>
              </View>
            ) : null}

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
              style={[styles.loginButton, { backgroundColor: theme.colors.primary }]}
              contentStyle={{ paddingVertical: 8 }}
              labelStyle={{ fontWeight: "700", fontSize: 15 }}
              buttonColor={theme.colors.primary}
            >
              Iniciar sesion
            </Button>
          </Surface>

          <View style={styles.footer}>
            <Icons name="shield-lock" size={14} color={theme.colors.outline} />
            <Text variant="bodySmall" style={{ color: theme.colors.outline, marginLeft: 4 }}>
              Conexion segura via HTTPS
            </Text>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "40%",
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
  },
  keyboardView: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logoContainer: {
    width: 88,
    height: 88,
    borderRadius: borderRadius.xxl,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  form: {
    marginTop: 32,
    padding: 24,
    borderRadius: borderRadius.xl,
  },
  input: {
    marginBottom: 14,
    backgroundColor: "transparent",
  },
  inputOutline: {
    borderRadius: borderRadius.md,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: borderRadius.md,
    marginBottom: 14,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontWeight: "500",
  },
  loginButton: {
    borderRadius: borderRadius.lg,
    marginTop: 4,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
});
