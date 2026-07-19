#!/usr/bin/env node
// Precompiles + minifies assets/js/hrt-decision-aid.jsx into a shipped .min.js,
// so the browser no longer has to fetch babel.min.js and JIT-transform raw,
// fully-readable JSX at runtime. hrt-decision-aid.jsx stays the source of
// truth for edits; run `npm run build` after changing it to refresh the
// shipped bundle.
const fs = require("fs");
const path = require("path");
const { minify } = require("terser");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "assets", "js", "hrt-decision-aid.jsx");
const OUT = path.join(ROOT, "assets", "js", "hrt-decision-aid.min.js");

async function main() {
  const src = fs.readFileSync(SRC, "utf8");

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
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
