"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { webcrypto } = require("node:crypto");

const code = fs.readFileSync("password-generator/app.js", "utf8");
const items = new Map();
function element(id) {
  if (!items.has(id)) items.set(id, {
    value: id === "length-range" ? "20" : "",
    checked: ["use-upper", "use-lower", "use-numbers", "use-symbols"].includes(id),
    textContent: "",
    hidden: false,
    style: {},
    classList: { toggle() {} },
    setAttribute() {},
    listeners: {},
    addEventListener(event, handler) { this.listeners[event] = handler; }
  });
  return items.get(id);
}
const context = {
  crypto: webcrypto,
  document: { getElementById: element },
  navigator: { clipboard: { async writeText() {} } },
  console,
  Number, Uint16Array, Set
};
vm.createContext(context);
vm.runInContext(code, context, { filename: "password-generator/app.js" });

function make(length, groups, avoid) {
  return vm.runInContext(
    "generatePassword(" + JSON.stringify(length) + ", " +
    JSON.stringify(groups) + ", " + JSON.stringify(avoid) + ")",
    context
  );
}
for (let n = 0; n < 30; n++) {
  const result = make(20, ["upper", "lower", "numbers", "symbols"], false);
  assert.equal(result.password.length, 20);
  assert.match(result.password, /[A-Z]/);
  assert.match(result.password, /[a-z]/);
  assert.match(result.password, /[0-9]/);
  assert.match(result.password, /[!@#$%^&*()\-_=+\[\]{};:,.?/]/);
}
const easy = make(128, ["upper", "lower", "numbers"], true).password;
assert.equal(easy.length, 128);
assert.equal(/[0O1lI|]/.test(easy), false);
assert.match(make(8, ["numbers"], false).password, /^[0-9]{8}$/);
assert.throws(() => make(8, [], false), /Select at least one/);
assert.throws(() => make(7, ["upper"], false), /8/);
assert.throws(() => make(129, ["upper"], false), /8/);
assert.equal(code.includes("Math.random("), false);
assert.equal(code.includes("crypto.getRandomValues"), true);
assert.equal(element("password-value").textContent.length, 20);
console.log("PASS password generator: secure randomness, groups, exclusions, limits and UI startup");
