import { createContext, useEffect } from "react";
import { getStoreVersion, IDB_STORES, setStoreVersion } from "../idb";
import { buildVocabItem, type IQuizzable, type VocabItem } from "../models";
import type { IDBPDatabase } from "idb";
import { blockUntilReady, idbToggleItemFlagged } from "../utils";
import useIdbStoreStatus from "../hooks/useIdbStoreStatus";

type VocabContextType = {
  getVocab: (chptrMin: number, chptrMax: number) => Promise<VocabItem[]>;
  getVerbs: () => Promise<string[]>;
  getVerb: (engVerb: string) => Promise<IQuizzable>;
  getFlaggedVocab: () => Promise<VocabItem[]>;
  toggleFlagVocabItem: (id: number) => Promise<VocabItem>;
  getPartsOfSpeech: () => Promise<string[]>;
};

type ProviderProps = {
  children: React.ReactNode;
  db: IDBPDatabase;
};

export const VocabContext = createContext({} as VocabContextType);

export const VocabProvider = (props: ProviderProps) => {
  const status = useIdbStoreStatus();

  useEffect(() => {
    const init = async () => {
      // Prevent this from ever being called more than once (dev mode)
      if (status.current === "NotReady") {
        status.current = "Pending";
        await migrateDb();
        status.current = "Ready";
      }
    };
    init();
  }, []);

  async function migrateDb() {
    let currentVerison = await getStoreVersion(props.db, IDB_STORES.Vocab);

    if (currentVerison < 1) {
      const result = await fetch("/lcs_dictionary.jsonl").then((x) => x.text());
      const tx = props.db.transaction(IDB_STORES.Vocab, "readwrite");
      result
        .split("\n")
        .filter((x) => x && x.length > 0)
        .forEach((x, i) => {
          tx.store.put(buildVocabItem(i, JSON.parse(x)));
        });
      await tx.done;
      await setStoreVersion(props.db, IDB_STORES.Vocab, ++currentVerison);
    }

    if (currentVerison < 2) {
      const tx = props.db.transaction(IDB_STORES.Vocab, "readwrite");
      // remove "verb" field from all items when it's an empty string
      for await (const cursor of tx.store) {
        if (cursor.value.hasOwnProperty("verb") && !cursor.value.verb) {
          cursor.update({ ...cursor.value, verb: undefined });
        }
      }
      await tx.done;
      await setStoreVersion(props.db, IDB_STORES.Vocab, ++currentVerison);
    }
  }

  async function getVocab(chptrMin: number, chptrMax: number) {
    await blockUntilReady(status);

    return await props.db.getAllFromIndex(
      IDB_STORES.Vocab,
      "lesson",
      IDBKeyRange.bound(chptrMin, chptrMax)
    );
  }

  async function getVerbs(): Promise<string[]> {
    await blockUntilReady(status);

    return await props.db
      .getAllFromIndex(IDB_STORES.Vocab, "verb", IDBKeyRange.only(""))
      .then((response) => {
        console.log(response);
        return response;
      });
  }

  async function getVerb(engVerb: string): Promise<IQuizzable> {
    await blockUntilReady(status);

    return await props.db.getFromIndex(
      IDB_STORES.Vocab,
      "verb",
      IDBKeyRange.only(engVerb)
    );
  }

  async function getFlaggedVocab() {
    await blockUntilReady(status);

    return await props.db.getAllFromIndex(IDB_STORES.Vocab, "flagged");
  }

  async function toggleFlagVocabItem(id: number) {
    await blockUntilReady(status);

    return await idbToggleItemFlagged(props.db, IDB_STORES.Vocab, id);
  }

  async function getPartsOfSpeech() {
    await blockUntilReady(status);

    const tx = props.db.transaction(IDB_STORES.Vocab, "readonly");
    const partsOfSpeech = new Set<string>();
    for await (const cursor of tx.store) {
      partsOfSpeech.add(cursor.value.partOfSpeech);
    }

    return Array.from(partsOfSpeech).sort();
  }

  return (
    <VocabContext.Provider
      value={{
        getVocab,
        getVerbs,
        getVerb,
        getFlaggedVocab,
        toggleFlagVocabItem,
        getPartsOfSpeech,
      }}
    >
      {props.children}
    </VocabContext.Provider>
  );
};
