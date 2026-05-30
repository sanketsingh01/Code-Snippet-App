import { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { Pill, RetroShadow, Surface } from "@/components/ui";
import { useApp } from "@/context/app-context";
import { theme } from "@/theme";
import { copyFileIntoAttachments } from "@/lib/file-hub";

export default function EditorScreen() {
  const {
    snippets,
    selectedSnippet,
    setActiveSnippetId,
    createSnippet,
    updateSnippet,
  } = useApp();
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const isNewDraft = params.mode === "new";
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("TypeScript");
  const [tags, setTags] = useState("");
  const [code, setCode] = useState("");
  const [notes, setNotes] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);

  useEffect(() => {
    if (isNewDraft) {
      setTitle("");
      setLanguage("TypeScript");
      setTags("");
      setCode("");
      setNotes("");
      setAttachments([]);
      return;
    }

    if (selectedSnippet) {
      setTitle(selectedSnippet.title);
      setLanguage(selectedSnippet.language);
      setTags(selectedSnippet.tags.join(", "));
      setCode(selectedSnippet.code);
      setNotes(selectedSnippet.notes);
      setAttachments(selectedSnippet.attachments ?? []);
    }
  }, [isNewDraft, selectedSnippet]);

  const tagList = useMemo(
    () =>
      tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    [tags],
  );

  async function handleSave() {
    if (isNewDraft || !selectedSnippet) {
      await createSnippet({
        title: title.trim() || "Untitled Snippet",
        language: language as any,
        tags: tagList,
        code,
        notes,
        attachments,
      });
      router.push("/details");
      return;
    }

    await updateSnippet({
      ...selectedSnippet,
      title,
      language: language as any,
      tags: tagList,
      code,
      notes,
      attachments,
    });
  }

  function handleLoadSeed() {
    const seed = snippets[0];
    if (!seed) {
      return;
    }

    setActiveSnippetId(seed.id);
    setTitle(seed.title);
    setLanguage(seed.language);
    setTags(seed.tags.join(", "));
    setCode(seed.code);
    setNotes(seed.notes);
    setAttachments(seed.attachments ?? []);
  }

  async function handleAttachFile() {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled) {
      return;
    }

    const picked = result.assets[0];
    const stored = await copyFileIntoAttachments(picked.uri);
    setAttachments((current) => Array.from(new Set([...current, stored.uri])));
  }

  async function handleCopyCode() {
    await Share.share({
      message: code || "// Write your code here",
      title: title || "DevSnippets code",
    });
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: theme.space.md, paddingBottom: 96 }}
      >
        <View style={styles.headerRow}>
          <RetroShadow offset={3} radius={theme.radius.full}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backBtnText}>← Back</Text>
            </Pressable>
          </RetroShadow>
          <Text style={styles.brand}>
            {isNewDraft ? "New Snippet" : "Edit"}
          </Text>
          <RetroShadow offset={3} radius={theme.radius.full}>
            <Pressable
              onPress={() => router.push("/settings")}
              style={styles.settingsBtn}
            >
              <Text style={styles.settingsBtnText}>⚙</Text>
            </Pressable>
          </RetroShadow>
        </View>

        <Text style={styles.label}>Filename</Text>
        <RetroShadow offset={4} radius={theme.radius.md}>
          <Surface style={styles.inputSurface}>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="main_auth_handler.py"
              placeholderTextColor={theme.colors.textMuted}
              style={styles.input}
            />
          </Surface>
        </RetroShadow>

        <Text style={styles.label}>Language</Text>
        <RetroShadow offset={4} radius={theme.radius.md}>
          <Surface style={styles.inputSurface}>
            <View style={styles.languageRow}>
              <TextInput
                value={language}
                onChangeText={setLanguage}
                placeholder="TypeScript"
                placeholderTextColor={theme.colors.textMuted}
                style={[styles.input, { flex: 1 }]}
              />
              <Text style={styles.chevron}>▾</Text>
            </View>
          </Surface>
        </RetroShadow>

        <Text style={styles.label}>Tags</Text>
        <View style={styles.tagCloud}>
          {tagList.length === 0 ? (
            <Text style={styles.helperText}>
              Comma-separate to add tags below.
            </Text>
          ) : (
            tagList.map((tag) => (
              <Pill key={tag} label={`#${tag}`} active />
            ))
          )}
        </View>
        <View style={styles.tagAdder}>
          <Text style={styles.tagAdderPlus}>+</Text>
          <TextInput
            value={tags}
            onChangeText={setTags}
            placeholder="comma, separated, tags"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.tagAdderInput}
          />
        </View>

        <Text style={styles.label}>Source</Text>
        <RetroShadow offset={5} radius={theme.radius.lg}>
          <View style={styles.codeShell}>
            <View style={styles.editorToolbar}>
              <View style={styles.windowDots}>
                <View
                  style={[
                    styles.windowDot,
                    { backgroundColor: theme.colors.red },
                  ]}
                />
                <View
                  style={[
                    styles.windowDot,
                    { backgroundColor: theme.colors.accent },
                  ]}
                />
                <View
                  style={[
                    styles.windowDot,
                    { backgroundColor: theme.colors.greenDeep },
                  ]}
                />
              </View>
              <Text style={styles.editorTitle} numberOfLines={1}>
                {title || "untitled.txt"}
              </Text>
              <Pressable onPress={handleCopyCode} hitSlop={10}>
                <Text style={styles.copyIcon}>Copy</Text>
              </Pressable>
            </View>
            <TextInput
              value={code}
              onChangeText={setCode}
              multiline
              placeholder={"// write your code here\n// happy coding 🌿"}
              placeholderTextColor={theme.colors.textMuted}
              style={styles.codeInput}
            />
          </View>
        </RetroShadow>

        <Text style={styles.label}>Notes</Text>
        <RetroShadow offset={4} radius={theme.radius.lg}>
          <Surface style={styles.noteSurface} radius={theme.radius.lg}>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Why this snippet matters..."
              placeholderTextColor={theme.colors.textMuted}
              multiline
              style={styles.notesInput}
            />
            <View style={styles.attachmentRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.attachButton,
                  pressed && {
                    transform: [{ translateX: 1 }, { translateY: 1 }],
                  },
                ]}
                onPress={handleAttachFile}
              >
                <Text style={styles.attachButtonText}>+ Attach file</Text>
              </Pressable>
              <Text style={styles.attachMeta}>
                {`${attachments.length} attachment${attachments.length === 1 ? "" : "s"}`}
              </Text>
            </View>
            {attachments.length > 0 ? (
              <View style={styles.attachmentList}>
                {attachments.map((uri) => (
                  <Text
                    key={uri}
                    style={styles.attachmentItem}
                    numberOfLines={1}
                  >
                    {`▸ ${uri.split(/[/\\]/).pop()}`}
                  </Text>
                ))}
              </View>
            ) : null}
          </Surface>
        </RetroShadow>

        <View style={styles.actionRow}>
          <RetroShadow offset={4} radius={theme.radius.full} style={{ flex: 1 }}>
            <Pressable
              style={({ pressed }) => [
                styles.secondaryAction,
                pressed && {
                  transform: [{ translateX: 1 }, { translateY: 1 }],
                },
              ]}
              onPress={handleLoadSeed}
            >
              <Text style={styles.secondaryActionText}>Load seed</Text>
            </Pressable>
          </RetroShadow>
          <RetroShadow offset={4} radius={theme.radius.full} style={{ flex: 1 }}>
            <Pressable
              style={({ pressed }) => [
                styles.primaryAction,
                pressed && {
                  transform: [{ translateX: 1 }, { translateY: 1 }],
                },
              ]}
              onPress={handleSave}
            >
              <Text style={styles.primaryActionText}>Save snippet</Text>
            </Pressable>
          </RetroShadow>
        </View>
      </ScrollView>

      <RetroShadow
        offset={4}
        radius={28}
        style={styles.fabWrap}
      >
        <Pressable
          style={({ pressed }) => [
            styles.fab,
            pressed && { transform: [{ translateX: 1 }, { translateY: 1 }] },
          ]}
          onPress={handleSave}
        >
          <Text style={styles.fabText}>✓</Text>
        </Pressable>
      </RetroShadow>
    </KeyboardAvoidingView>
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
  label: {
    color: theme.colors.textSoft,
    fontSize: 13,
    fontWeight: "700",
    marginTop: theme.space.md,
    marginBottom: 8,
    fontFamily: theme.fonts.body,
  },
  inputSurface: {
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  input: {
    color: theme.colors.text,
    fontSize: 15,
    fontFamily: theme.fonts.body,
    paddingHorizontal: theme.space.md,
    paddingVertical: 14,
  },
  languageRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  chevron: {
    color: theme.colors.textSoft,
    fontSize: 18,
    paddingRight: theme.space.md,
  },
  tagCloud: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  tagAdder: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: "dashed",
    borderRadius: theme.radius.full,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom: theme.space.md,
    backgroundColor: theme.colors.surface,
  },
  tagAdderPlus: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  tagAdderInput: {
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
    fontSize: 14,
    minWidth: 180,
    paddingVertical: 0,
  },
  helperText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 13,
  },
  codeShell: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    overflow: "hidden",
  },
  editorToolbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.space.md,
    paddingVertical: 10,
    backgroundColor: theme.colors.surface2,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.border,
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
  editorTitle: {
    color: theme.colors.text,
    fontSize: 12,
    fontFamily: theme.fonts.mono,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
  copyIcon: {
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
    fontSize: 12,
    fontWeight: "800",
  },
  codeInput: {
    color: theme.colors.text,
    fontFamily: theme.fonts.mono,
    fontSize: 13,
    lineHeight: 21,
    minHeight: 220,
    paddingHorizontal: theme.space.md,
    paddingTop: theme.space.sm,
    paddingBottom: theme.space.md,
    textAlignVertical: "top",
  },
  noteSurface: {
    padding: theme.space.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  notesInput: {
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
    fontSize: 14,
    lineHeight: 20,
    minHeight: 90,
    textAlignVertical: "top",
  },
  attachmentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: theme.space.md,
  },
  attachButton: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radius.full,
  },
  attachButtonText: {
    color: theme.colors.text,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
    fontSize: 12,
  },
  attachMeta: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    fontFamily: theme.fonts.body,
  },
  attachmentList: {
    marginTop: theme.space.sm,
    gap: 4,
  },
  attachmentItem: {
    color: theme.colors.textSoft,
    fontFamily: theme.fonts.mono,
    fontSize: 12,
  },
  actionRow: {
    flexDirection: "row",
    gap: theme.space.sm,
    marginTop: theme.space.lg,
    marginBottom: 20,
  },
  secondaryAction: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  secondaryActionText: {
    color: theme.colors.text,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
    fontSize: 13,
  },
  primaryAction: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    backgroundColor: theme.colors.text,
  },
  primaryActionText: {
    color: theme.colors.white,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
    fontSize: 13,
  },
  fabWrap: {
    position: "absolute",
    right: 18,
    bottom: 18,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  fabText: {
    color: theme.colors.white,
    fontSize: 24,
    fontWeight: "900",
  },
});
