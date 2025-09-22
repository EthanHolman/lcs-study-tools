import { createContext } from "react";
import { type VocabItem } from "../models";
import type { IDBPDatabase } from "idb";
import { idbToggleItemFlagged, setFlaggedItems } from "../utils";
import { IDB_STORES } from "../data/idb-settings";

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
  async function getVocab(chptrMin: number, chptrMax: number) {
    return await props.db.getAllFromIndex(
      IDB_STORES.Vocab,
      "lesson",
      IDBKeyRange.bound(chptrMin, chptrMax)
    );
  }

  async function getFlaggedVocab(): Promise<VocabItem[]> {
    return await props.db.getAllFromIndex(IDB_STORES.Vocab, "flagged");
  }

  async function toggleFlagVocabItem(id: number) {
    return await idbToggleItemFlagged(props.db, IDB_STORES.Vocab, id);
  }

  async function getPartsOfSpeech() {
    const tx = props.db.transaction(IDB_STORES.Vocab, "readonly");
    const partsOfSpeech = new Set<string>();
    for await (const cursor of tx.store) {
      partsOfSpeech.add(cursor.value.partOfSpeech);
    }

    return Array.from(partsOfSpeech).sort();
  }

  async function restoreFromBackup(flaggedIds: number[]): Promise<void> {
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
