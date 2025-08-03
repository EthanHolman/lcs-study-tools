export const DEFAULT_APP_TITLE = "LCS Study Tools";

const LS_PREFIX = "lcs-study-app_";

export const LAST_LESSON_MIN: { value: number } = {} as any;
Object.defineProperty(LAST_LESSON_MIN, "value", {
  get() {
    return parseInt(localStorage.getItem(`${LS_PREFIX}lastLessonMin`) ?? "2");
  },
  set(val) {
    localStorage.setItem(`${LS_PREFIX}lastLessonMin`, val);
  },
});

export const LAST_LESSON_MAX: { value: number } = {} as any;
Object.defineProperty(LAST_LESSON_MAX, "value", {
  get() {
    return parseInt(localStorage.getItem(`${LS_PREFIX}lastLessonMax`) ?? "2");
  },
  set(val) {
    localStorage.setItem(`${LS_PREFIX}lastLessonMax`, val);
  },
});
