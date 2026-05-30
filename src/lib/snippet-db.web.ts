import AsyncStorage from "@react-native-async-storage/async-storage";
import { seedSnippets } from "@/data/seed";
import type { Snippet } from "@/data/types";

const STORAGE_KEY = "devsnippets.snippets";

let initPromise: Promise<void> | null = null;

async function ensureSeeded() {
  if (!initPromise) {
    initPromise = (async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seedSnippets));
      }
    })();
  }
  await initPromise;
}

async function readAll(): Promise<Snippet[]> {
  await ensureSeeded();
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [...seedSnippets];
  }

  try {
    const parsed = JSON.parse(raw) as Snippet[];
    return Array.isArray(parsed) ? parsed : [...seedSnippets];
  } catch {
    return [...seedSnippets];
  }
}

async function writeAll(snippets: Snippet[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snippets));
}

export async function listSnippets() {
  const snippets = await readAll();
  return [...snippets].sort((a, b) => {
    if (a.favorite !== b.favorite) {
      return a.favorite ? -1 : 1;
    }
    return b.updatedAt - a.updatedAt;
  });
}

export async function saveSnippet(snippet: Snippet) {
  const snippets = await readAll();
  const index = snippets.findIndex((item) => item.id === snippet.id);
  const next = { ...snippet, attachments: snippet.attachments ?? [] };

  if (index >= 0) {
    snippets[index] = next;
  } else {
    snippets.push(next);
  }

  await writeAll(snippets);
  return next;
}

export async function deleteSnippet(id: string) {
  const snippets = await readAll();
  await writeAll(snippets.filter((snippet) => snippet.id !== id));
}

export async function resetToSeed() {
  await writeAll([...seedSnippets]);
  return listSnippets();
}
