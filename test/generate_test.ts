import { assert, assertEquals, assertStringIncludes } from "@std/assert";
import {
  decodeAnswers,
  encodeAnswers,
  generate,
  LINE_BUDGET,
} from "../src/generate.ts";

const lines = (s: string) => s.split("\n").length;

Deno.test("answers round-trip through the permalink encoding", () => {
  const a = { name: "Zürich ✓", kind: "cli", test: "deno test" };
  assertEquals(decodeAnswers(encodeAnswers(a)), a);
});

Deno.test("garbage hash decodes to empty answers", () => {
  assertEquals(decodeAnswers("%%%"), {});
});

Deno.test("generation is deterministic", () => {
  assertEquals(generate({ kind: "service" }), generate({ kind: "service" }));
});

Deno.test("blank commands become visible TODOs, never invented", () => {
  assertStringIncludes(generate({}), "- Test: TODO: test command");
});

Deno.test("published library gets a publish gate, not a deploy gate", () => {
  const out = generate({ kind: "library", published: "yes" });
  assertStringIncludes(out, "Publishing is an external action");
  assert(!out.includes("Deploying is gated"));
});

Deno.test("unpublished library gets no release section", () => {
  assert(
    !generate({ kind: "library", published: "no" }).includes("## Release"),
  );
});

Deno.test("deployed service gets the cross-repo deploy rules", () => {
  assertStringIncludes(
    generate({ kind: "service", deployed: "yes" }),
    "downstream dependents",
  );
});

Deno.test("worktree toggle swaps the workflow rule", () => {
  assertStringIncludes(generate({ worktrees: "yes" }), "git worktree add");
  assertStringIncludes(
    generate({ worktrees: "no" }),
    "Never commit to the default branch",
  );
});

Deno.test("secrets section is dropped when there are no secrets", () => {
  assert(!generate({ secrets: "no" }).includes("## Secrets"));
});

Deno.test("every archetype stays within the line budget", () => {
  for (const kind of ["library", "service", "cli", "workspace"]) {
    const out = generate({ kind, approval: "strict", team: "team" });
    assert(lines(out) <= LINE_BUDGET, `${kind}: ${lines(out)} lines`);
  }
});
