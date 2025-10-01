import { createContext } from "react";
import { type Verb, type VocabItem } from "../models";
import type { IDBPDatabase } from "idb";
import { idbToggleItemFlagged, setFlaggedItems } from "../utils";
import { IDB_STORES } from "../data/idb-settings";

type VocabContextType = {
  getVocab: (chptrMin: number, chptrMax: number) => Promise<VocabItem[]>;
  getVerbs: () => Promise<string[]>;
  getVerb: (engVerb: string) => Promise<Verb>;
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

  async function getVerbs(): Promise<string[]> {
    let cursor = await props.db
      .transaction(IDB_STORES.Vocab)
      .store.index("verb")
      .openCursor(undefined, "nextunique");
    const uniqueVerbs: string[] = [];
    while (cursor) {
      uniqueVerbs.push(cursor.value.verb);
      cursor = await cursor.continue();
    }
    return uniqueVerbs;
  }

  async function getVerb(engVerb: string): Promise<Verb> {
    const verbData = await props.db.getAllFromIndex(
      IDB_STORES.Vocab,
      "verb",
      IDBKeyRange.only(engVerb)
    );
    let data: Verb = {
      gerund: [],
      participle: [],
      infinitive: [],
      imperative: [],
      contractions: [],
      other: [],
      conjugations: {},
    };
    const personOrderMap = {
      "1st person": 0,
      "2nd person": 1,
      "2nd person plural": 1,
      "3rd person": 2,
      "3rd person plural": 3,
      "1st person plural": 4,
    } as { [key: string]: number };
    const defaultConjs = ["--", "--", "--", "--", "--"];

    for (const { eng, esp } of verbData) {
      if (!eng) continue;

      if (eng.includes("gerund")) {
        data.gerund.push(esp);
      } else if (eng.includes("participle")) {
        data.participle.push(esp);
      } else if (eng.includes("infinitive") && eng.includes("contraction")) {
        data.contractions.push(esp);
      } else if (eng.includes("infinitive") && !eng.includes("contraction")) {
        data.infinitive.push(esp);
      } else if (eng.includes("imperative")) {
        data.imperative.push(esp);
      } else {
        // get the "stuff" in paranthesis
        const [match] = eng.match(/\(.+\)/gi) as string[];
        if (match) {
          const [_, tense, person] = match
            .substring(1, match.length - 1)
            .split(",")
            .map((x) => x.trim());
          const personOrderIndex = personOrderMap[person];
          if (tense && person && personOrderIndex !== undefined) {
            data.conjugations[tense] = data.conjugations[tense] || [
              ...defaultConjs,
            ];
            data.conjugations[tense][personOrderIndex] = esp;
          } else {
            data.other?.push(esp);
          }
        } else {
          data.other?.push(esp);
        }
      }
    }
    return data;
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
        getVerbs,
        getVerb,
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
