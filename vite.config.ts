import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import { resolve } from "path";
import { buildSync } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync } from "fs";

// Build both code.ts and UI with esbuild, then inline into a single HTML file
function buildFigmaPlugin() {
  return {
    name: "build-figma-plugin",
    buildStart() {
      mkdirSync(resolve(__dirname, "dist"), { recursive: true });

      // 1. Build main thread (code.ts)
      buildSync({
        entryPoints: [resolve(__dirname, "src/code.ts")],
        bundle: true,
        outfile: resolve(__dirname, "dist/code.js"),
        format: "iife",
        target: "es2020",
        platform: "browser",
      });

      // 2. Build UI bundle (React app → single JS file)
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
        loader: {
          ".tsx": "tsx",
          ".ts": "ts",
          ".css": "css",
          ".json": "json",
        },
        define: {
          "process.env.NODE_ENV": '"production"',
        },
        minify: true,
      });

      // Separate JS and CSS from the build output
      let jsCode = "";
      let cssCode = "";
      for (const file of uiResult.outputFiles) {
        if (file.path.endsWith(".js")) {
          jsCode = file.text;
        } else if (file.path.endsWith(".css")) {
          cssCode = file.text;
        }
      }

      // 3. Create single inline HTML file
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<style>${cssCode}</style>
</head>
<body>
<div id="root"></div>
<script>
try {
${jsCode}
} catch(e) {
  document.getElementById("root").innerHTML = "<pre style='padding:12px;color:red;font-size:11px'>Error: " + e.message + "\\n" + e.stack + "</pre>";
}
</script>
</body>
</html>`;

      writeFileSync(resolve(__dirname, "dist/index.html"), html);
    },
  };
}

// Vite config — the actual build work is done by our custom plugin above.
// We use a dummy entry so Vite doesn't complain, but the real outputs are
// already written by esbuild.
export default defineConfig({
  plugins: [buildFigmaPlugin()],
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: false,
    rollupOptions: {
      input: resolve(__dirname, "src/ui/index.html"),
    },
  },
});
