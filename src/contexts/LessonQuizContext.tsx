import type { IDBPDatabase } from "idb";
import { buildLessonQuizItem, type LessonQuizItem } from "../models";
import { createContext, useEffect } from "react";
import { getStoreVersion, IDB_STORES, setStoreVersion } from "../idb";
import { blockUntilReady, idbToggleItemFlagged } from "../utils";
import useIdbStoreStatus from "../hooks/useIdbStoreStatus";

type LessonQuizContextType = {
  get: (lessonMin: number, lessonMax?: number) => Promise<LessonQuizItem[]>;
  getFlagged: () => Promise<LessonQuizItem[]>;
  toggleFlagged: (id: number) => Promise<LessonQuizItem>;
};

type ProviderProps = {
  children: React.ReactNode;
  db: IDBPDatabase;
};

export const LessonQuizContext = createContext({} as LessonQuizContextType);

export const LessonQuizProvider = (props: ProviderProps) => {
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
    let currentVerison = await getStoreVersion(props.db, IDB_STORES.LessonQuiz);

    if (currentVerison < 1) {
      const result = await fetch("/lcs_quizzes.jsonl").then((x) => x.text());
      const tx = props.db.transaction(IDB_STORES.LessonQuiz, "readwrite");
      result
        .split("\n")
        .filter((x) => x && x.length > 0)
        .forEach((x) => {
          tx.store.put(buildLessonQuizItem(JSON.parse(x)));
        });

      await tx.done;
      await setStoreVersion(props.db, IDB_STORES.LessonQuiz, currentVerison++);
    }
  }

  async function get(lessonMin: number, lessonMax?: number) {
    await blockUntilReady(status);

    const range =
      lessonMax && lessonMax > 0
        ? IDBKeyRange.bound(lessonMin, lessonMax)
        : IDBKeyRange.only(lessonMin);
    return await props.db.getAllFromIndex(
      IDB_STORES.LessonQuiz,
      "lesson",
      range
    );
  }

  async function getFlagged() {
    await blockUntilReady(status);

    return await props.db.getAllFromIndex(IDB_STORES.LessonQuiz, "flagged");
  }

  async function toggleFlagged(id: number) {
    await blockUntilReady(status);

    return await idbToggleItemFlagged(props.db, IDB_STORES.LessonQuiz, id);
  }

  return (
    <LessonQuizContext.Provider value={{ get, getFlagged, toggleFlagged }}>
      {props.children}
    </LessonQuizContext.Provider>
  );
};
