import { seedFolders } from "@/data/seed";
import type { ManagedFile, ManagedFolder, Settings, Snippet } from "@/data/types";
import {
  createFolder as createManagedFolder,
  exportSnippetPayload,
  initializeFileHub,
  listManagedFiles,
  listManagedFolders,
  readManagedFile,
  shareFile,
} from "@/lib/file-hub";
import { generateGeminiInsights } from "@/lib/gemini";
import { generateOpenAIInsights } from "@/lib/openai";
import {
  deleteSnippet,
  listSnippets,
  resetToSeed,
  saveSnippet,
} from "@/lib/snippet-db";

import {
  getApiKey,
  loadSettings,
  saveApiKey,
  saveSettings,
} from "@/lib/storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Alert } from "react-native";

type SnippetInput = Pick<
  Snippet,
  "title" | "code" | "language" | "tags" | "notes"
> & {
  attachments?: string[];
};

type AppContextValue = {
  snippets: Snippet[];
  folders: ManagedFolder[];
  files: ManagedFile[];
  settings: Settings;
  activeSnippetId: string | null;
  selectedSnippet: Snippet | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setActiveSnippetId: (id: string) => void;
  createSnippet: (snippet: SnippetInput) => Promise<void>;
  updateSnippet: (snippet: Snippet) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  removeSnippet: (id: string) => Promise<void>;
  generateInsights: (id: string) => Promise<void>;
  exportSnippet: (id: string, format: "txt" | "js" | "json") => Promise<void>;
  importFileAsSnippet: (path: string) => Promise<void>;
  createFolder: (name: string) => Promise<void>;
  saveApiToken: (value: string) => Promise<void>;
  updateThemeMode: (mode: Settings["themeMode"]) => Promise<void>;
  updateProvider: (provider: Settings["apiProvider"]) => Promise<void>;
  resetLibrary: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

function buildAiInsights(snippet: Snippet) {
  const source = snippet.code.toLowerCase();
  const suggestions: string[] = [];
  let summary = snippet.aiSummary;

  if (source.includes("fetch")) {
    summary = "This helper wraps network calls in a typed response object.";
    suggestions.push("Add `response.ok` handling and custom error types.");
    suggestions.push("Support `AbortController` for cancelable requests.");
  }

  if (source.includes("useeffect")) {
    summary =
      "A reusable React hook that synchronizes local state with a side effect.";
    suggestions.push("Avoid direct browser APIs on the server.");
    suggestions.push("Consider a serializer for non-JSON values.");
  }

  if (source.includes("hashlib") || source.includes("token")) {
    summary =
      "A security-oriented helper that hashes a user value with random entropy.";
    suggestions.push("Use an HMAC if you need verifiable tokens.");
    suggestions.push("Keep the threat model explicit in the snippet notes.");
  }

  if (source.includes("normalize")) {
    summary =
      "A data preprocessing helper that scales values into a normalized range.";
    suggestions.push("Guard against divide-by-zero when min and max match.");
    suggestions.push("Allow a configurable subset of columns.");
  }

  if (suggestions.length === 0) {
    suggestions.push("Add edge case handling for invalid input.");
    suggestions.push("Consider extracting repeated logic into a helper.");
    suggestions.push("Write a tiny usage example below the snippet.");
  }

  return { summary, suggestions };
}

function buildExportContent(snippet: Snippet, format: "txt" | "js" | "json") {
  if (format === "json") {
    return JSON.stringify(snippet, null, 2);
  }

  if (format === "js") {
    return `// ${snippet.title}\n// Tags: ${snippet.tags.join(", ")}\n\n${snippet.code}\n`;
  }

  return `${snippet.title}\nLanguage: ${snippet.language}\nTags: ${snippet.tags.join(", ")}\n\n${snippet.code}\n`;
}

function inferLanguageFromPath(path: string): Snippet["language"] {
  const extension = path.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "js":
    case "jsx":
      return "JavaScript";
    case "py":
      return "Python";
    case "md":
      return "Markdown";
    case "json":
      return "JSON";
    case "tsx":
    case "ts":
    default:
      return "TypeScript";
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [folders, setFolders] = useState<ManagedFolder[]>(seedFolders);
  const [files, setFiles] = useState<ManagedFile[]>([]);
  const [settings, setSettings] = useState<Settings>({
    themeMode: "light",
    apiProvider: "mock",
    apiKeySet: false,
  });
  const [activeSnippetId, setActiveSnippetIdState] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  // Keep the latest snippets/settings accessible inside callbacks without
  // forcing them to recreate on every state change.
  const snippetsRef = useRef(snippets);
  snippetsRef.current = snippets;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const selectedSnippet = useMemo(
    () =>
      snippets.find((snippet) => snippet.id === activeSnippetId) ??
      snippets[0] ??
      null,
    [activeSnippetId, snippets],
  );

  const refresh = useCallback(async () => {
    const [snippetRows, folderRows, fileRows, nextSettings, apiKey] =
      await Promise.all([
        listSnippets(),
        listManagedFolders(),
        listManagedFiles(),
        loadSettings(),
        getApiKey(),
      ]);

    setSnippets(snippetRows);
    setFolders(folderRows);
    setFiles(fileRows);
    setSettings({
      ...nextSettings,
      apiKeySet: !!apiKey,
    });
    setActiveSnippetIdState(
      (current) => current ?? snippetRows[0]?.id ?? null,
    );
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await initializeFileHub();
        await refresh();
      } catch (error) {
        // Keep the app usable even if persistence fails (e.g. AsyncStorage native
        // module missing on a misconfigured dev client).
        console.error(error);
        if (mounted) {
          Alert.alert(
            "Startup issue",
            "DevSnippets loaded with a fallback state (storage unavailable).",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [refresh]);

  const setActiveSnippetId = useCallback((id: string) => {
    setActiveSnippetIdState(id);
  }, []);

  const createSnippet = useCallback(
    async (input: SnippetInput) => {
      const now = Date.now();
      const snippet: Snippet = {
        id: `snippet-${now}-${Math.random().toString(16).slice(2, 6)}`,
        favorite: false,
        createdAt: now,
        updatedAt: now,
        aiSummary: `A new ${input.language} snippet waiting for analysis.`,
        aiSuggestions: ["Tap Details to run an offline AI-style explanation."],
        ...input,
        attachments: input.attachments ?? [],
      };

      await saveSnippet(snippet);
      await refresh();
      setActiveSnippetIdState(snippet.id);
    },
    [refresh],
  );

  const updateSnippet = useCallback(
    async (snippet: Snippet) => {
      const nextSnippet = { ...snippet, updatedAt: Date.now() };
      await saveSnippet(nextSnippet);
      await refresh();
      setActiveSnippetIdState(nextSnippet.id);
    },
    [refresh],
  );

  const toggleFavorite = useCallback(
    async (id: string) => {
      const current = snippetsRef.current.find((snippet) => snippet.id === id);
      if (!current) {
        return;
      }

      await saveSnippet({
        ...current,
        favorite: !current.favorite,
        updatedAt: Date.now(),
      });
      await refresh();
    },
    [refresh],
  );

  const removeSnippet = useCallback(
    async (id: string) => {
      await deleteSnippet(id);
      await refresh();
    },
    [refresh],
  );

  const generateInsights = useCallback(
    async (id: string) => {
      const current = snippetsRef.current.find((snippet) => snippet.id === id);
      if (!current) {
        return;
      }

      let analysis = buildAiInsights(current);
      const apiKey = await getApiKey();
      const provider = settingsRef.current.apiProvider;

      if (provider === "openai") {
        if (!apiKey) {
          Alert.alert(
            "OpenAI key missing",
            "Save your API key in Settings to enable real AI explanations.",
          );
        } else {
          try {
            analysis = await generateOpenAIInsights({
              apiKey,
              snippet: current,
            });
          } catch (error) {
            console.warn("OpenAI insight generation failed", error);
            Alert.alert(
              "OpenAI unavailable",
              "Falling back to offline snippet analysis.",
            );
          }
        }
      } else if (provider === "gemini") {
        if (!apiKey) {
          Alert.alert(
            "Gemini key missing",
            "Save your API key in Settings to enable real AI explanations.",
          );
        } else {
          try {
            analysis = await generateGeminiInsights({
              apiKey,
              snippet: current,
            });
          } catch (error) {
            console.warn("Gemini insight generation failed", error);
            Alert.alert(
              "Gemini unavailable",
              "Falling back to offline snippet analysis.",
            );
          }
        }
      }

      await saveSnippet({
        ...current,
        aiSummary: analysis.summary,
        aiSuggestions: analysis.suggestions,
        updatedAt: Date.now(),
        attachments: current.attachments ?? [],
      });
      await refresh();
    },
    [refresh],
  );

  const exportSnippet = useCallback(
    async (id: string, format: "txt" | "js" | "json") => {
      const current = snippetsRef.current.find((snippet) => snippet.id === id);
      if (!current) {
        return;
      }

      const file = await exportSnippetPayload(
        current.title,
        format,
        buildExportContent(current, format),
      );
      await shareFile(file.uri);
      await refresh();
    },
    [refresh],
  );

  const importFileAsSnippet = useCallback(
    async (path: string) => {
      const content = await readManagedFile(path);
      if (content == null) {
        return;
      }

      const fileName = path.split(/[/\\]/).pop() ?? "Imported File";
      const title = fileName.replace(/\.[^.]+$/, "");

      await createSnippet({
        title,
        language: inferLanguageFromPath(path),
        tags: ["files", "imported"],
        code: content,
        notes: `Imported from ${fileName} on device storage.`,
        attachments: [],
      });
    },
    [createSnippet],
  );

  const createFolder = useCallback(
    async (name: string) => {
      await createManagedFolder(name);
      await refresh();
    },
    [refresh],
  );

  const saveApiToken = useCallback(
    async (value: string) => {
      await saveApiKey(value);
      await refresh();
    },
    [refresh],
  );

  const updateThemeMode = useCallback(
    async (mode: Settings["themeMode"]) => {
      const next = { ...settingsRef.current, themeMode: mode };
      setSettings(next);
      await saveSettings(next);
    },
    [],
  );

  const updateProvider = useCallback(
    async (provider: Settings["apiProvider"]) => {
      const next = { ...settingsRef.current, apiProvider: provider };
      setSettings(next);
      await saveSettings(next);
    },
    [],
  );

  const resetLibrary = useCallback(async () => {
    await resetToSeed();
    await refresh();
  }, [refresh]);

  const value = useMemo<AppContextValue>(
    () => ({
      snippets,
      folders,
      files,
      settings,
      activeSnippetId,
      selectedSnippet,
      loading,
      refresh,
      setActiveSnippetId,
      createSnippet,
      updateSnippet,
      toggleFavorite,
      removeSnippet,
      generateInsights,
      exportSnippet,
      importFileAsSnippet,
      createFolder,
      saveApiToken,
      updateThemeMode,
      updateProvider,
      resetLibrary,
    }),
    [
      activeSnippetId,
      createFolder,
      createSnippet,
      exportSnippet,
      files,
      folders,
      generateInsights,
      importFileAsSnippet,
      loading,
      refresh,
      removeSnippet,
      resetLibrary,
      saveApiToken,
      selectedSnippet,
      setActiveSnippetId,
      settings,
      snippets,
      toggleFavorite,
      updateProvider,
      updateSnippet,
      updateThemeMode,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }

  return context;
}
