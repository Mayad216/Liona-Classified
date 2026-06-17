import type { CSSProperties, ReactNode } from "react";
import {
  DEFAULT_RESUME_TEMPLATE,
  getTemplateStyle,
  getTemplateVisualPreset,
  isResumeTemplate,
  type ResumeTemplate,
  type TemplateVisualPreset,
} from "@/lib/resume/templates";
import type { ResumeData } from "@/types/resume";

function formatDates(start: string, end: string, isCurrent: boolean) {
  const endPart = isCurrent ? "Present" : end || "";
  if (!start && !endPart) return "";
  if (!start) return endPart;
  return `${start} - ${endPart}`;
}

type LayoutOptions = {
  contactLayout: "inline" | "stacked";
  headerDivider: "none" | "bar" | "full" | "underline-full";
  headingUsesAccent: boolean;
  bulletStyle: "disc" | "dash";
  skillsAsBullets: boolean;
  contactItalic: boolean;
  headerPaddingBottom: string;
  headerBackground: boolean;
};

function layoutForPreset(preset: TemplateVisualPreset): LayoutOptions {
  switch (preset) {
    case "modern-band":
      return {
        contactLayout: "inline",
        headerDivider: "none",
        headingUsesAccent: true,
        bulletStyle: "disc",
        skillsAsBullets: false,
        contactItalic: false,
        headerPaddingBottom: "14px",
        headerBackground: true,
      };
    case "modern-stripe":
      return {
        contactLayout: "inline",
        headerDivider: "bar",
        headingUsesAccent: true,
        bulletStyle: "disc",
        skillsAsBullets: false,
        contactItalic: false,
        headerPaddingBottom: "10px",
        headerBackground: false,
      };
    case "modern-soft":
      return {
        contactLayout: "inline",
        headerDivider: "none",
        headingUsesAccent: false,
        bulletStyle: "disc",
        skillsAsBullets: false,
        contactItalic: false,
        headerPaddingBottom: "16px",
        headerBackground: false,
      };
    case "modern-underline":
      return {
        contactLayout: "inline",
        headerDivider: "underline-full",
        headingUsesAccent: true,
        bulletStyle: "dash",
        skillsAsBullets: false,
        contactItalic: false,
        headerPaddingBottom: "12px",
        headerBackground: false,
      };
    case "modern-chip":
      return {
        contactLayout: "inline",
        headerDivider: "bar",
        headingUsesAccent: true,
        bulletStyle: "disc",
        skillsAsBullets: true,
        contactItalic: false,
        headerPaddingBottom: "10px",
        headerBackground: false,
      };
    case "classic-center":
      return {
        contactLayout: "stacked",
        headerDivider: "full",
        headingUsesAccent: false,
        bulletStyle: "disc",
        skillsAsBullets: false,
        contactItalic: false,
        headerPaddingBottom: "12px",
        headerBackground: false,
      };
    case "minimal-plain":
      return {
        contactLayout: "inline",
        headerDivider: "none",
        headingUsesAccent: false,
        bulletStyle: "dash",
        skillsAsBullets: false,
        contactItalic: false,
        headerPaddingBottom: "8px",
        headerBackground: false,
      };
    case "executive-rule":
      return {
        contactLayout: "inline",
        headerDivider: "full",
        headingUsesAccent: true,
        bulletStyle: "disc",
        skillsAsBullets: false,
        contactItalic: false,
        headerPaddingBottom: "14px",
        headerBackground: false,
      };
    case "formal-serif":
      return {
        contactLayout: "stacked",
        headerDivider: "full",
        headingUsesAccent: false,
        bulletStyle: "disc",
        skillsAsBullets: false,
        contactItalic: true,
        headerPaddingBottom: "12px",
        headerBackground: false,
      };
    case "tech-clean":
      return {
        contactLayout: "inline",
        headerDivider: "bar",
        headingUsesAccent: true,
        bulletStyle: "dash",
        skillsAsBullets: true,
        contactItalic: false,
        headerPaddingBottom: "10px",
        headerBackground: false,
      };
    case "compact-standard":
      return {
        contactLayout: "inline",
        headerDivider: "none",
        headingUsesAccent: true,
        bulletStyle: "disc",
        skillsAsBullets: false,
        contactItalic: false,
        headerPaddingBottom: "6px",
        headerBackground: false,
      };
    case "modern-bar":
    default:
      return {
        contactLayout: "inline",
        headerDivider: "bar",
        headingUsesAccent: true,
        bulletStyle: "disc",
        skillsAsBullets: false,
        contactItalic: false,
        headerPaddingBottom: "10px",
        headerBackground: false,
      };
  }
}

