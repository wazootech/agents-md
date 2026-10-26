/** The decision tree: data only. Each question may be gated on earlier answers. */

export type Answers = Record<string, string>;

export interface Choice {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  label: string;
  hint?: string;
  type: "choice" | "text";
  choices?: Choice[];
  /** Default answer; an empty text default means "leave a TODO". */
  default: string;
  /** Show this question only when the predicate holds. */
  when?: (a: Answers) => boolean;
}

const yesNo: Choice[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

export const questions: Question[] = [
  { id: "name", label: "Project name", type: "text", default: "" },
  { id: "summary", label: "One-line description", type: "text", default: "" },
  {
    id: "kind",
    label: "What kind of project is it?",
    type: "choice",
    default: "library",
    choices: [
      { value: "library", label: "Library / package" },
      { value: "service", label: "Web app or service" },
      { value: "cli", label: "Command-line tool" },
      { value: "workspace", label: "Workspace of several repos" },
    ],
  },
  {
    id: "published",
    label: "Is it published to a registry (npm, JSR, PyPI, ...)?",
    type: "choice",
    default: "yes",
    choices: yesNo,
    when: (a) => a.kind === "library" || a.kind === "cli",
  },
  {
    id: "deployed",
    label: "Is it deployed to a live environment?",
    type: "choice",
    default: "yes",
    choices: yesNo,
    when: (a) => a.kind === "service",
  },
  {
    id: "team",
    label: "Who works on it?",
    type: "choice",
    default: "team",
    choices: [
      { value: "solo", label: "Just me" },
      { value: "team", label: "A team (PR review expected)" },
    ],
  },
  {
    id: "secrets",
    label: "Does it use credentials or .env files?",
    type: "choice",
    default: "yes",
    choices: yesNo,
  },
  {
    id: "worktrees",
    label: "Isolate feature work in git worktrees?",
    hint: "Keeps the main checkout clean when agents work in parallel.",
    type: "choice",
    default: "yes",
    choices: yesNo,
  },
  {
    id: "approval",
    label: "How cautious should the agent be?",
    type: "choice",
    default: "balanced",
    choices: [
      {
        value: "balanced",
        label: "Balanced: act freely, ask before irreversible steps",
      },
      { value: "strict", label: "Strict: ask before any outward-facing step" },
    ],
  },
  { id: "build", label: "Build command", type: "text", default: "" },
  { id: "test", label: "Test command", type: "text", default: "" },
  { id: "lint", label: "Lint / format command", type: "text", default: "" },
];

export function visibleQuestions(a: Answers): Question[] {
  const full = withDefaults(a);
  return questions.filter((q) => !q.when || q.when(full));
}

export function withDefaults(a: Answers): Answers {
  const out: Answers = {};
  for (const q of questions) out[q.id] = a[q.id] ?? q.default;
  return out;
}
