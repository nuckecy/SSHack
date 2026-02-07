# System Sidekick

A conversational WCAG 2.2 accessibility assistant that runs as a Figma plugin. Ask accessibility questions in natural language, get answers grounded in specific success criteria.

## Setup

The `dist/` folder is not included in the repo. You **must** build before running the plugin:

```bash
npm install
npm run build
```

This generates `dist/code.js` and `dist/index.html`, which `manifest.json` requires. Without building, the plugin will not load.

Load in Figma: **Plugins → Development → Import plugin from manifest** → select `manifest.json`.

If you don't want to build from source, use a pre-built zip from the **Plugin Zips** section below.

## Plugin Zips

Pre-built plugin packages are in `zips/`. Versions are progressive — the highest number is the most recent build. Use the latest zip to install without building from source.

To download directly, visit the [zips folder on GitHub](https://github.com/nuckecy/SSHack/tree/main/zips), right-click the zip file you want, and select **Save Link As**.

## AI Setup

The plugin supports Gemini, OpenAI, and Anthropic via BYOK (Bring Your Own Key). Open Settings inside the plugin to add your API key.
