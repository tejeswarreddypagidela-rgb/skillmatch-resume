// Shared theme toggle -- included on every page so the dark/light choice
// (and the click-to-reveal animation) behaves identically site-wide.
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.getElementById("themeToggle").setAttribute(
    "aria-label",
    theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
  );
  try {
    localStorage.setItem("skillmatch-theme", theme);
  } catch (e) {}
}

applyTheme(document.documentElement.getAttribute("data-theme") || "light");

document.getElementById("themeToggle").addEventListener("click", (e) => {
  const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  const next = current === "dark" ? "light" : "dark";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.startViewTransition || reducedMotion) {
    applyTheme(next);
    return;
  }

  // Circular reveal expanding from the click point, via the View
  // Transitions API: startViewTransition snapshots old vs. new state, then
  // we animate a clip-path on the new snapshot ourselves so it "wipes in"
  // instead of the default cross-fade (disabled in CSS for ::view-transition).
  const x = e.clientX;
  const y = e.clientY;
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  const transition = document.startViewTransition(() => applyTheme(next));
  transition.ready.then(() => {
    // ready can reject (e.g. an overlapping transition, or the tab being
    // backgrounded mid-animation) -- the theme itself is already applied
    // synchronously above, so a failed reveal animation is just cosmetic.
    const clipAnimation = document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`] },
      { duration: 550, easing: "ease-in-out", pseudoElement: "::view-transition-new(root)" }
    );
    // Without this, Chromium can leave a stale sliver of the old theme
    // painted in a corner after the clip animation finishes, until some
    // unrelated repaint (resize, scroll) happens to clear it -- the WAAPI
    // animation completing doesn't reliably trigger a fresh compositor
    // frame on its own. Forcing a layout read nudges it to repaint.
    clipAnimation.finished
      .then(() => {
        void document.documentElement.offsetHeight;
      })
      .catch(() => {});
  }).catch(() => {});
});
