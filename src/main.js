import "./style.css";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { mountShell } from "./shell.js";

gsap.registerPlugin(ScrollTrigger);

mountShell();

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

function initSmoothScroll() {
  if (reduceMotion) return null;

  const lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target, { offset: -20 });
      closeMobileNav();
    });
  });

  return lenis;
}

function initReveals() {
  if (reduceMotion) {
    document.querySelectorAll(".reveal").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    return;
  }

  gsap.utils.toArray(".reveal").forEach((el, index) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: "power3.out",
      delay: Math.min(index % 5, 3) * 0.04,
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        once: true,
      },
    });
  });

  gsap.utils.toArray(".section__rule").forEach((rule) => {
    gsap.fromTo(
      rule,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: 1.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: rule,
          start: "top 90%",
          once: true,
        },
      }
    );
  });
}

function initHero() {
  const media = document.querySelector("[data-parallax]");
  const img = media?.querySelector("img");
  const brandBits = document.querySelectorAll(
    ".hero__brand, .hero__title-sub, .eyebrow, .hero__content .text-link"
  );

  if (!reduceMotion && brandBits.length) {
    gsap.fromTo(
      brandBits,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 1.1,
        stagger: 0.12,
        ease: "power3.out",
        delay: 0.15,
      }
    );
  } else {
    brandBits.forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
  }

  if (!media || !img || reduceMotion) return;

  gsap.to(img, {
    yPercent: 14,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });
}

function initChroma() {
  if (reduceMotion || !finePointer) {
    document.querySelectorAll(".rgb-split").forEach((el) => el.classList.remove("rgb-split"));
    return;
  }

  const offR = document.querySelector('#rgb-split feOffset[result="offR"]');
  const offB = document.querySelector('#rgb-split feOffset[result="offB"]');
  if (!offR || !offB) return;

  // Base lens fringe on content edges; mouse only nudges strength (no spotlight).
  window.addEventListener(
    "pointermove",
    (event) => {
      const ax = event.clientX / window.innerWidth * 2 - 1;
      const ay = event.clientY / window.innerHeight * 2 - 1;
      const dx = (1.1 + Math.abs(ax) * 1.4).toFixed(2);
      const dy = (ay * 0.55).toFixed(2);
      offR.setAttribute("dx", String(-dx));
      offR.setAttribute("dy", String(-dy));
      offB.setAttribute("dx", dx);
      offB.setAttribute("dy", dy);
    },
    { passive: true }
  );
}

