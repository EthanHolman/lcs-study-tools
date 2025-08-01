import { Text } from "@mantine/core";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { CurrentTitleAtom } from "../atoms";

export default function AboutRoute() {
  const [_, setAppTitle] = useAtom(CurrentTitleAtom);

  useEffect(() => {
    setAppTitle("About");
  }, []);

  return (
    <>
      <Text>
        This app will let you practice everything from the official podcast
        lessons, including vocab terms and translation examples. This project is
        not affiliated with the LCS podcast (or their team) -- it was created by
        a fan of the podcast to assist himself and others in studying, as the
        official chapter quiz app is very limited. The vocabulary and chapter
        quizzes come from the teachable course's "dictionary" google sheets
        document. Please note that in the event that the LCS team changes
        anything, those changes will not be picked up here! If something looks
        off, please email me and I will look into it!
      </Text>
    </>
  );
}
