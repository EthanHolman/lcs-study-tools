import { NumberInput } from "@mantine/core";

type Props = {
  label: string;
  value: number;
  onChange: ((value: number | string) => void) | undefined;
  disabled?: boolean;
};

export default function LessonNumberInput(props: Props) {
  return (
    <NumberInput
      label={props.label}
      value={props.value}
      onChange={props.onChange}
      stepHoldDelay={250}
      stepHoldInterval={100}
      allowDecimal={false}
      allowNegative={false}
      min={2}
      max={250}
      pattern="\d*"
      disabled={props.disabled}
    />
  );
}
