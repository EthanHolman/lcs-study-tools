import { MultiSelect } from "@mantine/core";
import { useContext, useEffect, useState } from "react";
import { VocabContext } from "../contexts/VocabContext";

type Props = {
  value: string[];
  onChange: ((value: string[]) => void) | undefined;
};

export default function PartOfSpeechSelector(props: Props) {
  const [partsOfSpeech, setPartsOfSpeech] = useState<string[]>([]);

  const vocabContext = useContext(VocabContext);

  useEffect(() => {
    vocabContext.getPartsOfSpeech().then((a) => setPartsOfSpeech(a));
  }, []);

  return (
    <MultiSelect
      label="Select Parts of Speech (leave empty for all)"
      data={partsOfSpeech}
      value={props.value}
      clearable
      onChange={props.onChange}
    />
  );
}
