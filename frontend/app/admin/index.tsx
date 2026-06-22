import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

import { storage } from "@/src/utils/storage";
import { TOKEN_KEY, adminMe } from "@/src/api";
import { colors } from "@/src/theme";

export default function AdminIndex() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const token = await storage.secureGet<string>(TOKEN_KEY, "");
      if (!token) {
        router.replace("/admin/login");
        return;
      }
      try {
        await adminMe();
        router.replace("/admin/dashboard");
      } catch {
        await storage.secureRemove(TOKEN_KEY);
        router.replace("/admin/login");
      }
    })();
  }, [router]);

  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.brand} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
});
