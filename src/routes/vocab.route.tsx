import { Container, Group, Switch, Table, type TableData } from "@mantine/core";
import { useAtom } from "jotai";
import { CurrentTitleAtom } from "../atoms";
import { useContext, useEffect, useMemo, useReducer, useState } from "react";
import { VocabContext } from "../contexts/VocabContext";
import { type VocabItem } from "../models";
import {
  vocabQuizSettingsReducer,
  initialVocabQuizSettings,
} from "../reducers/VocabQuizSettings.reducer";
import LessonNumberInput from "../components/LessonNumberInput";
import PartOfSpeechSelector from "../components/PartOfSpeechSelector";

export default function VocabRoute() {
  const [vocabItems, setVocabItems] = useState<VocabItem[]>([]);
  const [filterSettings, filterSettingsDispatch] = useReducer(
    vocabQuizSettingsReducer,
    initialVocabQuizSettings()
  );

  const [_, setAppTitle] = useAtom(CurrentTitleAtom);

  const vocabContext = useContext(VocabContext);

  function loadVocab() {
    vocabContext.getVocab(70, 90).then((result) => setVocabItems(result));
  }

  useEffect(() => {
    setAppTitle("Vocab");
    loadVocab();
  }, []);

  const tableData: TableData = useMemo(
    () => ({
      head: ["English", "Spanish", "Lesson", "Part of Speech", "Flagged"],
      body: vocabItems.map((v) => [
        v.eng,
        v.esp,
        v.lesson,
        v.partOfSpeech,
        <div>{v.flagged ? "Yes" : "No"}</div>,
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
      </Group>
      <Table data={tableData} />
    </div>
  );
}
