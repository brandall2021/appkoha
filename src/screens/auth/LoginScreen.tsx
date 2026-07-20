import React, { useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import {
  Text, useTheme, TextInput, Button, Surface, IconButton, Snackbar,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getKohaAPI, initKohaAPI } from "../../api/koha";
import { useAppStore } from "../../stores/appStore";

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { setPatron, kohaUrl, setKohaUrl, setConfigured } = useAppStore();
  const [url, setUrl] = useState(kohaUrl || "");
  const [userid, setUserid] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.content}>
        <View style={[styles.logoContainer, { backgroundColor: theme.colors.primaryContainer }]}>
          <MaterialCommunityIcons name="book-open-variant" size={40} color={theme.colors.primary} />
        </View>
        <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onBackground }]}>
          KohaLibrary
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.outline, textAlign: "center" }}>
          Conecta con tu biblioteca universitaria
        </Text>

        <Surface style={[styles.form, { backgroundColor: theme.colors.surface }]} elevation={2}>
          <TextInput
            label="URL de Koha"
            value={url}
            onChangeText={setUrl}
            mode="outlined"
            placeholder="https://tubiblioteca.koha.com"
            left={<TextInput.Icon icon="web" />}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />

          <TextInput
            label="Usuario / Num. de socio"
            value={userid}
            onChangeText={setUserid}
            mode="outlined"
            left={<TextInput.Icon icon="account" />}
            autoCapitalize="none"
            style={styles.input}
          />

          <TextInput
            label="Contrasena"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={showPassword ? "eye-off" : "eye"}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            style={styles.input}
          />

          {error ? (
            <Text variant="bodySmall" style={styles.errorText}>
              {error}
            </Text>
          ) : null}

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.loginButton}
            contentStyle={{ paddingVertical: 6 }}
          >
            Iniciar sesion
          </Button>
        </Surface>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  form: {
    marginTop: 32,
    padding: 24,
    borderRadius: 20,
  },
  input: {
    marginBottom: 12,
  },
  errorText: {
    color: "#D32F2F",
    marginBottom: 12,
    textAlign: "center",
  },
  loginButton: {
    borderRadius: 12,
    marginTop: 4,
  },
});
