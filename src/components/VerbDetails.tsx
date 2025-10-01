import { Box, ScrollArea, Text, Title } from "@mantine/core";
import type { Verb } from "../models";
import { useMemo } from "react";

function ConjugationColumn(props: {
  title: string;
  rows: string[];
  isHeader?: boolean;
}) {
  return (
    <Box
      style={{
        display: "inline-block",
        verticalAlign: "top",
        textAlign: props.isHeader ? "right" : "left",
      }}
      p="md"
    >
      <Title order={4}>{props.title}</Title>
      {props.rows.map((row, i) => (
        <Text key={`${props.title}-${row}${i}`}>{row}</Text>
      ))}
    </Box>
  );
}

function VerbSpecialData(props: { title: string; data?: string[] }) {
  return (
    <>
      {props.data && props.data.length > 0 && (
        <Text>
          <b>{props.title}:</b> {props.data.join(", ") || "(None)"}
        </Text>
      )}
    </>
  );
}

type Props = {
  verb: Verb;
};

export default function VerbDetails(props: Props) {
  const tenses = useMemo(
    () => Object.keys(props.verb.conjugations),
    [props.verb]
  );

  return (
    <>
      <VerbSpecialData title="Infinitive" data={props.verb.infinitive} />
      <VerbSpecialData title="Gerund" data={props.verb.gerund} />
      <VerbSpecialData title="Participle" data={props.verb.participle} />
      <VerbSpecialData title="Imperatives" data={props.verb.imperative} />
      <VerbSpecialData title="Contractions" data={props.verb.contractions} />
      <VerbSpecialData title="Other" data={props.verb.other} />
      <div style={{ display: "flex" }}>
        <ConjugationColumn
          title="(person)"
          rows={["Me", "You", "He/She/It", "They", "We"]}
          isHeader
        />
        <ScrollArea
          type="auto"
          offsetScrollbars
          style={{
            overflowY: "hidden",
            overflowX: "scroll",
            width: "auto",
            whiteSpace: "nowrap",
            flex: "1",
          }}
        >
          {tenses.map((tense) => (
            <ConjugationColumn
              key={tense}
              title={tense}
              rows={props.verb.conjugations[tense]}
            />
          ))}
        </ScrollArea>
      </div>
    </>
  );
}
