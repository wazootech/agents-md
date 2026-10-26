/** Bundle the wizard into dist/: index.html, main.js, CNAME. */

const root = new URL("../", import.meta.url);
const dist = new URL("dist/", root);

await Deno.remove(dist, { recursive: true }).catch(() => {});
await Deno.mkdir(dist, { recursive: true });

const bundle = await new Deno.Command(Deno.execPath(), {
  args: [
    "bundle",
    "--platform=browser",
    "--minify",
    "--output",
    new URL("main.js", dist).pathname.replace(/^\/([A-Za-z]:)/, "$1"),
    new URL("src/main.ts", root).pathname.replace(/^\/([A-Za-z]:)/, "$1"),
  ],
  stdout: "inherit",
  stderr: "inherit",
}).output();
if (!bundle.success) Deno.exit(bundle.code);

await Deno.copyFile(
  new URL("src/index.html", root),
  new URL("index.html", dist),
);
await Deno.copyFile(new URL("CNAME", root), new URL("CNAME", dist));
console.log("built dist/");
