"use strict";

/* Secure password generator: all randomness comes from Web Crypto. */
const GROUPS = Object.freeze({
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.?/"
});
const AMBIGUOUS = new Set("0O1lI|");
const MIN_LENGTH = 8;
const MAX_LENGTH = 128;
const elements = {
  password: document.getElementById("password-value"),
  copy: document.getElementById("copy-button"),
  feedback: document.getElementById("copy-feedback"),
  visible: document.getElementById("toggle-visibility"),
  range: document.getElementById("length-range"),
  output: document.getElementById("length-output"),
  minus: document.getElementById("length-minus"),
  plus: document.getElementById("length-plus"),
  generate: document.getElementById("generate-button"),
  upper: document.getElementById("use-upper"),
  lower: document.getElementById("use-lower"),
  numbers: document.getElementById("use-numbers"),
  symbols: document.getElementById("use-symbols"),
  avoid: document.getElementById("avoid-ambiguous"),
  error: document.getElementById("option-error"),
  strength: document.getElementById("strength-text"),
  meter: document.getElementById("strength-bar"),
  entropy: document.getElementById("entropy-text")
};
let currentPassword = "";
let shown = true;

function randomIndex(upperBound) {
  if (!Number.isSafeInteger(upperBound) || upperBound < 1 || upperBound > 65536) {
    throw new RangeError("Unsupported random range.");
  }
  const limit = Math.floor(65536 / upperBound) * upperBound;
  const sample = new Uint16Array(1);
  let number;
  do {
    crypto.getRandomValues(sample);
    number = sample[0];
  } while (number >= limit);
  return number % upperBound;
}

function secureShuffle(chars) {
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars;
}

function generatePassword(length, enabled, avoidSimilar) {
  if (!Number.isInteger(length) || length < MIN_LENGTH || length > MAX_LENGTH) {
    throw new RangeError("Password length must be 8–128 characters.");
  }
  const groups = enabled
    .filter(key => Object.hasOwn(GROUPS, key))
    .map(key => avoidSimilar ? [...GROUPS[key]].filter(c => !AMBIGUOUS.has(c)).join("") : GROUPS[key])
    .filter(Boolean);
  if (!groups.length) throw new Error("Select at least one character type.");
  if (length < groups.length) throw new RangeError("Password too short for the selected character types.");

  const pool = groups.join("");
  const result = groups.map(group => group[randomIndex(group.length)]);
  while (result.length < length) result.push(pool[randomIndex(pool.length)]);
  return { password: secureShuffle(result).join(""), poolSize: new Set(pool).size };
}

function selectedGroups() {
  return Object.keys(GROUPS).filter(key => elements[key].checked);
}

function setError(message) {
  elements.error.textContent = message;
  elements.error.hidden = !message;
}

function setLength(value) {
  elements.range.value = String(Math.min(MAX_LENGTH, Math.max(MIN_LENGTH, Number(value) || MIN_LENGTH)));
  elements.output.textContent = elements.range.value;
  updateMeter();
}

function updateMeter() {
  const groups = selectedGroups();
  const pool = groups.map(key => elements.avoid.checked
    ? [...GROUPS[key]].filter(c => !AMBIGUOUS.has(c)).join("")
    : GROUPS[key]).join("");
  const bits = pool.length ? Number(elements.range.value) * Math.log2(new Set(pool).size) : 0;
  const label = bits < 50 ? "Basic" : bits < 80 ? "Good" : bits < 120 ? "Strong" : "Very strong";
  elements.strength.textContent = label;
  elements.entropy.textContent = pool.length ? "≈ " + Math.floor(bits) + " bits estimated" : "Select characters";
  elements.meter.style.width = (pool.length ? Math.min(100, Math.max(10, bits / 140 * 100)) : 0) + "%";
  elements.meter.style.background = bits < 50 ? "#e7a278" : bits < 80 ? "#e2ce81" : "#a8deb2";
  // Estimate assumes independent uniform characters; at least-one-per-group constraints alter distribution.
}

function showPassword() {
  elements.password.textContent = currentPassword;
  elements.password.classList.toggle("is-masked", !shown);
  elements.visible.setAttribute("aria-label", shown ? "Hide password" : "Show password");
  elements.visible.setAttribute("aria-pressed", String(shown));
}

function generate() {
  elements.feedback.textContent = "";
  setError("");
  try {
    const result = generatePassword(Number(elements.range.value), selectedGroups(), elements.avoid.checked);
    currentPassword = result.password;
    showPassword();
    updateMeter();
  } catch (error) {
    currentPassword = "";
    elements.password.textContent = "Unable to generate";
    setError(error.message);
    updateMeter();
  }
}

elements.generate.addEventListener("click", generate);
elements.range.addEventListener("input", () => { setLength(elements.range.value); generate(); });
elements.minus.addEventListener("click", () => { setLength(Number(elements.range.value) - 1); generate(); });
elements.plus.addEventListener("click", () => { setLength(Number(elements.range.value) + 1); generate(); });
for (const key of Object.keys(GROUPS)) elements[key].addEventListener("change", generate);
elements.avoid.addEventListener("change", generate);
elements.visible.addEventListener("click", () => { shown = !shown; showPassword(); });
elements.copy.addEventListener("click", async () => {
  if (!currentPassword) return;
  try {
    await navigator.clipboard.writeText(currentPassword);
    elements.feedback.textContent = "Copied to clipboard. Save it in a trusted password manager.";
  } catch {
    elements.feedback.textContent = "Clipboard access unavailable. Use a secure browser context or manually select the password.";
  }
});
if (!globalThis.crypto || typeof globalThis.crypto.getRandomValues !== "function") {
  elements.password.textContent = "Secure randomness unavailable";
  elements.generate.disabled = true;
  setError("This browser cannot provide cryptographic randomness. Use an up-to-date browser over HTTPS.");
} else {
  generate();
}
