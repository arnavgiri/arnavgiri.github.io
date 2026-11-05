"use strict";

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

// Play the hero heading and portrait entrance once, without scroll observers.
const root = document.documentElement;
if (root.classList.contains("motion-enabled")) {
  const targets = document.querySelectorAll(
    ".hero-index, .hero h1 .line, .hero-lead, .hero-actions, .portrait-wrap"
  );
  requestAnimationFrame(() => {
    targets.forEach(element => element.classList.add("is-visible"));
  });

  // Restored pages should show their final state without replaying the entrance.
  window.addEventListener("pageshow", event => {
    if (event.persisted) {
      root.classList.remove("motion-enabled");
    }
  });
}
