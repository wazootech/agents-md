/** Serve dist/ on http://localhost:8000 for local development. */
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname } from "node:path";
import { fileURLToPath } from "node:url";

const dist = fileURLToPath(new URL("../dist/", import.meta.url));
const types: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

createServer(async (req, res) => {
  const name = new URL(req.url ?? "/", "http://localhost").pathname;
  const file = name.endsWith("/") ? `${name}index.html` : name;
  if (file.includes("..")) {
    res.writeHead(400).end();
    return;
  }
  try {
    const body = await readFile(dist + file);
    res.writeHead(200, {
      "content-type": types[extname(file)] ?? "application/octet-stream",
    }).end(body);
  } catch {
    res.writeHead(404).end("not found");
  }
}).listen(8000, () => console.log("serving dist/ on http://localhost:8000"));
