import { Button, Table, Text } from "@mantine/core";
import { useMemo } from "react";
import type { IQuizzable } from "../models";

type Props = {
  items: IQuizzable[];
  toggleFlag: (id: number) => void;
};

export default function LessonQuizTable(props: Props) {
  const tableData = useMemo(
    () => ({
      head: ["English", "Spanish", "Lesson", ""],
      body: props.items.map((a) => [
        a.eng,
        a.esp,
        a.lesson,
        <Button
          variant="subtle"
          color="red"
          onClick={() => props.toggleFlag(a.id)}
        >
          Remove Flagged
        </Button>,
      ]),
    }),
    [props.items]
  );

  return (
    <>
      <Table data={tableData} />
      {tableData.body.length === 0 && (
        <Text pt="md">You have not flagged any lesson quiz items yet</Text>
      )}
    </>
  );
}
