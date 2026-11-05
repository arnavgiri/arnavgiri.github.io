"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const code = fs.readFileSync("age-calculator/app.js", "utf8");
const elements = new Map();
function el(id) {
  if (!elements.has(id)) elements.set(id, {
    value: "",
    textContent: "",
    hidden: false,
    listeners: {},
    addEventListener(event, callback) {
      this.listeners[event] = callback;
    }
  });
  return elements.get(id);
}
const context = {
  document: { getElementById: el },
  Date,
  Intl,
  navigator: { clipboard: { async writeText() {} } },
  window: { requestAnimationFrame(callback) { callback(); } }
};
vm.runInNewContext(code, context, { filename: "age-calculator/app.js" });

const submit = (dob, asof) => {
  el("birth-date").value = dob;
  el("as-of-date").value = asof;
  el("age-form").listeners.submit({ preventDefault() {} });
  return {
    years: el("years").textContent,
    months: el("months").textContent,
    days: el("days").textContent,
    totalDays: el("total-days").textContent,
    error: el("form-error").hidden ? "" : el("form-error").textContent
  };
};

assert.deepEqual({ ...submit("2000-06-15", "2026-09-01"), error: "" }, {
  years: "26", months: 2, days: 17, totalDays: "9,574", error: ""
});
assert.deepEqual(submit("2004-02-29", "2025-02-28"), {
  years: "21", months: 0, days: 0, totalDays: "7,670", error: ""
});
assert.deepEqual(submit("2024-01-31", "2024-02-29"), {
  years: "0", months: 1, days: 0, totalDays: "29", error: ""
});
assert.deepEqual(submit("2000-01-01", "2000-01-01"), {
  years: "0", months: 0, days: 0, totalDays: "0", error: ""
});
assert.match(submit("2027-01-01", "2026-11-05").error, /later than/);
assert.match(submit("2023-02-29", "2026-11-05").error, /valid date/);
assert.match(submit("", "2026-11-05").error, /valid date/);
console.log("PASS age calculator: calendar months, leap-day birthdays, invalid dates and age limits");
