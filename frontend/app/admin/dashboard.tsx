import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { storage } from "@/src/utils/storage";
import {
  adminListBusinesses,
  adminDeleteBusiness,
  TOKEN_KEY,
  type Business,
} from "@/src/api";
import { colors, font, radius, spacing } from "@/src/theme";

export default function AdminDashboard() {
  const router = useRouter();
  const [items, setItems] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const fetchData = useCallback(
    async (q?: string) => {
      try {
        const list = await adminListBusinesses(q);
        setItems(list);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed";
        if (msg.toLowerCase().includes("unauthor")) {
          await storage.secureRemove(TOKEN_KEY);
          router.replace("/admin/login");
        } else {
          showToast(msg);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [router]
  );

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchData(search.trim() || undefined);
    }, [fetchData, search])
  );

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      fetchData(search.trim() || undefined);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleDelete = async (id: string) => {
    try {
      await adminDeleteBusiness(id);
      setItems((arr) => arr.filter((b) => b.id !== id));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast("Listing deleted");
    } catch {
      showToast("Delete failed");
    } finally {
      setConfirmId(null);
    }
  };

  const logout = async () => {
    await storage.secureRemove(TOKEN_KEY);
    router.replace("/admin/login");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          testID="admin-back-btn"
          style={styles.iconBtn}
          onPress={() => router.replace("/")}
        >
          <Ionicons name="home-outline" size={20} color={colors.onSurface} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Admin · Listings</Text>
          <Text style={styles.headerSub}>{items.length} total</Text>
        </View>
        <Pressable
          testID="admin-logout-btn"
          style={styles.iconBtn}
          onPress={logout}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            testID="admin-search-input"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search name, owner, mobile, category..."
            placeholderTextColor={colors.muted}
          />
          {search ? (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color={colors.muted} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.actionsRow}>
        <Pressable
          testID="admin-add-btn"
          style={[styles.actionBtn, { backgroundColor: colors.brandPrimary }]}
          onPress={() => router.push("/admin/edit/new")}
        >
          <Ionicons name="add-circle" size={18} color="#fff" />
          <Text style={styles.actionBtnText}>Add new</Text>
        </Pressable>
        <Pressable
          testID="admin-import-btn"
          style={[styles.actionBtn, { backgroundColor: colors.brand }]}
          onPress={() => router.push("/admin/import")}
        >
          <Ionicons name="cloud-upload-outline" size={18} color="#fff" />
          <Text style={styles.actionBtnText}>Import CSV/Excel</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.brand} />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="business-outline" size={48} color={colors.muted} />
          <Text style={styles.emptyTitle}>No listings found</Text>
          <Text style={styles.emptySub}>
            Tap &quot;Add new&quot; or import a file to get started.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchData(search.trim() || undefined);
              }}
              tintColor={colors.brand}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.card} testID={`admin-row-${item.id}`}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardName} numberOfLines={1}>
                  {item.businessName}
                </Text>
                <Text style={styles.cardMeta} numberOfLines={1}>
                  {item.category.toUpperCase()} · {item.district}
                </Text>
                <Text style={styles.cardSub} numberOfLines={1}>
                  {item.ownerName} · {item.mobileNumber}
                </Text>
              </View>
              <View style={styles.rowActions}>
                <Pressable
                  testID={`admin-edit-${item.id}`}
                  style={[styles.rowBtn, styles.rowBtnEdit]}
                  onPress={() => router.push(`/admin/edit/${item.id}`)}
                >
                  <Ionicons
                    name="create-outline"
                    size={18}
                    color={colors.brand}
                  />
                </Pressable>
                <Pressable
                  testID={`admin-delete-${item.id}`}
                  style={[styles.rowBtn, styles.rowBtnDel]}
                  onPress={() => setConfirmId(item.id)}
                >
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={colors.error}
                  />
                </Pressable>
              </View>
            </View>
          )}
        />
      )}

      {/* Delete confirmation */}
      {confirmId ? (
        <View style={styles.modalOverlay}>
          <View style={styles.modal} testID="admin-delete-confirm">
            <Text style={styles.modalTitle}>Delete listing?</Text>
            <Text style={styles.modalSub}>This action cannot be undone.</Text>
            <View style={styles.modalActions}>
              <Pressable
                testID="admin-delete-cancel"
                style={[styles.modalBtn, styles.modalCancel]}
                onPress={() => setConfirmId(null)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                testID="admin-delete-confirm-btn"
                style={[styles.modalBtn, styles.modalDelete]}
                onPress={() => handleDelete(confirmId)}
              >
                <Text style={styles.modalDeleteText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}

      {toast ? (
        <View pointerEvents="none" style={styles.toast} testID="admin-toast">
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}
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
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: {
    fontSize: font.lg,
    fontWeight: "700",
    color: colors.onSurface,
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
  actionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
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
  actionBtnText: { color: "#fff", fontWeight: "700", fontSize: font.sm },
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
    gap: spacing.sm,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardName: {
    fontSize: font.base,
    fontWeight: "700",
    color: colors.onSurface,
  },
  cardMeta: {
    fontSize: 10,
    color: colors.brand,
    fontWeight: "700",
    marginTop: 2,
    letterSpacing: 0.5,
  },
  cardSub: {
    fontSize: font.sm,
    color: colors.muted,
    marginTop: 4,
  },
  rowActions: { flexDirection: "row", gap: spacing.xs },
  rowBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  rowBtnEdit: { backgroundColor: colors.brandTertiary },
  rowBtnDel: { backgroundColor: "#FEF2F2" },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15,23,42,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  modal: {
    width: "100%",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  modalTitle: {
    fontSize: font.lg,
    fontWeight: "700",
    color: colors.onSurface,
  },
  modalSub: { fontSize: font.sm, color: colors.muted },
  modalActions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancel: { backgroundColor: colors.surfaceSecondary },
  modalCancelText: { color: colors.onSurface, fontWeight: "600" },
  modalDelete: { backgroundColor: colors.error },
  modalDeleteText: { color: "#fff", fontWeight: "700" },
  toast: {
    position: "absolute",
    bottom: 40,
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
