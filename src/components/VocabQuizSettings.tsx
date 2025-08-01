import { Group, Stack, Switch } from "@mantine/core";
import type {
  VocabQuizSettings,
  VocabQuizSettingsAction,
} from "../reducers/VocabQuizSettings.reducer";
import LessonNumberInput from "./LessonNumberInput";
import PartOfSpeechSelector from "./PartOfSpeechSelector";

type Props = {
  settings: VocabQuizSettings;
  dispatch: React.ActionDispatch<[action: VocabQuizSettingsAction]>;
};

export default function VocabQuizSettings(props: Props) {
  return (
    <Stack>
      <Group>
        <LessonNumberInput
          label="From Lesson"
          value={props.settings.lessonMin}
          onChange={(val) =>
            props.dispatch({ type: "SET_LESSON_MIN", payload: val as number })
          }
        />
        <LessonNumberInput
          label="To Lesson"
          value={props.settings.lessonMax}
          onChange={(val) =>
            props.dispatch({ type: "SET_LESSON_MAX", payload: val as number })
          }
        />
      </Group>
      <PartOfSpeechSelector
        value={props.settings.partsOfSpeech}
        onChange={(items) =>
          props.dispatch({ type: "SET_PARTS_OF_SPEECH", payload: items })
        }
      />
      <Switch
        label="Show English First"
        checked={props.settings.englishFirst}
        onChange={() => props.dispatch({ type: "TOGGLE_ENGLISH_FIRST" })}
      />
    </Stack>
  );
}
