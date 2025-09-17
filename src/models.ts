export type IQuizzable = {
  id: number;
  esp: string;
  eng: string;
  lesson: number;
  flagged?: number;
};

export type VocabItem = {
  partOfSpeech: string;
  verb?: string;
} & IQuizzable;

export function buildVocabItem(id: number, rawData: any[]): VocabItem {
  return {
    id,
    esp: rawData[0],
    eng: rawData[1],
    lesson: rawData[2],
    partOfSpeech: rawData[3],
    verb: rawData[4] && rawData[4].length > 0 ? rawData[4] : undefined,
  };
}

export type LessonQuizItem = {} & IQuizzable;

export function buildLessonQuizItem(rawData: any[]): LessonQuizItem {
  return {
    id: rawData[3],
    esp: rawData[1],
    eng: rawData[0],
    lesson: rawData[2],
  };
}
