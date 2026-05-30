import {
  Pill,
  RetroShadow,
  SearchField,
  SectionTitle,
  SnippetCard,
  StatTile,
} from "@/components/ui";
import { useApp } from "@/context/app-context";
import { theme } from "@/theme";
import { router } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function HomeScreen() {
  const { snippets, toggleFavorite, setActiveSnippetId } = useApp();
  const searchRef = useRef<TextInput>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("All");

  const favoriteSnippets = snippets.filter((snippet) => snippet.favorite);

  const filteredSnippets = useMemo(() => {
    return snippets.filter((snippet) => {
      const haystack =
        `${snippet.title} ${snippet.code} ${snippet.tags.join(" ")} ${snippet.language}`.toLowerCase();
      const matchesSearch = haystack.includes(query.toLowerCase());
      const matchesFilter =
        filter === "All" ||
        snippet.language.toLowerCase() === filter.toLowerCase();
      return matchesSearch && matchesFilter;
    });
  }, [filter, query, snippets]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.topBar}>
        <View style={styles.brandWrap}>
          <Text style={styles.hello}>Hello,</Text>
          <Text style={styles.brandText}>
            Dev <Text style={styles.brandEmoji}>👋</Text>
          </Text>
        </View>
        <View style={styles.topBarActions}>
          <RetroShadow offset={3} radius={theme.radius.full}>
            <Pressable
              onPress={() => searchRef.current?.focus()}
              style={styles.iconBtn}
              hitSlop={6}
            >
              <Text style={styles.iconBtnText}>⌕</Text>
            </Pressable>
          </RetroShadow>
          <RetroShadow offset={3} radius={theme.radius.full}>
            <Pressable
              onPress={() => router.push("/settings")}
              style={[styles.iconBtn, styles.iconBtnPrimary]}
              hitSlop={6}
            >
              <Text style={[styles.iconBtnText, { color: theme.colors.white }]}>
                ⚙
              </Text>
            </Pressable>
          </RetroShadow>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <SearchField
          ref={searchRef}
          value={query}
          onChangeText={setQuery}
          placeholder="Search snippets, tags, files..."
        />
      </View>

      <View style={styles.statRow}>
        <StatTile
          title={snippets.length.toString().padStart(2, "0")}
          subtitle="Snippets →"
          tone="primary"
          emoji="✌️"
          onPress={() => router.push("/details")}
        />
        <StatTile
          title={favoriteSnippets.length.toString().padStart(2, "0")}
          subtitle="Favorites →"
          tone="amber"
          emoji="🤩"
          onPress={() => router.push("/favorites")}
        />
      </View>

      <View style={styles.quickRow}>
        <RetroShadow
          offset={4}
          radius={theme.radius.lg}
          style={{ flex: 1 }}
        >
          <Pressable
            style={({ pressed }) => [
              styles.quickCard,
              { backgroundColor: theme.colors.accent2 },
              pressed && {
                transform: [{ translateX: 1 }, { translateY: 1 }],
              },
            ]}
            onPress={() => router.push("/editor?mode=new")}
          >
            <Text style={styles.quickEmoji}>✨</Text>
            <Text style={styles.quickTitle}>New Snippet</Text>
            <Text style={styles.quickSubtitle}>Start fresh →</Text>
          </Pressable>
        </RetroShadow>
        <RetroShadow
          offset={4}
          radius={theme.radius.lg}
          style={{ flex: 1 }}
        >
          <Pressable
            style={({ pressed }) => [
              styles.quickCard,
              { backgroundColor: theme.colors.pink },
              pressed && {
                transform: [{ translateX: 1 }, { translateY: 1 }],
              },
            ]}
            onPress={() => router.push("/files")}
          >
            <Text style={styles.quickEmoji}>📁</Text>
            <Text style={styles.quickTitle}>Files</Text>
            <Text style={styles.quickSubtitle}>Browse local →</Text>
          </Pressable>
        </RetroShadow>
      </View>

      <View style={styles.filterRow}>
        {["All", "TypeScript", "Python", "JavaScript"].map((label) => (
          <Pill
            key={label}
            label={label}
            active={filter === label}
            onPress={() => setFilter(label)}
            tone={filter === label ? "dark" : "sky"}
          />
        ))}
      </View>

      <SectionTitle
        title="Recent Snippets"
        action={{
          label: "See All",
          onPress: () => router.push("/details"),
        }}
      />
      {filteredSnippets.length === 0 ? (
        <RetroShadow offset={4} radius={theme.radius.lg}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔎</Text>
            <Text style={styles.emptyTitle}>No matches</Text>
            <Text style={styles.emptyBody}>
              Try a different filter or create a new snippet.
            </Text>
          </View>
        </RetroShadow>
      ) : (
        filteredSnippets.slice(0, 4).map((snippet) => (
          <SnippetCard
            key={snippet.id}
            snippet={snippet}
            onPress={() => {
              setActiveSnippetId(snippet.id);
              router.push("/details");
            }}
            onFavorite={() => toggleFavorite(snippet.id)}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: theme.colors.bg,
  },
  scrollContent: {
    padding: theme.space.md,
    paddingBottom: 38,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 6,
    paddingBottom: theme.space.md,
    gap: theme.space.sm,
  },
  brandWrap: {
    flex: 1,
    minWidth: 0,
  },
  topBarActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.sm,
  },
  hello: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 14,
  },
  brandText: {
    color: theme.colors.text,
    fontSize: 28,
    fontFamily: theme.fonts.display,
    fontWeight: "900",
    letterSpacing: -0.6,
  },
  brandEmoji: {
    fontSize: 22,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnPrimary: {
    backgroundColor: theme.colors.text,
    borderColor: theme.colors.border,
  },
  iconBtnText: {
    color: theme.colors.text,
    fontSize: 20,
    lineHeight: 22,
    fontWeight: "800",
    textAlign: "center",
    includeFontPadding: false,
  },
  searchWrap: {
    marginBottom: theme.space.md,
  },
  statRow: {
    flexDirection: "row",
    gap: theme.space.md,
    marginBottom: theme.space.md,
  },
  quickRow: {
    flexDirection: "row",
    gap: theme.space.md,
    marginBottom: theme.space.md,
  },
  quickCard: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.space.md,
    minHeight: 120,
    justifyContent: "space-between",
  },
  quickEmoji: {
    fontSize: 26,
  },
  quickTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontFamily: theme.fonts.display,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginTop: theme.space.xs,
  },
  quickSubtitle: {
    color: theme.colors.textSoft,
    fontFamily: theme.fonts.body,
    fontSize: 12,
    marginTop: 2,
    fontWeight: "600",
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: theme.space.sm,
  },
  emptyState: {
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.space.lg,
    alignItems: "center",
    gap: theme.space.xs,
    marginBottom: theme.space.md,
  },
  emptyEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontFamily: theme.fonts.display,
    fontWeight: "800",
  },
  emptyBody: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 13,
    textAlign: "center",
  },
});
