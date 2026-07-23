// Regression tests for the questionnaire's core decision logic
// (rankOptions / rankAdjust). This is the part of the site that actually
// decides what a visitor sees as their "best" HRT options, so it's the
// highest-value place to have automated coverage — run with:
//   node --test tests/
const test = require("node:test");
const assert = require("node:assert/strict");
const { loadTool } = require("./load-tool");

const { rankOptions } = loadTool();

// Every field rankOptions reads, defaulted to a "typical" mid-transition
// answer set; individual tests override only what they care about.
function baseAnswers(overrides = {}) {
  return {
    uterus: "intact",
    age: "45to49",
    timing: "peri",
    risk: [],
    prefs: [],
    contraception: "no",
    symptoms: "systemic",
    ...overrides,
  };
}

function findOpt(result, id) {
  const all = [...result.top, ...result.mid, ...result.low, ...result.no];
  return all.find((o) => o.id === id);
}

test("no uterus: gets oestrogen-only options, not the uterus-only ones", () => {
  const r = rankOptions(baseAnswers({ uterus: "none" }));
  assert.ok(findOpt(r, "patch"), "expected the patch option to be present");
  assert.equal(findOpt(r, "patch").name, "Oestrogen patch", "no-uterus patch should not mention progesterone in its name");
  assert.ok(findOpt(r, "oralest"), "expected the oestrogen-only tablet option");
  assert.equal(findOpt(r, "ius"), undefined, "coil option needs a uterus, should not appear");
  assert.equal(findOpt(r, "combpatch"), undefined, "combined patch needs a uterus, should not appear");
  assert.equal(findOpt(r, "combtab"), undefined, "combined tablet needs a uterus, should not appear");
});

test("has a uterus: progestogen-paired options appear, oestrogen-only tablet does not", () => {
  const r = rankOptions(baseAnswers({ uterus: "intact" }));
  assert.match(findOpt(r, "patch").name, /progesterone/i, "with a uterus, the patch option should pair with progesterone");
  assert.ok(findOpt(r, "ius"), "expected the coil option to be offered");
  assert.ok(findOpt(r, "combpatch"), "expected the combined patch option");
  assert.ok(findOpt(r, "combtab"), "expected the combined tablet option");
  assert.equal(findOpt(r, "oralest"), undefined, "oestrogen-only tablet is for no-uterus only");
});

test("60 or over: oral routes are vetoed to the 'not recommended' tier", () => {
  const r = rankOptions(baseAnswers({ uterus: "intact", age: "60plus", timing: "post" }));
  assert.ok(r.no.some((o) => o.id === "combtab"), "combined tablet should be vetoed at 60+");
  assert.ok(r.no.some((o) => o.id === "tibolone"), "tibolone should be vetoed at 60+ (MHRA stroke-risk advice)");
});

test("clot/cardiovascular history: oral routes are vetoed regardless of age", () => {
  const r = rankOptions(baseAnswers({ uterus: "none", age: "45to49", risk: ["pvte"] }));
  const oral = findOpt(r, "oralest");
  assert.ok(oral.score < 0, "oral oestrogen should be vetoed with a personal clot history");
});

test("still needing contraception with a uterus: the coil option is boosted, not vetoed", () => {
  const withContra = rankOptions(baseAnswers({ uterus: "intact", timing: "peri", age: "45to49", contraception: "yes" }));
  const withoutContra = rankOptions(baseAnswers({ uterus: "intact", timing: "peri", age: "45to49", contraception: "no" }));
  assert.ok(
    findOpt(withContra, "ius").score > findOpt(withoutContra, "ius").score,
    "needing contraception should score the coil option higher, since it covers both jobs"
  );
});

test("combined pill alternative only offered when perimenopausal, under 50, low-risk, and needing contraception", () => {
  const eligible = rankOptions(baseAnswers({ timing: "peri", age: "45to49", risk: [], contraception: "yes", uterus: "intact" }));
  assert.ok(findOpt(eligible, "coc"), "expected the combined-pill alternative to be offered");

  const notPeri = rankOptions(baseAnswers({ timing: "post", age: "45to49", risk: [], contraception: "yes", uterus: "intact" }));
  assert.equal(findOpt(notPeri, "coc"), undefined, "should not be offered once fully post-menopausal");

  const hasRisk = rankOptions(baseAnswers({ timing: "peri", age: "45to49", risk: ["migraine"], contraception: "yes", uterus: "intact" }));
  assert.equal(findOpt(hasRisk, "coc"), undefined, "should not be offered with a risk flag present");
});

test("tibolone is only offered post-menopause, or 55+ without a uterus", () => {
  const postMeno = rankOptions(baseAnswers({ timing: "post", age: "55to59", uterus: "intact" }));
  assert.ok(findOpt(postMeno, "tibolone"), "expected tibolone post-menopause");

  const periNoUterus = rankOptions(baseAnswers({ timing: "peri", age: "45to49", uterus: "none" }));
  assert.equal(findOpt(periNoUterus, "tibolone"), undefined, "should not be offered while still perimenopausal and under 55");
});

test("options are returned sorted into tiers by score, highest first within each tier", () => {
  const r = rankOptions(baseAnswers({ uterus: "intact" }));
  for (const tier of [r.top, r.mid, r.low]) {
    for (let i = 1; i < tier.length; i++) {
      assert.ok(tier[i - 1].score >= tier[i].score, "each tier should be sorted highest score first");
    }
  }
});
