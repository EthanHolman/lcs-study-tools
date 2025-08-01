import { Button, Stack, Table, Text } from "@mantine/core";
import { useContext, useEffect, useMemo, useState } from "react";
import { LessonQuizContext } from "../contexts/LessonQuizContext";
import type { LessonQuizItem } from "../models";
import { useAtom } from "jotai";
import { CurrentTitleAtom } from "../atoms";
import { Link } from "react-router";

export default function LessonFlaggedRoute() {
  const [flaggedItems, setFlaggedItems] = useState<LessonQuizItem[]>([]);
  const [_, setAppTitle] = useAtom(CurrentTitleAtom);

  const context = useContext(LessonQuizContext);

  async function removeFlag(id: number) {
    context
      .toggleFlagged(id)
      .then(() =>
        setFlaggedItems((old) => [...old.filter((x) => x.id !== id)])
      );
  }

  const tableData = useMemo(
    () => ({
      head: ["English", "Spanish", "Lesson", ""],
      body: flaggedItems.map((a) => [
        a.eng,
        a.esp,
        a.lesson,
        <Button variant="subtle" color="red" onClick={() => removeFlag(a.id)}>
          Remove Flagged
        </Button>,
      ]),
    }),
    [flaggedItems]
  );

  useEffect(() => {
    setAppTitle("Lesson Quizzes: Flagged");
    context.getFlagged().then((result) => {
      setFlaggedItems(result);
    });
  }, []);

  return (
    <Stack>
      <Link to="/lesson/quiz">Back to Lesson Quizzes</Link>
      <Table data={tableData} />
      {tableData.body.length === 0 && (
        <Text pt="md">You have not flagged any lesson quiz items yet</Text>
      )}
    </Stack>
  );
}
