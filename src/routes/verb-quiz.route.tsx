import {
  Accordion,
  Box,
  Button,
  Card,
  Chip,
  Group,
  Radio,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import { useState, useContext, useEffect } from "react";
import { FaAngleLeft } from "react-icons/fa";
import { Link } from "react-router";
import { VocabContext } from "../contexts/VocabContext";
import useTitle from "../hooks/useTitle";
import classes from "./verb-quiz.route.module.css";
import VerbQuizzerSuspense, {
  type VerbQuizType,
} from "../components/VerbQuizzer";

export default function VerbQuizRoute() {
  const [_, setAppTitle] = useTitle();

  const [viewMode, setViewMode] = useState<"QuizSetup" | "RunQuiz">(
    "QuizSetup"
  );
  const [groupedVerbs, setGroupedVerbs] = useState<{
    [group: string]: string[];
  }>({});
  const [selectedVerbs, setSelectedVerbs] = useState<string[]>([]);
  const [quizMode, setQuizMode] = useState<VerbQuizType>("tense");

  const context = useContext(VocabContext);

  function onSelectVerb(verb: string) {
    if (selectedVerbs.includes(verb))
      setSelectedVerbs(selectedVerbs.filter((x) => x !== verb));
    else setSelectedVerbs([...selectedVerbs, verb]);
  }

  function startQuiz() {
    setViewMode("RunQuiz");
  }

  useEffect(() => {
    context.getGroupedVerbs().then((data) => setGroupedVerbs(data));
    setAppTitle("Verb Practice");
  }, []);

  if (viewMode === "RunQuiz")
    return (
      <VerbQuizzerSuspense
        verbs={selectedVerbs}
        type={quizMode}
        onEndQuiz={() => setViewMode("QuizSetup")}
      />
    );

  return (
    <>
      <Stack pb="md" align="start">
        <Button
          component={Link}
          to="/verbs"
          variant="subtle"
          leftSection={<FaAngleLeft />}
        >
          Back to Verbs
        </Button>

        <Text size="lg">
          Choose the verbs that you'd like to practice, and select a type of
          quiz!
        </Text>
      </Stack>

      <SimpleGrid cols={{ base: 1, md: 2 }} style={{ overflowY: "auto" }}>
        <Card withBorder className={classes.card}>
          <Stack>
            <Text className={classes.cardTitle}>Select quiz type:</Text>
            <Radio.Card
              checked={quizMode === "tense"}
              onClick={() => setQuizMode("tense")}
              p="md"
            >
              <Group wrap="nowrap" align="flex-start">
                <Radio.Indicator />
                <div>
                  <Text className={classes.cardTitle}>Complete the tense</Text>
                  <Text>
                    Fill in all the person conjugations for a given verb tense.
                  </Text>
                </div>
              </Group>
            </Radio.Card>
            <Radio.Card
              checked={quizMode === "single"}
              onClick={() => setQuizMode("single")}
              p="md"
            >
              <Group wrap="nowrap" align="flex-start">
                <Radio.Indicator />
                <div>
                  <Text className={classes.cardTitle}>One at a time</Text>
                  <Text>
                    Given a verb, tense, and person: what is the conjugation?
                  </Text>
                </div>
              </Group>
            </Radio.Card>
          </Stack>
        </Card>

        <Card withBorder className={classes.card}>
          <Text fw="bold" mb="md">
            Currently Selected:
          </Text>
          <Group>
            {selectedVerbs.map((v) => (
              <Chip
                size="md"
                variant="outline"
                key="v"
                checked={true}
                onChange={() => onSelectVerb(v)}
              >
                {v}
              </Chip>
            ))}
            {selectedVerbs.length === 0 && (
              <Chip size="md" variant="outline" checked={false} readOnly={true}>
                <i>None</i>
              </Chip>
            )}
          </Group>
          <Text mt="md" fw="bold">
            Select Verbs:
          </Text>
          <Accordion defaultValue="A">
            {Object.keys(groupedVerbs).map((key) => (
              <Accordion.Item key={key} value={key}>
                <Accordion.Control>{key}</Accordion.Control>
                <Accordion.Panel>
                  <Group>
                    {groupedVerbs[key].map((verb) => (
                      <Chip
                        size="md"
                        variant="outline"
                        key={verb}
                        checked={selectedVerbs.includes(verb)}
                        onChange={() => onSelectVerb(verb)}
                      >
                        {verb}
                      </Chip>
                    ))}
                  </Group>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        </Card>
      </SimpleGrid>

      <Box mt="md">
        <Group>
          <Button
            variant="filled"
            onClick={startQuiz}
            disabled={selectedVerbs.length === 0}
          >
            Start Quiz
          </Button>
          <Text>
            <b>{selectedVerbs.length}</b> selected verbs
          </Text>
        </Group>
      </Box>
    </>
  );
}
