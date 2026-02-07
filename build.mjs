import { buildSync } from "esbuild";
import { writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

mkdirSync(resolve(__dirname, "dist"), { recursive: true });

// 1. Build main thread (code.ts → code.js)
buildSync({
  entryPoints: [resolve(__dirname, "src/code.ts")],
  bundle: true,
  outfile: resolve(__dirname, "dist/code.js"),
  format: "iife",
  target: "es2020",
  platform: "browser",
});
console.log("✓ dist/code.js");

// 2. Build UI (React app → single JS + CSS)
const uiResult = buildSync({
  entryPoints: [resolve(__dirname, "src/ui/index.tsx")],
  bundle: true,
  write: false,
  outdir: resolve(__dirname, "dist"),
  format: "iife",
  target: "es2020",
  platform: "browser",
  jsx: "automatic",
  jsxImportSource: "react",
  loader: { ".tsx": "tsx", ".ts": "ts", ".css": "css", ".json": "json" },
  define: { "process.env.NODE_ENV": '"production"' },
  minify: true,
});

let jsCode = "";
let cssCode = "";
for (const file of uiResult.outputFiles) {
  if (file.path.endsWith(".js")) jsCode = file.text;
  else if (file.path.endsWith(".css")) cssCode = file.text;
}

// 3. Create single inline HTML file (using string concatenation to avoid
// backticks in esbuild output breaking template literals)
const html = '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8" />\n<style>' +
  cssCode +
  '</style>\n</head>\n<body>\n<div id="root"></div>\n<script>' +
  jsCode +
  '</script>\n</body>\n</html>';

writeFileSync(resolve(__dirname, "dist/index.html"), html);
console.log("✓ dist/index.html (" + Math.round(html.length / 1024) + " kB)");
console.log("Build complete.");
