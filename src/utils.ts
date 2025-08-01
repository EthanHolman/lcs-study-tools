import type { IDBPDatabase } from "idb";

export function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export async function blockUntilReady(readyRef: React.RefObject<boolean>) {
  while (!readyRef.current) await new Promise((r) => setTimeout(r, 50));
}

export async function idbToggleItemFlagged(
  db: IDBPDatabase,
  storeName: string,
  id: number
) {
  const item = await db.get(storeName, id);
  item.flagged = item.flagged === 1 ? undefined : 1;
  await db.put(storeName, item);
  return item;
}
