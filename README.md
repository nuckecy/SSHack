# System Sidekick

A conversational WCAG 2.2 accessibility assistant that runs as a Figma plugin. Ask accessibility questions in natural language, get answers grounded in specific success criteria.

## Setup

```bash
npm install
npm run build
```

Load in Figma: **Plugins → Development → Import plugin from manifest** → select `manifest.json`.

## Plugin Zips

Pre-built plugin packages are in `zips/`. Versions are progressive — the highest number is the most recent build. Use the latest zip to install without building from source.

To download directly, visit the [zips folder on GitHub](https://github.com/nuckecy/SSHack/tree/main/zips), right-click the zip file you want, and select **Save Link As**.

## AI Setup

The plugin supports Gemini, OpenAI, and Anthropic via BYOK (Bring Your Own Key). Open Settings inside the plugin to add your API key.
