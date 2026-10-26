/**
 * Rule fragments. `why` is shown in the UI and never emitted, so the output
 * stays terse while every default remains auditable.
 */

import type { Answers } from "./tree.ts";

export type Section =
  | "Commands"
  | "Workflow"
  | "Testing"
  | "Approval"
  | "Secrets"
  | "Release";

export interface Rule {
  id: string;
  section: Section;
  when?: (a: Answers) => boolean;
  text: string;
  why: string;
}

const publishes = (a: Answers) =>
  (a.kind === "library" || a.kind === "cli") && a.published === "yes";
const deploys = (a: Answers) => a.kind === "service" && a.deployed === "yes";

export const rules: Rule[] = [
  {
    id: "read-first",
    section: "Workflow",
    text:
      "Read this file, the README, and any local `AGENTS.md` or `skills/` before editing a directory.",
    why: "Agents that skip local docs reinvent conventions.",
  },
  {
    id: "branch",
    section: "Workflow",
    when: (a) => a.worktrees === "no",
    text:
      "Never commit to the default branch. Work on a feature branch and open a PR.",
    why: "Keeps the default branch releasable.",
  },
  {
    id: "worktree",
    section: "Workflow",
    when: (a) => a.worktrees === "yes",
    text:
      "Do feature work in a git worktree (`git worktree add ../<repo>-<slug> -b <slug>`), never directly in the main checkout.",
    why: "Parallel agents stop clobbering each other's working tree.",
  },
  {
    id: "small-prs",
    section: "Workflow",
    when: (a) => a.team === "team",
    text:
      "Keep PRs small and single-purpose. Describe what changed, why, and what you could not verify.",
    why: "Reviewable diffs merge; sprawling ones stall.",
  },
  {
    id: "fix-fallout",
    section: "Workflow",
    text:
      'Fix breakage you cause in the same change. Do not leave known-broken state behind as "pre-existing" when a safe fix exists.',
    why: "Reported-but-unfixed problems accumulate.",
  },
  {
    id: "workspace-manifest",
    section: "Workflow",
    when: (a) => a.kind === "workspace",
    text:
      "The manifest is the single source of truth for member repos. Adding or removing an entry needs approval. Push from the checkout that owns the remote, and verify the remote and branch first.",
    why: "Federated checkouts drift without one registry.",
  },
  {
    id: "tests-with-code",
    section: "Testing",
    text:
      "Add or update tests with every behavior change. Run the test command before declaring work done.",
    why: '"It should work" is not verification.',
  },
  {
    id: "verify-claims",
    section: "Testing",
    text: "State only what you checked. Say plainly what you could not verify.",
    why: "Confident wrong reports cost more than honest gaps.",
  },
  {
    id: "no-skip-hooks",
    section: "Testing",
    text: "Never skip hooks or CI checks to get green. Fix the cause.",
    why: "Bypassed gates stop meaning anything.",
  },
  {
    id: "approval-balanced",
    section: "Approval",
    when: (a) => a.approval === "balanced",
    text:
      "Act without asking on local, reversible work (edits, tests, branches, PRs). Ask first before merging to the default branch, force operations, deleting data, or spending money.",
    why: "Speed on cheap steps, a human on expensive ones.",
  },
  {
    id: "approval-strict",
    section: "Approval",
    when: (a) => a.approval === "strict",
    text:
      "Ask before any outward-facing step: pushing, opening PRs, merging, publishing, deploying, or touching external services. Local edits and tests need no approval.",
    why: "Outward effects are hard to retract.",
  },
  {
    id: "escalate",
    section: "Approval",
    text:
      "When asking, escalate in one line: the target, the action, and the reason.",
    why: "Cheap to answer means answered.",
  },
  {
    id: "secrets",
    section: "Secrets",
    when: (a) => a.secrets === "yes",
    text:
      "Never print, log, edit, or commit credentials or `.env` files. Refer to secrets by name, never by value.",
    why: "A printed key is a rotated key.",
  },
  {
    id: "publish-gate",
    section: "Release",
    when: publishes,
    text:
      "Publishing is an external action: bump the version in a PR, and get approval before releasing. Never hand-edit generated files; regenerate them.",
    why: "Published versions cannot be unpublished.",
  },
  {
    id: "deploy-gate",
    section: "Release",
    when: deploys,
    text:
      "A green CI run means this repo is correct, not that the deploy is safe. For contract or schema changes, list downstream dependents and the merge order in the PR body, and say what you could not observe against a live environment.",
    why: "First contact with production is after merge.",
  },
  {
    id: "deploy-approval",
    section: "Release",
    when: deploys,
    text: "Deploying is gated on human approval.",
    why: "Deploys are outward-facing and hard to reverse.",
  },
];

export const sectionOrder: Section[] = [
  "Commands",
  "Workflow",
  "Testing",
  "Approval",
  "Secrets",
  "Release",
];