function initSoonSlider() {
  const root = document.querySelector("[data-soon-slider]");
  if (!root) return;

  const track = root.querySelector(".soon-slider__track");
  const slides = [...root.querySelectorAll(".soon-slider__slide")];
  const dotsWrap = root.querySelector("[data-soon-dots]");
  const prev = root.querySelector("[data-soon-prev]");
  const next = root.querySelector("[data-soon-next]");
  if (!track || slides.length < 2) return;

  let index = 0;
  let timer;

  slides.forEach((_, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("aria-label", `Slide ${i + 1}`);
    btn.addEventListener("click", () => go(i));
    dotsWrap?.appendChild(btn);
  });

  const dots = [...(dotsWrap?.querySelectorAll("button") || [])];

  function render() {
    track.style.transform = `translate3d(${-index * 100}%, 0, 0)`;
    slides.forEach((slide, i) => slide.classList.toggle("is-active", i === index));
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
  }

  function go(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    render();
    restart();
  }

  function restart() {
    clearInterval(timer);
    timer = setInterval(() => go(index + 1), 5200);
  }

  prev?.addEventListener("click", () => go(index - 1));
  next?.addEventListener("click", () => go(index + 1));
  root.addEventListener("pointerenter", () => clearInterval(timer));
  root.addEventListener("pointerleave", restart);

  render();
  restart();
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

function initReelPlayer() {
  const trigger = document.querySelector("[data-reel]");
  const bg = trigger?.querySelector("video");
  const overlay = document.getElementById("reel-player");
  if (!trigger || !bg || !overlay) return;

  const player = overlay.querySelector(".player__video");
  const preroll = overlay.querySelector("[data-preroll]");
  const mark = preroll?.querySelector("img");
  const playBtn = overlay.querySelector("[data-play]");
  const muteBtn = overlay.querySelector("[data-mute]");
  const seek = overlay.querySelector("[data-seek]");
  const timeEl = overlay.querySelector("[data-time]");
  const durEl = overlay.querySelector("[data-dur]");
  const fullBtn = overlay.querySelector("[data-full]");
  const backBtn = overlay.querySelector("[data-close]");
  let opening = false;

  player.src = "/video/MAG_REEL_v01.mp4";
  player.disableRemotePlayback = true;
  player.removeAttribute("controls");
  player.controls = false;

  const setPlaying = (playing) => {
    overlay.classList.toggle("is-playing", playing);
    playBtn.setAttribute("aria-label", playing ? "Pause" : "Play");
  };

  const setMuted = (muted) => {
    overlay.classList.toggle("is-muted", muted);
    muteBtn.setAttribute("aria-label", muted ? "Unmute" : "Mute");
  };

  const runPreroll = () =>
    new Promise((resolve) => {
      if (!preroll || !mark || reduceMotion) {
        resolve();
        return;
      }

      overlay.classList.add("is-preroll");
      gsap.set(preroll, { opacity: 1, visibility: "visible" });
      gsap.set(player, { opacity: 0 });
      gsap.set(".player__bar", { opacity: 0 });
      gsap.set(mark, { scale: 0.72, opacity: 0, rotate: -8 });

      const tl = gsap.timeline({
        onComplete: () => {
          overlay.classList.remove("is-preroll");
          resolve();
        },
      });

      tl.to(mark, {
        opacity: 1,
        scale: 1,
        rotate: 0,
        duration: 0.55,
        ease: "power3.out",
      })
        .to(mark, {
          scale: 1.08,
          duration: 0.35,
          ease: "power1.inOut",
        })
        .to(mark, {
          opacity: 0,
          scale: 1.35,
          duration: 0.45,
          ease: "power2.in",
        })
        .to(
          preroll,
          {
            opacity: 0,
            duration: 0.25,
            onComplete: () => {
              gsap.set(preroll, { visibility: "hidden" });
            },
          },
          "-=0.1"
        )
        .to(player, { opacity: 1, duration: 0.35 }, "-=0.15")
        .to(".player__bar", { opacity: 1, duration: 0.3 }, "<");
    });

  const zoomFromHero = () => {
    gsap.set(".player__bar, .player__top", { opacity: 0 });
    gsap.fromTo(
      overlay,
      { scale: 0.92, opacity: 0.35 },
      {
        scale: 1,
        opacity: 1,
        duration: reduceMotion ? 0 : 0.55,
        ease: "power3.out",
      }
    );
    gsap.to(".player__top", {
      opacity: 1,
      duration: 0.3,
      delay: reduceMotion ? 0 : 0.2,
    });
  };

  const open = async () => {
    if (opening || !overlay.hidden) return;
    opening = true;
    overlay.hidden = false;
    document.body.classList.add("player-open");
    bg.pause();
    player.pause();
    player.currentTime = 0;
    player.muted = false;
    player.volume = 1;
    setMuted(false);
    setPlaying(false);
    overlay.style.setProperty("--played", "0%");
    seek.value = "0";
    timeEl.textContent = "0:00";
    zoomFromHero();
    await runPreroll();
    try {
      await player.play();
    } catch {
      setPlaying(false);
    }
    opening = false;
  };

  const close = () => {
    const finish = () => {
      overlay.hidden = true;
      overlay.classList.remove("is-preroll");
      document.body.classList.remove("player-open");
      gsap.set(overlay, { clearProps: "transform,scale,opacity" });
      gsap.set(player, { clearProps: "opacity" });
      gsap.set(preroll, { clearProps: "opacity,visibility" });
      bg.currentTime = 0;
      bg.muted = true;
      bg.play().catch(() => {});
    };

    player.pause();
    if (reduceMotion) {
      finish();
      return;
    }
    gsap.to(".player__bar, .player__top, .player__preroll", { opacity: 0, duration: 0.2 });
    gsap.to(overlay, {
      scale: 1.04,
      opacity: 0,
      duration: 0.35,
      ease: "power2.in",
      onComplete: finish,
    });
  };

  trigger.addEventListener("click", open);
  backBtn.addEventListener("click", close);
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !overlay.hidden) close();
  });

  playBtn.addEventListener("click", () => {
    if (player.paused) player.play();
    else player.pause();
  });
  player.addEventListener("click", () => {
    if (player.paused) player.play();
    else player.pause();
  });
  player.addEventListener("play", () => setPlaying(true));
  player.addEventListener("pause", () => setPlaying(false));

  muteBtn.addEventListener("click", () => {
    player.muted = !player.muted;
    setMuted(player.muted);
  });

  player.addEventListener("loadedmetadata", () => {
    durEl.textContent = formatTime(player.duration);
  });

  player.addEventListener("timeupdate", () => {
    if (!player.duration) return;
    seek.value = String(Math.round((player.currentTime / player.duration) * 1000));
    overlay.style.setProperty("--played", `${(player.currentTime / player.duration) * 100}%`);
    timeEl.textContent = formatTime(player.currentTime);
    durEl.textContent = formatTime(player.duration);
  });

  seek.addEventListener("input", () => {
    if (!player.duration) return;
    player.currentTime = (Number(seek.value) / 1000) * player.duration;
    overlay.style.setProperty("--played", `${(Number(seek.value) / 1000) * 100}%`);
  });

  fullBtn.addEventListener("click", async () => {
    if (!document.fullscreenElement) {
      await overlay.requestFullscreen?.();
    } else {
      await document.exitFullscreen?.();
    }
  });
}

