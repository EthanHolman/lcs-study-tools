import { Chip, Group, Title } from "@mantine/core";
import { useMemo } from "react";
import { Link } from "react-router";

type Props = {
  verbs: string[];
};

export default function VerbList(props: Props) {
  const groupedVerbs = useMemo(() => {
    if (!props.verbs || props.verbs.length === 0) return {};

    return props.verbs.reduce((acc, obj) => {
      const k = obj.charAt(0).toUpperCase();
      acc[k] = acc[k] || [];
      acc[k].push(obj);
      return acc;
    }, {} as { [group: string]: string[] });
  }, [props.verbs]);

  return (
    <>
      {Object.keys(groupedVerbs).map((key) => (
        <div key={key}>
          <Title order={2} pt="md" pb="md">
            {key}
          </Title>
          <Group>
            {groupedVerbs[key].map((verb) => (
              <Link key={verb} to={`/verbs/${verb}`}>
                <Chip size="md" variant="outline" key={verb}>
                  {verb}
                </Chip>
              </Link>
            ))}
          </Group>
        </div>
      ))}
    </>
  );
}
