import type { IDBPDatabase } from "idb";
import type { IQuizzable } from "./models";

export function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
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

export async function setFlaggedItems(
  flaggedIds: number[],
  currentlyFlagged: IQuizzable[],
  storeName: string,
  db: IDBPDatabase
): Promise<void> {
  const toFlagPromises = await Promise.allSettled(
    flaggedIds
      .filter((x) => currentlyFlagged.findIndex((y) => y.id === x) === -1)
      .map((x) => db.get(storeName, x))
  );
  const toUnflag = currentlyFlagged.filter((x) => !flaggedIds.includes(x.id));

  const tx = db.transaction(storeName, "readwrite");
  toUnflag.forEach((x) => tx.store.put({ ...x, flagged: undefined }));
  toFlagPromises.forEach((x) => {
    if (x.status === "fulfilled") tx.store.put({ ...x.value, flagged: 1 });
  });
  await tx.done;
}
