import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { VocabContext } from "../contexts/VocabContext";
import { type Verb } from "../models";
import useTitle from "../hooks/useTitle";
import VerbDetails from "../components/VerbDetails";

export default function VerbViewRoute() {
  const [verbData, setVerbData] = useState<Verb>();

  const [, setAppTitle] = useTitle();
  let { verb } = useParams();

  const context = useContext(VocabContext);

  useEffect(() => {
    if (verb) {
      setAppTitle(`Verb: ${verb}`);
      context.getVerb(verb).then((result) => setVerbData(result));
    }
  }, [verb]);

  return (
    <div>
      <Link to="/verbs">Back to Verbs List</Link>
      {verbData && <VerbDetails verb={verbData} />}
    </div>
  );
}
