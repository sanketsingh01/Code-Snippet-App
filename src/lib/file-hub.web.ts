import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Sharing from "expo-sharing";
import { Platform, Share } from "react-native";
import { seedFolders } from "@/data/seed";
import type { ManagedFile, ManagedFolder } from "@/data/types";
import { formatBytes, formatRelativeTime } from "@/lib/format";

const STORAGE_KEY = "devsnippets.filehub";

type StoredFile = ManagedFile & { content: string };

type FileHubState = {
  folders: ManagedFolder[];
  files: StoredFile[];
};

let initialized = false;
let memoryState: FileHubState | null = null;

function now() {
  return Date.now();
}

function buildSeedFiles(): StoredFile[] {
  const t = now();
  const mk = (
    folder: string,
    name: string,
    content: string,
    icon: string,
    size: number,
    ageMs: number,
  ): StoredFile => ({
    name,
    path: `web://${folder}/${name}`,
    kind: "file",
    sizeLabel: formatBytes(size),
    modifiedLabel: formatRelativeTime(t - ageMs),
    modifiedAt: t - ageMs,
    icon,
    content,
  });

  return [
    mk(
      "Screenshots",
      "architecture-vision.png",
      "DevSnippets AI local screenshot placeholder",
      "png",
      2048,
      1000 * 60 * 60 * 26,
    ),
    mk(
      "Screenshots",
      "hero-background.webp",
      "Offline-first visual asset placeholder",
      "webp",
      4096,
      1000 * 60 * 60 * 20,
    ),
    mk(
      "Templates",
      "starter-snippet.json",
      JSON.stringify(
        { title: "New Snippet", language: "TypeScript", tags: ["template"] },
        null,
        2,
      ),
      "json",
      512,
      1000 * 60 * 60 * 14,
    ),
    mk(
      "Templates",
      "readme-template.md",
      "# Template\n\nUse this file to store reusable docs and prompts.",
      "md",
      256,
      1000 * 60 * 60 * 10,
    ),
    mk(
      "Exports",
      "api-handler.js",
      "export const message = 'Exported snippet';",
      "js",
      128,
      1000 * 60 * 90,
    ),
    mk(
      "Exports",
      "documentation.md",
      "# Exported Notes\n\nSaved locally from DevSnippets AI.",
      "md",
      192,
      1000 * 60 * 45,
    ),
  ];
}

function defaultState(): FileHubState {
  return {
    folders: seedFolders.map((folder) => ({ ...folder })),
    files: buildSeedFiles(),
  };
}

async function loadState(): Promise<FileHubState> {
  if (memoryState) {
    return memoryState;
  }

  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    memoryState = defaultState();
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(memoryState));
    return memoryState;
  }

  try {
    const parsed = JSON.parse(raw) as FileHubState;
    memoryState = {
      folders: parsed.folders?.length ? parsed.folders : defaultState().folders,
      files: parsed.files?.length ? parsed.files : buildSeedFiles(),
    };
  } catch {
    memoryState = defaultState();
  }

  return memoryState;
}

