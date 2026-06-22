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
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import {
  adminCreateBusiness,
  adminUpdateBusiness,
  getBusiness,
  getCategories,
  type BusinessPayload,
  type Category,
} from "@/src/api";
import { colors, font, radius, spacing } from "@/src/theme";

const DISTRICTS = ["Tirunelveli", "Thoothukudi"] as const;

export default function AdminEdit() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === "new";

  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] =
    useState<(typeof DISTRICTS)[number]>("Tirunelveli");
  const [category, setCategory] = useState<string>("");
  const [googleMapsLink, setGoogleMapsLink] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    (async () => {
      try {
        const cats = await getCategories();
        setCategories(cats);
        if (cats.length && !category) setCategory(cats[0].key);

        if (!isNew && id) {
          const biz = await getBusiness(id);
          setBusinessName(biz.businessName || "");
          setOwnerName(biz.ownerName || "");
          setMobileNumber(biz.mobileNumber || "");
          setWhatsappNumber(biz.whatsappNumber || "");
          setAddress(biz.address || "");
          setCity(biz.city || "");
          setDistrict(
            (biz.district as (typeof DISTRICTS)[number]) || "Tirunelveli"
          );
          setCategory(biz.category || cats[0]?.key || "");
          setGoogleMapsLink(biz.googleMapsLink || "");
          setImageUrl(biz.imageUrl || "");
          setDescription(biz.description || "");
        }
      } catch (e) {
        console.log("edit load err", e);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const submit = async () => {
    if (
      !businessName.trim() ||
      !ownerName.trim() ||
      !mobileNumber.trim() ||
      !address.trim() ||
      !category
    ) {
      showToast("Please fill all required fields");
      return;
    }
    setSubmitting(true);
    try {
      const payload: BusinessPayload = {
        businessName: businessName.trim(),
        category,
        ownerName: ownerName.trim(),
        mobileNumber: mobileNumber.trim(),
        whatsappNumber: whatsappNumber.trim() || null,
        address: address.trim(),
        city: city.trim(),
        district,
        googleMapsLink: googleMapsLink.trim() || null,
        imageUrl: imageUrl.trim() || null,
        description: description.trim(),
      };
      if (isNew) {
        await adminCreateBusiness(payload);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToast("Listing created");
      } else if (id) {
        await adminUpdateBusiness(id, payload);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToast("Listing updated");
      }
      setTimeout(() => router.back(), 700);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Save failed";
      showToast(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          testID="edit-back-btn"
          style={styles.iconBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {isNew ? "Add listing" : "Edit listing"}
        </Text>
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
            testID="edit-businessName"
            value={businessName}
            onChangeText={setBusinessName}
            placeholder="e.g. Bright Battery Shop"
          />
          <Field
            label="Owner name *"
            testID="edit-ownerName"
            value={ownerName}
            onChangeText={setOwnerName}
            placeholder="e.g. Karthik"
          />
          <Field
            label="Mobile number *"
            testID="edit-mobile"
            value={mobileNumber}
            onChangeText={setMobileNumber}
            placeholder="10-digit mobile"
            keyboardType="phone-pad"
          />
          <Field
            label="WhatsApp number (optional)"
            testID="edit-whatsapp"
            value={whatsappNumber}
            onChangeText={setWhatsappNumber}
            placeholder="Defaults to mobile"
            keyboardType="phone-pad"
          />
          <Field
            label="Address *"
            testID="edit-address"
            value={address}
            onChangeText={setAddress}
            placeholder="Street, area, landmark"
            multiline
          />
          <Field
            label="City"
            testID="edit-city"
            value={city}
            onChangeText={setCity}
            placeholder="e.g. Palayamkottai"
          />

          <Text style={styles.fieldLabel}>District *</Text>
          <View style={styles.chipRow}>
            {DISTRICTS.map((d) => {
              const active = district === d;
              return (
                <Pressable
                  key={d}
                  testID={`edit-district-${d.toLowerCase()}`}
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
                  testID={`edit-cat-${c.key}`}
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
            label="Google Maps link (optional)"
            testID="edit-mapsLink"
            value={googleMapsLink}
            onChangeText={setGoogleMapsLink}
            placeholder="https://maps.google.com/..."
          />
          <Field
            label="Image URL (optional)"
            testID="edit-imageUrl"
            value={imageUrl}
            onChangeText={setImageUrl}
            placeholder="https://..."
          />
          <Field
            label="Description (optional)"
            testID="edit-description"
            value={description}
            onChangeText={setDescription}
            placeholder="Tell customers about the business"
            multiline
          />
        </ScrollView>

        <SafeAreaView edges={["bottom"]} style={styles.bottomBar}>
          <Pressable
            testID="edit-submit"
            style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
            onPress={submit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.submitText}>
                  {isNew ? "Create listing" : "Save changes"}
                </Text>
              </>
            )}
          </Pressable>
        </SafeAreaView>
      </KeyboardAvoidingView>

      {toast ? (
        <View pointerEvents="none" style={styles.toast} testID="edit-toast">
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
  keyboardType?: "default" | "phone-pad" | "email-address" | "url";
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
        autoCapitalize="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  centerScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
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
  chipActive: { backgroundColor: colors.brand, borderColor: colors.brand },
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
