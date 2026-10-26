# agents-md

A static wizard that turns a few answers into an opinionated `AGENTS.md`. No
LLM, no telemetry; the same answers always produce the same file.

Live at <https://agents.wazoo.dev> once deployed.

## How it works

- `src/tree.ts` is the decision tree (questions, gated on earlier answers).
- `src/rules.ts` holds the rule fragments. Each has a `why` that the UI shows
  but the output omits, so the file stays terse and the defaults stay auditable.
- `src/generate.ts` is a pure `generate(answers) -> string`. Answers also encode
  into the URL fragment, and the output header carries that permalink so a file
  can be regenerated.
- The output is kept under a 100-line budget; the UI shows a live meter.

Blank command fields become visible `TODO`s rather than guesses.

## Develop

```sh
deno task test   # golden behavior per archetype
deno task dev    # build and serve dist/ locally
```

Changing rule text? Bump `RULESET_VERSION` in `src/generate.ts`.
