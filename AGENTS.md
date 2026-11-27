# Agent guidelines

## Code health

Family-wide rules live in the
[wazootech workspace constitution](https://github.com/wazootech/workspace/blob/main/AGENTS.md#code-health-standards);
this repo's specifics:

- Before pushing, run `bun run fmt:check`, `bun run lint`, `bun run check`, and
  `bun test` (or `bun run ci` for all of them plus the build); the Pages
  workflow runs them on every pull request and push to `main`.
- Format is `bun fmt`, lint is Oxlint (`--deny-warnings`), and types are
  `bun check` (strict, from `tsconfig.json`). `.oxlintrc.json` enforces
  `no-explicit-any` and `ban-ts-comment` (no `@ts-ignore`).
- `secret-scan.yml` runs gitleaks on every pull request and push to `main`;
  never commit credentials.
- Workflow actions are pinned to full commit SHAs with a version comment. Bun is
  the one toolchain left floating (`bun-version: "1.x"`), CI installs with
  `bun install --frozen-lockfile`, so commit any `bun.lock` change.
- The code is Node-compatible (`node:*` APIs, `node:test`); Bun is the tooling.
  The package is not published, so there is no `jsr.json`.
- `code-health.yml` only warns: files over 120 lines of code (300 for tests) and
  `TODO`/`FIXME` without an issue link. There are no exclusions; the generator's
  own `TODO:` placeholder text in `src/` and `test/` warns by design.
- `.github/CODEOWNERS` routes review to the repo owner.
