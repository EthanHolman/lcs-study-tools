import { createContext, useEffect, useRef } from "react";
import { IDB_STORES } from "../idb";
import { buildVocabItem, type VocabItem } from "../models";
import type { IDBPDatabase } from "idb";
import {
  blockUntilReady,
  idbToggleItemFlagged,
  setFlaggedItems,
} from "../utils";

type VocabContextType = {
  getVocab: (chptrMin: number, chptrMax: number) => Promise<VocabItem[]>;
  getFlaggedVocab: () => Promise<VocabItem[]>;
  toggleFlagVocabItem: (id: number) => Promise<VocabItem>;
  getPartsOfSpeech: () => Promise<string[]>;
  restoreFromBackup: (flaggedIds: number[]) => Promise<void>;
};

type ProviderProps = {
  children: React.ReactNode;
  db: IDBPDatabase;
};

export const VocabContext = createContext({} as VocabContextType);

export const VocabProvider = (props: ProviderProps) => {
  const ready = useRef(false);

  useEffect(() => {
    const init = async () => {
      const count = await props.db.count(IDB_STORES.Vocab);
      if (count < 100) await initVocabDb();
      ready.current = true;
    };
    init();
  }, []);

  async function initVocabDb() {
    const result = await fetch("/lcs_dictionary.jsonl").then((x) => x.text());
    const tx = props.db.transaction(IDB_STORES.Vocab, "readwrite");
    // TODO: would this improve speed? (if so, do in other context too)
    // const [result, db] = await Promise.all([result, db])
    result
      .split("\n")
      .filter((x) => x && x.length > 0)
      .forEach((x, i) => {
        tx.store.put(buildVocabItem(i, JSON.parse(x)));
      });

    await tx.done;
  }

  async function getVocab(chptrMin: number, chptrMax: number) {
    await blockUntilReady(ready);

    return await props.db.getAllFromIndex(
      IDB_STORES.Vocab,
      "lesson",
      IDBKeyRange.bound(chptrMin, chptrMax)
    );
  }

  async function getFlaggedVocab(): Promise<VocabItem[]> {
    await blockUntilReady(ready);

    return await props.db.getAllFromIndex(IDB_STORES.Vocab, "flagged");
  }

  async function toggleFlagVocabItem(id: number) {
    await blockUntilReady(ready);

    return await idbToggleItemFlagged(props.db, IDB_STORES.Vocab, id);
  }

  async function getPartsOfSpeech() {
    await blockUntilReady(ready);

    const tx = props.db.transaction(IDB_STORES.Vocab, "readonly");
    const partsOfSpeech = new Set<string>();
    for await (const cursor of tx.store) {
      partsOfSpeech.add(cursor.value.partOfSpeech);
    }

    return Array.from(partsOfSpeech).sort();
  }

  async function restoreFromBackup(flaggedIds: number[]): Promise<void> {
    await blockUntilReady(ready);

    const currentlyFlagged = await getFlaggedVocab();

    await setFlaggedItems(
      flaggedIds,
      currentlyFlagged,
      IDB_STORES.Vocab,
      props.db
    );
  }

  return (
    <VocabContext.Provider
      value={{
        getVocab,
        getFlaggedVocab,
        toggleFlagVocabItem,
        getPartsOfSpeech,
        restoreFromBackup,
      }}
    >
      {props.children}
    </VocabContext.Provider>
  );
};
