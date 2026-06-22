import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { storage } from "@/src/utils/storage";
import { adminLogin, TOKEN_KEY } from "@/src/api";
import { colors, font, radius, spacing } from "@/src/theme";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@weconnect.app");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setErr(null);
    if (!email.trim() || !password) {
      setErr("Enter email and password");
      return;
    }
    setLoading(true);
    try {
      const res = await adminLogin(email.trim().toLowerCase(), password);
      await storage.secureSet(TOKEN_KEY, res.token);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/admin/dashboard");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Login failed";
      setErr(msg);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          testID="admin-login-back-btn"
          style={styles.iconBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <View style={styles.iconBtn} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.body}>
          <View style={styles.lockBadge}>
            <Ionicons name="lock-closed" size={28} color={colors.brand} />
          </View>
          <Text style={styles.title}>Sign in to manage listings</Text>
          <Text style={styles.subtitle}>
            Add, edit, delete and import business listings.
          </Text>

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              testID="admin-email-input"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="admin@weconnect.app"
              placeholderTextColor={colors.muted}
            />
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Password</Text>
            <View style={styles.pwdRow}>
              <TextInput
                testID="admin-password-input"
                style={[styles.input, { flex: 1 }]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPwd}
                placeholder="Enter password"
                placeholderTextColor={colors.muted}
              />
              <Pressable
                testID="admin-toggle-password"
                style={styles.eyeBtn}
                onPress={() => setShowPwd((s) => !s)}
              >
                <Ionicons
                  name={showPwd ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.muted}
                />
              </Pressable>
            </View>
          </View>

          {err ? (
            <View style={styles.errorBox} testID="admin-login-error">
              <Ionicons
                name="alert-circle-outline"
                size={16}
                color={colors.error}
              />
              <Text style={styles.errorText}>{err}</Text>
            </View>
          ) : null}

          <Pressable
            testID="admin-login-submit"
            style={[styles.btn, loading && { opacity: 0.7 }]}
            onPress={submit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Sign in</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: font.lg,
    fontWeight: "700",
    color: colors.onSurface,
  },
  body: { padding: spacing.xl, gap: spacing.md },
  lockBadge: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.brandTertiary,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: spacing.md,
  },
  title: {
    textAlign: "center",
    fontSize: font.xl,
    fontWeight: "700",
    color: colors.onSurface,
  },
  subtitle: {
    textAlign: "center",
    fontSize: font.sm,
    color: colors.muted,
    marginBottom: spacing.lg,
  },
  fieldWrap: { gap: spacing.xs },
  fieldLabel: {
    fontSize: font.sm,
    fontWeight: "600",
    color: colors.onSurfaceSecondary,
  },
  input: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: font.base,
    color: colors.onSurface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pwdRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  eyeBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "#FEF2F2",
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorText: { color: colors.error, fontSize: font.sm, flex: 1 },
  btn: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.md,
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: font.base },
});
