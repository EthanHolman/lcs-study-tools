import { useAtom } from "jotai";
import { CurrentTitleAtom } from "../atoms";

export default function useTitle() {
  return useAtom(CurrentTitleAtom);
}
