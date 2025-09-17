import { useAtom } from "jotai";
import { useContext, useEffect } from "react";
import { CurrentTitleAtom } from "../atoms";
import { VocabContext } from "../contexts/VocabContext";

export default function VerbsRoute() {
  const [_, setAppTitle] = useAtom(CurrentTitleAtom);

  const context = useContext(VocabContext);

  useEffect(() => {
    context.getVerbs();
    setAppTitle("Vocab");
  }, []);

  return <div>Welcome to the verbs page</div>;
}
