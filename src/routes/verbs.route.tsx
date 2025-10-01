import { useContext, useEffect, useState } from "react";
import { VocabContext } from "../contexts/VocabContext";
import VerbList from "../components/VerbList";
import useTitle from "../hooks/useTitle";

export default function VerbsRoute() {
  const [_, setAppTitle] = useTitle();

  const [verbs, setVerbs] = useState<string[]>([]);

  const context = useContext(VocabContext);

  useEffect(() => {
    context.getVerbs().then((verbs) => setVerbs(verbs));
    setAppTitle("Verbs");
  }, []);

  return (
    <div>
      <VerbList verbs={verbs} />
    </div>
  );
}
