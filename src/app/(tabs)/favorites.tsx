import { useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useApp } from "@/context/app-context";
import {
  RetroShadow,
  Screen,
  SnippetCard,
  Surface,
} from "@/components/ui";
import { theme } from "@/theme";

export default function FavoritesScreen() {
  const { snippets, toggleFavorite, setActiveSnippetId } = useApp();

  const favorites = useMemo(
    () => snippets.filter((snippet) => snippet.favorite),
    [snippets],
  );

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28 }}
      >
        <View style={styles.headerRow}>
          <RetroShadow offset={3} radius={theme.radius.full}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backBtnText}>← Back</Text>
            </Pressable>
          </RetroShadow>
          <View style={{ flex: 1 }} />
          <RetroShadow offset={3} radius={theme.radius.full}>
            <Pressable
              onPress={() => router.push("/settings")}
              style={styles.settingsBtn}
            >
              <Text style={styles.settingsBtnText}>⚙</Text>
            </Pressable>
          </RetroShadow>
        </View>

        <Text style={styles.heroTitle}>Saved</Text>
        <Text style={styles.heroSubtitle}>
          Your favorite snippets, ready when you need them.
        </Text>

        <View style={styles.summaryRow}>
          <RetroShadow offset={4} radius={theme.radius.lg} style={{ flex: 1 }}>
            <View
              style={[styles.summaryCard, { backgroundColor: theme.colors.accent2 }]}
            >
              <Text style={styles.summaryEmoji}>⭐</Text>
              <Text style={styles.summaryValue}>
                {favorites.length.toString().padStart(2, "0")}
              </Text>
              <Text style={styles.summaryLabel}>Pinned</Text>
            </View>
          </RetroShadow>
          <RetroShadow offset={4} radius={theme.radius.lg} style={{ flex: 1 }}>
            <View
              style={[styles.summaryCard, { backgroundColor: theme.colors.pink }]}
            >
              <Text style={styles.summaryEmoji}>🌸</Text>
              <Text style={styles.summaryValue}>
                {new Set(favorites.map((s) => s.language))
                  .size.toString()
                  .padStart(2, "0")}
              </Text>
              <Text style={styles.summaryLabel}>Languages</Text>
            </View>
          </RetroShadow>
        </View>

        {favorites.length > 0 ? (
          favorites.map((snippet, index) => (
            <SnippetCard
              key={snippet.id}
              snippet={snippet}
              status={{
                label: index % 2 === 0 ? "Saved" : "Starred",
                tone: index % 2 === 0 ? "dark" : "primary",
              }}
              onPress={() => {
                setActiveSnippetId(snippet.id);
                router.push("/details");
              }}
              onFavorite={() => toggleFavorite(snippet.id)}
            />
          ))
        ) : (
          <RetroShadow offset={5} radius={theme.radius.lg}>
            <Surface style={styles.emptyCard} radius={theme.radius.lg}>
              <Text style={styles.emptyEmoji}>🌼</Text>
              <Text style={styles.emptyTitle}>Nothing saved yet</Text>
              <Text style={styles.emptyBody}>
                Tap the star on any snippet to pin it here for quick access.
              </Text>
              <RetroShadow offset={3} radius={theme.radius.full}>
                <Pressable
                  style={({ pressed }) => [
                    styles.emptyButton,
                    pressed && {
                      transform: [{ translateX: 1 }, { translateY: 1 }],
                    },
                  ]}
                  onPress={() => router.push("/details")}
                >
                  <Text style={styles.emptyButtonText}>Browse snippets</Text>
                </Pressable>
              </RetroShadow>
            </Surface>
          </RetroShadow>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 6,
    paddingBottom: theme.space.sm,
    gap: theme.space.sm,
  },
  backBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.full,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  backBtnText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
    fontWeight: "700",
    fontSize: 13,
  },
  settingsBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsBtnText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  heroTitle: {
    color: theme.colors.text,
    fontSize: 36,
    fontFamily: theme.fonts.display,
    fontWeight: "900",
    letterSpacing: -1,
    marginTop: theme.space.sm,
  },
  heroSubtitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 14,
    marginTop: 4,
    marginBottom: theme.space.lg,
  },
  summaryRow: {
    flexDirection: "row",
    gap: theme.space.md,
    marginBottom: theme.space.lg,
  },
  summaryCard: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.space.md,
    minHeight: 120,
    justifyContent: "space-between",
  },
  summaryEmoji: {
    fontSize: 26,
  },
  summaryValue: {
    color: theme.colors.text,
    fontSize: 30,
    fontFamily: theme.fonts.display,
    fontWeight: "900",
    letterSpacing: -1,
  },
  summaryLabel: {
    color: theme.colors.textSoft,
    fontFamily: theme.fonts.body,
    fontSize: 13,
    fontWeight: "600",
  },
  emptyCard: {
    padding: theme.space.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: "center",
    gap: theme.space.xs,
    marginTop: theme.space.md,
  },
  emptyEmoji: {
    fontSize: 36,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontFamily: theme.fonts.display,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  emptyBody: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: theme.space.sm,
  },
  emptyButton: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.text,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: theme.radius.full,
  },
  emptyButtonText: {
    color: theme.colors.white,
    fontFamily: theme.fonts.body,
    fontSize: 13,
    fontWeight: "800",
  },
});
