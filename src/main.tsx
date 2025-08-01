import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import LayoutComponent from "./layout.tsx";
import Router from "./router.tsx";
import { BrowserRouter } from "react-router";
import { theme } from "./styles/mantine.ts";
import { VocabProvider } from "./contexts/VocabContext.tsx";
import { getIdb } from "./idb.ts";
import { LessonQuizProvider } from "./contexts/LessonQuizContext.tsx";

const idb = await getIdb();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <BrowserRouter>
        <VocabProvider db={idb}>
          <LessonQuizProvider db={idb}>
            <LayoutComponent>
              <Router />
            </LayoutComponent>
          </LessonQuizProvider>
        </VocabProvider>
      </BrowserRouter>
    </MantineProvider>
  </StrictMode>
);
