/** Bundle the wizard into dist/: index.html, main.js, CNAME. */
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, rmSync } from "node:fs";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const dist = new URL("dist/", root);
const path = (url: URL) => fileURLToPath(url);

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

// Both runtimes bundle for the browser; only the subcommand differs.
const isDeno = "deno" in process.versions;
const args = isDeno
  ? [
    "bundle",
    "--platform=browser",
    "--minify",
    "--output",
    path(new URL("main.js", dist)),
    path(new URL("src/main.ts", root)),
  ]
  : [
    "build",
    "--target=browser",
    "--minify",
    "--outfile",
    path(new URL("main.js", dist)),
    path(new URL("src/main.ts", root)),
  ];

const bundle = spawnSync(process.execPath, args, { stdio: "inherit" });
if (bundle.status !== 0) process.exit(bundle.status ?? 1);

copyFileSync(new URL("src/index.html", root), new URL("index.html", dist));
copyFileSync(new URL("CNAME", root), new URL("CNAME", dist));
console.log("built dist/");
