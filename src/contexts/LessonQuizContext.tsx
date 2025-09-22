import type { IDBPDatabase } from "idb";
import { type IQuizzable, type LessonQuizItem } from "../models";
import { createContext } from "react";
import { idbToggleItemFlagged, setFlaggedItems } from "../utils";
import { IDB_STORES } from "../data/idb-settings";

type LessonQuizContextType = {
  get: (lessonMin: number, lessonMax?: number) => Promise<LessonQuizItem[]>;
  getFlagged: () => Promise<LessonQuizItem[]>;
  toggleFlagged: (id: number) => Promise<LessonQuizItem>;
  restoreFromBackup: (flaggedIds: number[]) => Promise<void>;
};

type ProviderProps = {
  children: React.ReactNode;
  db: IDBPDatabase;
};

export const LessonQuizContext = createContext({} as LessonQuizContextType);

export const LessonQuizProvider = (props: ProviderProps) => {
  async function get(
    lessonMin: number,
    lessonMax?: number
  ): Promise<IQuizzable[]> {
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

  async function getFlagged(): Promise<IQuizzable[]> {
    return await props.db.getAllFromIndex(IDB_STORES.LessonQuiz, "flagged");
  }

  async function toggleFlagged(id: number) {
    return await idbToggleItemFlagged(props.db, IDB_STORES.LessonQuiz, id);
  }

  async function restoreFromBackup(flaggedIds: number[]): Promise<void> {
    const currentlyFlagged = await getFlagged();

    await setFlaggedItems(
      flaggedIds,
      currentlyFlagged,
      IDB_STORES.LessonQuiz,
      props.db
    );
  }

  return (
    <LessonQuizContext.Provider
      value={{ get, getFlagged, toggleFlagged, restoreFromBackup }}
    >
      {props.children}
    </LessonQuizContext.Provider>
  );
};
