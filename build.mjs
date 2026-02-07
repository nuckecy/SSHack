import { build, buildSync } from "esbuild";
import postcss from "postcss";
import tailwindcss from "@tailwindcss/postcss";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// 1. Build main thread (code.ts → code.js)
buildSync({
  entryPoints: [resolve(__dirname, "src/code.ts")],
  bundle: true,
  outfile: resolve(__dirname, "code.js"),
  format: "iife",
  target: "es2017",
  platform: "browser",
});
console.log("✓ code.js");

// 2. Build UI (React app → single JS + CSS) with Tailwind CSS processing
const tailwindPlugin = {
  name: "tailwind-postcss",
  setup(b) {
    b.onLoad({ filter: /\.css$/ }, async (args) => {
      const css = readFileSync(args.path, "utf8");
      const result = await postcss([tailwindcss()]).process(css, { from: args.path });
      return { contents: result.css, loader: "css" };
    });
  },
};

const uiResult = await build({
  entryPoints: [resolve(__dirname, "src/ui/index.tsx")],
  bundle: true,
  write: false,
  outdir: resolve(__dirname, "."),
  format: "iife",
  target: "es2017",
  platform: "browser",
  jsx: "automatic",
  jsxImportSource: "react",
  loader: { ".tsx": "tsx", ".ts": "ts", ".css": "css", ".json": "json" },
  define: { "process.env.NODE_ENV": '"production"' },
  minify: true,
  plugins: [tailwindPlugin],
});

let jsCode = "";
let cssCode = "";
for (const file of uiResult.outputFiles) {
  if (file.path.endsWith(".js")) jsCode = file.text;
  else if (file.path.endsWith(".css")) cssCode = file.text;
}

// 3. Create single inline HTML file
const html = '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8" />\n<style>' +
  cssCode +
  '</style>\n</head>\n<body>\n<div id="root"></div>\n<script>' +
  jsCode +
  '</script>\n</body>\n</html>';

writeFileSync(resolve(__dirname, "index.html"), html);
console.log("✓ index.html (" + Math.round(html.length / 1024) + " kB)");
console.log("Build complete.");
