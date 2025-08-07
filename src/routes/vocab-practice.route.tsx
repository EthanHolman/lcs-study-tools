import { useContext, useEffect, useReducer, useState } from "react";
import {
  defaultQuizSettings,
  quizSettingsReducer,
} from "../reducers/QuizSettings.reducer";
import VocabQuizSettings from "../components/VocabQuizSettings";
import { Button, Stack, Switch, Tabs, Text } from "@mantine/core";
import { VocabContext } from "../contexts/VocabContext";
import type { VocabItem } from "../models";
import { useAtom } from "jotai";
import { CurrentTitleAtom } from "../atoms";
import Quizzer from "../components/Quizzer";
import { Link } from "react-router";

const TabItems = {
  All: "All Vocab",
  Flagged: "Flagged Vocab Only",
};

export default function VocabPracticeRoute() {
  const [settings, settingsDispatch] = useReducer(
    quizSettingsReducer,
    defaultQuizSettings()
  );
  const [viewMode, setViewMode] = useState<"QuizSetup" | "RunQuiz">(
    "QuizSetup"
  );
  const [quizItems, setQuizItems] = useState<VocabItem[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(TabItems.All);

  const [_, setAppTitle] = useAtom(CurrentTitleAtom);

  const vocabContext = useContext(VocabContext);

  function startFlashcardsQuiz() {
    vocabContext
      .getVocab(settings.lessonMin, settings.lessonMax)
      .then((res) => {
        setQuizItems(res);
        setViewMode("RunQuiz");
      });
  }

  function startTextEntryQuiz() {
    setViewMode("RunQuiz");
  }

  function endQuiz() {
    setViewMode("QuizSetup");
  }

  async function toggleFlag(id: number) {
    // update db
    const newItem = vocabContext.toggleFlagVocabItem(id);

    // update current quiz item
    const index = quizItems.findIndex((x) => x.id === id);
    if (index === -1) throw new Error(`Could not find item ${id}`);
    quizItems.splice(index, 1, await newItem);
    setQuizItems([...quizItems]);
  }

  function loadFlaggedVocab() {
    vocabContext.getFlaggedVocab().then((items) => setQuizItems(items));
  }

  useEffect(() => {
    if (activeTab === TabItems.Flagged) loadFlaggedVocab();
  }, [activeTab]);

  useEffect(() => {
    setAppTitle("Vocab Practice");
  }, []);

  if (viewMode === "RunQuiz")
    return (
      <Quizzer
        quizItems={quizItems}
        showEnglishFirst={settings.englishFirst}
        toggleFlag={toggleFlag}
        onEndQuiz={endQuiz}
        type="Flashcard"
      />
    );

  if (viewMode === "QuizSetup")
    return (
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value={TabItems.All}>{TabItems.All}</Tabs.Tab>
          <Tabs.Tab value={TabItems.Flagged}>{TabItems.Flagged}</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value={TabItems.All}>
          <Stack pt="md" align="flex-start">
            <Text>
              Practice vocabulary terms from any of the LCS lessons! Note that
              the lesson number selectors are inclusive.
            </Text>
            <VocabQuizSettings
              settings={settings}
              dispatch={settingsDispatch}
            />
            <Button variant="filled" onClick={startFlashcardsQuiz}>
              Start Quiz!
            </Button>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value={TabItems.Flagged}>
          <Stack pt="md" align="flex-start">
            <Text>
              Use this mode to practice only the vocab terms that you've flagged
              for later. You can flag terms during a regular vocab quiz, or on
              the <Link to="/vocab">Vocab List Page</Link>.
            </Text>
            <Switch
              label="Show English First"
              checked={settings.englishFirst}
              onChange={(_) =>
                settingsDispatch({ type: "TOGGLE_ENGLISH_FIRST" })
              }
            />
            {quizItems.length === 0 && (
              <Text c="red">You haven't flagged any terms yet!</Text>
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
