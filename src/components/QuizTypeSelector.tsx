import { Fieldset, Stack, Radio } from "@mantine/core";
import type { QuizType } from "../reducers/QuizSettings.reducer";

type Props = {
  quizType: QuizType;
  onSelect: (type: QuizType) => void;
};

export default function QuizTypeSelector(props: Props) {
  return (
    <Fieldset legend="Quiz Type">
      <Stack>
        <Radio
          label="Flashcards"
          checked={props.quizType === "Flashcard"}
          onChange={() => props.onSelect("Flashcard")}
        />
        <Radio
          label="Write your answer"
          checked={props.quizType === "TextEntry"}
          onChange={() => props.onSelect("TextEntry")}
        />
      </Stack>
    </Fieldset>
  );
}
