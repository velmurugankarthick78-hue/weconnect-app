import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as Haptics from "expo-haptics";

import { adminImport, type ImportResult } from "@/src/api";
import { colors, font, radius, spacing } from "@/src/theme";

const REQUIRED_COLUMNS = [
  "businessName",
  "category",
  "ownerName",
  "mobileNumber",
  "address",
  "district",
];

const OPTIONAL_COLUMNS = [
  "whatsappNumber",
  "city",
  "googleMapsLink",
  "imageUrl",
  "description",
];

export default function AdminImport() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pickAndUpload = async () => {
    setError(null);
    setResult(null);
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: [
          "text/csv",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (res.canceled || !res.assets || res.assets.length === 0) return;
      const asset = res.assets[0];
      const name = asset.name || "upload";
      const lower = name.toLowerCase();
      const mime = lower.endsWith(".csv")
        ? "text/csv"
        : lower.endsWith(".xlsx")
          ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          : asset.mimeType || "application/octet-stream";

      setFileName(name);
      setUploading(true);
      const r = await adminImport(asset.uri, name, mime);
      setResult(r);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Import failed";
      setError(msg);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          testID="import-back-btn"
          style={styles.iconBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Import CSV / Excel</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons name="cloud-upload-outline" size={28} color="#fff" />
          </View>
          <Text style={styles.heroTitle}>Bulk import listings</Text>
          <Text style={styles.heroSub}>
            Upload a .csv or .xlsx file. The first row must be the header.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Required columns</Text>
          <View style={styles.tagsRow}>
            {REQUIRED_COLUMNS.map((c) => (
              <View key={c} style={[styles.tag, styles.tagRequired]}>
                <Text style={styles.tagText}>{c}</Text>
              </View>
            ))}
          </View>
          <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>
            Optional columns
          </Text>
          <View style={styles.tagsRow}>
            {OPTIONAL_COLUMNS.map((c) => (
              <View key={c} style={[styles.tag, styles.tagOptional]}>
                <Text style={styles.tagOptText}>{c}</Text>
              </View>
            ))}
          </View>
        </View>

        <Pressable
          testID="import-pick-btn"
          style={[styles.uploadBtn, uploading && { opacity: 0.7 }]}
          onPress={pickAndUpload}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons
                name="document-attach-outline"
                size={20}
                color="#fff"
              />
              <Text style={styles.uploadBtnText}>Choose file & upload</Text>
            </>
          )}
        </Pressable>

        {fileName ? (
          <View style={styles.fileChip}>
            <Ionicons name="document-text" size={16} color={colors.brand} />
            <Text style={styles.fileChipText} numberOfLines={1}>
              {fileName}
            </Text>
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorBox} testID="import-error">
            <Ionicons
              name="alert-circle-outline"
              size={18}
              color={colors.error}
            />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {result ? (
          <View style={styles.resultBox} testID="import-result">
            <View style={styles.resultRow}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={colors.success}
              />
              <Text style={styles.resultText}>
                Inserted: <Text style={styles.resultBold}>{result.inserted}</Text>
              </Text>
            </View>
            <View style={styles.resultRow}>
              <Ionicons
                name="warning-outline"
                size={20}
                color={colors.warning ?? "#D97706"}
              />
              <Text style={styles.resultText}>
                Skipped: <Text style={styles.resultBold}>{result.skipped}</Text>
              </Text>
            </View>
            {result.errors.length > 0 ? (
              <View style={styles.errList}>
                <Text style={styles.errListTitle}>Errors (first 50)</Text>
                {result.errors.map((er, i) => (
                  <Text key={i} style={styles.errListItem}>
                    • {er}
                  </Text>
                ))}
              </View>
            ) : null}
            <Pressable
              testID="import-back-to-dashboard"
              style={styles.doneBtn}
              onPress={() => router.replace("/admin/dashboard")}
            >
              <Text style={styles.doneBtnText}>Back to dashboard</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
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
  scrollContent: { padding: spacing.lg, gap: spacing.lg, paddingBottom: 48 },
  heroCard: {
    backgroundColor: colors.brandTertiary,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.brand,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  heroTitle: {
    fontSize: font.lg,
    fontWeight: "700",
    color: colors.onSurface,
  },
  heroSub: {
    fontSize: font.sm,
    color: colors.muted,
    textAlign: "center",
    marginTop: 4,
  },
  section: { gap: spacing.sm },
  sectionTitle: {
    fontSize: font.sm,
    fontWeight: "700",
    color: colors.onSurfaceSecondary,
  },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  tagRequired: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
  },
  tagOptional: {
    backgroundColor: colors.surfaceSecondary,
    borderColor: colors.border,
  },
  tagText: { color: "#fff", fontWeight: "700", fontSize: font.sm },
  tagOptText: {
    color: colors.onSurfaceSecondary,
    fontWeight: "600",
    fontSize: font.sm,
  },
  uploadBtn: {
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.brand,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  uploadBtnText: { color: "#fff", fontWeight: "700", fontSize: font.base },
  fileChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    alignSelf: "flex-start",
    backgroundColor: colors.brandTertiary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  fileChipText: {
    color: colors.brand,
    fontWeight: "600",
    fontSize: font.sm,
    maxWidth: 220,
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
  resultBox: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  resultText: { fontSize: font.base, color: colors.onSurface },
  resultBold: { fontWeight: "700" },
  errList: {
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  errListTitle: {
    fontSize: font.sm,
    fontWeight: "700",
    color: colors.onSurfaceSecondary,
    marginBottom: 4,
  },
  errListItem: { fontSize: font.sm, color: colors.muted },
  doneBtn: {
    marginTop: spacing.md,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  doneBtnText: { color: "#fff", fontWeight: "700", fontSize: font.base },
});
