import { readdirSync, unlinkSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const zipsDir = resolve(__dirname, "zips");
const MAX_ZIPS = 3;

// Find existing zips and determine next version
const existing = readdirSync(zipsDir)
  .filter(f => f.match(/^sshack-plugin-v[\d.]+\.zip$/))
  .sort((a, b) => {
    const vA = parseFloat(a.match(/v([\d.]+)/)[1]);
    const vB = parseFloat(b.match(/v([\d.]+)/)[1]);
    return vA - vB;
  });

const lastVersion = existing.length
  ? parseFloat(existing[existing.length - 1].match(/v([\d.]+)/)[1])
  : 0;
const nextVersion = (lastVersion + 0.1).toFixed(1);

// Remove oldest if at limit
while (existing.length >= MAX_ZIPS) {
  const oldest = existing.shift();
  unlinkSync(resolve(zipsDir, oldest));
  console.log(`✗ Removed ${oldest}`);
}

// Create new zip
const zipName = `sshack-plugin-v${nextVersion}.zip`;
execSync(`zip -j "${resolve(zipsDir, zipName)}" "${resolve(__dirname, "code.js")}" "${resolve(__dirname, "index.html")}" "${resolve(__dirname, "manifest.json")}"`);
console.log(`✓ Created ${zipName}`);