function headingStyle(
  style: ReturnType<typeof getTemplateStyle>,
  accentColor: string,
  preset: TemplateVisualPreset,
  layout: LayoutOptions
): CSSProperties {
  const headingColor = layout.headingUsesAccent ? accentColor : "#111827";
  const borderTop = style.headingBorder === "both" ? `1px solid ${headingColor}` : "none";
  let borderBottom =
    style.headingBorder === "bottom" || style.headingBorder === "both"
      ? `1px solid ${headingColor}`
      : preset === "minimal-plain"
        ? "none"
        : preset === "formal-serif"
          ? `2px solid ${headingColor}`
          : "none";

  const base: CSSProperties = {
    fontSize: style.headingSize,
    fontWeight:
      preset === "minimal-plain" ? 800 : preset === "modern-soft" ? 600 : 700,
    color: preset === "modern-soft" ? "#374151" : headingColor,
    textTransform: style.headingUppercase ? "uppercase" : "none",
    textAlign: style.headingAlign,
    letterSpacing:
      preset === "formal-serif"
        ? "0.14em"
        : preset === "modern-soft"
          ? "0.02em"
          : style.headingLetterSpacing,
    marginTop:
      preset === "compact-standard"
        ? "12px"
        : preset === "modern-soft"
          ? "22px"
          : preset === "modern-stripe"
            ? "18px"
            : "16px",
    marginBottom: "8px",
    paddingBottom:
      style.headingBorder === "bottom" || style.headingBorder === "both" ? "3px" : 0,
    paddingTop: style.headingBorder === "both" ? "4px" : 0,
    borderTop,
    borderBottom,
  };

  if (preset === "modern-stripe") {
    return {
      ...base,
      borderLeft: `4px solid ${accentColor}`,
      paddingLeft: "10px",
      borderBottom: "none",
    };
  }

  if (preset === "modern-chip") {
    return {
      ...base,
      display: "inline-block",
      backgroundColor: `color-mix(in srgb, ${accentColor} 14%, white)`,
      padding: "4px 12px",
      borderRadius: "3px",
      marginBottom: "10px",
      borderBottom: "none",
    };
  }

  if (preset === "modern-soft") {
    return {
      ...base,
      borderBottom: `1px solid #e5e7eb`,
      paddingBottom: "6px",
    };
  }

  return base;
}

function Section({
  title,
  headingStyle: hStyle,
  children,
}: {
  title: string;
  headingStyle: CSSProperties;
  children: ReactNode;
}) {
  if (!children) return null;
  return (
    <section>
      <h2 style={hStyle}>{title}</h2>
      <div style={{ marginTop: "8px" }}>{children}</div>
    </section>
  );
}

function ContactBlock({
  contact,
  style,
  layout,
}: {
  contact: string[];
  style: ReturnType<typeof getTemplateStyle>;
  layout: LayoutOptions;
}) {
  if (contact.length === 0) return null;

  const baseStyle: CSSProperties = {
    fontSize: style.contactSize,
    margin: 0,
    fontStyle: layout.contactItalic ? "italic" : "normal",
    color: layout.contactItalic ? "#374151" : "#111827",
  };

  if (layout.contactLayout === "stacked") {
    return (
      <div style={{ marginTop: "6px", display: "flex", flexDirection: "column", gap: "2px" }}>
        {contact.map((line) => (
          <p key={line} style={baseStyle}>
            {line}
          </p>
        ))}
      </div>
    );
  }

  return <p style={{ ...baseStyle, marginTop: "4px" }}>{contact.join(" | ")}</p>;
}

