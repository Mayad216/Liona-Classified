import { useEffect, useMemo, useState } from "react";
import { aiSuggestSkillsForRole } from "@/lib/resume/ai";
import { bulletsToDescription } from "@/lib/resume/experienceDescription";
import {
  dedupeSkillSuggestions,
  getExperienceSkillSuggestions,
  getSkillsForJobTitle,
  groupExperienceSuggestions,
  hasSkill,
  shouldFetchAiSkillSuggestions,
  type SkillSuggestion,
} from "@/lib/resume/skillSuggestions";
import type { Experience } from "@/types/resume";

export function useExperienceSkillSuggestions(
  experiences: Experience[],
  selectedSkills: string[]
) {
  const [aiSuggestions, setAiSuggestions] = useState<SkillSuggestion[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiActive, setAiActive] = useState(false);

  const localSuggestions = useMemo(
    () =>
      getExperienceSkillSuggestions(experiences).filter(
        (item) => !hasSkill(selectedSkills, item.skill)
      ),
    [experiences, selectedSkills]
  );

  const experienceKey = useMemo(
    () =>
      experiences
        .map(
          (exp) =>
            `${exp.job_title}|${exp.company}|${exp.bullets.join(" ").slice(0, 200)}`
        )
        .join(";;"),
    [experiences]
  );

  useEffect(() => {
    const titled = experiences.filter((exp) => exp.job_title.trim());
    if (titled.length === 0) {
      setAiSuggestions([]);
      setAiLoading(false);
      setAiActive(false);
      return;
    }

    const needsAi = titled.some((exp) =>
      shouldFetchAiSkillSuggestions(exp.job_title, getSkillsForJobTitle(exp.job_title))
    );

    if (!needsAi) {
      setAiSuggestions([]);
      setAiLoading(false);
      setAiActive(false);
      return;
    }

    let cancelled = false;
    setAiLoading(true);
    setAiActive(false);

    void Promise.all(
      titled.map(async (exp) => {
        if (
          !shouldFetchAiSkillSuggestions(
            exp.job_title,
            getSkillsForJobTitle(exp.job_title)
          )
        ) {
          return [] as SkillSuggestion[];
        }

        const notes = bulletsToDescription(exp.bullets);
        const { suggestions, fromAi } = await aiSuggestSkillsForRole(
          exp.job_title,
          exp.company,
          notes || undefined
        );

        return suggestions.map((item) => ({
          skill: item.skill,
          source: "experience" as const,
          jobTitle: exp.job_title,
          recommended: item.recommended,
          fromAi,
        }));
      })
    )
      .then((groups) => {
        if (cancelled) return;
        const merged = dedupeSkillSuggestions(groups.flat()).filter(
          (item) => !hasSkill(selectedSkills, item.skill)
        );
        setAiSuggestions(merged);
        setAiActive(merged.some((item) => item.fromAi));
      })
      .finally(() => {
        if (!cancelled) setAiLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [experienceKey, selectedSkills, experiences]);

  const suggestions = useMemo(() => {
    const localKeys = new Set(localSuggestions.map((item) => item.skill.toLowerCase()));
    const aiOnly = aiSuggestions.filter(
      (item) => !localKeys.has(item.skill.toLowerCase())
    );
    return dedupeSkillSuggestions([...localSuggestions, ...aiOnly]).filter(
      (item) => !hasSkill(selectedSkills, item.skill)
    );
  }, [localSuggestions, aiSuggestions, selectedSkills]);

  const groups = useMemo(
    () =>
      groupExperienceSuggestions(suggestions).map((group) => ({
        ...group,
        skills: group.skills.filter((item) => !hasSkill(selectedSkills, item.skill)),
      })),
    [suggestions, selectedSkills]
  );

  return {
    suggestions,
    groups,
    aiLoading,
    aiActive,
  };
}
