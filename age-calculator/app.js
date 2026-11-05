"use strict";

const form = document.getElementById("age-form");
const dobField = document.getElementById("birth-date");
const asofField = document.getElementById("as-of-date");
const errorBox = document.getElementById("form-error");
const empty = document.getElementById("result-empty");
const details = document.getElementById("result-details");
const status = document.getElementById("result-status");
const todayButton = document.getElementById("today-btn");
const copyButton = document.getElementById("copy-result");
const copyStatus = document.getElementById("copy-status");
let latestSummary = "";

const formatNumber = number => number.toLocaleString("en-US");
const two = number => String(number).padStart(2, "0");

function todayString() {
  const now = new Date();
  return [now.getFullYear(), two(now.getMonth() + 1), two(now.getDate())].join("-");
}

function parseDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (year < 1900 || year > 9999 || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day ? date : null;
}

function addMonthsClamped(date, numberOfMonths) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + numberOfMonths;
  const first = new Date(Date.UTC(year, month, 1));
  const lastDay = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  return new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), Math.min(date.getUTCDate(), lastDay)));
}

function daysBetween(start, end) {
  return Math.round((end.getTime() - start.getTime()) / 86400000);
}

function calendarAge(dob, asof) {
  let completedMonths = (asof.getUTCFullYear() - dob.getUTCFullYear()) * 12 +
    asof.getUTCMonth() - dob.getUTCMonth();
  if (addMonthsClamped(dob, completedMonths) > asof) completedMonths--;
  const anniversary = addMonthsClamped(dob, completedMonths);
  return {
    years: Math.floor(completedMonths / 12),
    months: completedMonths % 12,
    days: daysBetween(anniversary, asof),
    completedMonths,
    totalDays: daysBetween(dob, asof)
  };
}

function nextBirthday(dob, asof) {
  let year = asof.getUTCFullYear();
  const birthdayForYear = y => {
    const lastDay = new Date(Date.UTC(y, dob.getUTCMonth() + 1, 0)).getUTCDate();
    return new Date(Date.UTC(y, dob.getUTCMonth(), Math.min(dob.getUTCDate(), lastDay)));
  };
  let birthday = birthdayForYear(year);
  if (birthday < asof) birthday = birthdayForYear(++year);
  return { date: birthday, days: daysBetween(asof, birthday) };
}

function pretty(date, options = { year: "numeric", month: "long", day: "numeric" }) {
  return new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" }).format(date);
}

function setResult(id, value) {
  document.getElementById(id).textContent = value;
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.hidden = false;
}

function calculate() {
  errorBox.hidden = true;
  copyStatus.textContent = "";
  const dob = parseDate(dobField.value);
  const asof = parseDate(asofField.value);
  if (!dob || !asof) {
    showError("Please enter a valid date of birth and an age-as-on date.");
    return;
  }
  if (dob > asof) {
    showError("The date of birth cannot be later than the age-as-on date.");
    return;
  }
  const age = calendarAge(dob, asof);
  const next = nextBirthday(dob, asof);
  const bornWeekday = pretty(dob, { weekday: "long" });
  const birthdayText = pretty(next.date, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  setResult("result-on", pretty(asof));
  setResult("years", formatNumber(age.years));
  setResult("months", age.months);
  setResult("days", age.days);
  setResult("total-days", formatNumber(age.totalDays));
  setResult("total-weeks", formatNumber(Math.floor(age.totalDays / 7)) + " full weeks");
  setResult("total-months", formatNumber(age.completedMonths));
  setResult("birth-weekday", bornWeekday);
  setResult("next-birthday", birthdayText);
  setResult("birthday-countdown", next.days === 0 ? "Happy birthday!" :
    `${formatNumber(next.days)} day${next.days === 1 ? "" : "s"} to go · Turning ${next.date.getUTCFullYear() - dob.getUTCFullYear()}`);
  latestSummary = `Age as on ${pretty(asof)}: ${age.years} years, ${age.months} months, ${age.days} days. Total days: ${formatNumber(age.totalDays)}. Next birthday: ${birthdayText}.`;
  empty.hidden = true;
  details.hidden = false;
  status.textContent = "Calculated";
}

todayButton.addEventListener("click", () => {
  asofField.value = todayString();
  if (dobField.value) calculate();
});
form.addEventListener("submit", event => {
  event.preventDefault();
  calculate();
});
form.addEventListener("reset", () => {
  window.requestAnimationFrame(() => {
    asofField.value = todayString();
    empty.hidden = false;
    details.hidden = true;
    errorBox.hidden = true;
    copyStatus.textContent = "";
    status.textContent = "Ready";
    latestSummary = "";
  });
});
copyButton.addEventListener("click", async () => {
  if (!latestSummary) return;
  try {
    await navigator.clipboard.writeText(latestSummary);
    copyStatus.textContent = "Result copied.";
  } catch {
    copyStatus.textContent = "Unable to copy automatically. Please select the result text.";
  }
});
asofField.value = todayString();
dobField.max = todayString();
