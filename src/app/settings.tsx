import { Pill, RetroShadow, Screen, Surface } from "@/components/ui";
import { useApp } from "@/context/app-context";
import { getApiKey } from "@/lib/storage";
import { theme } from "@/theme";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function SettingsScreen() {
  const {
    settings,
    updateThemeMode,
    updateProvider,
    saveApiToken,
    resetLibrary,
  } = useApp();
  const [token, setToken] = useState("");

  useEffect(() => {
    (async () => {
      setToken((await getApiKey()) ?? "");
    })();
  }, []);

  async function handleSaveToken() {
    await saveApiToken(token);
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
          <Text style={styles.brand}>Settings</Text>
          <View style={{ width: 38 }} />
        </View>

        <RetroShadow offset={5} radius={theme.radius.lg}>
          <Surface style={styles.panel} radius={theme.radius.lg}>
            <Text style={styles.panelEmoji}>🎨</Text>
            <Text style={styles.panelTitle}>Theme preference</Text>
            <Text style={styles.helperText}>
              Pick a base palette. Pastel mode is locked on for now.
            </Text>
            <View style={styles.optionRow}>
              <Pill
                label="Light"
                active={settings.themeMode === "light"}
                onPress={() => updateThemeMode("light")}
                tone="amber"
              />
              <Pill
                label="System"
                active={settings.themeMode === "system"}
                onPress={() => updateThemeMode("system")}
                tone="sky"
              />
            </View>
          </Surface>
        </RetroShadow>

        <RetroShadow
          offset={5}
          radius={theme.radius.lg}
          style={{ marginTop: theme.space.md }}
        >
          <Surface style={styles.panel} radius={theme.radius.lg}>
            <Text style={styles.panelEmoji}>🤖</Text>
            <Text style={styles.panelTitle}>AI provider</Text>
            <Text style={styles.helperText}>
              Mock keeps the app usable without an API key or internet.
            </Text>
            <View style={styles.optionRow}>
              <Pill
                label="Mock"
                active={settings.apiProvider === "mock"}
                onPress={() => updateProvider("mock")}
                tone="sky"
              />
              <Pill
                label="OpenAI"
                active={settings.apiProvider === "openai"}
                onPress={() => updateProvider("openai")}
                tone="primary"
              />
              <Pill
                label="Gemini"
                active={settings.apiProvider === "gemini"}
                onPress={() => updateProvider("gemini")}
                tone="amber"
              />
            </View>
          </Surface>
        </RetroShadow>

        <RetroShadow
          offset={5}
          radius={theme.radius.lg}
          style={{ marginTop: theme.space.md }}
        >
          <Surface style={styles.panel} radius={theme.radius.lg}>
            <Text style={styles.panelEmoji}>🔑</Text>
            <Text style={styles.panelTitle}>API credential</Text>
            <Text style={styles.helperText}>
              Stored locally in Expo SecureStore. Never synced.
            </Text>
            <TextInput
              value={token}
              onChangeText={setToken}
              placeholder="paste your API key..."
              placeholderTextColor={theme.colors.textMuted}
              secureTextEntry
              style={styles.tokenInput}
            />
            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                pressed && {
                  transform: [{ translateX: 1 }, { translateY: 1 }],
                },
              ]}
              onPress={handleSaveToken}
            >
              <Text style={styles.saveButtonText}>Save token</Text>
            </Pressable>
            {settings.apiKeySet ? (
              <Text style={styles.statusOk}>● Saved</Text>
            ) : (
              <Text style={styles.statusNeutral}>○ No key stored</Text>
            )}
          </Surface>
        </RetroShadow>

        <RetroShadow
          offset={5}
          radius={theme.radius.lg}
          style={{ marginTop: theme.space.md }}
        >
          <Surface style={styles.panel} radius={theme.radius.lg}>
            <Text style={styles.panelEmoji}>🧹</Text>
            <Text style={styles.panelTitle}>Library reset</Text>
            <Text style={styles.helperText}>
              Restores demo snippets and rebuilds the local file structure.
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.warnButton,
                pressed && {
                  transform: [{ translateX: 1 }, { translateY: 1 }],
                },
              ]}
              onPress={resetLibrary}
            >
              <Text style={styles.warnButtonText}>Reset demo data</Text>
            </Pressable>
          </Surface>
        </RetroShadow>

        <RetroShadow
          offset={5}
          radius={theme.radius.lg}
          style={{ marginTop: theme.space.md }}
        >
          <Surface style={styles.panel} radius={theme.radius.lg}>
            <Text style={styles.panelEmoji}>📦</Text>
            <Text style={styles.panelTitle}>Storage stack</Text>
            <Text style={styles.helperText}>
              ▸ SQLite — snippet library{"\n"}
              ▸ AsyncStorage — preferences{"\n"}
              ▸ SecureStore — sensitive tokens{"\n"}
              ▸ Expo FileSystem — local file management
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
    paddingBottom: theme.space.md,
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
  brand: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 26,
    fontFamily: theme.fonts.display,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.4,
  },
  panel: {
    padding: theme.space.md,
    gap: theme.space.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  panelEmoji: {
    fontSize: 24,
  },
  panelTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "800",
    fontFamily: theme.fonts.display,
    letterSpacing: -0.2,
  },
  optionRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 4,
  },
  helperText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 13,
    lineHeight: 19,
  },
  tokenInput: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.space.md,
    paddingVertical: 12,
    color: theme.colors.text,
    fontFamily: theme.fonts.mono,
    fontSize: 13,
    backgroundColor: theme.colors.bg,
    marginTop: 6,
  },
  saveButton: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.text,
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 6,
  },
  saveButtonText: {
    color: theme.colors.white,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
    fontSize: 13,
  },
  statusOk: {
    color: theme.colors.greenDeep,
    fontFamily: theme.fonts.body,
    fontSize: 12,
    fontWeight: "800",
  },
  statusNeutral: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 12,
  },
  warnButton: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radius.full,
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 6,
  },
  warnButtonText: {
    color: theme.colors.primaryDeep,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
    fontSize: 13,
  },
});
