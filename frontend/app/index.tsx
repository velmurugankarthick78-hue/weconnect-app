import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

import { colors, spacing, radius, font } from "@/src/theme";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../src/firebase";

const HERO_IMAGE =
  "https://images.pexels.com/photos/3792569/pexels-photo-3792569.jpeg";

const DISTRICTS = ["Tirunelveli", "Thoothukudi"] as const;

export default function HomeScreen() {
  const router = useRouter();
  const [district, setDistrict] = useState<(typeof DISTRICTS)[number]>(
    "Tirunelveli"
  );
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
useEffect(() => {
    (async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "categories"));
        const cats = querySnapshot.docs.map(doc => ({
          key: doc.id,
          ...doc.data()
        }));
        setCategories(cats);
      } catch (e) {
        console.log("cat err", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  
    

  const handleSearch = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/listings",
      params: { district, search: search.trim() },
    });
  }, [search, district, router]);

  const handleCategory = useCallback(
    (key: string, label: string) => {
      Haptics.selectionAsync();
      router.push({
        pathname: "/listings",
        params: { district, category: key, title: label },
      });
    },
    [district, router]
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <Ionicons name="location" size={18} color={colors.onBrandPrimary} />
            </View>
            <View>
              <Text style={styles.brandTitle}>We Connect</Text>
              <Text style={styles.brandSub}>Tirunelveli · Thoothukudi</Text>
            </View>
          </View>
          <View style={styles.topActions}>
            <Pressable
              testID="admin-entry-btn"
              style={styles.addBtn}
              onPress={() => {
                Haptics.selectionAsync();
                router.push("/admin");
              }}
            >
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={colors.brand}
              />
            </Pressable>
            <Pressable
              testID="add-business-header-btn"
              style={styles.addBtn}
              onPress={() => {
                Haptics.selectionAsync();
                router.push("/add");
              }}
            >
              <Ionicons name="add" size={20} color={colors.brand} />
            </Pressable>
          </View>
        </View>

        <View style={styles.hero}>
          <Image
            source={{ uri: HERO_IMAGE }}
            style={styles.heroImage}
            contentFit="cover"
            transition={300}
          />
          <LinearGradient
            colors={["rgba(15,23,42,0)", "rgba(15,23,42,0.85)"]}
            style={styles.heroScrim}
          />
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Find local businesses</Text>
            <Text style={styles.heroSubtitle}>
              Battery shops, hotels, doctors & more
            </Text>

            <View style={styles.districtRow}>
              {DISTRICTS.map((d) => {
                const active = district === d;
                return (
                  <Pressable
                    key={d}
                    testID={`district-${d.toLowerCase()}-chip`}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setDistrict(d);
                    }}
                    style={[
                      styles.districtChip,
                      active && styles.districtChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.districtChipText,
                        active && styles.districtChipTextActive,
                      ]}
                    >
                      {d}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.searchWrap}>
          <View style={styles.searchBar}>
            <Ionicons
              name="search"
              size={20}
              color={colors.muted}
              style={styles.searchIcon}
            />
            <TextInput
              testID="home-search-input"
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search businesses, services..."
              placeholderTextColor={colors.muted}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            <Pressable
              testID="home-search-submit-btn"
              style={styles.searchBtn}
              onPress={handleSearch}
            >
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Browse Categories</Text>
            <Text style={styles.sectionSub}>Tap to explore listings</Text>
          </View>

          {loading ? (
            <ActivityIndicator color={colors.brand} style={{ marginTop: 24 }} />
          ) : (
            <View style={styles.grid}>
              {categories.map((c) => (
                <Pressable
                  key={c.key}
                  testID={`category-card-${c.key}`}
                  style={styles.gridItem}
                  onPress={() => handleCategory(c.key, c.label)}
                >
                  <View style={styles.gridIconWrap}>
                    <Ionicons
                      name={c.icon as never}
                      size={26}
                      color={colors.brand}
                    />
                  </View>
                  <Text style={styles.gridLabel} numberOfLines={2}>
                    {c.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Pressable
            testID="add-business-cta"
            style={styles.ctaCard}
            onPress={() => router.push("/add")}
          >
            <View style={styles.ctaIcon}>
              <Ionicons name="storefront-outline" size={22} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.ctaTitle}>List your business</Text>
              <Text style={styles.ctaSub}>
                Reach customers across both districts.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.brand} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xxxl },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  brandTitle: {
    fontSize: font.xl,
    fontWeight: "700",
    color: colors.onSurface,
  },
  brandSub: { fontSize: font.sm, color: colors.muted, marginTop: 2 },
  topActions: { flexDirection: "row", gap: spacing.sm },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.brandTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  hero: {
    marginHorizontal: spacing.lg,
    height: 200,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.surfaceSecondary,
  },
  heroImage: { ...StyleSheet.absoluteFillObject },
  heroScrim: { ...StyleSheet.absoluteFillObject },
  heroContent: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: "flex-end",
  },
  heroTitle: {
    color: "#fff",
    fontSize: font.xxl,
    fontWeight: "700",
  },
  heroSubtitle: {
    color: "#E2E8F0",
    fontSize: font.base,
    marginTop: 4,
    marginBottom: spacing.md,
  },
  districtRow: { flexDirection: "row", gap: spacing.sm },
  districtChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  districtChipActive: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
  },
  districtChipText: {
    color: "#fff",
    fontSize: font.sm,
    fontWeight: "600",
  },
  districtChipTextActive: { color: "#fff" },
  searchWrap: {
    paddingHorizontal: spacing.lg,
    marginTop: -spacing.xl,
    marginBottom: spacing.lg,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
    shadowColor: "#0F172A",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: { marginRight: spacing.sm },
  searchInput: {
    flex: 1,
    fontSize: font.base,
    color: colors.onSurface,
    paddingVertical: spacing.md,
  },
  searchBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  section: { paddingHorizontal: spacing.lg, marginTop: spacing.md },
  sectionHead: { marginBottom: spacing.md },
  sectionTitle: {
    fontSize: font.lg,
    fontWeight: "700",
    color: colors.onSurface,
  },
  sectionSub: { fontSize: font.sm, color: colors.muted, marginTop: 2 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  gridItem: {
    width: "31%",
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  gridIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.brandTertiary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  gridLabel: {
    fontSize: font.sm,
    color: colors.onSurface,
    fontWeight: "600",
    textAlign: "center",
  },
  ctaCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.brandTertiary,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.brand,
  },
  ctaIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaTitle: {
    fontSize: font.base,
    fontWeight: "700",
    color: colors.onSurface,
  },
  ctaSub: { fontSize: font.sm, color: colors.onSurfaceSecondary, marginTop: 2 },
});
