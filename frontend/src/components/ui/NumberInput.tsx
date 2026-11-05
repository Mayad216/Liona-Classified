import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { nonNegativeNumberProps } from "@/lib/forms/numberInput";

/** Unstyled number input that rejects negative values. Use where a bare
 *  `<input type="number">` is needed instead of the labelled `Input`. */
export const NumberInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function NumberInput(props, ref) {
    const numberProps = { ...props, type: "number" as const };
    return <input ref={ref} {...numberProps} {...nonNegativeNumberProps(numberProps)} />;
  }
);
