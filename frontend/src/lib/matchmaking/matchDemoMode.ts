export type MatchDemoMode = "male-seeker" | "female-layla";

export function getMatchDemoMode(): MatchDemoMode | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get("demo");
  if (value === "male-seeker" || value === "female-layla") {
    return value;
  }
  return null;
}

export function isMatchDemoMode(): boolean {
  return getMatchDemoMode() !== null;
}
