// Compiles hrt-decision-aid.jsx with the same Babel transform the build
// script uses, then evaluates it as a CommonJS module so its pure
// decision-logic functions (rankOptions, rankAdjust, ...) can be
// unit-tested directly, without a browser or a bundler.
//
// The file's top level references two browser globals (`React`, for the
// hooks destructure on line 1, and `window`, to attach the component at
// the bottom) purely as a side effect of being a browser script; neither
// is touched by the logic functions this loader exists to test. Minimal
// stubs are enough to let the module evaluate.
const fs = require("fs");
const path = require("path");
const Module = require("module");

const ROOT = path.join(__dirname, "..");

function loadTool() {
  const src = fs.readFileSync(path.join(ROOT, "assets", "js", "hrt-decision-aid.jsx"), "utf8");
  const Babel = require(path.join(ROOT, "assets", "vendor", "babel.min.js"));
  const { code } = Babel.transform(src, {
    filename: "hrt-decision-aid.jsx",
    presets: ["react", "typescript"],
  });

  if (typeof global.React === "undefined") {
    global.React = { useState: () => [undefined, () => {}], useEffect: () => {}, useRef: () => ({ current: undefined }) };
  }
  if (typeof global.window === "undefined") {
    global.window = global;
  }

  const filename = path.join(ROOT, "assets", "js", "__hrt-decision-aid.test-compiled.js");
  const m = new Module(filename, module);
  m.filename = filename;
  m.paths = Module._nodeModulePaths(ROOT);
  m._compile(code, filename);
  return m.exports;
}

module.exports = { loadTool };
