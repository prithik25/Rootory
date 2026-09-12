import { openDB } from "idb";
import type { State } from "./data";
const database = () =>
  openDB("rootory-demo", 1, {
    upgrade(db) {
      db.createObjectStore("workspace");
    },
  });
export async function readState(scope = "state"): Promise<State | undefined> {
  const db = await database();
  const value = await db.get("workspace", scope);
  return value?.version === 1 ? value : undefined;
}
let writes = Promise.resolve();
export function saveState(state: State, scope = "state", pendingRevision?: number | null) {
  writes = writes
    .catch(() => {})
    .then(async () => {
      const db = await database();
      const tx = db.transaction("workspace", "readwrite");
      await tx.store.put(pendingRevision !== undefined ? { ...state, communityVersion: 1, marketplaceVersion: 1 } : state, scope);
      if (pendingRevision !== undefined) await tx.store.put(pendingRevision, `${scope}:pending`);
      await tx.done;
    });
  return writes;
}
export async function imageFromFile(file: File): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error("Choose a JPG, PNG, or WebP image.");
  if (file.size > 8 * 1024 * 1024)
    throw new Error("Choose an image smaller than 8 MB.");
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("This photo could not be opened. Choose a different JPG, PNG, or WebP image.");
  }
  if (bitmap.width * bitmap.height > 40000000) {
    bitmap.close();
    throw new Error("This image is too large. Choose a smaller photo.");
  }
  const canvas = document.createElement("canvas");
  const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
  canvas.width = bitmap.width * scale;
  canvas.height = bitmap.height * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not prepare the image.");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.82);
}

export async function readPendingRevision(scope: string): Promise<number | undefined> {
  const db = await database();
  const value = await db.get("workspace", `${scope}:pending`);
  return typeof value === "number" ? value : undefined;
}
