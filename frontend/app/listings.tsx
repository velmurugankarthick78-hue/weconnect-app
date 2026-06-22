import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  Linking,
  ScrollView,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { colors, spacing, radius, font } from "@/src/theme";
import { listBusinesses, type Business } from "@/src/api";

const DISTRICTS = ["Tirunelveli", "Thoothukudi"] as const;

export default function ListingsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    district?: string;
    category?: string;
    search?: string;
    title?: string;
  }>();

  const initialDistrict =
    (params.district as (typeof DISTRICTS)[number]) || "Tirunelveli";

  const [district, setDistrict] =
    useState<(typeof DISTRICTS)[number]>(initialDistrict);
  const [search, setSearch] = useState((params.search as string) || "");
  const [items, setItems] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const category = (params.category as string) || undefined;
  const title =
    (params.title as string) || (category ? category : "Search results");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listBusinesses({
        district,
        category,
        search: search.trim() || undefined,
      });
      setItems(data);
    } catch (e) {
      console.log("listings err", e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [district, category, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          testID="back-btn"
          style={styles.iconBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.headerSub}>
            {items.length} {items.length === 1 ? "result" : "results"} · {district}
          </Text>
        </View>
        <View style={styles.iconBtn} />
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            testID="listings-search-input"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Refine search..."
            placeholderTextColor={colors.muted}
            returnKeyType="search"
            onSubmitEditing={() => {
              Haptics.selectionAsync();
              fetchData();
            }}
          />
          {search.length > 0 ? (
            <Pressable
              onPress={() => {
                setSearch("");
              }}
            >
              <Ionicons name="close-circle" size={18} color={colors.muted} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* District filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsRow}
        contentContainerStyle={styles.chipsContent}
      >
        {DISTRICTS.map((d) => {
          const active = district === d;
          return (
            <Pressable
              key={d}
              testID={`filter-district-${d.toLowerCase()}`}
              onPress={() => {
                Haptics.selectionAsync();
                setDistrict(d);
              }}
              style={[styles.chip, active && styles.chipActive]}
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
      </ScrollView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.brand} />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="business-outline" size={48} color={colors.muted} />
          <Text style={styles.emptyTitle}>No businesses found</Text>
          <Text style={styles.emptySub}>
            Try a different district or search term.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <BusinessCard
              item={item}
              onPress={() => router.push(`/business/${item.id}`)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

function BusinessCard({
  item,
  onPress,
}: {
  item: Business;
  onPress: () => void;
}) {
  const call = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL(`tel:${item.mobile}`);
  };
  const whatsapp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const num = (item.whatsapp || item.mobile).replace(/\D/g, "");
    const phone = num.length === 10 ? `91${num}` : num;
    Linking.openURL(`https://wa.me/${phone}`);
  };
  const maps = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (item.latitude && item.longitude) {
      Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`
      );
    } else {
      Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          item.name + " " + item.address
        )}`
      );
    }
  };

  return (
    <Pressable
      testID={`business-card-${item.id}`}
      style={styles.card}
      onPress={onPress}
    >
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.cardCat} numberOfLines={1}>
            {item.category.toUpperCase()} · {item.district}
          </Text>
        </View>
        <View style={styles.ratingPill}>
          <Ionicons name="star" size={12} color={colors.brandPrimary} />
          <Text style={styles.ratingText}>
            {(item.rating ?? 4.5).toFixed(1)}
          </Text>
        </View>
      </View>

      <View style={styles.cardMid}>
        <View style={styles.metaRow}>
          <Ionicons
            name="person-outline"
            size={14}
            color={colors.muted}
            style={styles.metaIcon}
          />
          <Text style={styles.metaText} numberOfLines={1}>
            {item.owner_name}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons
            name="location-outline"
            size={14}
            color={colors.muted}
            style={styles.metaIcon}
          />
          <Text style={styles.metaText} numberOfLines={2}>
            {item.address}
          </Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <Pressable
          testID={`card-call-${item.id}`}
          style={[styles.actionBtn, styles.actionCall]}
          onPress={call}
        >
          <Ionicons name="call" size={16} color="#fff" />
          <Text style={styles.actionCallText}>Call</Text>
        </Pressable>
        <Pressable
          testID={`card-whatsapp-${item.id}`}
          style={[styles.actionBtn, styles.actionGhost]}
          onPress={whatsapp}
        >
          <Ionicons name="logo-whatsapp" size={16} color={colors.whatsapp} />
          <Text style={styles.actionGhostText}>WhatsApp</Text>
        </Pressable>
        <Pressable
          testID={`card-maps-${item.id}`}
          style={[styles.actionBtn, styles.actionGhost]}
          onPress={maps}
        >
          <Ionicons name="navigate" size={16} color={colors.brand} />
          <Text style={styles.actionGhostText}>Maps</Text>
        </Pressable>
      </View>
    </Pressable>
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
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: {
    fontSize: font.lg,
    fontWeight: "700",
    color: colors.onSurface,
    textTransform: "capitalize",
  },
  headerSub: { fontSize: font.sm, color: colors.muted, marginTop: 2 },
  searchWrap: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, fontSize: font.base, color: colors.onSurface },
  chipsRow: { maxHeight: 56 },
  chipsContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
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
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: font.lg,
    fontWeight: "700",
    color: colors.onSurface,
    marginTop: spacing.md,
  },
  emptySub: {
    fontSize: font.sm,
    color: colors.muted,
    marginTop: 4,
    textAlign: "center",
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  cardTitle: {
    fontSize: font.lg,
    fontWeight: "700",
    color: colors.onSurface,
  },
  cardCat: {
    fontSize: 10,
    color: colors.brand,
    fontWeight: "700",
    marginTop: 4,
    letterSpacing: 0.5,
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF7ED",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  ratingText: {
    fontSize: font.sm,
    fontWeight: "700",
    color: colors.brandPrimary,
  },
  cardMid: { gap: spacing.xs },
  metaRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  metaIcon: { marginTop: 2 },
  metaText: {
    flex: 1,
    fontSize: font.sm,
    color: colors.onSurfaceSecondary,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionBtn: {
    flex: 1,
    height: 44,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  actionCall: { backgroundColor: colors.brandPrimary },
  actionCallText: { color: "#fff", fontWeight: "700", fontSize: font.sm },
  actionGhost: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionGhostText: {
    color: colors.onSurfaceSecondary,
    fontWeight: "600",
    fontSize: font.sm,
  },
});
