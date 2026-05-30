import { useMemo } from "react";
import {
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useApp } from "@/context/app-context";
import {
  CodePanel,
  Pill,
  RetroShadow,
  Screen,
  SectionTitle,
  Surface,
} from "@/components/ui";
import { theme } from "@/theme";
import { formatRelativeTime } from "@/lib/format";

export default function DetailsScreen() {
  const {
    snippets,
    selectedSnippet,
    setActiveSnippetId,
    generateInsights,
    exportSnippet,
  } = useApp();
  const snippet = selectedSnippet ?? snippets[0];

  const relatedTags = useMemo(() => snippet?.tags.slice(0, 4) ?? [], [snippet]);

  if (!snippet) {
    return (
      <Screen>
        <View style={styles.headerRow}>
          <Text style={styles.brand}>Snippet</Text>
        </View>
        <RetroShadow offset={4} radius={theme.radius.lg}>
          <Surface style={styles.emptyCard} radius={theme.radius.lg}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyTitle}>Nothing here yet</Text>
            <Text style={styles.emptyBody}>
              Create one from the Editor tab to get started.
            </Text>
          </Surface>
        </RetroShadow>
      </Screen>
    );
  }

  async function handleShareCode() {
    if (!snippet) return;
    await Share.share({
      message: snippet.code,
      title: snippet.title,
    });
  }

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
          <Text style={styles.brand}>Snippet</Text>
          <RetroShadow offset={3} radius={theme.radius.full}>
            <Pressable
              onPress={() => router.push("/settings")}
              style={styles.settingsBtn}
            >
              <Text style={styles.settingsBtnText}>⚙</Text>
            </Pressable>
          </RetroShadow>
        </View>

        <View style={styles.selectorRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {snippets.map((item) => (
                <Pill
                  key={item.id}
                  label={item.title.split(" ").slice(0, 2).join(" ")}
                  active={item.id === snippet.id}
                  tone={item.id === snippet.id ? "dark" : "sky"}
                  onPress={() => setActiveSnippetId(item.id)}
                />
              ))}
            </View>
          </ScrollView>
        </View>

        <Text style={styles.title}>{snippet.title}</Text>
        <Text style={styles.subtitle}>
          {snippet.notes ||
            "A local-first snippet ready for explanation and sharing."}
        </Text>

        <View style={styles.metaRow}>
          <Pill
            label={`Updated ${formatRelativeTime(snippet.updatedAt)}`}
            tone="sky"
          />
          <Pill label={snippet.language} tone="primary" />
          <Pill
            label={`${snippet.attachments?.length ?? 0} files`}
            tone="amber"
          />
          <Pill
            label={`${Math.max(1, snippet.code.split("\n").length)} lines`}
            tone="green"
          />
        </View>

        <RetroShadow
          offset={5}
          radius={theme.radius.md}
          style={styles.codeWrap}
        >
          <CodePanel
            title={`${snippet.title}.${snippet.language === "Python" ? "py" : "ts"}`}
            code={snippet.code}
            lineNumbers
            onCopy={handleShareCode}
          />
        </RetroShadow>

        <Text style={styles.associated}>Tags</Text>
        <View style={styles.tagRow}>
          {relatedTags.length === 0 ? (
            <Text style={styles.emptyBody}>No tags assigned.</Text>
          ) : (
            relatedTags.map((tag) => (
              <Pill key={tag} label={`#${tag}`} tone="sky" />
            ))
          )}
        </View>

        <SectionTitle title="AI Insights" />

        <RetroShadow offset={5} radius={theme.radius.lg}>
          <Surface
            style={styles.aiPanel}
            radius={theme.radius.lg}
          >
            <View style={styles.aiHeader}>
              <Text style={styles.aiEmoji}>✨</Text>
              <Text style={styles.aiTitle}>Explanation</Text>
            </View>
            <Text style={styles.aiBody}>{snippet.aiSummary}</Text>

            <View style={styles.aiDivider} />

            <View style={styles.aiHeader}>
              <Text style={styles.aiEmoji}>🛠</Text>
              <Text style={styles.aiTitle}>Optimization</Text>
            </View>
            <Text style={styles.aiBody}>
              {snippet.aiSuggestions[0] ??
                "Run AI to fetch refined suggestions."}
            </Text>

            <View style={styles.aiDivider} />

            <View style={styles.aiHeader}>
              <Text style={styles.aiEmoji}>📐</Text>
              <Text style={styles.aiTitle}>Complexity</Text>
              <View style={styles.optimalBadge}>
                <Text style={styles.optimalBadgeText}>Optimal</Text>
              </View>
            </View>
            <Text style={styles.aiBody}>O(1) memory · O(n) network</Text>
          </Surface>
        </RetroShadow>

        <RetroShadow
          offset={5}
          radius={theme.radius.lg}
          style={{ marginTop: theme.space.md, marginBottom: theme.space.md }}
        >
          <Pressable
            style={({ pressed }) => [
              styles.featureCard,
              pressed && {
                transform: [{ translateX: 1 }, { translateY: 1 }],
              },
            ]}
            onPress={() => generateInsights(snippet.id)}
          >
            <Text style={styles.featureEmoji}>🚀</Text>
            <Text style={styles.featureTitle}>Run AI analysis</Text>
            <Text style={styles.featureSubtitle}>
              Refresh the explanation for this snippet.
            </Text>
          </Pressable>
        </RetroShadow>

        <View style={styles.bottomButtons}>
          <RetroShadow offset={4} radius={theme.radius.full} style={{ flex: 1 }}>
            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && {
                  transform: [{ translateX: 1 }, { translateY: 1 }],
                },
              ]}
              onPress={() => router.push("/editor")}
            >
              <Text style={styles.secondaryButtonText}>Edit</Text>
            </Pressable>
          </RetroShadow>
          <RetroShadow offset={4} radius={theme.radius.full} style={{ flex: 1 }}>
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && {
                  transform: [{ translateX: 1 }, { translateY: 1 }],
                },
              ]}
              onPress={() => exportSnippet(snippet.id, "json")}
            >
              <Text style={styles.primaryButtonText}>Share</Text>
            </Pressable>
          </RetroShadow>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 6,
    paddingBottom: theme.space.md,
    gap: theme.space.sm,
  },
  brand: {
    color: theme.colors.text,
    fontSize: 22,
    fontFamily: theme.fonts.display,
    fontWeight: "900",
    letterSpacing: -0.4,
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
  selectorRow: {
    marginBottom: theme.space.md,
  },
  title: {
    color: theme.colors.text,
    fontSize: 26,
    fontWeight: "900",
    fontFamily: theme.fonts.display,
    marginBottom: 6,
    letterSpacing: -0.6,
  },
  subtitle: {
    color: theme.colors.textSoft,
    fontFamily: theme.fonts.body,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: theme.space.md,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: theme.space.md,
  },
  codeWrap: {
    marginBottom: theme.space.lg,
  },
  associated: {
    color: theme.colors.textSoft,
    fontFamily: theme.fonts.body,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 10,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: theme.space.md,
  },
  aiPanel: {
    padding: theme.space.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    gap: theme.space.xs,
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  aiEmoji: {
    fontSize: 20,
  },
  aiTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "800",
    fontFamily: theme.fonts.display,
    flex: 1,
    letterSpacing: -0.2,
  },
  aiBody: {
    color: theme.colors.textSoft,
    fontFamily: theme.fonts.body,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 4,
  },
  aiDivider: {
    height: 1,
    backgroundColor: theme.colors.borderDim,
    marginVertical: theme.space.xs,
  },
  optimalBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.greenSoft,
    borderRadius: theme.radius.full,
  },
  optimalBadgeText: {
    color: theme.colors.greenDeep,
    fontFamily: theme.fonts.body,
    fontSize: 10,
    fontWeight: "800",
  },
  featureCard: {
    backgroundColor: theme.colors.primary,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.space.md,
  },
  featureEmoji: {
    fontSize: 26,
  },
  featureTitle: {
    color: theme.colors.white,
    fontSize: 22,
    fontFamily: theme.fonts.display,
    fontWeight: "900",
    marginTop: 6,
    letterSpacing: -0.4,
  },
  featureSubtitle: {
    color: "rgba(255,255,255,0.92)",
    marginTop: 4,
    fontSize: 13,
    fontFamily: theme.fonts.body,
  },
  bottomButtons: {
    flexDirection: "row",
    gap: theme.space.sm,
    marginBottom: 14,
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.full,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: theme.colors.surface,
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
    fontSize: 13,
  },
  primaryButton: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.full,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: theme.colors.text,
  },
  primaryButtonText: {
    color: theme.colors.white,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
    fontSize: 13,
  },
  emptyCard: {
    padding: theme.space.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: "center",
    gap: theme.space.xs,
  },
  emptyEmoji: {
    fontSize: 30,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: 18,
    fontWeight: "800",
  },
  emptyBody: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 13,
    textAlign: "center",
  },
});
