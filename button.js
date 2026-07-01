/**
 * Auto-triggered countdown button animation.
 * 6s idle → roll animation → 6s later → black CTA state
 */
const AUTO_START_MS = 6000;
const EXIT_DELAY_MS = 6000;
const EXIT_DURATION_MS = 620;
const ANIMATION_TO_CTA_MS = EXIT_DELAY_MS + EXIT_DURATION_MS;

function getButtonLabel(state) {
  return state === "cta" ? "Вперёд к покупкам" : "2 часа до начала";
}

function playAnimation(button) {
  if (button.classList.contains("is-animating") || button.classList.contains("is-cta")) {
    return;
  }

  button.classList.add("is-animating");
  button.setAttribute("aria-label", "Анимация…");

  window.setTimeout(() => {
    button.classList.remove("is-animating");
    button.classList.add("is-cta");
    button.setAttribute("aria-label", getButtonLabel("cta"));
  }, ANIMATION_TO_CTA_MS);
}

function initAnimatedButton(button) {
  if (!button || button.dataset.animatedButtonInit === "true") {
    return;
  }

  button.dataset.animatedButtonInit = "true";
  button.setAttribute("aria-label", getButtonLabel("countdown"));
  button.style.setProperty("--exit-delay", `${EXIT_DELAY_MS}ms`);

  window.setTimeout(() => {
    playAnimation(button);
  }, AUTO_START_MS);
}

function initAnimatedButtons(root = document) {
  root.querySelectorAll(".button").forEach(initAnimatedButton);
}

initAnimatedButtons();
