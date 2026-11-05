"use strict";

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

const motionRoot = document.documentElement;

if (motionRoot.classList.contains("motion-enabled") && "IntersectionObserver" in window) {
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
  }, { threshold: 0.05, rootMargin: "0px 0px 24px 0px" });

  for (const element of targets) {
    element.classList.add("reveal-on-scroll");
    observer.observe(element);
  }

  // Unhide immediately when navigating back to a restored page and avoid
  // replaying reveal animations after the browser restores its page cache.
  window.addEventListener("pageshow", event => {
    if (!event.persisted) return;
    observer.disconnect();
    targets.forEach(element => {
      element.classList.remove("reveal-on-scroll");
      element.classList.add("is-visible");
    });
  });
} else {
  motionRoot.classList.remove("motion-enabled");
}
