export type QuizType = "Flashcard" | "TextEntry";

export type VocabQuizSettings = {
  lessonMin: number;
  lessonMax: number;
  multiLesson: boolean;
  partsOfSpeech: string[];
  englishFirst: boolean;
  quizType: QuizType;
};

export type VocabQuizSettingsAction =
  | { type: "SET_LESSON_MIN"; payload: number }
  | { type: "SET_LESSON_MAX"; payload: number }
  | { type: "SET_PARTS_OF_SPEECH"; payload: string[] }
  | { type: "TOGGLE_ENGLISH_FIRST" }
  | { type: "TOGGLE_MULTI_LESSON" }
  | { type: "SET_QUIZ_TYPE"; payload: QuizType };

export function vocabQuizSettingsReducer(
  state: VocabQuizSettings,
  action: VocabQuizSettingsAction
): VocabQuizSettings {
  switch (action.type) {
    case "SET_LESSON_MIN":
      if (state.multiLesson) return { ...state, lessonMin: action.payload };
      else
        return {
          ...state,
          lessonMin: action.payload,
          lessonMax: action.payload,
        };

    case "SET_LESSON_MAX":
      return { ...state, lessonMax: action.payload };

    case "TOGGLE_MULTI_LESSON":
      if (state.multiLesson)
        return {
          ...state,
          multiLesson: !state.multiLesson,
          lessonMax: state.lessonMin,
        };
      else return { ...state, multiLesson: !state.multiLesson };

    case "SET_PARTS_OF_SPEECH": {
      return {
        ...state,
        partsOfSpeech: action.payload,
      };
    }

    case "TOGGLE_ENGLISH_FIRST":
      return { ...state, englishFirst: !state.englishFirst };

    case "SET_QUIZ_TYPE":
      return { ...state, quizType: action.payload };

    default:
      return state;
  }
}

export function initialVocabQuizSettings(): VocabQuizSettings {
  return {
    lessonMin: 2,
    lessonMax: 5,
    multiLesson: true,
    partsOfSpeech: [],
    englishFirst: true,
    quizType: "Flashcard",
  };
}
