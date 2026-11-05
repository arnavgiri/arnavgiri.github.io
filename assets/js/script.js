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

// Give below-the-fold sections a restrained, one-time entrance on observation.
// Content remains visible when motion is reduced or IntersectionObserver is unavailable.
if (root.classList.contains("motion-enabled") && "IntersectionObserver" in window) {
  const revealTargets = document.querySelectorAll(
    ".strip, #work .section-top, #work .project, #services .section-top, " +
    "#services .service, #about .section-name, #about .about-copy, " +
    ".contact-head, .contact h2, .contact-actions, .footer"
  );
  revealTargets.forEach(element => element.classList.add("scroll-reveal"));
  root.classList.add("scroll-ready");

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -24px 0px" });

  revealTargets.forEach(element => revealObserver.observe(element));

  window.addEventListener("pageshow", event => {
    if (event.persisted) {
      revealObserver.disconnect();
      root.classList.remove("scroll-ready");
    }
  });
}
