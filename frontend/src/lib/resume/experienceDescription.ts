/** Join stored bullets into one editable description field. */
export function bulletsToDescription(bullets: string[]): string {
  return bullets
    .map((b) => b.trim())
    .filter(Boolean)
    .join("\n\n");
}

/** Split textarea content back into resume bullets (one per paragraph). */
export function descriptionToBullets(text: string): string[] {
  const lines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  return lines;
}

export function appendToDescription(current: string, addition: string): string {
  const trimmed = addition.trim();
  if (!trimmed) return current;
  const base = current.trim();
  return base ? `${base}\n\n${trimmed}` : trimmed;
}

export function descriptionIncludesSuggestion(description: string, suggestion: string): boolean {
  return description.toLowerCase().includes(suggestion.trim().toLowerCase());
}
