import { useRef } from "react";

export type IdbStoreStatus = "NotReady" | "Pending" | "Ready";

export default function useIdbStoreStatus() {
  return useRef<IdbStoreStatus>("NotReady");
}
