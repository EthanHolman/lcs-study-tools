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
  Title,
} from "@mantine/core";
import { useState, useContext, useEffect } from "react";
import { FaAngleLeft } from "react-icons/fa";
import { Link } from "react-router";
import { VocabContext } from "../contexts/VocabContext";
import useTitle from "../hooks/useTitle";
import classes from "./verb-quiz.route.module.css";

export default function VerbQuizRoute() {
  const [_, setAppTitle] = useTitle();

  const [viewMode, setViewMode] = useState<"QuizSetup" | "RunQuiz">(
    "QuizSetup"
  );
  const [groupedVerbs, setGroupedVerbs] = useState<{
    [group: string]: string[];
  }>({});
  const [selectedVerbs, setSelectedVerbs] = useState<string[]>([]);
  const [quizMode, setQuizMode] = useState<"single" | "tense">("tense");

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
      <div>
        Verb Quizzer
        <Button
          variant="light"
          color="orange"
          onClick={() => setViewMode("QuizSetup")}
          style={{ alignSelf: "center" }}
        >
          End Quiz
        </Button>
      </div>
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
          <Text fw="bold">Select quiz type</Text>
          <Card
            mt="md"
            mb="md"
            withBorder={quizMode === "tense"}
            onClick={() => setQuizMode("tense")}
          >
            <Radio checked={quizMode === "tense"} label="Complete the tense" />
            Fill in all the person conjugations for a given verb tense.
          </Card>
          <Card
            mt="md"
            mb="md"
            withBorder={quizMode === "single"}
            onClick={() => setQuizMode("single")}
          >
            <Radio checked={quizMode === "single"} label="One at a time" />
            Given a verb, tense, and person -- what is the conjugation?
          </Card>
        </Card>

        <Card withBorder className={classes.card}>
          <Text fw="bold">Currently Selected Verbs</Text>
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
          </Group>
          {selectedVerbs.length === 0 && <Text>No verbs selected yet!</Text>}
          <Text mt="md" fw="bold">
            Select verbs to practice:
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
        <Button variant="filled" onClick={startQuiz}>
          Start Quiz
        </Button>
      </Box>
    </>
  );
}
