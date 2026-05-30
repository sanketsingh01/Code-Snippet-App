import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { useApp } from "@/context/app-context";
import {
  FileRow,
  FolderCard,
  Pill,
  RetroShadow,
  Screen,
  SectionTitle,
  Surface,
} from "@/components/ui";
import { theme } from "@/theme";
import {
  copyManagedFile,
  deleteManagedFile,
  moveManagedFile,
} from "@/lib/file-hub";

export default function FilesScreen() {
  const { folders, files, refresh, createFolder, importFileAsSnippet } =
    useApp();
  const router = useRouter();
  const [selectedPath, setSelectedPath] = useState<string | null>(
    files[0]?.path ?? null,
  );

  useEffect(() => {
    if (!selectedPath && files[0]?.path) {
      setSelectedPath(files[0].path);
    }
  }, [files, selectedPath]);

  const selectedFile = useMemo(
    () => files.find((file) => file.path === selectedPath) ?? files[0] ?? null,
    [files, selectedPath],
  );

  async function handleNewFolder() {
    await createFolder(`Playgrounds-${Date.now().toString().slice(-4)}`);
    await refresh();
  }

  async function handleImport() {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled) {
      return;
    }

    await importFileAsSnippet(result.assets[0].uri);
    await refresh();
    router.push("/editor");
  }

  async function handleUseFile() {
    if (!selectedFile || selectedFile.kind === "folder") {
      Alert.alert(
        "Select a file",
        "Choose a file row first, then import it into the snippet editor.",
      );
      return;
    }

    await importFileAsSnippet(selectedFile.path);
    router.push("/editor");
  }

  async function handleDelete() {
    if (!selectedFile || selectedFile.kind === "folder") {
      return;
    }
    await deleteManagedFile(selectedFile.path);
    await refresh();
  }

  async function handleCopy() {
    if (!selectedFile || selectedFile.kind === "folder") {
      return;
    }
    await copyManagedFile(selectedFile.path, "Exports");
    await refresh();
  }

  async function handleMove() {
    if (!selectedFile || selectedFile.kind === "folder") {
      return;
    }
    await moveManagedFile(selectedFile.path, "Templates");
    await refresh();
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

        <Text style={styles.heroTitle}>Files</Text>
        <Text style={styles.heroSubtitle}>
          Local storage · DevSnippets
        </Text>

        <View style={styles.actionRow}>
          <RetroShadow offset={4} radius={theme.radius.full} style={{ flex: 1 }}>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                pressed && {
                  transform: [{ translateX: 1 }, { translateY: 1 }],
                },
              ]}
              onPress={handleUseFile}
            >
              <Text style={styles.actionButtonText}>Use</Text>
            </Pressable>
          </RetroShadow>
          <RetroShadow offset={4} radius={theme.radius.full} style={{ flex: 1 }}>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                pressed && {
                  transform: [{ translateX: 1 }, { translateY: 1 }],
                },
              ]}
              onPress={handleNewFolder}
            >
              <Text style={styles.actionButtonText}>New folder</Text>
            </Pressable>
          </RetroShadow>
          <RetroShadow offset={4} radius={theme.radius.full} style={{ flex: 1 }}>
            <Pressable
              style={({ pressed }) => [
                styles.actionButtonFilled,
                pressed && {
                  transform: [{ translateX: 1 }, { translateY: 1 }],
                },
              ]}
              onPress={handleImport}
            >
              <Text style={styles.actionButtonFilledText}>Import</Text>
            </Pressable>
          </RetroShadow>
        </View>

        <SectionTitle title="Folders" />
        {folders.length === 0 ? (
          <RetroShadow offset={4} radius={theme.radius.lg}>
            <Surface style={styles.emptyState}>
              <Text style={styles.emptyText}>No folders yet.</Text>
            </Surface>
          </RetroShadow>
        ) : (
          folders.map((folder) => (
            <FolderCard key={folder.name} folder={folder} />
          ))
        )}

        <SectionTitle
          title="Recent Files"
          action={{ label: "Refresh", onPress: refresh }}
        />
        <RetroShadow
          offset={5}
          radius={theme.radius.lg}
          style={{ marginBottom: theme.space.lg }}
        >
          <Surface style={styles.filesTable} radius={theme.radius.lg}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>NAME</Text>
              <Text style={styles.tableHeaderText}>SIZE</Text>
            </View>
            {files.length === 0 ? (
              <View style={styles.fileRowEmpty}>
                <Text style={styles.emptyText}>No files yet.</Text>
              </View>
            ) : (
              files.map((file) => (
                <FileRow
                  key={file.path}
                  file={file}
                  onPress={() => setSelectedPath(file.path)}
                />
              ))
            )}
          </Surface>
        </RetroShadow>

        <RetroShadow
          offset={5}
          radius={theme.radius.lg}
          style={{ marginBottom: theme.space.lg }}
        >
          <Surface style={styles.syncCard} radius={theme.radius.lg}>
            <View style={styles.syncTop}>
              <View style={styles.syncIcon}>
                <Text style={styles.syncIconText}>↻</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.syncTitle}>Sync status</Text>
                <Text style={styles.syncSubtitle}>
                  8 files pending · 42 MB queued
                </Text>
              </View>
              <Text style={styles.syncPercent}>72%</Text>
            </View>
            <View style={styles.syncTrack}>
              <View style={styles.syncProgress} />
            </View>
          </Surface>
        </RetroShadow>

        <RetroShadow offset={5} radius={theme.radius.lg}>
          <Surface style={styles.actionsPanel} radius={theme.radius.lg}>
            <Text style={styles.panelEyebrow}>SELECTED</Text>
            <Text style={styles.panelTitle}>
              {selectedFile ? selectedFile.name : "Nothing selected"}
            </Text>
            <Text style={styles.panelSubtitle}>
              {selectedFile
                ? `${selectedFile.sizeLabel} · ${selectedFile.modifiedLabel}`
                : "Tap a file row to select it."}
            </Text>
            <View style={styles.fileActions}>
              <Pill label="Copy" tone="sky" onPress={handleCopy} />
              <Pill label="Move" tone="amber" onPress={handleMove} />
              <Pill label="Delete" tone="primary" onPress={handleDelete} />
            </View>
          </Surface>
        </RetroShadow>

        <RetroShadow
          offset={4}
          radius={theme.radius.lg}
          style={{ marginTop: theme.space.md }}
        >
          <Surface style={styles.bottomNote} radius={theme.radius.lg}>
            <Text style={styles.bottomNoteText}>
              File management runs entirely on device using Expo FileSystem. No
              cloud sync.
            </Text>
          </Surface>
        </RetroShadow>
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
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: theme.space.md,
  },
  actionButton: {
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.full,
  },
  actionButtonText: {
    color: theme.colors.text,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
    fontSize: 12,
  },
  actionButtonFilled: {
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.text,
    borderRadius: theme.radius.full,
  },
  actionButtonFilledText: {
    color: theme.colors.white,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
    fontSize: 12,
  },
  emptyState: {
    padding: theme.space.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 13,
  },
  filesTable: {
    backgroundColor: theme.colors.surface,
    paddingBottom: 0,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: theme.colors.bgAlt,
    paddingHorizontal: theme.space.md,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.border,
  },
  tableHeaderText: {
    color: theme.colors.textSoft,
    fontSize: 11,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
    letterSpacing: 1.4,
  },
  fileRowEmpty: {
    paddingHorizontal: theme.space.md,
    paddingVertical: theme.space.md,
  },
  syncCard: {
    padding: theme.space.md,
    gap: theme.space.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  syncTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.md,
  },
  syncIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  syncIconText: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: "900",
  },
  syncTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "800",
    fontFamily: theme.fonts.display,
    letterSpacing: -0.2,
  },
  syncSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontFamily: theme.fonts.body,
    marginTop: 2,
  },
  syncPercent: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: 18,
    fontWeight: "900",
  },
  syncTrack: {
    height: 10,
    backgroundColor: theme.colors.bgAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.full,
    overflow: "hidden",
  },
  syncProgress: {
    width: "72%",
    height: "100%",
    backgroundColor: theme.colors.primary,
  },
  actionsPanel: {
    padding: theme.space.md,
    gap: 6,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  panelEyebrow: {
    color: theme.colors.primaryDeep,
    fontFamily: theme.fonts.body,
    fontSize: 11,
    letterSpacing: 1.2,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  panelTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontFamily: theme.fonts.display,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  panelSubtitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 13,
    marginBottom: 8,
  },
  fileActions: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  bottomNote: {
    backgroundColor: theme.colors.accent2Soft,
    borderWidth: 2,
    borderColor: theme.colors.border,
    padding: theme.space.md,
  },
  bottomNoteText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
    fontSize: 13,
    lineHeight: 19,
  },
});