function BulletList({
  items,
  bulletStyle,
  fontSize,
}: {
  items: string[];
  bulletStyle: "disc" | "dash";
  fontSize: string;
}) {
  if (bulletStyle === "dash") {
    return (
      <ul style={{ margin: "4px 0 0", padding: 0, listStyle: "none" }}>
        {items.map((b, i) => (
          <li
            key={i}
            style={{
              marginBottom: "3px",
              paddingLeft: "12px",
              textIndent: "-12px",
              fontSize,
            }}
          >
            — {b}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul style={{ margin: "4px 0 0 18px", padding: 0, listStyle: "disc" }}>
      {items.map((b, i) => (
        <li key={i} style={{ marginBottom: "3px" }}>
          {b}
        </li>
      ))}
    </ul>
  );
}

/** Single-column ATS-safe resume body — 30 templates with distinct visual presets */
export function AtsResumeContent({
  data,
  template = DEFAULT_RESUME_TEMPLATE,
  accentColor = "#000000",
  fontFamily,
}: {
  data: ResumeData;
  template?: ResumeTemplate | string;
  accentColor?: string;
  fontFamily?: string;
}) {
  const tpl = isResumeTemplate(template) ? template : DEFAULT_RESUME_TEMPLATE;
  const s = getTemplateStyle(tpl);
  const preset = getTemplateVisualPreset(tpl);
  const layout = layoutForPreset(preset);
  const hStyle = headingStyle(s, accentColor, preset, layout);
  const pi = data.personal_info;
  const contact = [pi.email, pi.phone, pi.location, pi.linkedin, pi.website].filter(Boolean);

  const rootStyle: CSSProperties = {
    fontFamily: fontFamily ?? s.fontFamily,
    fontSize: s.fontSize,
    lineHeight: s.lineHeight,
    color: "#111827",
  };

  const headerAlign = s.headerAlign;
  const nameColor =
    preset === "minimal-plain" || preset === "modern-soft"
      ? "#111827"
      : preset === "formal-serif"
        ? "#111827"
        : accentColor;

  const headerStyle: CSSProperties = {
    textAlign: headerAlign,
    paddingBottom: layout.headerPaddingBottom,
    borderBottom:
      layout.headerDivider === "full"
        ? `1px solid ${preset === "formal-serif" ? "#111827" : accentColor}`
        : layout.headerDivider === "underline-full"
          ? `3px solid ${accentColor}`
          : "none",
    marginBottom:
      layout.headerDivider === "full" || layout.headerDivider === "underline-full" ? "8px" : 0,
    ...(layout.headerBackground
      ? {
          backgroundColor: `color-mix(in srgb, ${accentColor} 10%, white)`,
          padding: "16px 14px",
          marginBottom: "12px",
          borderRadius: "4px",
        }
      : {}),
  };

  return (
    <article style={rootStyle}>
      <header style={headerStyle}>
        <h1
          style={{
            fontSize:
              preset === "executive-rule" || preset === "modern-band" || preset === "modern-underline"
                ? "22pt"
                : preset === "compact-standard"
                  ? "15pt"
                  : preset === "modern-soft"
                    ? "21pt"
                    : s.nameSize,
            fontWeight: preset === "formal-serif" || preset === "modern-soft" ? 600 : 700,
            margin: 0,
            color: nameColor,
            letterSpacing:
              preset === "formal-serif" ? "0.02em" : preset === "modern-band" ? "-0.01em" : undefined,
          }}
        >
          {pi.full_name || "Your Name"}
        </h1>

        {layout.headerDivider === "bar" && (
          <div
            style={{
              width: preset === "tech-clean" ? "100%" : headerAlign === "center" ? "80px" : "64px",
              height: preset === "tech-clean" ? "2px" : "3px",
              backgroundColor: accentColor,
              margin:
                headerAlign === "center"
                  ? "8px auto 0"
                  : preset === "tech-clean"
                    ? "8px 0 0"
                    : "6px 0 0",
              opacity: preset === "tech-clean" ? 0.85 : 1,
            }}
          />
        )}

        <ContactBlock contact={contact} style={s} layout={layout} />
      </header>

      {data.summary && (
        <Section title="Professional Summary" headingStyle={hStyle}>
          <p style={{ margin: 0 }}>{data.summary}</p>
        </Section>
      )}

      {data.experiences.length > 0 && (
        <Section title="Work Experience" headingStyle={hStyle}>
          {data.experiences.map((exp) => (
            <div key={exp.id} style={{ marginBottom: s.itemSpacing }}>
              <p style={{ fontWeight: 700, margin: "0 0 2px" }}>
                {exp.job_title}
                {exp.company ? `, ${exp.company}` : ""}
              </p>
              {(exp.location || exp.start_date || exp.end_date || exp.is_current) && (
                <p style={{ fontSize: s.contactSize, margin: "0 0 4px", color: "#4b5563" }}>
                  {[exp.location, formatDates(exp.start_date, exp.end_date, exp.is_current)]
                    .filter(Boolean)
                    .join(" | ")}
                </p>
              )}
              {exp.bullets.filter(Boolean).length > 0 && (
                <BulletList
                  items={exp.bullets.filter(Boolean)}
                  bulletStyle={layout.bulletStyle}
                  fontSize={s.contactSize}
                />
              )}
            </div>
          ))}
        </Section>
      )}

      {data.education.length > 0 && (
        <Section title="Education" headingStyle={hStyle}>
          {data.education.map((edu) => (
            <div key={edu.id} style={{ marginBottom: s.itemSpacing }}>
              <p style={{ fontWeight: 700, margin: "0 0 2px" }}>
                {edu.degree}
                {edu.school ? `, ${edu.school}` : ""}
              </p>
              <p style={{ fontSize: s.contactSize, margin: "0 0 4px", color: "#4b5563" }}>
                {[edu.location, formatDates(edu.start_date, edu.end_date, false)]
                  .filter(Boolean)
                  .join(" | ")}
              </p>
              {edu.description && <p style={{ margin: 0 }}>{edu.description}</p>}
            </div>
          ))}
        </Section>
      )}

      {data.skills.length > 0 && (
        <Section title="Skills" headingStyle={hStyle}>
          {layout.skillsAsBullets ? (
            <BulletList items={data.skills} bulletStyle="dash" fontSize={s.fontSize} />
          ) : (
            <p style={{ margin: 0 }}>{data.skills.join(", ")}</p>
          )}
        </Section>
      )}

      {data.languages.length > 0 && (
        <Section title="Languages" headingStyle={hStyle}>
          <p style={{ margin: 0 }}>
            {data.languages
              .filter((l) => l.name)
              .map((l) => (l.level ? `${l.name} (${l.level})` : l.name))
              .join(", ")}
          </p>
        </Section>
      )}

      {data.projects.length > 0 && (
        <Section title="Projects" headingStyle={hStyle}>
          {data.projects.map((p) => (
            <div key={p.id} style={{ marginBottom: s.itemSpacing }}>
              <p style={{ fontWeight: 700, margin: "0 0 2px" }}>{p.name}</p>
              {p.url && (
                <p style={{ fontSize: s.contactSize, margin: "0 0 4px", color: "#4b5563" }}>
                  {p.url}
                </p>
              )}
              {p.description && <p style={{ margin: 0 }}>{p.description}</p>}
            </div>
          ))}
        </Section>
      )}

      {data.certifications.length > 0 && (
        <Section title="Certifications" headingStyle={hStyle}>
          {data.certifications.map((c) => (
            <div key={c.id} style={{ marginBottom: "8px" }}>
              <p style={{ fontWeight: 700, margin: "0 0 2px" }}>
                {c.name}
                {c.date ? ` (${c.date})` : ""}
              </p>
              {c.issuer && (
                <p style={{ fontSize: s.contactSize, margin: 0, color: "#4b5563" }}>
                  {c.issuer}
                </p>
              )}
            </div>
          ))}
        </Section>
      )}
    </article>
  );
}
