import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  A4_MIN_HEIGHT,
  A4_WIDTH,
  BUILDER_PREVIEW_SCALE,
} from "@/lib/resume/pageSize";

type Props = {
  children: ReactNode;
  scale?: number;
  className?: string;
};

/**
 * Displays full-size A4 content (210mm, 11pt fields, etc.) scaled down for the UI.
 * Transform only affects presentation — export/PDF still uses unscaled dimensions.
 */
export function ScaledA4Frame({
  children,
  scale = BUILDER_PREVIEW_SCALE,
  className,
}: Props) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [innerHeight, setInnerHeight] = useState<number | null>(null);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    const measure = () => setInnerHeight(el.offsetHeight);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [children]);

  const frameHeight =
    innerHeight != null ? innerHeight * scale : `calc(${A4_MIN_HEIGHT} * ${scale})`;

  return (
    <div
      className={className}
      style={{
        width: `calc(${A4_WIDTH} * ${scale})`,
        height: frameHeight,
        overflow: "hidden",
      }}
    >
      <div
        ref={innerRef}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: A4_WIDTH,
        }}
      >
        {children}
      </div>
    </div>
  );
}