async function saveState(state: FileHubState) {
  memoryState = state;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function folderFromPath(path: string) {
  const match = path.match(/^web:\/\/([^/]+)\//);
  return match?.[1] ?? "Exports";
}

export async function initializeFileHub() {
  if (initialized) {
    return;
  }
  await loadState();
  initialized = true;
}

export async function listManagedFolders(): Promise<ManagedFolder[]> {
  const state = await loadState();
  const accentPalette = [
    "#f7c9d2",
    "#f0bcc7",
    "#ef7c8f",
    "#f6d1d8",
    "#f4b8c2",
  ];

  return state.folders.map((folder, index) => {
    const children = state.files.filter(
      (file) => folderFromPath(file.path) === folder.name,
    );
    const totalSize = children.reduce(
      (sum, file) => sum + (file.content?.length ?? 0),
      0,
    );

    return {
      ...folder,
      itemCount: children.length || folder.itemCount,
      sizeLabel: children.length ? formatBytes(totalSize) : folder.sizeLabel,
      accent: folder.accent ?? accentPalette[index % accentPalette.length],
      progress:
        folder.progress ?? Math.min(0.95, Math.max(children.length, 1) / 10),
    };
  });
}

export async function listManagedFiles() {
  const state = await loadState();
  return [...state.files]
    .sort((a, b) => b.modifiedAt - a.modifiedAt)
    .slice(0, 6)
    .map(({ content: _content, ...file }) => file);
}

export async function createFolder(name: string) {
  const state = await loadState();
  if (!state.folders.some((folder) => folder.name === name)) {
    state.folders.push({
      name,
      itemCount: 0,
      sizeLabel: "0 B",
      accent: "#f0bcc7",
      progress: 0.1,
    });
    await saveState(state);
  }
  return { name };
}

export async function createExportFile(
  name: string,
  content: string,
  extension: string,
) {
  const state = await loadState();
  const safeName = name.replace(/[^\w.-]+/g, "-").toLowerCase();
  const fileName = `${safeName}.${extension}`;
  const path = `web://Exports/${fileName}`;
  const stored: StoredFile = {
    name: fileName,
    path,
    kind: "file",
    sizeLabel: formatBytes(content.length),
    modifiedLabel: formatRelativeTime(now()),
    modifiedAt: now(),
    icon: extension,
    content,
  };

  state.files = state.files.filter((file) => file.path !== path);
  state.files.unshift(stored);
  await saveState(state);
  return { uri: path, name: fileName };
}

export async function copyFileIntoAttachments(sourcePath: string) {
  const state = await loadState();
  let content = "";

  try {
    const response = await fetch(sourcePath);
    content = await response.text();
  } catch {
    content = "";
  }

  const safeName =
    sourcePath.split(/[/\\]/).pop()?.split("?")[0] ??
    `attachment-${Date.now()}`;
  const path = `web://Attachments/${safeName}`;

  const stored: StoredFile = {
    name: safeName,
    path,
    kind: "file",
    sizeLabel: formatBytes(content.length),
    modifiedLabel: formatRelativeTime(now()),
    modifiedAt: now(),
    icon: safeName.split(".").pop()?.toLowerCase() ?? "file",
    content,
  };

  state.files = state.files.filter((file) => file.path !== path);
  state.files.push(stored);
  await saveState(state);

  return { uri: path, name: safeName };
}

export async function readManagedFile(path: string) {
  const state = await loadState();
  const file = state.files.find((item) => item.path === path);
  return file?.content ?? null;
}

export async function copyFileToExports(source: { name: string; uri?: string }) {
  const state = await loadState();
  const existing = state.files.find((file) => file.path === source.uri);
  const content = existing?.content ?? "";
  return createExportFile(
    source.name.replace(/\.[^.]+$/, ""),
    content,
    source.name.split(".").pop() ?? "txt",
  );
}

export async function moveManagedFile(
  sourcePath: string,
  destinationFolder: "Screenshots" | "Templates" | "Exports",
) {
  const state = await loadState();
  const file = state.files.find((item) => item.path === sourcePath);
  if (!file) {
    const name = sourcePath.split("/").pop() ?? "file";
    return { uri: `web://${destinationFolder}/${name}` };
  }

  const name = file.name;
  const nextPath = `web://${destinationFolder}/${name}`;
  file.path = nextPath;
  file.modifiedAt = now();
  file.modifiedLabel = formatRelativeTime(file.modifiedAt);
  await saveState(state);
  return { uri: nextPath, name };
}

export async function copyManagedFile(
  sourcePath: string,
  destinationFolder: "Screenshots" | "Templates" | "Exports",
) {
  const state = await loadState();
  const source = state.files.find((item) => item.path === sourcePath);
  if (!source) {
    const name = sourcePath.split("/").pop() ?? "file";
    return { uri: `web://${destinationFolder}/${name}` };
  }

  const nextPath = `web://${destinationFolder}/${source.name}`;
  const copy: StoredFile = {
    ...source,
    path: nextPath,
    modifiedAt: now(),
    modifiedLabel: formatRelativeTime(now()),
  };

  state.files = state.files.filter((file) => file.path !== nextPath);
  state.files.push(copy);
  await saveState(state);
  return { uri: nextPath, name: source.name };
}

export async function deleteManagedFile(path: string) {
  const state = await loadState();
  state.files = state.files.filter((file) => file.path !== path);
  await saveState(state);
}

export async function shareFile(path: string) {
  const state = await loadState();
  const file = state.files.find((item) => item.path === path);
  const message = file?.content ?? "";

  if (Platform.OS === "web") {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: file?.name ?? "DevSnippets export",
          text: message,
        });
        return;
      } catch {
        // User cancelled or share failed — fall through to RN Share
      }
    }

    await Share.share({
      message,
      title: file?.name ?? "DevSnippets export",
    });
    return;
  }

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(path);
  }
}

export async function exportSnippetPayload(
  name: string,
  format: "txt" | "js" | "json",
  content: string,
) {
  return createExportFile(name, content, format);
}

export function getRootDirectory() {
  return { uri: "web://DevSnippets" };
}

export function getAttachmentsDirectory() {
  return { uri: "web://Attachments" };
}
