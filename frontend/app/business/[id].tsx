import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

import { colors, spacing, radius, font } from "@/src/theme";
import { getBusiness, type Business } from "@/src/api";

export default function BusinessDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [biz, setBiz] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const b = await getBusiness(id);
        setBiz(b);
      } catch (e) {
        console.log("detail err", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.brand} />
        </View>
      </SafeAreaView>
    );
  }

  if (!biz) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.errorText}>Could not load business details</Text>
          <Pressable style={styles.retryBtn} onPress={() => router.back()}>
            <Text style={styles.retryText}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const call = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL(`tel:${biz.mobile}`);
  };
  const whatsapp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const num = (biz.whatsapp || biz.mobile).replace(/\D/g, "");
    const phone = num.length === 10 ? `91${num}` : num;
    Linking.openURL(`https://wa.me/${phone}`);
  };
  const maps = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (biz.latitude && biz.longitude) {
      Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${biz.latitude},${biz.longitude}`
      );
    } else {
      Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          biz.name + " " + biz.address
        )}`
      );
    }
  };

  return (
    <View style={styles.safe}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          {biz.image_url ? (
            <Image
              source={{ uri: biz.image_url }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={300}
            />
          ) : (
            <View
              style={[StyleSheet.absoluteFill, { backgroundColor: colors.brand }]}
            />
          )}
          <LinearGradient
            colors={["rgba(15,23,42,0.4)", "rgba(15,23,42,0.85)"]}
            style={StyleSheet.absoluteFill}
          />
          <SafeAreaView style={styles.heroBar} edges={["top"]}>
            <Pressable
              testID="detail-back-btn"
              style={styles.heroBtn}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </Pressable>
            <Pressable
              testID="detail-maps-icon-btn"
              style={styles.heroBtn}
              onPress={maps}
            >
              <Ionicons name="navigate" size={20} color="#fff" />
            </Pressable>
          </SafeAreaView>
          <View style={styles.heroFooter}>
            <View style={styles.catChip}>
              <Text style={styles.catChipText}>
                {biz.category.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.heroTitle} numberOfLines={2}>
              {biz.name}
            </Text>
            <View style={styles.heroMetaRow}>
              <Ionicons name="location" size={14} color="#fff" />
              <Text style={styles.heroMetaText}>{biz.district}</Text>
              <View style={styles.dot} />
              <Ionicons name="star" size={14} color={colors.brandPrimary} />
              <Text style={styles.heroMetaText}>
                {(biz.rating ?? 4.5).toFixed(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.body}>
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Ionicons
                name="person-outline"
                size={18}
                color={colors.brand}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Owner</Text>
              <Text style={styles.rowValue}>{biz.owner_name}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Ionicons name="call-outline" size={18} color={colors.brand} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Mobile</Text>
              <Text style={styles.rowValue}>{biz.mobile}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Ionicons
                name="location-outline"
                size={18}
                color={colors.brand}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Address</Text>
              <Text style={styles.rowValue}>{biz.address}</Text>
              <Pressable
                testID="detail-open-maps-btn"
                style={styles.mapLinkBtn}
                onPress={maps}
              >
                <Ionicons
                  name="navigate-outline"
                  size={14}
                  color={colors.brand}
                />
                <Text style={styles.mapLinkText}>Open in Google Maps</Text>
              </Pressable>
            </View>
          </View>

          {biz.description ? (
            <View style={styles.descCard}>
              <Text style={styles.descTitle}>About</Text>
              <Text style={styles.descText}>{biz.description}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Sticky bottom CTAs */}
      <SafeAreaView edges={["bottom"]} style={styles.bottomBar}>
        <View style={styles.bottomInner}>
          <Pressable
            testID="detail-whatsapp-btn"
            style={[styles.bottomBtn, styles.bottomWhatsapp]}
            onPress={whatsapp}
          >
            <Ionicons name="logo-whatsapp" size={20} color="#fff" />
            <Text style={styles.bottomBtnText}>WhatsApp</Text>
          </Pressable>
          <Pressable
            testID="detail-call-btn"
            style={[styles.bottomBtn, styles.bottomCall]}
            onPress={call}
          >
            <Ionicons name="call" size={20} color="#fff" />
            <Text style={styles.bottomBtnText}>Call now</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { color: colors.onSurface, fontSize: font.base },
  retryBtn: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.brand,
    borderRadius: radius.md,
  },
  retryText: { color: "#fff", fontWeight: "600" },
  hero: {
    height: 280,
    backgroundColor: colors.brand,
  },
  heroBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
  },
  heroBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
  },
  catChip: {
    alignSelf: "flex-start",
    backgroundColor: colors.brandPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginBottom: spacing.sm,
  },
  catChipText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: "#fff",
    fontSize: font.xxxl,
    fontWeight: "700",
  },
  heroMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: spacing.sm,
  },
  heroMetaText: { color: "#fff", fontSize: font.sm, fontWeight: "600" },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.6)",
    marginHorizontal: 4,
  },
  body: { padding: spacing.lg, gap: spacing.lg },
  row: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start",
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.brandTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    fontSize: font.sm,
    color: colors.muted,
    fontWeight: "600",
    marginBottom: 2,
  },
  rowValue: {
    fontSize: font.base,
    color: colors.onSurface,
    fontWeight: "600",
  },
  mapLinkBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: spacing.sm,
    alignSelf: "flex-start",
    backgroundColor: colors.brandTertiary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  mapLinkText: {
    color: colors.brand,
    fontWeight: "600",
    fontSize: font.sm,
  },
  descCard: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  descTitle: {
    fontSize: font.lg,
    fontWeight: "700",
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  descText: {
    fontSize: font.base,
    color: colors.onSurfaceSecondary,
    lineHeight: 22,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  bottomInner: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.lg,
  },
  bottomBtn: {
    flex: 1,
    height: 52,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  bottomCall: { backgroundColor: colors.brandPrimary },
  bottomWhatsapp: { backgroundColor: colors.whatsapp },
  bottomBtnText: { color: "#fff", fontWeight: "700", fontSize: font.base },
});
