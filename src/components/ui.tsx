import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type GestureResponderEvent,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { theme } from "@/theme";
import type { ManagedFile, ManagedFolder, Snippet } from "@/data/types";
import { formatRelativeTime } from "@/lib/format";

export function RetroShadow({
  children,
  offset = 5,
  shadowColor = theme.colors.shadow,
  radius = theme.radius.md,
  style,
}: {
  children: React.ReactNode;
  offset?: number;
  shadowColor?: string;
  radius?: number;
  style?: ViewStyle;
}) {
  return (
    <View
      style={[
        styles.shadowWrap,
        { paddingRight: offset, paddingBottom: offset },
        style,
      ]}
    >
      <View
        pointerEvents="none"
        style={[
          styles.shadowBlock,
          {
            left: offset,
            top: offset,
            backgroundColor: shadowColor,
            borderRadius: radius,
          },
        ]}
      />
      <View style={styles.shadowChild}>{children}</View>
    </View>
  );
}

export function Screen({
  children,
  padded = true,
}: {
  children: React.ReactNode;
  padded?: boolean;
}) {
  return (
    <View style={[styles.screen, padded && styles.screenPadded]}>
      {children}
    </View>
  );
}

export function Surface({
  children,
  style,
  borderColor,
  bordered = true,
  radius = theme.radius.md,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  borderColor?: string;
  bordered?: boolean;
  radius?: number;
}) {
  return (
    <View
      style={[
        styles.surface,
        { borderRadius: radius },
        bordered && {
          borderWidth: 2,
          borderColor: borderColor ?? theme.colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function SectionTitle({
  title,
  action,
}: {
  title: string;
  action?: { label: string; onPress: (event: GestureResponderEvent) => void };
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={{ flex: 1 }} />
      {action ? (
        <Pressable
          onPress={action.onPress}
          style={({ pressed }) => [
            styles.linkButton,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={styles.linkButtonText}>{action.label} →</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Pill({
  label,
  active,
  onPress,
  icon,
  tone,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  icon?: string;
  tone?: "primary" | "accent" | "amber" | "green" | "pink" | "sky" | "dark";
}) {
  const palette = (() => {
    switch (tone) {
      case "accent":
      case "amber":
        return { color: theme.colors.accentDeep, bg: theme.colors.accentSoft };
      case "green":
        return { color: theme.colors.greenDeep, bg: theme.colors.greenSoft };
      case "pink":
        return { color: theme.colors.pinkDeep, bg: theme.colors.pinkSoft };
      case "sky":
        return {
          color: theme.colors.accent2Deep,
          bg: theme.colors.accent2Soft,
        };
      case "dark":
        return { color: theme.colors.text, bg: theme.colors.surface2 };
      default:
        return { color: theme.colors.primaryDeep, bg: theme.colors.primarySoft };
    }
  })();

  const Container: any = onPress ? Pressable : View;
  const containerProps = onPress
    ? {
        onPress,
        style: ({ pressed }: { pressed: boolean }) => [
          styles.pill,
          { borderColor: theme.colors.border, backgroundColor: palette.bg },
          active && {
            backgroundColor: theme.colors.text,
            borderColor: theme.colors.text,
          },
          pressed ? { transform: [{ translateX: 1 }, { translateY: 1 }] } : null,
        ],
      }
    : {
        style: [
          styles.pill,
          { borderColor: theme.colors.border, backgroundColor: palette.bg },
          active && {
            backgroundColor: theme.colors.text,
            borderColor: theme.colors.text,
          },
        ],
      };

  const labelColor = active ? theme.colors.white : palette.color;

  return (
    <Container {...containerProps}>
      {icon ? (
        <Text style={[styles.pillIcon, { color: labelColor }]}>{icon}</Text>
      ) : null}
      <Text style={[styles.pillText, { color: labelColor }]}>{label}</Text>
    </Container>
  );
}

export const SearchField = React.forwardRef<TextInput, TextInputProps>(
  function SearchField({ style, ...props }, ref) {
    return (
      <View style={styles.searchField}>
        <View style={styles.searchIconBubble}>
          <Text style={styles.searchIcon}>⌕</Text>
        </View>
        <TextInput
          ref={ref}
          {...props}
          placeholderTextColor={theme.colors.textMuted}
          style={[styles.searchInput, style]}
        />
      </View>
    );
  },
);

export function StatTile({
  title,
  subtitle,
  tone = "primary",
  emoji,
  onPress,
}: {
  title: string;
  subtitle: string;
  tone?: "primary" | "amber" | "sky" | "green";
  emoji?: string;
  onPress?: () => void;
}) {
  const bg = (() => {
    switch (tone) {
      case "amber":
        return theme.colors.accent;
      case "sky":
        return theme.colors.accent2;
      case "green":
        return theme.colors.green;
      default:
        return theme.colors.primary;
    }
  })();

  const textColor =
    tone === "primary" ? theme.colors.white : theme.colors.text;

  const Container: any = onPress ? Pressable : View;

  return (
    <RetroShadow offset={5} radius={theme.radius.lg} style={{ flex: 1 }}>
      <Container
        onPress={onPress}
        style={({ pressed }: { pressed?: boolean }) => [
          styles.statTile,
          { backgroundColor: bg },
          pressed && { transform: [{ translateX: 1 }, { translateY: 1 }] },
        ]}
      >
        <View style={styles.statTileEmojiRow}>
          {emoji ? (
            <Text style={styles.statTileEmoji}>{emoji}</Text>
          ) : null}
        </View>
        <Text style={[styles.statTileTitle, { color: textColor }]}>
          {title}
        </Text>
        <View style={styles.statTileFooter}>
          <Text
            style={[
              styles.statTileSubtitle,
              { color: tone === "primary" ? "rgba(255,255,255,0.85)" : theme.colors.textSoft },
            ]}
          >
            {subtitle}
          </Text>
          <Text
            style={[
              styles.statTileArrow,
              { color: tone === "primary" ? theme.colors.white : theme.colors.text },
            ]}
          >
            →
          </Text>
        </View>
      </Container>
    </RetroShadow>
  );
}

const LANGUAGE_PALETTE: Record<
  string,
  { bg: string; text: string; emoji: string }
> = {
  TypeScript: { bg: "#dbeafe", text: "#1e40af", emoji: "TS" },
  JavaScript: { bg: "#fef3c7", text: "#92400e", emoji: "JS" },
  Python: { bg: "#dcfce7", text: "#166534", emoji: "PY" },
  React: { bg: "#dbeafe", text: "#1d4ed8", emoji: "⚛" },
  JSON: { bg: "#f3e8ff", text: "#6b21a8", emoji: "{ }" },
  Markdown: { bg: "#fee2e2", text: "#991b1b", emoji: "MD" },
};

function languageBadge(language: string) {
  return (
    LANGUAGE_PALETTE[language] ?? {
      bg: theme.colors.accent2Soft,
      text: theme.colors.text,
      emoji: language.slice(0, 2).toUpperCase(),
    }
  );
}

export function SnippetCard({
  snippet,
  onPress,
  onFavorite,
  status,
}: {
  snippet: Snippet;
  onPress?: () => void;
  onFavorite?: () => void;
  status?: { label: string; tone?: "dark" | "primary" | "green" };
}) {
  const lang = languageBadge(snippet.language);
  return (
    <RetroShadow
      offset={5}
      radius={theme.radius.lg}
      style={{ marginBottom: theme.space.md }}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.snippetCard,
          pressed && { transform: [{ translateX: 1 }, { translateY: 1 }] },
        ]}
      >
        <View style={styles.snippetCardTop}>
          <View style={[styles.langBadge, { backgroundColor: lang.bg }]}>
            <Text style={[styles.langBadgeText, { color: lang.text }]}>
              {lang.emoji}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={styles.snippetTitle}>
              {snippet.title}
            </Text>
            <Text style={styles.snippetSubtitle}>
              {snippet.language} · {formatRelativeTime(snippet.updatedAt)}
            </Text>
          </View>
          {onFavorite ? (
            <Pressable onPress={onFavorite} hitSlop={12}>
              <Text
                style={[
                  styles.favoriteIcon,
                  snippet.favorite && styles.favoriteIconActive,
                ]}
              >
                {snippet.favorite ? "★" : "☆"}
              </Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.snippetFooter}>
          <View style={styles.tagRow}>
            {snippet.tags.slice(0, 2).map((tag) => (
              <Text key={tag} style={styles.tag}>
                #{tag}
              </Text>
            ))}
          </View>
          {status ? (
            <View
              style={[
                styles.statusButton,
                status.tone === "primary" && {
                  backgroundColor: theme.colors.primary,
                },
                status.tone === "green" && {
                  backgroundColor: theme.colors.greenDeep,
                },
              ]}
            >
              <Text style={styles.statusButtonText}>{status.label}</Text>
            </View>
          ) : (
            <Text style={styles.snippetMeta}>
              {Math.max(1, snippet.code.split("\n").length)} lines
            </Text>
          )}
        </View>
      </Pressable>
    </RetroShadow>
  );
}

export function FolderCard({ folder }: { folder: ManagedFolder }) {
  return (
    <RetroShadow
      offset={5}
      radius={theme.radius.lg}
      style={{ marginBottom: theme.space.md }}
    >
      <View style={styles.folderCard}>
        <View style={styles.folderLeft}>
          <View
            style={[styles.folderIconBox, { backgroundColor: folder.accent }]}
          >
            <Text style={styles.folderIcon}>▣</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.folderName}>{folder.name}</Text>
            <Text style={styles.folderMeta}>
              {`${folder.itemCount} items · ${folder.sizeLabel}`}
            </Text>
            <View style={styles.folderDots}>
              <View
                style={[styles.dot, { backgroundColor: theme.colors.primary }]}
              />
              <View
                style={[styles.dot, { backgroundColor: theme.colors.accent }]}
              />
              <View
                style={[styles.dot, { backgroundColor: theme.colors.accent2 }]}
              />
            </View>
          </View>
          <Text style={styles.folderArrow}>→</Text>
        </View>
        <View style={styles.folderProgressTrack}>
          <View
            style={[
              styles.folderProgress,
              { width: `${Math.round(folder.progress * 100)}%` },
            ]}
          />
        </View>
      </View>
    </RetroShadow>
  );
}

export function FileRow({
  file,
  onPress,
}: {
  file: ManagedFile;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.fileRow,
        pressed && { backgroundColor: theme.colors.bgAlt },
      ]}
    >
      <View style={styles.fileTypeBox}>
        <Text style={styles.fileType}>
          {file.icon.toUpperCase().slice(0, 4)}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.fileName}>{file.name}</Text>
        <Text style={styles.fileMeta}>{file.modifiedLabel}</Text>
      </View>
      <Text style={styles.fileSize}>{file.sizeLabel}</Text>
    </Pressable>
  );
}

export function CodePanel({
  title,
  code,
  lineNumbers = false,
  onCopy,
}: {
  title: string;
  code: string;
  lineNumbers?: boolean;
  onCopy?: () => void;
}) {
  const lines = code.split("\n");
  return (
    <View style={styles.codeShell}>
      <View style={styles.codeHeader}>
        <View style={styles.windowDots}>
          <View
            style={[styles.windowDot, { backgroundColor: theme.colors.red }]}
          />
          <View
            style={[styles.windowDot, { backgroundColor: theme.colors.accent }]}
          />
          <View
            style={[styles.windowDot, { backgroundColor: theme.colors.green }]}
          />
        </View>
        <Text style={styles.codeTitle} numberOfLines={1}>
          {title}
        </Text>
        {onCopy ? (
          <Pressable
            onPress={onCopy}
            hitSlop={10}
            style={({ pressed }) => [
              styles.copyButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.copyBadge}>Copy</Text>
          </Pressable>
        ) : (
          <Text style={styles.copyBadge}>Code</Text>
        )}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.codeBody}>
          {lines.map((line, index) => (
            <View key={`${title}-${index}`} style={styles.codeLine}>
              {lineNumbers ? (
                <Text style={styles.lineNo}>
                  {String(index + 1).padStart(2, "0")}
                </Text>
              ) : null}
              <Text style={styles.codeText}>{line || " "}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export function InfoCard({
  title,
  body,
  eyebrow,
  emoji,
}: {
  title: string;
  body: string;
  eyebrow?: string;
  emoji?: string;
}) {
  return (
    <RetroShadow
      offset={5}
      radius={theme.radius.lg}
      style={{ marginBottom: theme.space.md }}
    >
      <Surface style={styles.infoCard} radius={theme.radius.lg}>
        <View style={styles.infoHeader}>
          {emoji ? <Text style={styles.infoEmoji}>{emoji}</Text> : null}
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        </View>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoBody}>{body}</Text>
      </Surface>
    </RetroShadow>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    position: "relative",
    alignSelf: "stretch",
  },
  shadowBlock: {
    position: "absolute",
    right: 0,
    bottom: 0,
  },
  shadowChild: {
    width: "100%",
  },
  screen: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  screenPadded: {
    paddingHorizontal: theme.space.md,
    paddingBottom: theme.space.xl,
  },
  surface: {
    backgroundColor: theme.colors.surface,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.xs,
    marginTop: theme.space.xl,
    marginBottom: theme.space.md,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontFamily: theme.fonts.display,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  linkButton: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  linkButtonText: {
    color: theme.colors.textSoft,
    fontSize: 13,
    fontWeight: "600",
    fontFamily: theme.fonts.body,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    borderWidth: 2,
  },
  pillIcon: {
    fontSize: 12,
    fontFamily: theme.fonts.body,
    fontWeight: "700",
  },
  pillText: {
    fontSize: 12,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
    letterSpacing: 0.2,
  },
  searchField: {
    minHeight: 56,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 6,
    paddingRight: theme.space.md,
    gap: theme.space.sm,
  },
  searchIconBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  searchIcon: {
    color: theme.colors.white,
    fontSize: 18,
    lineHeight: 20,
    fontWeight: "800",
    textAlign: "center",
    includeFontPadding: false,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 14,
    fontFamily: theme.fonts.body,
    paddingVertical: 10,
    paddingHorizontal: 0,
    margin: 0,
  },
  statTile: {
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    padding: theme.space.md,
    minHeight: 130,
    justifyContent: "space-between",
  },
  statTileEmojiRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statTileEmoji: {
    fontSize: 26,
  },
  statTileTitle: {
    fontSize: 30,
    fontFamily: theme.fonts.display,
    fontWeight: "900",
    letterSpacing: -1,
  },
  statTileFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statTileSubtitle: {
    fontSize: 13,
    fontFamily: theme.fonts.body,
    fontWeight: "600",
  },
  statTileArrow: {
    fontSize: 20,
    fontWeight: "800",
  },
  snippetCard: {
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    padding: theme.space.md,
    gap: theme.space.sm,
  },
  snippetCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.sm,
  },
  langBadge: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  langBadgeText: {
    fontSize: 13,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
    letterSpacing: -0.2,
  },
  snippetTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontFamily: theme.fonts.display,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  snippetSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontFamily: theme.fonts.body,
    marginTop: 2,
  },
  favoriteIcon: {
    color: theme.colors.textMuted,
    fontSize: 22,
  },
  favoriteIconActive: {
    color: theme.colors.accentDeep,
  },
  snippetFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.space.sm,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    flex: 1,
  },
  tag: {
    color: theme.colors.textSoft,
    fontSize: 11,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
    backgroundColor: theme.colors.bgAlt,
    borderRadius: theme.radius.full,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  snippetMeta: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontFamily: theme.fonts.body,
    fontWeight: "600",
  },
  statusButton: {
    backgroundColor: theme.colors.text,
    borderRadius: theme.radius.full,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  statusButtonText: {
    color: theme.colors.white,
    fontSize: 11,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
  folderCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.border,
    padding: theme.space.md,
    gap: theme.space.md,
    borderRadius: theme.radius.lg,
  },
  folderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.md,
  },
  folderIconBox: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  folderIcon: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: "900",
  },
  folderName: {
    color: theme.colors.text,
    fontSize: 16,
    fontFamily: theme.fonts.display,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  folderMeta: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontFamily: theme.fonts.body,
    marginTop: 2,
  },
  folderDots: {
    flexDirection: "row",
    gap: 4,
    marginTop: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  folderArrow: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: "800",
  },
  folderProgressTrack: {
    height: 8,
    backgroundColor: theme.colors.bgAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.full,
    overflow: "hidden",
  },
  folderProgress: {
    height: "100%",
    backgroundColor: theme.colors.primary,
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.md,
    paddingVertical: theme.space.md,
    paddingHorizontal: theme.space.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderDim,
  },
  fileTypeBox: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.sm,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  fileType: {
    color: theme.colors.text,
    fontWeight: "800",
    fontSize: 10,
    fontFamily: theme.fonts.body,
    letterSpacing: 0.4,
  },
  fileName: {
    color: theme.colors.text,
    fontSize: 14,
    fontFamily: theme.fonts.display,
    fontWeight: "700",
  },
  fileMeta: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontFamily: theme.fonts.body,
    marginTop: 2,
  },
  fileSize: {
    color: theme.colors.text,
    fontSize: 13,
    fontFamily: theme.fonts.body,
    fontWeight: "700",
    minWidth: 56,
    textAlign: "right",
  },
  codeShell: {
    borderRadius: theme.radius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface2,
    overflow: "hidden",
  },
  codeHeader: {
    height: 42,
    backgroundColor: theme.colors.bgAlt,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.space.md,
    gap: theme.space.sm,
  },
  windowDots: {
    flexDirection: "row",
    gap: 6,
    width: 60,
  },
  windowDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  codeTitle: {
    color: theme.colors.text,
    fontSize: 12,
    fontFamily: theme.fonts.mono,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
  copyBadge: {
    color: theme.colors.text,
    fontSize: 12,
    fontFamily: theme.fonts.body,
    fontWeight: "800",
    minWidth: 56,
    textAlign: "right",
  },
  copyButton: {
    minWidth: 56,
    alignItems: "flex-end",
  },
  codeBody: {
    padding: theme.space.md,
    minWidth: 500,
    backgroundColor: theme.colors.surface,
  },
  codeLine: {
    flexDirection: "row",
    gap: theme.space.md,
    minHeight: 22,
  },
  lineNo: {
    width: 28,
    color: theme.colors.textDim,
    fontFamily: theme.fonts.mono,
    fontSize: 11,
  },
  codeText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.mono,
    fontSize: 13,
    lineHeight: 21,
  },
  infoCard: {
    padding: theme.space.md,
    gap: theme.space.xs,
    backgroundColor: theme.colors.cardAlt,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.xs,
  },
  infoEmoji: {
    fontSize: 22,
  },
  eyebrow: {
    color: theme.colors.primaryDeep,
    fontFamily: theme.fonts.body,
    fontWeight: "800",
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  infoTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "800",
    fontFamily: theme.fonts.display,
    letterSpacing: -0.2,
  },
  infoBody: {
    color: theme.colors.textSoft,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: theme.fonts.body,
  },
});
