import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform, Pressable, Animated } from "react-native";
import {
  Text, useTheme, TextInput, Button, Surface, IconButton, Snackbar,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getKohaAPI, initKohaAPI } from "../../api/koha";
import { useAppStore } from "../../stores/appStore";
import { shadows, borderRadius, motion } from "../../theme";

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { setPatron, kohaUrl, setKohaUrl, setConfigured, isDarkMode } = useAppStore();
  const [url, setUrl] = useState(kohaUrl || "");
  const [userid, setUserid] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 20,
        stiffness: 100,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        damping: 12,
        stiffness: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!url.trim() || !userid.trim() || !password.trim()) {
      setError("Completa todos los campos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let baseUrl = url.trim();
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      baseUrl = baseUrl.replace(/\/$/, "");

      initKohaAPI({
        baseUrl,
        authType: "basic",
        username: userid.trim(),
        password: password.trim(),
      });

      setKohaUrl(baseUrl);
      const api = getKohaAPI();
      const patron = await api.loginPatron(userid.trim(), password.trim());
      setPatron(patron);
      setConfigured(true);

      router.replace("/(tabs)");
    } catch (err: any) {
      setError(err.message || "Error al conectar con Koha");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? "#0A0A0A" : "#FFFFFF" }]}>
      {/* Background Gradient Accent */}
      <View
        style={[
          styles.backgroundAccent,
          {
            backgroundColor: isDarkMode ? "rgba(76, 175, 80, 0.08)" : "rgba(27, 94, 32, 0.04)",
          },
        ]}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Logo */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                backgroundColor: theme.colors.primaryContainer,
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            <MaterialCommunityIcons name="book-open-variant" size={44} color={theme.colors.primary} />
          </Animated.View>

          <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onBackground }]}>
            KohaLibrary
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.outline, textAlign: "center", marginBottom: 8 }}>
            Conecta con tu biblioteca universitaria
          </Text>

          {/* Form Card */}
          <Surface style={[styles.form, { backgroundColor: theme.colors.surface }, shadows.lg]} elevation={0}>
            {/* URL Input */}
            <TextInput
              label="URL de Koha"
              value={url}
              onChangeText={setUrl}
              mode="outlined"
              placeholder="https://tubiblioteca.koha.com"
              left={<TextInput.Icon icon="web" color={theme.colors.primary} />}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
              outlineStyle={styles.inputOutline}
              theme={{
                colors: {
                  primary: theme.colors.primary,
                  outline: theme.colors.outlineVariant,
                },
              }}
            />

            {/* User ID Input */}
            <TextInput
              label="Usuario / Num. de socio"
              value={userid}
              onChangeText={setUserid}
              mode="outlined"
              left={<TextInput.Icon icon="account" color={theme.colors.primary} />}
              autoCapitalize="none"
              style={styles.input}
              outlineStyle={styles.inputOutline}
              theme={{
                colors: {
                  primary: theme.colors.primary,
                  outline: theme.colors.outlineVariant,
                },
              }}
            />

            {/* Password Input */}
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
              theme={{
                colors: {
                  primary: theme.colors.primary,
                  outline: theme.colors.outlineVariant,
                },
              }}
            />

            {/* Error Message */}
            {error ? (
              <View style={[styles.errorContainer, { backgroundColor: `${theme.colors.error}12` }]}>
                <MaterialCommunityIcons name="alert-circle" size={16} color={theme.colors.error} />
                <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
                  {error}
                </Text>
              </View>
            ) : null}

            {/* Login Button */}
            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={[styles.loginButton, { backgroundColor: theme.colors.primary }]}
              contentStyle={{ paddingVertical: 8 }}
              labelStyle={{ fontWeight: "700", fontSize: 15 }}
              buttonColor={theme.colors.primary}
            >
              Iniciar sesion
            </Button>
          </Surface>

          {/* Footer */}
          <View style={styles.footer}>
            <MaterialCommunityIcons name="shield-lock" size={14} color={theme.colors.outline} />
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
  container: {
    flex: 1,
  },
  backgroundAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "40%",
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
  },
  keyboardView: {
    flex: 1,
  },
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
