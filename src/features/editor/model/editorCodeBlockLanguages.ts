export const editorCodeBlockLanguageOptions = [
  { value: "plaintext", label: "Text" },
  { value: "ts", label: "TypeScript" },
  { value: "js", label: "JavaScript" },
  { value: "go", label: "Go" },
  { value: "java", label: "Java" },
  { value: "python", label: "Python" },
  { value: "rust", label: "Rust" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "sql", label: "SQL" },
  { value: "bash", label: "Bash" },
  { value: "json", label: "JSON" },
  { value: "yaml", label: "YAML" },
  { value: "md", label: "Markdown" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
] as const;

export type EditorCodeBlockLanguage =
  (typeof editorCodeBlockLanguageOptions)[number]["value"];

const editorCodeBlockLanguageValues = new Set<string>(
  editorCodeBlockLanguageOptions.map((language) => language.value),
);

export function normalizeEditorCodeBlockLanguage(
  language: unknown,
): EditorCodeBlockLanguage {
  if (
    typeof language === "string" &&
    editorCodeBlockLanguageValues.has(language)
  ) {
    return language as EditorCodeBlockLanguage;
  }

  return "plaintext";
}

export function serializeEditorCodeBlockLanguage(
  language: EditorCodeBlockLanguage,
): string | null {
  return language === "plaintext" ? null : language;
}
