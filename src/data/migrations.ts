import type { IDBPDatabase, IDBPTransaction } from "idb";
import { IDB_SETTINGS, IDB_STORES } from "./idb-settings";
import { buildLessonQuizItem, buildVocabItem } from "../models";

// Motivation for separating schema and data migrations:
//  indexeddb migrations must be synchronous, which makes fetching and
//  updating data challenging/impossible. As such, these sorts of migrations
//  are applied after the DB is opened, but before it's returned for use.

type Migrations = {
  [version: number]: {
    schema?: (
      db: IDBPDatabase<unknown>,
      tx: IDBPTransaction<unknown, string[], "versionchange">
    ) => void;
    data?: (db: IDBPDatabase<unknown>) => Promise<void>;
  };
};

export const IdbMigrations: Migrations = {
  1: {
    schema: (db) => {
      if (!db.objectStoreNames.contains(IDB_STORES.Vocab)) {
        const x = db.createObjectStore(IDB_STORES.Vocab, { keyPath: "id" });
        x.createIndex("partOfSpeech", "partOfSpeech", { unique: false });
        x.createIndex("lesson", "lesson", { unique: false });
        x.createIndex("flagged", "flagged", { unique: false });
      }
    },
  },
  2: {
    schema: (db) => {
      if (!db.objectStoreNames.contains(IDB_STORES.LessonQuiz)) {
        const x = db.createObjectStore(IDB_STORES.LessonQuiz, {
          keyPath: "id",
        });
        x.createIndex("lesson", "lesson", { unique: false });
        x.createIndex("flagged", "flagged", { unique: false });
      }
    },
    data: async (db) => {
      // Don't reload and overwrite user's saved data if stores
      //  are already populated by the legacy data loader

      if ((await db.count(IDB_STORES.LessonQuiz)) < 100) {
        const result = await fetch("/lcs_quizzes.jsonl").then((x) => x.text());
        const tx = db.transaction(IDB_STORES.LessonQuiz, "readwrite");
        result
          .split("\n")
          .filter((x) => x && x.length > 0)
          .forEach((x) => {
            tx.store.put(buildLessonQuizItem(JSON.parse(x)));
          });
        await tx.done;
      }

      if ((await db.count(IDB_STORES.Vocab)) < 100) {
        const result = await fetch("/lcs_dictionary.jsonl").then((x) =>
          x.text()
        );
        const tx = db.transaction(IDB_STORES.Vocab, "readwrite");
        result
          .split("\n")
          .filter((x) => x && x.length > 0)
          .forEach((x, i) => {
            tx.store.put(buildVocabItem(i, JSON.parse(x)));
          });
        await tx.done;
      }
    },
  },
  3: {
    schema: (db) => {
      if (!db.objectStoreNames.contains(IDB_STORES.Settings)) {
        const x = db.createObjectStore(IDB_STORES.Settings, {
          keyPath: "id",
        });
        x.add({ id: IDB_SETTINGS.DataVersion, value: 0 });
      }
    },
    data: async (db) => {
      const tx = db.transaction(IDB_STORES.Vocab, "readwrite");
      for await (const cursor of tx.store) {
        // Remove empty string verb property
        if (cursor.value.hasOwnProperty("verb") && !cursor.value.verb) {
          cursor.update({ ...cursor.value, verb: undefined });
        }
      }
      await tx.done;
    },
  },
  4: {
    schema: (db, tx) => {
      const x = tx.objectStore(IDB_STORES.Vocab);
      x.createIndex("verb", "verb", { unique: false });
    },
    data: async (db) => {
      // fix some borked data
      const dars = await db.getAllFromIndex(
        IDB_STORES.Vocab,
        "verb",
        IDBKeyRange.only("Dar")
      );
      const diste = dars.find((x) => x.eng.includes("2rd person"));
      diste["eng"] = `"gave", "you gave" (Dar, preterite, 2nd person)`;
      db.put(IDB_STORES.Vocab, diste);
    },
  },
};
