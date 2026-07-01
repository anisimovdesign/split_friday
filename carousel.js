/**
 * Hero banner carousel: market → split → pay (infinite loop)
 * Auto-advance every 5s + swipe
 * Image track leads, text track follows with stagger
 */
(function initHeroCarousel() {
  const AUTOPLAY_MS = 5000;
  const TRANSITION_MS = 500;
  const TEXT_STAGGER_MS = 50;
  const ANIMATION_MS = TRANSITION_MS + TEXT_STAGGER_MS;
  const SWIPE_THRESHOLD = 40;
  const EASING = "cubic-bezier(0.45, 0, 0.55, 1)";

  const carousel = document.querySelector("[data-hero-carousel]");
  if (!carousel) {
    return;
  }

  const textTrack = carousel.querySelector('[data-hero-track="text"]');
  const imageTrack = carousel.querySelector('[data-hero-track="image"]');
  const viewport = carousel.querySelector(".hero-carousel__layer--text .hero-carousel__viewport");
  const lead = carousel.closest(".lead");
  const dotsContainer = lead?.querySelector(".hero-dots");
  const dots = Array.from(lead?.querySelectorAll(".hero-dots__item") ?? []);
  const gradients = Array.from(document.querySelectorAll("[data-hero-gradient]"));

  const textSlides = Array.from(textTrack.querySelectorAll(".hero-slide:not(.hero-slide--clone)"));
  const imageSlides = Array.from(imageTrack.querySelectorAll(".hero-slide:not(.hero-slide--clone)"));
  const slideCount = textSlides.length;

  function cloneSlide(slide) {
    const clone = slide.cloneNode(true);
    clone.classList.add("hero-slide--clone");
    clone.setAttribute("aria-hidden", "true");
    return clone;
  }

  textTrack.insertBefore(cloneSlide(textSlides[slideCount - 1]), textSlides[0]);
  imageTrack.insertBefore(cloneSlide(imageSlides[slideCount - 1]), imageSlides[0]);
  textTrack.appendChild(cloneSlide(textSlides[0]));
  imageTrack.appendChild(cloneSlide(imageSlides[0]));

  dotsContainer?.style.setProperty("--autoplay-ms", `${AUTOPLAY_MS}ms`);

  let position = 1;
  let autoplayId = null;
  let isAnimating = false;
  let touchStartX = 0;
  let touchDeltaX = 0;

  function getRealIndex(pos = position) {
    if (pos <= 0) {
      return slideCount - 1;
    }

    if (pos >= slideCount + 1) {
      return 0;
    }

    return pos - 1;
  }

  function stopProgress() {
    dots.forEach((dot) => {
      dot.classList.remove("is-progressing");
    });
  }

  function restartProgress() {
    stopProgress();

    const activeDot = dots[getRealIndex()];
    if (!activeDot?.classList.contains("is-active")) {
      return;
    }

    const fill = activeDot.querySelector(".hero-dots__fill");
    if (fill) {
      fill.style.animation = "none";
      fill.offsetWidth;
      fill.style.animation = "";
    }

    activeDot.classList.add("is-progressing");
  }

  function getSlideWidth() {
    return viewport?.clientWidth ?? carousel.clientWidth;
  }

  function applyTrackTransform(animated) {
    const offset = position * getSlideWidth();
    const transition = animated
      ? `transform ${TRANSITION_MS}ms ${EASING}`
      : "none";

    imageTrack.style.transition = transition;
    imageTrack.style.transitionDelay = "0ms";
    imageTrack.style.transform = `translateX(-${offset}px)`;

    textTrack.style.transition = transition;
    textTrack.style.transitionDelay = animated ? `${TEXT_STAGGER_MS}ms` : "0ms";
    textTrack.style.transform = `translateX(-${offset}px)`;
  }

  function syncUI(options = {}) {
    const { restartTimer = true } = options;
    const realIndex = getRealIndex();

    textTrack.querySelectorAll(".hero-slide").forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === position);
    });

    imageTrack.querySelectorAll(".hero-slide").forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === position);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === realIndex);
      dot.setAttribute("aria-current", dotIndex === realIndex ? "true" : "false");
    });

    gradients.forEach((gradient, gradientIndex) => {
      gradient.classList.toggle("is-active", gradientIndex === realIndex);
    });

    if (autoplayId !== null && restartTimer) {
      restartProgress();
    }
  }

  function snapIfNeeded() {
    if (position === slideCount + 1) {
      position = 1;
      applyTrackTransform(false);
      syncUI({ restartTimer: false });
      return;
    }

    if (position === 0) {
      position = slideCount;
      applyTrackTransform(false);
      syncUI({ restartTimer: false });
    }
  }

  function moveTo(nextPosition, animated) {
    position = nextPosition;
    applyTrackTransform(animated);
    syncUI();
  }

  function finishAnimatedMove() {
    window.setTimeout(() => {
      snapIfNeeded();
      isAnimating = false;
    }, ANIMATION_MS);
  }

  function goNext() {
    if (isAnimating) {
      return;
    }

    isAnimating = true;
    moveTo(position + 1, true);
    finishAnimatedMove();
  }

  function goPrev() {
    if (isAnimating) {
      return;
    }

    isAnimating = true;
    moveTo(position - 1, true);
    finishAnimatedMove();
  }

  function goToRealIndex(realIndex, animated = false) {
    if (isAnimating || realIndex === getRealIndex()) {
      return;
    }

    if (animated) {
      isAnimating = true;
      moveTo(realIndex + 1, true);
      finishAnimatedMove();
      return;
    }

    position = realIndex + 1;
    applyTrackTransform(false);
    syncUI();
  }

  function stopAutoplay() {
    if (autoplayId !== null) {
      window.clearInterval(autoplayId);
      autoplayId = null;
    }

    stopProgress();
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayId = window.setInterval(goNext, AUTOPLAY_MS);
    restartProgress();
  }

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener("click", () => {
      stopAutoplay();
      goToRealIndex(dotIndex);
      startAutoplay();
    });
  });

  carousel.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0].clientX;
    touchDeltaX = 0;
    stopAutoplay();
  }, { passive: true });

  carousel.addEventListener("touchmove", (event) => {
    touchDeltaX = event.changedTouches[0].clientX - touchStartX;
  }, { passive: true });

  carousel.addEventListener("touchend", () => {
    if (touchDeltaX <= -SWIPE_THRESHOLD) {
      goNext();
    } else if (touchDeltaX >= SWIPE_THRESHOLD) {
      goPrev();
    }

    startAutoplay();
  });

  carousel.addEventListener("mousedown", (event) => {
    touchStartX = event.clientX;
    touchDeltaX = 0;
    stopAutoplay();

    function onMouseMove(moveEvent) {
      touchDeltaX = moveEvent.clientX - touchStartX;
    }

    function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);

      if (touchDeltaX <= -SWIPE_THRESHOLD) {
        goNext();
      } else if (touchDeltaX >= SWIPE_THRESHOLD) {
        goPrev();
      }

      startAutoplay();
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });

  applyTrackTransform(false);
  syncUI();
  startAutoplay();

  window.addEventListener("resize", () => {
    applyTrackTransform(false);
    imageTrack.offsetHeight;
    imageTrack.style.transition = `transform ${TRANSITION_MS}ms ${EASING}`;
    textTrack.style.transition = `transform ${TRANSITION_MS}ms ${EASING}`;
  });
})();
