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
  if (reduceMotion || !finePointer) return;
  const root = document.documentElement;

  window.addEventListener(
    "pointermove",
    (event) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = (event.clientY / window.innerHeight) * 2 - 1;
      root.style.setProperty("--ab-x", x.toFixed(3));
      root.style.setProperty("--ab-y", y.toFixed(3));
    },
    { passive: true }
  );
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
  const dialog = document.getElementById("reel-player");
  if (!trigger || !bg || !dialog) return;

  const player = dialog.querySelector(".player__video");
  const playBtn = dialog.querySelector("[data-play]");
  const muteBtn = dialog.querySelector("[data-mute]");
  const seek = dialog.querySelector("[data-seek]");
  const vol = dialog.querySelector("[data-vol]");
  const fullBtn = dialog.querySelector("[data-full]");
  const closeBtn = dialog.querySelector("[data-close]");
  const src = bg.currentSrc || bg.querySelector("source")?.src;
  if (src) player.src = src;

  const syncPlayLabel = () => {
    playBtn.textContent = player.paused ? "Play" : "Pause";
  };

  const open = async () => {
    bg.pause();
    player.currentTime = bg.currentTime || 0;
    player.muted = false;
    player.volume = Number(vol.value);
    dialog.showModal();
    try {
      await player.play();
    } catch {
      /* autoplay with sound may need a second click */
    }
    syncPlayLabel();
  };

  const close = () => {
    player.pause();
    bg.currentTime = player.currentTime || 0;
    bg.muted = true;
    bg.play().catch(() => {});
    dialog.close();
  };

  trigger.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) close();
  });
  dialog.addEventListener("close", () => {
    player.pause();
    bg.play().catch(() => {});
  });

  playBtn.addEventListener("click", () => {
    if (player.paused) player.play();
    else player.pause();
  });
  player.addEventListener("play", syncPlayLabel);
  player.addEventListener("pause", syncPlayLabel);

  muteBtn.addEventListener("click", () => {
    player.muted = !player.muted;
    muteBtn.textContent = player.muted ? "Muted" : "Sound";
  });

  vol.addEventListener("input", () => {
    player.volume = Number(vol.value);
    player.muted = player.volume === 0;
    muteBtn.textContent = player.muted ? "Muted" : "Sound";
  });

  player.addEventListener("timeupdate", () => {
    if (!player.duration) return;
    seek.value = String(Math.round((player.currentTime / player.duration) * 1000));
    playBtn.title = `${formatTime(player.currentTime)} / ${formatTime(player.duration)}`;
  });

  seek.addEventListener("input", () => {
    if (!player.duration) return;
    player.currentTime = (Number(seek.value) / 1000) * player.duration;
  });

  fullBtn.addEventListener("click", async () => {
    const node = dialog.querySelector(".player__shell");
    if (!document.fullscreenElement) {
      await node.requestFullscreen?.();
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
initReelPlayer();
