import {
  Box,
  Checkbox,
  Group,
  LoadingOverlay,
  Table,
  type TableData,
} from "@mantine/core";
import { useAtom } from "jotai";
import { CurrentTitleAtom } from "../atoms";
import { useContext, useEffect, useMemo, useReducer, useState } from "react";
import { VocabContext } from "../contexts/VocabContext";
import { type VocabItem } from "../models";
import {
  quizSettingsReducer,
  defaultQuizSettings,
} from "../reducers/QuizSettings.reducer";
import LessonNumberInput from "../components/LessonNumberInput";
import PartOfSpeechSelector from "../components/PartOfSpeechSelector";

export default function VocabRoute() {
  const [vocabItems, setVocabItems] = useState<VocabItem[]>([]);
  const [filterSettings, filterSettingsDispatch] = useReducer(
    quizSettingsReducer,
    {
      ...defaultQuizSettings(),
      persistLessonNumbers: false,
      lessonMin: 2,
      lessonMax: 50,
    }
  );
  const [loading, setLoading] = useState(false);

  const [_, setAppTitle] = useAtom(CurrentTitleAtom);

  const vocabContext = useContext(VocabContext);

  function loadVocab() {
    setLoading(true);
    vocabContext
      .getVocab(filterSettings.lessonMin, filterSettings.lessonMax)
      .then((result) => {
        return result.filter((x) => {
          let include = true;
          // flagged filter
          if (filterSettings.onlyFlagged && x.flagged !== 1) include = false;
          // parts of speech filter
          if (
            filterSettings.partsOfSpeech.length > 0 &&
            !filterSettings.partsOfSpeech.includes(x.partOfSpeech)
          )
            include = false;
          return include;
        });
      })
      .then((result) => {
        setVocabItems(result);
        setLoading(false);
      });
  }

  async function toggleFlag(id: number) {
    // update db
    const newItem = vocabContext.toggleFlagVocabItem(id);

    // update current quiz item
    const index = vocabItems.findIndex((x) => x.id === id);
    if (index === -1) throw new Error(`Could not find item ${id}`);
    vocabItems.splice(index, 1, await newItem);
    setVocabItems([...vocabItems]);
  }

  useEffect(loadVocab, [filterSettings]);

  useEffect(() => {
    setAppTitle("Vocab");
  }, []);

  const tableData: TableData = useMemo(
    () => ({
      head: ["English", "Spanish", "Lesson", "Part of Speech", "Flagged"],
      body: vocabItems.map((v) => [
        v.eng,
        v.esp,
        v.lesson,
        v.partOfSpeech,
        <Checkbox
          checked={v.flagged === 1}
          onChange={() => toggleFlag(v.id)}
        />,
      ]),
    }),
    [vocabItems]
  );

  return (
    <div>
      <Group>
        <LessonNumberInput
          label="From Lesson"
          value={filterSettings.lessonMin}
          onChange={(val) =>
            filterSettingsDispatch({
              type: "SET_LESSON_MIN",
              payload: val as number,
            })
          }
        />
        <LessonNumberInput
          label="To Lesson"
          value={filterSettings.lessonMax}
          onChange={(val) =>
            filterSettingsDispatch({
              type: "SET_LESSON_MAX",
              payload: val as number,
            })
          }
        />
        <PartOfSpeechSelector
          value={filterSettings.partsOfSpeech}
          onChange={(items) =>
            filterSettingsDispatch({
              type: "SET_PARTS_OF_SPEECH",
              payload: items,
            })
          }
        />
        <Checkbox
          checked={filterSettings.onlyFlagged}
          onChange={() =>
            filterSettingsDispatch({ type: "TOGGLE_ONLY_FLAGGED" })
          }
          label="Only Flagged"
        />
      </Group>
      <Box pos="relative">
        <LoadingOverlay
          visible={loading}
          zIndex={1}
          overlayProps={{ radius: "sm" }}
        />
        <Table data={tableData} />
      </Box>
    </div>
  );
}
