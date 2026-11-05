"use strict";

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

/* Reveal each section only when it enters the viewport. */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!reduceMotion && "IntersectionObserver" in window) {
  const targets = document.querySelectorAll([
    ".hero-index",
    ".hero h1 .line",
    ".hero-lead",
    ".hero-actions",
    ".portrait-wrap",
    ".strip",
    ".section-top",
    ".project",
    ".service",
    ".about-copy",
    ".contact-head",
    ".contact h2",
    ".contact-actions"
  ].join(", "));

  const observer = new IntersectionObserver((entries, currentObserver) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("is-visible");
      currentObserver.unobserve(entry.target);
    }
  }, { threshold: 0.08, rootMargin: "0px 0px -18px 0px" });

  for (const element of targets) {
    element.classList.add("reveal-on-scroll");
    observer.observe(element);
  }
}
