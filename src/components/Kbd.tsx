import { Kbd as MantineKbd, type KbdProps } from "@mantine/core";
import { useOs, type UseOSReturnValue } from "@mantine/hooks";

type Props = { children: string } & KbdProps;

const osesToShowKbd: UseOSReturnValue[] = [
  "chromeos",
  "linux",
  "macos",
  "windows",
];

export default function Kbd({ children, ...props }: Props) {
  const os = useOs();

  if (osesToShowKbd.includes(os))
    return <MantineKbd {...props}>{children}</MantineKbd>;

  return <span />;
}
