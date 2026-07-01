function initOfferCardPress(root = document) {
  root.querySelectorAll(".offer-card").forEach((card) => {
    if (card.dataset.pressInit === "true") {
      return;
    }

    card.dataset.pressInit = "true";
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");

    const press = () => card.classList.add("is-pressed");
    const release = () => card.classList.remove("is-pressed");

    card.addEventListener("mousedown", press);
    card.addEventListener("touchstart", press, { passive: true });
    card.addEventListener("mouseup", release);
    card.addEventListener("mouseleave", release);
    card.addEventListener("touchend", release);
    card.addEventListener("touchcancel", release);
    card.addEventListener("blur", release);
    card.addEventListener("keydown", (event) => {
      if (event.key === " " || event.key === "Enter") {
        press();
      }
    });
    card.addEventListener("keyup", (event) => {
      if (event.key === " " || event.key === "Enter") {
        release();
      }
    });
  });
}

initOfferCardPress();
