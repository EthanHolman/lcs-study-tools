import { useAtom } from "jotai";
import { useEffect } from "react";
import { CurrentTitleAtom } from "../atoms";
import { Card, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { Link, type To } from "react-router";

function HomepageCard(props: { title: string; bodyText: string; linkTo: To }) {
  return (
    <Card shadow="sm" withBorder component={Link} to={props.linkTo}>
      <Title order={3}>{props.title}</Title>
      <Text c="gray">{props.bodyText}</Text>
    </Card>
  );
}

export default function HomeRoute() {
  const [_, setAppTitle] = useAtom(CurrentTitleAtom);

  useEffect(() => {
    setAppTitle("Home");
  }, []);

  return (
    <Stack>
      <Text>
        Welcome to the Unofficial LearnCraft Spanish Study Tools App! This app
        will let you practice everything from the official podcast lessons,
        including vocab terms and translation examples.
      </Text>
      <SimpleGrid cols={1}>
        <HomepageCard
          title="Practice Vocab"
          bodyText="Practice vocabulary terms from the LCS lessons!"
          linkTo="/vocab/practice"
        />
        <HomepageCard
          title="Lesson Quizzes"
          bodyText="An enhanced version of the official LCS quizzing tool, with the same
            sentences from the lessons."
          linkTo="/lesson/quiz"
        />
        <HomepageCard
          title="View Vocab"
          bodyText="View and filter the complete LCS dictionary. Here, you can also flag
            vocab items to include them more frequently on quizzes."
          linkTo="/vocab"
        />
        <HomepageCard
          title="Verbs"
          bodyText="View each verb, including a conjugation table, gerunds, imperatives, etc."
          linkTo="/verbs"
        />
      </SimpleGrid>
    </Stack>
  );
}