function initServiceList() {
  const items = [...document.querySelectorAll(".service-list li")];
  if (!items.length) return;

  const setActive = (active) => {
    items.forEach((item) => item.classList.toggle("is-active", item === active));
  };

  setActive(items[6] || items[0]);

  items.forEach((item) => {
    item.addEventListener("mouseenter", () => setActive(item));
    item.addEventListener("focus", () => setActive(item));
  });
}

function initCursor() {
  if (!finePointer || reduceMotion) return;

  const cursor = document.querySelector(".cursor");
  const dot = document.querySelector(".cursor__dot");
  const ring = document.querySelector(".cursor__ring");
  if (!cursor || !dot || !ring) return;

  document.body.classList.add("has-custom-cursor");

  const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const ringPos = { x: pos.x, y: pos.y };

  window.addEventListener("pointermove", (event) => {
    pos.x = event.clientX;
    pos.y = event.clientY;
    gsap.set(dot, { x: pos.x, y: pos.y });
  });

  gsap.ticker.add(() => {
    ringPos.x += (pos.x - ringPos.x) * 0.18;
    ringPos.y += (pos.y - ringPos.y) * 0.18;
    gsap.set(ring, { x: ringPos.x, y: ringPos.y });
  });

  document.querySelectorAll("[data-cursor]").forEach((el) => {
    const mode = el.getAttribute("data-cursor");
    el.addEventListener("pointerenter", () => {
      document.body.classList.add(mode === "media" ? "cursor-media" : "cursor-link");
    });
    el.addEventListener("pointerleave", () => {
      document.body.classList.remove("cursor-link", "cursor-media");
    });
  });
}

function closeMobileNav() {
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector(".mobile-nav");
  if (!menuToggle || !mobileNav) return;
  menuToggle.setAttribute("aria-expanded", "false");
  mobileNav.hidden = true;
  document.body.style.overflow = "";
}

function initMobileNav() {
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector(".mobile-nav");
  if (!menuToggle || !mobileNav) return;

  menuToggle.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!open));
    mobileNav.hidden = open;
    document.body.style.overflow = open ? "" : "hidden";
  });

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMobileNav);
  });
}

initSmoothScroll();
initHero();
initReveals();
initServiceList();
initCursor();
initMobileNav();
initChroma();
initSoonSlider();
initReelPlayer();
