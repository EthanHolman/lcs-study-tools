import { useEffect, useMemo, useState } from "react";
import type { IQuizzable } from "../models";
import { getRandomNumber } from "../utils";
import {
  ActionIcon,
  Button,
  Container,
  Group,
  Popover,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import type { QuizType } from "../reducers/QuizSettings.reducer";
import { useHotkeys } from "@mantine/hooks";
import { FaInfo } from "react-icons/fa";
import Kbd from "./Kbd";

type SubProps = {
  primaryText: string;
  secondaryText: string;
  showEnglishFirst: boolean;
  showAnswer: boolean;
  toggleShow: () => void;
};

function FlashcardQuizzer(props: SubProps) {
  return (
    <>
      <div>
        <Text size="sm" c="gray" ta="center">
          {props.showEnglishFirst ? "ENGLISH" : "SPANISH"}
        </Text>
        <Text size="xl" ta="center">
          {props.primaryText}
        </Text>
      </div>
      <Container
        onClick={props.toggleShow}
        style={{
          border: "2px dashed var(--mantine-color-default-border)",
          borderRadius: "10px",
          padding: "var(--mantine-spacing-md)",
          margin: "var(--mantine-spacing-xl)",
          width: "80%",
          maxWidth: "25rem",
          height: "7rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <Text size="lg" c={props.showAnswer ? "dark" : "gray"}>
          {props.showAnswer
            ? props.secondaryText
            : `Click/Tap to show ${
                props.showEnglishFirst ? "Spanish" : "English"
              }`}
        </Text>
      </Container>
    </>
  );
}

function TextEntryQuizzer(props: SubProps) {
  const [inputVal, setInputVal] = useState("");

  const secondaryText = useMemo(() => {
    // If user is predicting english, don't make them add things in
    //  parantheses.. ie, "That one(f) is good" -> "That one is good"
    if (!props.showEnglishFirst)
      return props.secondaryText.replaceAll(/\(([^\)]+)\)/gm, "");

    return props.secondaryText;
  }, [props.secondaryText]);

  const answerIsCorrect = inputVal === secondaryText;

  function onDone() {
    props.toggleShow();
  }

  useEffect(() => {
    if (inputVal.includes("\n")) {
      setInputVal((old) => old.replace("\n", ""));
      onDone();
    }
  }, [inputVal]);

  useEffect(() => {
    setInputVal("");
  }, [props.primaryText]);

  return (
    <div style={{ width: "100%", maxWidth: "50rem" }}>
      <Text size="sm" c="gray">
        Translate this to {props.showEnglishFirst ? "Spanish" : "English"}:
      </Text>
      <Text size="xl">{props.primaryText}</Text>
      {props.showAnswer ? (
        <Stack gap="3" mih="130px" mt="lg">
          <Text size="sm" c="gray">
            {answerIsCorrect ? "Correct - Nice job!" : "You Entered"}
          </Text>
          <Text size="xl" ff="monospace" c={answerIsCorrect ? "green" : "red"}>
            {!inputVal || inputVal.length === 0 ? "[No Entry]" : inputVal}
          </Text>
          {!answerIsCorrect && (
            <>
              <Text size="xl" ff="monospace">
                {secondaryText}
              </Text>
              <Text size="sm" c="gray">
                Correct Answer
              </Text>
            </>
          )}
        </Stack>
      ) : (
        <Stack gap="xs" align="center" mih="130px" mt="lg">
          <Textarea
            label={`${
              props.showEnglishFirst ? "Spanish" : "English"
            } Translation`}
            placeholder="Type Here..."
            value={inputVal}
            onChange={(e) => setInputVal(e.currentTarget.value)}
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            styles={{
              root: { alignSelf: "stretch" },
              input: { fontFamily: "var(--mantine-font-family-monospace)" },
            }}
          />
          <Button
            onClick={onDone}
            variant="filled"
            color="green"
            leftSection={<Kbd size="xs">Enter</Kbd>}
          >
            Done
          </Button>
        </Stack>
      )}
    </div>
  );
}

type Props = {
  quizItems: IQuizzable[];
  showEnglishFirst: boolean;
  onEndQuiz: () => void;
  toggleFlag: (id: number) => void;
  type: QuizType;
};

export default function Quizzer(props: Props) {
  const [currentIndex, setCurrentIndex] = useState(
    getRandomNumber(0, props.quizItems.length - 1)
  );
  const [completedIndexes, setCompletedIndexes] = useState<number[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);

  useHotkeys([
    ["Enter", () => nextItem()],
    ["f", () => flagPressed()],
  ]);

  const currentItem = props.quizItems[currentIndex] ?? {
    eng: "(There are no items)",
    esp: "(No hay cosas)",
    id: -1,
  };

  const primaryText = props.showEnglishFirst
    ? currentItem.eng
    : currentItem.esp;

  const secondaryText = props.showEnglishFirst
    ? currentItem.esp
    : currentItem.eng;

  function nextItem() {
    setShowAnswer(false);
    const newCompletedIndexes =
      completedIndexes.length + 1 === props.quizItems.length
        ? []
        : [...completedIndexes, currentIndex];
    setCompletedIndexes(newCompletedIndexes);
    let newIndex: number;
    do {
      newIndex = getRandomNumber(0, props.quizItems.length - 1);
    } while (
      newCompletedIndexes.includes(newIndex) ||
      currentIndex === newIndex
    );
    setCurrentIndex(newIndex);
  }

  function toggleShow() {
    setShowAnswer(!showAnswer);
  }

  async function flagPressed() {
    props.toggleFlag(currentItem.id);
  }

  const subComponentProps = {
    primaryText,
    secondaryText,
    showEnglishFirst: props.showEnglishFirst,
    showAnswer,
    toggleShow,
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flexGrow: "1",
        paddingBottom: "var(--mantine-spacing-md)",
      }}
    >
      <Stack flex={1} justify="center" align="center">
        <Text c="gray" size="sm">
          {completedIndexes.length + 1} of {props.quizItems.length}
        </Text>
        {props.type === "Flashcard" && (
          <FlashcardQuizzer {...subComponentProps} />
        )}
        {props.type === "TextEntry" && (
          <TextEntryQuizzer {...subComponentProps} />
        )}
        <Stack
          style={{
            visibility: showAnswer ? "visible" : "hidden",
            width: "100%",
            maxWidth: "20rem",
            marginTop: "var(--mantine-spacing-lg)",
          }}
        >
          <Group>
            <Button
              variant="outline"
              color="orange"
              onClick={flagPressed}
              leftSection={<Kbd size="xs">f</Kbd>}
              rightSection={<span />}
              justify="space-between"
              flex={1}
            >
              {currentItem.flagged ? "Remove Flag" : "Add Flag"}
            </Button>
            <Popover width={250} withArrow shadow="md">
              <Popover.Target>
                <ActionIcon
                  variant="light"
                  color="orange"
                  aria-label="About flags"
                  size="input-sm"
                >
                  <FaInfo />
                </ActionIcon>
              </Popover.Target>
              <Popover.Dropdown>
                <Text size="sm">
                  Add a flag for items you're struggling with. You can quiz
                  yourself using the Flag Quiz to get extra practice!
                </Text>
              </Popover.Dropdown>
            </Popover>
          </Group>
          <Button
            variant="filled"
            onClick={nextItem}
            leftSection={<Kbd size="xs">Enter</Kbd>}
            rightSection={<span />}
            justify="space-between"
          >
            {completedIndexes.length + 1 === props.quizItems.length
              ? "Start Over"
              : "Next"}
          </Button>
        </Stack>
      </Stack>
      <Button
        variant="light"
        color="orange"
        onClick={props.onEndQuiz}
        style={{ alignSelf: "center" }}
      >
        End Quiz
      </Button>
    </div>
  );
}
