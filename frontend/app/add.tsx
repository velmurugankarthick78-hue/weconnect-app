import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { colors, spacing, radius, font } from "@/src/theme";
import { createBusiness, getCategories, type Category } from "@/src/api";

const DISTRICTS = ["Tirunelveli", "Thoothukudi"] as const;

export default function AddBusinessScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [district, setDistrict] =
    useState<(typeof DISTRICTS)[number]>("Tirunelveli");
  const [category, setCategory] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const cats = await getCategories();
      setCategories(cats);
      if (cats.length && !category) setCategory(cats[0].key);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const submit = async () => {
    if (!name.trim() || !ownerName.trim() || !mobile.trim() || !address.trim()) {
      showToast("Please fill all required fields");
      return;
    }
    if (!/^\d{10}$/.test(mobile.replace(/\D/g, ""))) {
      showToast("Enter a valid 10-digit mobile number");
      return;
    }
    setSubmitting(true);
    try {
      await createBusiness({
        name: name.trim(),
        owner_name: ownerName.trim(),
        mobile: mobile.trim(),
        whatsapp: whatsapp.trim() || mobile.trim(),
        address: address.trim(),
        district,
        category,
        description: description.trim(),
        image_url:
          categories.find((c) => c.key === category)?.image_url || null,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast("Business listed successfully");
      setTimeout(() => router.back(), 800);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Submission failed";
      showToast(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          testID="add-back-btn"
          style={styles.iconBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>List your business</Text>
        <View style={styles.iconBtn} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Field
            label="Business name *"
            testID="add-name-input"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Bright Battery Shop"
          />
          <Field
            label="Owner name *"
            testID="add-owner-input"
            value={ownerName}
            onChangeText={setOwnerName}
            placeholder="e.g. Karthik"
          />
          <Field
            label="Mobile number *"
            testID="add-mobile-input"
            value={mobile}
            onChangeText={setMobile}
            placeholder="10-digit mobile"
            keyboardType="phone-pad"
          />
          <Field
            label="WhatsApp number (optional)"
            testID="add-whatsapp-input"
            value={whatsapp}
            onChangeText={setWhatsapp}
            placeholder="Defaults to mobile"
            keyboardType="phone-pad"
          />
          <Field
            label="Address *"
            testID="add-address-input"
            value={address}
            onChangeText={setAddress}
            placeholder="Street, area, landmark"
            multiline
          />

          <Text style={styles.fieldLabel}>District *</Text>
          <View style={styles.chipRow}>
            {DISTRICTS.map((d) => {
              const active = district === d;
              return (
                <Pressable
                  key={d}
                  testID={`add-district-${d.toLowerCase()}`}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setDistrict(d)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      active && styles.chipTextActive,
                    ]}
                  >
                    {d}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.fieldLabel}>Category *</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.catRow}
          >
            {categories.map((c) => {
              const active = category === c.key;
              return (
                <Pressable
                  key={c.key}
                  testID={`add-category-${c.key}`}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setCategory(c.key)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      active && styles.chipTextActive,
                    ]}
                  >
                    {c.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Field
            label="Description (optional)"
            testID="add-desc-input"
            value={description}
            onChangeText={setDescription}
            placeholder="Tell customers about your business"
            multiline
          />
        </ScrollView>

        <SafeAreaView edges={["bottom"]} style={styles.bottomBar}>
          <Pressable
            testID="add-submit-btn"
            style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
            onPress={submit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.submitText}>Submit listing</Text>
              </>
            )}
          </Pressable>
        </SafeAreaView>
      </KeyboardAvoidingView>

      {toast ? (
        <View pointerEvents="none" style={styles.toast} testID="add-toast">
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  testID,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  keyboardType?: "default" | "phone-pad" | "email-address";
  multiline?: boolean;
  testID?: string;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        testID={testID}
        style={[styles.input, multiline && styles.inputMulti]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        keyboardType={keyboardType || "default"}
        multiline={multiline}
      />
    </View>
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
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 120,
    gap: spacing.md,
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
  inputMulti: { minHeight: 80, textAlignVertical: "top" },
  chipRow: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" },
  catRow: { flexDirection: "row", gap: spacing.sm, paddingVertical: 4 },
  chip: {
    flexShrink: 0,
    height: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
  },
  chipActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  chipText: {
    fontSize: font.sm,
    color: colors.onSurfaceSecondary,
    fontWeight: "600",
  },
  chipTextActive: { color: "#fff" },
  bottomBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  submitBtn: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.brandPrimary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  submitText: { color: "#fff", fontWeight: "700", fontSize: font.base },
  toast: {
    position: "absolute",
    bottom: 110,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.onSurface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  toastText: { color: "#fff", fontWeight: "600", fontSize: font.sm },
});
