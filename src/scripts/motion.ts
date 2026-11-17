/**
 * Motion choreography. Purposeful, small, and entirely optional:
 * - never runs under prefers-reduced-motion (content is simply visible)
 * - without JS nothing is hidden (html.motion-ok is only set by the inline head script)
 *
 * Hooks (data attributes):
 *   data-reveal              fade/rise in when scrolled into view (batched)
 *   data-hero-line           hero headline lines, staggered on load
 *   data-draw                SVG path drawn on load (hero ribbon)
 *   data-draw-scroll         SVG path drawn as its section scrolls through
 *   data-parallax="0.12"     subtle vertical drift relative to scroll
 *   data-progress            element scaled on X with section scroll progress
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

declare global {
  interface Window {
    __mfMotion?: boolean;
  }
}

const root = document.documentElement;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reduce) {
  root.classList.remove('motion-ok');
} else {
  window.__mfMotion = true;
  gsap.registerPlugin(ScrollTrigger);
  const ease = 'expo.out';

  // Hero: headline lines then supporting elements.
  const lines = gsap.utils.toArray<HTMLElement>('[data-hero-line]');
  if (lines.length) {
    gsap.fromTo(lines, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.09, ease, delay: 0.05 });
  }

  // Ribbon paths drawn once on load.
  for (const path of gsap.utils.toArray<SVGPathElement>('[data-draw]')) {
    const len = path.getTotalLength();
    gsap.fromTo(path, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut', delay: 0.2 });
  }

  // Paths drawn with scroll (process track).
  for (const path of gsap.utils.toArray<SVGPathElement>('[data-draw-scroll]')) {
    const len = path.getTotalLength();
    gsap.fromTo(
      path,
      { strokeDasharray: len, strokeDashoffset: len },
      { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: path.closest('section') ?? path, start: 'top 70%', end: 'bottom 60%', scrub: 0.6 } },
    );
  }

  for (const bar of gsap.utils.toArray<HTMLElement>('[data-progress]')) {
    gsap.fromTo(
      bar,
      { scaleX: 0 },
      { scaleX: 1, ease: 'none', transformOrigin: 'left center', scrollTrigger: { trigger: bar.closest('section') ?? bar, start: 'top 65%', end: 'bottom 70%', scrub: 0.5 } },
    );
  }

  for (const el of gsap.utils.toArray<HTMLElement>('[data-parallax]')) {
    const amount = Number(el.dataset.parallax) || 0.1;
    gsap.fromTo(
      el,
      { yPercent: -amount * 50 },
      { yPercent: amount * 50, ease: 'none', scrollTrigger: { trigger: el.parentElement ?? el, start: 'top bottom', end: 'bottom top', scrub: true } },
    );
  }

  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%',
    once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease, overwrite: true }),
  });

  // Fonts and images can change layout after load; keep trigger positions accurate.
  window.addEventListener('load', () => ScrollTrigger.refresh());
}
