import { useContext, useEffect, useState } from "react";
import { VocabContext } from "../contexts/VocabContext";
import useTitle from "../hooks/useTitle";
import {
  Button,
  Card,
  Chip,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { Link } from "react-router";

export default function VerbsRoute() {
  const [_, setAppTitle] = useTitle();

  const [groupedVerbs, setGroupedVerbs] = useState<{
    [group: string]: string[];
  }>({});

  const context = useContext(VocabContext);

  useEffect(() => {
    context.getGroupedVerbs().then((data) => setGroupedVerbs(data));
    setAppTitle("Verbs");
  }, []);

  return (
    <div>
      <Stack pb="md" align="start">
        <Text size="lg">
          Select a verb to view its conjugations, gerunds, contractions, and
          more.
        </Text>

        <Button component={Link} to="/verbs/quiz" variant="filled">
          Practice Verbs
        </Button>
      </Stack>

      <SimpleGrid cols={{ base: 1, md: 2 }}>
        {Object.keys(groupedVerbs).map((key) => (
          <Card key={key} withBorder>
            <Title order={2} pb="xs">
              {key}
            </Title>
            <Group justify="center">
              {groupedVerbs[key].map((verb) => (
                <Link key={verb} to={`/verbs/${verb}`}>
                  <Chip size="md" variant="outline" key={verb}>
                    {verb}
                  </Chip>
                </Link>
              ))}
            </Group>
          </Card>
        ))}
      </SimpleGrid>
    </div>
  );
}
