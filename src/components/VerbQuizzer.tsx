import { Suspense, useContext, useEffect, useMemo, useState } from "react";
import type { Verb } from "../models";
import { VocabContext } from "../contexts/VocabContext";
import { Box, Button, Group, Stack, Text, TextInput } from "@mantine/core";
import { getRandomNumber } from "../utils";
import { FaCheckCircle } from "react-icons/fa";
import { EmptyConjugation, TensePersons } from "../constants";
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

function TenseInput(props: {
  showAnswer: boolean;
  label: string;
  answer: string;
  autofocus?: boolean;
  disabled?: boolean;
}) {
  const [val, setVal] = useState("");

  const error =
    props.showAnswer &&
    !props.disabled &&
    val.toLocaleLowerCase() !== props.answer.toLocaleLowerCase();

  useEffect(() => setVal(""), [props.label, props.answer]);

  return (
    <Group>
      <TextInput
        placeholder={props.label}
        rightSection={
          <>
            {props.showAnswer && !props.disabled && !error && <FaCheckCircle />}
            {error && <FaCircleExclamation />}
          </>
        }
        error={error}
        readOnly={props.showAnswer}
        value={val}
        onChange={(e) => setVal(e.currentTarget.value)}
        autoFocus={props.autofocus ?? false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        disabled={props.disabled}
      />
      <Text
        style={{
          color: error ? "red" : "unset",
          minWidth: "5rem",
        }}
      >
        {props.showAnswer && !props.disabled && props.answer}
      </Text>
    </Group>
  );
}

function SingleMode(props: SubProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedIndexes, setCompletedIndexes] = useState<number[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);

  const items = useMemo(
    () =>
      props.verbs.reduce((acc, cur) => {
        Object.keys(cur.conjugations).forEach((t) => {
          TensePersons.forEach((p, i) => {
            if (cur.conjugations[t][i] !== EmptyConjugation)
              acc.push(`${cur.verb}_${t}_${p}`);
          });
        });
        return acc;
      }, [] as string[]),
    [props.verbs]
  );

  const [conj, verb, tense, person] = useMemo(() => {
    const [verb, tense, person] = items[currentIndex].split("_");
    try {
      const v = props.verbs.find((x) => x.verb === verb)?.conjugations[tense];
      if (!v) throw new Error(`Unable to find verb ${verb}`);
      const personIndex = TensePersons.indexOf(person);
      const conj = personIndex !== -1 ? v[personIndex] : "Missing Conjugation";
      return [conj, verb, tense, person];
    } catch (e) {
      console.error(e);
      console.error(`Unable to find verb: ${items[currentIndex]}`);
      return ["", verb, tense, person];
    }
  }, [currentIndex]);

  function nextItem() {
    setShowAnswer(false);
    const newCompletedIndexes =
      completedIndexes.length + 1 === items.length
        ? []
        : [...completedIndexes, currentIndex];
    setCompletedIndexes(newCompletedIndexes);
    let newIndex: number;
    do {
      newIndex = getRandomNumber(0, items.length - 1);
    } while (
      newCompletedIndexes.includes(newIndex) ||
      (items.length > 1 && currentIndex === newIndex)
    );
    setCurrentIndex(newIndex);
  }

  function check() {
    setShowAnswer(true);
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
        <Text size="sm" c="gray" mt="sm">
          Person:
        </Text>
        <Text size="xl">{person}</Text>
      </Box>
      <form action={check}>
        <TenseInput
          showAnswer={showAnswer}
          label="Your Answer"
          answer={conj}
          autofocus={true}
        />
      </form>
      {showAnswer && (
        <Button variant="filled" onClick={nextItem}>
          {completedIndexes.length + 1 === items.length ? "Start Over" : "Next"}
        </Button>
      )}
      {!showAnswer && (
        <Button variant="filled" color="green" onClick={check}>
          Check
        </Button>
      )}
    </Stack>
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
            label={x.tense}
            answer={x.conj}
            disabled={x.conj === EmptyConjugation}
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
