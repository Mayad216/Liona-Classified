import type { ChangeEvent, ClipboardEvent, InputHTMLAttributes, KeyboardEvent } from "react";

type GuardedProps = Pick<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "min" | "onChange" | "onKeyDown" | "onPaste"
>;

/**
 * Numeric fields here measure real-world quantities — rent, size, age, fees —
 * so a negative value is never valid. A field that genuinely needs negatives
 * opts out by passing a negative `min`.
 */
export function nonNegativeNumberProps(props: GuardedProps): GuardedProps {
  if (props.type !== "number") return {};
  if (props.min !== undefined && props.min !== "" && Number(props.min) < 0) return {};

  return {
    min: props.min ?? 0,

    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
      // Modifier combinations such as Ctrl+- are browser shortcuts, not input.
      if (event.key === "-" && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        return;
      }
      props.onKeyDown?.(event);
    },

    onPaste: (event: ClipboardEvent<HTMLInputElement>) => {
      if (event.clipboardData.getData("text").includes("-")) {
        event.preventDefault();
        return;
      }
      props.onPaste?.(event);
    },

    // Last resort for values the two guards above never see, e.g. dragged text.
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      if (event.target.value.includes("-")) {
        event.target.value = event.target.value.replace(/-/g, "");
      }
      props.onChange?.(event);
    },
  };
}
