import { Suspense, useContext, useEffect, useMemo, useState } from "react";
import type { Verb } from "../models";
import { VocabContext } from "../contexts/VocabContext";
import { Box, Button, Group, Stack, Text, TextInput } from "@mantine/core";
import { getRandomNumber } from "../utils";
import { FaCheckCircle } from "react-icons/fa";
import { TensePersons } from "../constants";
import { FaCircleExclamation } from "react-icons/fa6";

export type VerbQuizType = "single" | "tense";

type Props = {
  verbs: string[];
  type: VerbQuizType;
  onEndQuiz: () => void;
};

type SubProps = {
  type: VerbQuizType;
  verbs: Verb[];
};

function SingleMode(props: SubProps) {
  return <>SingleMode</>;
}

function TenseInput(props: {
  showAnswer: boolean;
  person: string;
  answer: string;
}) {
  const [val, setVal] = useState("");

  const error =
    props.showAnswer &&
    val.toLocaleLowerCase() !== props.answer.toLocaleLowerCase();

  useEffect(() => setVal(""), [props.person, props.answer]);

  return (
    <Group>
      <TextInput
        placeholder={props.person}
        rightSection={
          <>
            {props.showAnswer && !error && <FaCheckCircle />}
            {error && <FaCircleExclamation />}
          </>
        }
        error={error}
        readOnly={props.showAnswer}
        value={val}
        onChange={(e) => setVal(e.currentTarget.value)}
      />
      <Text
        style={{
          color: error ? "red" : "unset",
          minWidth: "5rem",
        }}
      >
        {props.showAnswer && props.answer}
      </Text>
    </Group>
  );
}

function TenseMode(props: SubProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedIndexes, setCompletedIndexes] = useState<number[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);

  const verbs_tenses = useMemo(() => {
    return props.verbs.reduce((acc, cur) => {
      Object.keys(cur.conjugations).forEach((t) =>
        acc.push(`${cur.verb}_${t}`)
      );
      return acc;
    }, [] as string[]);
  }, [props.verbs]);

  const [conjs, verb, tense] = useMemo(() => {
    const [verb, tense] = verbs_tenses[currentIndex].split("_");
    const x = props.verbs.find((x) => x.verb === verb)?.conjugations[tense];
    if (!x) {
      console.error("Missing verb conjugation in VerbQuizzer");
      return [[], verb, tense];
    }
    return [
      TensePersons.map((tense, i) => ({ tense, conj: x[i] })),
      verb,
      tense,
    ];
  }, [currentIndex]);

  function nextItem() {
    setShowAnswer(false);
    const newCompletedIndexes =
      completedIndexes.length + 1 === verbs_tenses.length
        ? []
        : [...completedIndexes, currentIndex];
    setCompletedIndexes(newCompletedIndexes);
    let newIndex: number;
    do {
      newIndex = getRandomNumber(0, verbs_tenses.length - 1);
    } while (
      newCompletedIndexes.includes(newIndex) ||
      (verbs_tenses.length > 1 && currentIndex === newIndex)
    );
    setCurrentIndex(newIndex);
  }

  return (
    <Stack align="center" justify="center" flex={1}>
      <Box>
        <Text size="sm" c="gray">
          Verb:
        </Text>
        <Text size="xl">{verb}</Text>
        <Text size="sm" c="gray" mt="sm">
          Tense:
        </Text>
        <Text size="xl">{tense}</Text>
      </Box>
      <Stack style={{}}>
        {conjs.map((x) => (
          <TenseInput
            key={x.tense}
            showAnswer={showAnswer}
            person={x.tense}
            answer={x.conj}
          />
        ))}
      </Stack>
      {showAnswer && (
        <Button variant="filled" onClick={nextItem}>
          {completedIndexes.length + 1 === verbs_tenses.length
            ? "Start Over"
            : "Next"}
        </Button>
      )}
      {!showAnswer && (
        <Button
          variant="filled"
          color="green"
          onClick={() => setShowAnswer(true)}
        >
          Check
        </Button>
      )}
    </Stack>
  );
}

function VerbQuizzer(props: SubProps) {
  if (props.type === "single") return <SingleMode {...props} />;
  if (props.type === "tense") return <TenseMode {...props} />;
}

async function VerbQuizzerLoader(props: Props) {
  const context = useContext(VocabContext);
  const verbs = await Promise.all(props.verbs.map((v) => context.getVerb(v)));
  return <VerbQuizzer verbs={verbs} type={props.type} />;
}

export default function VerbQuizzerSuspense(props: Props) {
  return (
    <>
      <Suspense fallback={<>Loading quiz...</>}>
        <VerbQuizzerLoader {...props} />
      </Suspense>
      <Button
        variant="light"
        color="orange"
        onClick={props.onEndQuiz}
        mt="md"
        style={{ alignSelf: "center" }}
      >
        End Quiz
      </Button>
    </>
  );
}
