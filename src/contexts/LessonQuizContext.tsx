import type { IDBPDatabase } from "idb";
import { buildLessonQuizItem, type LessonQuizItem } from "../models";
import { createContext, useEffect, useRef } from "react";
import { IDB_STORES } from "../idb";
import { blockUntilReady, idbToggleItemFlagged } from "../utils";

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
  const ready = useRef(false);

  useEffect(() => {
    const init = async () => {
      const count = await props.db.count(IDB_STORES.LessonQuiz);
      if (count < 100) await initDb();
      ready.current = true;
    };
    init();
  }, []);

  async function initDb() {
    const result = await fetch("/lcs_quizzes.jsonl").then((x) => x.text());
    const tx = props.db.transaction(IDB_STORES.LessonQuiz, "readwrite");
    result
      .split("\n")
      .filter((x) => x && x.length > 0)
      .forEach((x) => {
        tx.store.put(buildLessonQuizItem(JSON.parse(x)));
      });

    await tx.done;
  }

  async function get(lessonMin: number, lessonMax?: number) {
    await blockUntilReady(ready);

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
    await blockUntilReady(ready);

    return await props.db.getAllFromIndex(IDB_STORES.LessonQuiz, "flagged");
  }

  async function toggleFlagged(id: number) {
    await blockUntilReady(ready);

    return await idbToggleItemFlagged(props.db, IDB_STORES.LessonQuiz, id);
  }

  return (
    <LessonQuizContext.Provider value={{ get, getFlagged, toggleFlagged }}>
      {props.children}
    </LessonQuizContext.Provider>
  );
};
