"use strict";
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

/* Scroll reveals are progressive enhancements; content stays visible without JS. */
if ("IntersectionObserver" in window &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const targets = document.querySelectorAll(
    ".strip, .section-top, .project, .service, .about-copy, .contact-head, .contact h2, .contact-actions"
  );
  if (targets.length) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      }
    }, { threshold: 0.08, rootMargin: "0px 0px -24px 0px" });

    for (const element of targets) {
      element.classList.add("reveal-on-scroll");
      if (element.getBoundingClientRect().top < window.innerHeight + 24) {
        element.classList.add("is-visible");
      } else {
        observer.observe(element);
      }
    }
    document.documentElement.classList.add("motion-ready");
  }
}
