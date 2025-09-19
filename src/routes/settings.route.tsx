import { useContext, useEffect, useState } from "react";
import useTitle from "../hooks/useTitle";
import { Title, Text, Button, FileButton, Group } from "@mantine/core";
import { VocabContext } from "../contexts/VocabContext";
import { LessonQuizContext } from "../contexts/LessonQuizContext";

/* NOTE: This backup and restore thing is temporary, and as such, the
          code is rather quick n' dirty
*/

type BackupData = {
  flaggedVocabItems: number[];
  flaggedLessonQuizItems: number[];
};

function BackupAndRestore() {
  const vocabContext = useContext(VocabContext);
  const lessonQuizContext = useContext(LessonQuizContext);

  const [file, setFile] = useState<File | null>(null);
  const [restoreStatus, setRestoreStatus] = useState<
    "" | "pending" | "complete" | "error"
  >("");

  async function generateBackup() {
    let flaggedVocabItems = await vocabContext.getFlaggedVocab();
    let flaggedLessonQuizItems = await lessonQuizContext.getFlagged();

    const backupData: BackupData = {
      flaggedVocabItems: flaggedVocabItems.map((x) => x.id),
      flaggedLessonQuizItems: flaggedLessonQuizItems.map((x) => x.id),
    };

    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(backupData)], {
      type: "application/json",
    });
    element.href = URL.createObjectURL(file);
    element.download = `lcs-study-tools-backup-${Date.now()}.json`;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);
  }

  function handleError(e: unknown) {
    console.error(e);
    setRestoreStatus("error");
  }

  async function processRestoreData(data: BackupData) {
    try {
      let { flaggedVocabItems = [], flaggedLessonQuizItems = [] } = data;
      await Promise.all([
        vocabContext.restoreFromBackup(flaggedVocabItems),
        lessonQuizContext.restoreFromBackup(flaggedLessonQuizItems),
      ]);
      setRestoreStatus("complete");
    } catch (e) {
      handleError(e);
    }
  }

  function loadRestoreFile() {
    if (file) {
      setRestoreStatus("pending");
      const fileReader = new FileReader();
      fileReader.readAsText(file, "UTF-8");
      fileReader.onload = (e) => {
        try {
          if (e.target && e.target.result) {
            const data = JSON.parse(e.target.result as string);
            processRestoreData(data);
          } else throw Error("Invalid input file");
        } catch (e) {
          handleError(e);
        }
      };
      fileReader.onerror = handleError;
    }
  }

  useEffect(loadRestoreFile, [file]);

  return (
    <div>
      <Title>Backup & Restore</Title>
      <Text>
        LCS Study Tools does not currently support sync'ing your progress
        between devices (This feature is coming at a later date). However, you
        can download a backup of your progress. This can be used to restore your
        progress either on the same device, or if you share the download with
        another device, transfer your progress that way.
      </Text>
      <Group p="sm">
        <Button variant="filled" onClick={generateBackup}>
          Download Backup
        </Button>
        <FileButton onChange={setFile} accept="application/json">
          {(props) => (
            <Button {...props} variant="filled">
              Restore From Backup
            </Button>
          )}
        </FileButton>
      </Group>
      {restoreStatus && <Text fw="bold">Restore status: {restoreStatus}</Text>}
    </div>
  );
}

export default function SettingsRoute() {
  const [_, setAppTitle] = useTitle();

  useEffect(() => {
    setAppTitle("About");
  }, []);

  return (
    <>
      <BackupAndRestore />
    </>
  );
}
