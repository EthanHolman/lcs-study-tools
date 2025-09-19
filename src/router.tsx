import { Navigate, Route, Routes } from "react-router";
import HomeRoute from "./routes/home.route";
import VocabPracticeRoute from "./routes/vocab-practice.route";
import VocabRoute from "./routes/vocab.route";
import LessonQuizRoute from "./routes/lesson-quiz.route";
import AboutRoute from "./routes/about.route";
import SettingsRoute from "./routes/settings.route";

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/vocab" element={<VocabRoute />} />
      <Route path="/vocab/practice" element={<VocabPracticeRoute />} />
      <Route path="/lesson/quiz" element={<LessonQuizRoute />} />
      <Route path="/settings" element={<SettingsRoute />} />
      <Route path="/about" element={<AboutRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
