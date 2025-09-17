import {
  AppShell,
  Burger,
  Container,
  Divider,
  Group,
  NavLink,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useAtom } from "jotai";
import { Link, useLocation, type To } from "react-router";
import { CurrentTitleAtom } from "./atoms";
import { DEFAULT_APP_TITLE } from "./settings";
import { FaExternalLinkAlt } from "react-icons/fa";
import type { JSX } from "react";

export type MenuLink = {
  text: string;
  icon?: JSX.Element;
  toPath: To;
};

const navLinks: MenuLink[] = [
  { text: "Home", toPath: "/" },
  { text: "View Vocab", toPath: "/vocab" },
  { text: "View Verbs", toPath: "/verbs" },
  { text: "Practice Vocab", toPath: "/vocab/practice" },
  { text: "Lesson Quizzes", toPath: "/lesson/quiz" },
  { text: "About", toPath: "/about" },
];

const externalLinks = [
  { text: "LCS Website", href: "https://www.learncraftspanish.com/" },
  {
    text: "LCS Teachable",
    href: "https://learncraftspanish.teachable.com/courses/enrolled/2049851",
  },
  {
    text: "LCS Official Quiz Tool",
    href: "https://app.learncraftspanish.com/officialquizzes",
  },
];

export default function LayoutComponent(props: { children: React.ReactNode }) {
  const [opened, { toggle, close }] = useDisclosure();
  const location = useLocation();

  const [currentTitle] = useAtom(CurrentTitleAtom);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: !opened } }}
    >
      <AppShell.Header>
        <Group p="sm">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Title visibleFrom="sm" order={2}>
            {DEFAULT_APP_TITLE} -
          </Title>
          <Title order={2}>{currentTitle}</Title>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar>
        {navLinks.map((navlink) => (
          <NavLink
            component={Link}
            key={navlink.text}
            to={navlink.toPath}
            label={navlink.text}
            onClick={() => close()}
            active={location.pathname === navlink.toPath}
          />
        ))}
        <Divider mt="xl" />
        <Text size="sm" c="gray" p="sm">
          Official LCS Links:
        </Text>
        {externalLinks.map((link) => (
          <NavLink
            key={link.text}
            label={link.text}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            c="gray.8"
            rightSection={<FaExternalLinkAlt color="gray" />}
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main style={{ display: "flex", flexDirection: "column" }}>
        <Container
          size="md"
          pt="md"
          w="100%"
          style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}
        >
          {props.children}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
