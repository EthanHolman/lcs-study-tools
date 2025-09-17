import { openDB, type IDBPDatabase } from "idb";

const IDB_NAME = "lcsCompanion";

export const IDB_STORES = {
  Vocab: "vocabStore",
  LessonQuiz: "lessonReviewStore",
  SettingsStore: "settingsStore",
};

export async function getIdb() {
  const db = await openDB(IDB_NAME, 4, {
    upgrade: (db, oldVersion, newVersion, transaction, e) => {
      if (oldVersion < 1) {
        if (!db.objectStoreNames.contains(IDB_STORES.Vocab)) {
          const x = db.createObjectStore(IDB_STORES.Vocab, { keyPath: "id" });
          x.createIndex("partOfSpeech", "partOfSpeech", { unique: false });
          x.createIndex("lesson", "lesson", { unique: false });
          x.createIndex("flagged", "flagged", { unique: false });
        }
      }

      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains(IDB_STORES.LessonQuiz)) {
          const x = db.createObjectStore(IDB_STORES.LessonQuiz, {
            keyPath: "id",
          });
          x.createIndex("lesson", "lesson", { unique: false });
          x.createIndex("flagged", "flagged", { unique: false });
        }
      }

      if (oldVersion < 3) {
        const x = transaction.objectStore(IDB_STORES.Vocab);
        x.createIndex("verb", "verb", { unique: false });
      }

      if (oldVersion < 4) {
        db.createObjectStore(IDB_STORES.SettingsStore, {
          keyPath: "setting",
        });
      }
    },
    blocked: () => {
      // this event shouldn't trigger if we handle onversionchange correctly
      // it means that there's another open connection to the same database
      // and it wasn't closed after db.onversionchange triggered for it
      console.error("indexedDB blocked!");
    },
  });

  db.onversionchange = function () {
    db.close();
    alert("Database is outdated, please reload the page.");
  };

  return db;
}

function buildStoreVersionKey(storeName: string) {
  return `${storeName}_currentVersion`;
}

export async function getStoreVersion(
  db: IDBPDatabase,
  storeName: string
): Promise<number> {
  const result = await db.get(
    IDB_STORES.SettingsStore,
    buildStoreVersionKey(storeName)
  );
  return result ? result.value ?? 0 : 0;
}

export async function setStoreVersion(
  db: IDBPDatabase,
  storeName: string,
  newVersion: number
): Promise<any> {
  return db.put(IDB_STORES.SettingsStore, {
    setting: buildStoreVersionKey(storeName),
    value: newVersion,
  });
}
