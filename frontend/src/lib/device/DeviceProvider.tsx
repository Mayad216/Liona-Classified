import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  BREAKPOINTS,
  DEVICE_QUERIES,
  deviceTypeFromWidth,
  type DeviceType,
} from "@/lib/device/breakpoints";

export type DeviceContextValue = {
  type: DeviceType;
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
  prefersReducedMotion: boolean;
  /** True when viewport is below the lg breakpoint (< 1024px). */
  isCompact: boolean;
};

const DeviceContext = createContext<DeviceContextValue | null>(null);

function readTouch(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(DEVICE_QUERIES.touch).matches;
}

function readReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(DEVICE_QUERIES.reducedMotion).matches;
}

function readViewport() {
  if (typeof window === "undefined") {
    return { width: BREAKPOINTS.lg, height: 800 };
  }
  return { width: window.innerWidth, height: window.innerHeight };
}

function buildValue(width: number, height: number): DeviceContextValue {
  const type = deviceTypeFromWidth(width);
  return {
    type,
    width,
    height,
    isMobile: type === "mobile",
    isTablet: type === "tablet",
    isDesktop: type === "desktop",
    isTouch: readTouch(),
    prefersReducedMotion: readReducedMotion(),
    isCompact: width < BREAKPOINTS.lg,
  };
}

export function DeviceProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<DeviceContextValue>(() => {
    const { width, height } = readViewport();
    return buildValue(width, height);
  });

  const sync = useCallback(() => {
    const { width, height } = readViewport();
    setValue(buildValue(width, height));
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener("resize", sync, { passive: true });
    window.addEventListener("orientationchange", sync);

    const touchMq = window.matchMedia(DEVICE_QUERIES.touch);
    const motionMq = window.matchMedia(DEVICE_QUERIES.reducedMotion);
    touchMq.addEventListener("change", sync);
    motionMq.addEventListener("change", sync);

    return () => {
      window.removeEventListener("resize", sync);
      window.removeEventListener("orientationchange", sync);
      touchMq.removeEventListener("change", sync);
      motionMq.removeEventListener("change", sync);
    };
  }, [sync]);

  const ctx = useMemo(() => value, [value]);

  return <DeviceContext.Provider value={ctx}>{children}</DeviceContext.Provider>;
}

export function useDevice(): DeviceContextValue {
  const ctx = useContext(DeviceContext);
  if (!ctx) {
    throw new Error("useDevice must be used within DeviceProvider");
  }
  return ctx;
}

/** Safe fallback when provider is unavailable (e.g. tests). */
export function useDeviceOptional(): DeviceContextValue {
  const ctx = useContext(DeviceContext);
  if (ctx) return ctx;
  const { width, height } = readViewport();
  return buildValue(width, height);
}
