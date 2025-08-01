import { openDB } from "idb";

const IDB_NAME = "lcsCompanion";

export const IDB_STORES = {
  Vocab: "vocabStore",
  LessonQuiz: "lessonReviewStore",
};

export async function getIdb() {
  const db = await openDB(IDB_NAME, 2, {
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
