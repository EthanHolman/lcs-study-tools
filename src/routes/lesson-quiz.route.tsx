import { useAtom } from "jotai";
import { useContext, useEffect, useReducer, useState } from "react";
import { CurrentTitleAtom } from "../atoms";
import {
  defaultQuizSettings,
  quizSettingsReducer,
} from "../reducers/QuizSettings.reducer";
import { Tabs, Text, Stack, Button, Switch, Group } from "@mantine/core";
import LessonNumberInput from "../components/LessonNumberInput";
import { type LessonQuizItem } from "../models";
import { LessonQuizContext } from "../contexts/LessonQuizContext";
import QuizTypeSelector from "../components/QuizTypeSelector";
import Quizzer from "../components/Quizzer";
import LessonQuizTable from "../components/LessonQuizTable";

const TabItems = {
  All: "All Items",
  Flagged: "Flagged Items Only",
};

export default function LessonQuizRoute() {
  const [settings, settingsDispatch] = useReducer(quizSettingsReducer, {
    ...defaultQuizSettings(),
    multiLesson: false,
  });
  const [viewMode, setViewMode] = useState<
    "QuizSetup" | "RunQuiz" | "ManageFlagged"
  >("QuizSetup");
  const [quizItems, setQuizItems] = useState<LessonQuizItem[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(TabItems.All);

  const [_, setAppTitle] = useAtom(CurrentTitleAtom);

  const context = useContext(LessonQuizContext);

  function startFlashcardsQuiz() {
    context
      .get(
        settings.lessonMin,
        settings.multiLesson ? settings.lessonMax : undefined
      )
      .then((res) => {
        setQuizItems(res);
        setViewMode("RunQuiz");
      });
  }

  function startTextEntryQuiz() {
    setViewMode("RunQuiz");
  }

  function showQuizSettings() {
    setViewMode("QuizSetup");
  }

  async function toggleFlag(id: number) {
    const newItem = context.toggleFlagged(id);

    // update current quiz item
    const index = quizItems.findIndex((x) => x.id === id);
    if (index === -1) throw new Error(`Could not find item ${id}`);
    quizItems.splice(index, 1, await newItem);
    setQuizItems([...quizItems]);
  }

  function loadFlaggedVocab() {
    context.getFlagged().then((items) => setQuizItems(items));
  }

  useEffect(() => {
    if (activeTab === TabItems.Flagged) loadFlaggedVocab();
  }, [activeTab]);

  useEffect(() => {
    setAppTitle("Lesson Quizzes");
  }, []);

  const quizTypeSelector = (
    <QuizTypeSelector
      quizType={settings.quizType}
      onSelect={(qtype) =>
        settingsDispatch({
          type: "SET_QUIZ_TYPE",
          payload: qtype,
        })
      }
    />
  );

  const englishFirst = (
    <Switch
      label="Show English First"
      checked={settings.englishFirst}
      onChange={(_) => settingsDispatch({ type: "TOGGLE_ENGLISH_FIRST" })}
    />
  );

  if (viewMode === "RunQuiz")
    return (
      <Quizzer
        quizItems={quizItems}
        showEnglishFirst={settings.englishFirst}
        toggleFlag={toggleFlag}
        onEndQuiz={showQuizSettings}
        type={settings.quizType}
        showLessonNumber={
          activeTab === TabItems.Flagged ||
          (settings.multiLesson && settings.lessonMin !== settings.lessonMax)
        }
      />
    );

  if (viewMode === "ManageFlagged")
    return (
      <Stack>
        <Button variant="filled" onClick={showQuizSettings}>
          Back to Quiz Setup
        </Button>
        <LessonQuizTable items={quizItems} toggleFlag={toggleFlag} />
      </Stack>
    );

  if (viewMode === "QuizSetup")
    return (
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value={TabItems.All}>{TabItems.All}</Tabs.Tab>
          <Tabs.Tab value={TabItems.Flagged}>{TabItems.Flagged}</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value={TabItems.All}>
          <Stack pt="md">
            <Text>
              Quiz yourself on the translations from each lesson. Note that the
              lesson number selectors are inclusive.
            </Text>
            {quizTypeSelector}
            <Switch
              label="Multi-lesson"
              checked={settings.multiLesson}
              onChange={(_) =>
                settingsDispatch({ type: "TOGGLE_MULTI_LESSON" })
              }
            />
            <Group>
              <LessonNumberInput
                label={settings.multiLesson ? "From Lesson" : "Lesson"}
                value={settings.lessonMin}
                onChange={(val) =>
                  settingsDispatch({
                    type: "SET_LESSON_MIN",
                    payload: val as number,
                  })
                }
              />
              {settings.multiLesson && (
                <LessonNumberInput
                  label="To Lesson"
                  value={settings.lessonMax}
                  onChange={(val) =>
                    settingsDispatch({
                      type: "SET_LESSON_MAX",
                      payload: val as number,
                    })
                  }
                />
              )}
            </Group>
            {englishFirst}
            <Button variant="filled" onClick={startFlashcardsQuiz}>
              Start Quiz!
            </Button>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value={TabItems.Flagged}>
          <Stack pt="md">
            <Text>
              Use this mode to practice only the quiz items that you've flagged
              during regular lesson quizzes.
            </Text>
            <Button
              variant="subtle"
              onClick={() => setViewMode("ManageFlagged")}
            >
              Manage Flagged Items
            </Button>
            {quizTypeSelector}
            {englishFirst}
            {quizItems.length === 0 && (
              <Text c="red">You haven't flagged any items yet!</Text>
            )}
            <Button
              variant="filled"
              onClick={startTextEntryQuiz}
              disabled={quizItems.length === 0}
            >
              Start Quiz!
            </Button>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    );
}
