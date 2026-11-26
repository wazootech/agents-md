import assert from "node:assert/strict";
import { test } from "node:test";
import {
  decodeAnswers,
  encodeAnswers,
  generate,
  LINE_BUDGET,
} from "../src/generate.ts";

const lines = (s: string) => s.split("\n").length;

/** Fails with the full output when `haystack` lacks `needle`. */
function assertIncludes(haystack: string, needle: string): void {
  assert.ok(haystack.includes(needle), `missing "${needle}" in:\n${haystack}`);
}

test("answers round-trip through the permalink encoding", () => {
  const a = { name: "Zürich ✓", kind: "cli", test: "deno test" };
  assert.deepEqual(decodeAnswers(encodeAnswers(a)), a);
});

test("garbage hash decodes to empty answers", () => {
  assert.deepEqual(decodeAnswers("%%%"), {});
});

test("generation is deterministic", () => {
  assert.equal(generate({ kind: "service" }), generate({ kind: "service" }));
});

test("blank commands become visible TODOs, never invented", () => {
  assertIncludes(generate({}), "- Test: TODO: test command");
});

test("published library gets a publish gate, not a deploy gate", () => {
  const out = generate({ kind: "library", published: "yes" });
  assertIncludes(out, "Publishing is an external action");
  assert.ok(!out.includes("Deploying is gated"));
});

test("unpublished library gets no release section", () => {
  assert.ok(
    !generate({ kind: "library", published: "no" }).includes("## Release"),
  );
});

test("deployed service gets the cross-repo deploy rules", () => {
  assertIncludes(
    generate({ kind: "service", deployed: "yes" }),
    "downstream dependents",
  );
});

test("worktree toggle swaps the workflow rule", () => {
  assertIncludes(generate({ worktrees: "yes" }), "git worktree add");
  assertIncludes(
    generate({ worktrees: "no" }),
    "Never commit to the default branch",
  );
});

test("secrets section is dropped when there are no secrets", () => {
  assert.ok(!generate({ secrets: "no" }).includes("## Secrets"));
});

test("every archetype stays within the line budget", () => {
  for (const kind of ["library", "service", "cli", "workspace"]) {
    const out = generate({ kind, approval: "strict", team: "team" });
    assert.ok(lines(out) <= LINE_BUDGET, `${kind}: ${lines(out)} lines`);
  }
});
