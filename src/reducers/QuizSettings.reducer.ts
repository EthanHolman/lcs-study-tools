import { LAST_LESSON_MAX, LAST_LESSON_MIN } from "../settings";

export type QuizType = "Flashcard" | "TextEntry";

export type QuizSettings = {
  lessonMin: number;
  lessonMax: number;
  multiLesson: boolean;
  partsOfSpeech: string[];
  englishFirst: boolean;
  quizType: QuizType;
  onlyFlagged: boolean;
};

export type QuizSettingsAction =
  | { type: "SET_LESSON_MIN"; payload: number }
  | { type: "SET_LESSON_MAX"; payload: number }
  | { type: "SET_PARTS_OF_SPEECH"; payload: string[] }
  | { type: "TOGGLE_ENGLISH_FIRST" }
  | { type: "TOGGLE_MULTI_LESSON" }
  | { type: "SET_QUIZ_TYPE"; payload: QuizType }
  | { type: "TOGGLE_ONLY_FLAGGED" };

export function quizSettingsReducer(
  state: QuizSettings,
  action: QuizSettingsAction
): QuizSettings {
  switch (action.type) {
    case "SET_LESSON_MIN":
      if (state.multiLesson) {
        LAST_LESSON_MIN.value = action.payload;
        return { ...state, lessonMin: action.payload };
      } else {
        LAST_LESSON_MIN.value = LAST_LESSON_MAX.value = action.payload;
        return {
          ...state,
          lessonMin: action.payload,
          lessonMax: action.payload,
        };
      }

    case "SET_LESSON_MAX":
      LAST_LESSON_MAX.value = action.payload;
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

    case "TOGGLE_ONLY_FLAGGED":
      return { ...state, onlyFlagged: !state.onlyFlagged };

    default:
      return state;
  }
}

export function defaultQuizSettings(): QuizSettings {
  return {
    lessonMin: LAST_LESSON_MIN.value,
    lessonMax: LAST_LESSON_MAX.value,
    multiLesson: true,
    partsOfSpeech: [],
    englishFirst: true,
    quizType: "Flashcard",
    onlyFlagged: false,
  };
}
