#!/usr/bin/env node
// Precompiles + minifies assets/js/hrt-decision-aid.jsx into a shipped .min.js,
// so the browser no longer has to fetch babel.min.js and JIT-transform raw,
// fully-readable JSX at runtime. hrt-decision-aid.jsx stays the source of
// truth for edits; run `npm run build` after changing it to refresh the
// shipped bundle.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { minify } = require("terser");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "assets", "js", "hrt-decision-aid.jsx");
const OUT = path.join(ROOT, "assets", "js", "hrt-decision-aid.min.js");
const HTML = path.join(ROOT, "index.html");
const WEBMANIFEST = path.join(ROOT, "site.webmanifest");

// Every static file whose URL should carry a content hash so browsers and
// Cloudflare's edge cache always fetch fresh content the moment it changes,
// with nobody needing to remember to bump a version number by hand.
const HASHED_ASSETS = [
  "assets/images/favicon-32.png",
  "assets/images/favicon-16.png",
  "assets/images/apple-touch-icon.png",
  "assets/images/icon-192.png",
  "assets/images/icon-512.png",
];

function hashFile(absPath) {
  return crypto.createHash("sha256").update(fs.readFileSync(absPath)).digest("hex").slice(0, 10);
}

function stampAssetRef(text, assetRelPath, hash) {
  const escaped = assetRelPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`${escaped}(\\?v=[a-f0-9]+)?`, "g");
  return text.replace(re, `${assetRelPath}?v=${hash}`);
}

async function main() {
  const src = fs.readFileSync(SRC, "utf8");

  // hrt-decision-aid.jsx is the single source of truth for the tool version
  // and the "content last checked" date (it shows them in the tool footer and
  // the printable summary). The homepage footer in index.html shows the same
  // two values, so we stamp them from here at build time instead of keeping a
  // hand-copied duplicate that can silently drift out of sync.
  const versionMatch = src.match(/TOOL_VERSION\s*=\s*"([^"]+)"/);
  const reviewedMatch = src.match(/CONTENT_REVIEWED\s*=\s*"([^"]+)"/);

  // Same Babel + same presets dc-runtime.js uses to JIT-compile this file
  // in the browser today, so behavior is identical to the current runtime path.
  const Babel = require(path.join(ROOT, "assets", "vendor", "babel.min.js"));
  const { code: compiled } = Babel.transform(src, {
    filename: "hrt-decision-aid.jsx",
    presets: ["react", "typescript"],
  });

  const result = await minify(compiled, {
    compress: true,
    // toplevel defaults to false: top-level declarations (HRTOptionsFinder,
    // and any other function dc-runtime picks up as a window global) keep
    // their exact names. Only nested/internal names get shortened.
    mangle: true,
    format: { comments: false },
  });

  if (result.error) throw result.error;
  fs.writeFileSync(OUT, result.code, "utf8");
  console.log(
    `Wrote ${path.relative(ROOT, OUT)} (${compiled.length} -> ${result.code.length} bytes)`
  );

  // Cache-busting: stamp every reference to this file (and to the favicon/
  // manifest assets below) with a hash of its own content, so the URL itself
  // changes whenever the file does. Browsers and Cloudflare's edge cache key
  // on the full URL, so a changed ?v= forces a fresh fetch regardless of any
  // Cache-Control/TTL in play — nobody has to remember to bump a version
  // number, and nobody needs an incognito window to see a new deploy.
  const jsHash = crypto.createHash("sha256").update(result.code).digest("hex").slice(0, 10);
  let html = fs.readFileSync(HTML, "utf8");
  html = html.replace(
    /assets\/js\/hrt-decision-aid\.min\.js(\?v=[a-f0-9]+)?#/,
    `assets/js/hrt-decision-aid.min.js?v=${jsHash}#`
  );

  // Keep the homepage footer's version + review date in lock-step with the
  // JSX constants above (single source of truth lives in the .jsx file).
  if (versionMatch && reviewedMatch) {
    html = html.replace(
      /Version [^,]+, content last checked against current guidance on [^.<]+\./,
      `Version ${versionMatch[1]}, content last checked against current guidance on ${reviewedMatch[1]}.`
    );
  }

  let manifest = fs.readFileSync(WEBMANIFEST, "utf8");
  for (const rel of HASHED_ASSETS) {
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) continue;
    const h = hashFile(abs);
    html = stampAssetRef(html, rel, h);
    manifest = stampAssetRef(manifest, rel, h);
  }

  fs.writeFileSync(HTML, html, "utf8");
  fs.writeFileSync(WEBMANIFEST, manifest, "utf8");
  console.log("Stamped index.html and site.webmanifest with content-hash cache-busting.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
