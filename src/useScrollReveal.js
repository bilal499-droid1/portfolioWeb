import { useLayoutEffect } from 'react'

// Scroll and entrance choreography for the whole page.
//
//   data-reveal="<variant>"  eases the element in the first time it scrolls into view
//   data-reveal-delay="ms"   holds it back a little longer (for a child of a revealed block)
//   data-hero="<order>"      plays on load instead of on scroll, in this order (the hero)
//
// Variants share one easing and timing and differ only in how the element arrives:
// up-sm / up / up-lg rise by increasing distances, scale rises and settles from 98%,
// left / right slide sideways, down drops in (the header), and fade / fade-slow only
// fade. Elements that come into view together are staggered ~90ms apart.
//
// Scrolling back up is handled too: an element that scrolls out of the bottom of the
// screen is re-armed and eases in again on the way back down, and one that arrives
// from the top edge drops in instead of rising.
//
// How it stays safe:
// - It animates with the Web Animations API, so an element's own classes, transitions
//   and hover effects are untouched, and only opacity and transform ever move.
// - Nothing is hidden by CSS. An element is held hidden only by an animation this hook
//   owns, so if the hook is torn down, errors, or a hot reload replaces the element,
//   the element is simply visible. Cleanup cancels every animation.
// - Elements already on screen at load are left alone (bar the hero, which animates in).
// - A debounced sweep after scrolling stops reveals anything on screen that the observer
//   somehow missed, so nothing stays hidden.
// - Reduced motion, or no IntersectionObserver / Web Animations: nothing is armed.

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'
const DURATION = 900 // ms
const STAGGER = 90 // ms between elements that arrive together
const MAX_STEPS = 5 // caps the stagger so a busy screen doesn't drag
const ENTER_RATIO = 0.15 // how much of an element must be on screen to trigger it
const HERO_START = 120 // ms
const HERO_STAGGER = 110 // ms per step of data-hero order

// x / y in px, s = starting scale, d = duration multiplier.
const VARIANTS = {
  up: { y: 44 },
  'up-sm': { y: 28 },
  'up-lg': { y: 64 },
  scale: { y: 36, s: 0.98 },
  left: { x: -44 },
  right: { x: 44 },
  down: { y: -24 },
  fade: {},
  'fade-slow': { d: 1.7 },
}

// The from-state of an element's entrance. There is no end keyframe (offset 0 marks
// this one as the start), so the animation settles on whatever the element's own
// styles say. Phones get shorter, quicker moves, and sideways slides become rises so
// nothing can push the page wider than the screen.
function motion(el, fromAbove) {
  const v = VARIANTS[el.getAttribute('data-reveal')] || VARIANTS.up
  const compact = window.matchMedia('(max-width: 767px)').matches
  let x = v.x || 0
  let y = v.y || 0
  if (compact) {
    if (x) y = 30
    x = 0
    y *= 0.55
  }
  if (fromAbove && y > 0) y = -y * 0.6 // arriving from the top edge: drop in rather than rise

  const from = { opacity: 0, offset: 0 }
  if (x || y || v.s) {
    from.transform = `translate3d(${x}px, ${y}px, 0)${v.s ? ` scale(${v.s})` : ''}`
  }
  return { from, duration: DURATION * (v.d || 1) * (compact ? 0.75 : 1) }
}

const hiddenFor = (el) => {
  // Holds the element at opacity 0 without touching its styles: a paused animation.
  const hold = el.animate([{ opacity: 0, offset: 0 }], { duration: 1, fill: 'both' })
  hold.pause()
  hold.currentTime = 0
  return hold
}

function useScrollReveal() {
  useLayoutEffect(() => {
    const supported =
      'IntersectionObserver' in window &&
      typeof Element.prototype.animate === 'function' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!supported) return

    const records = new Map() // element -> { holding, hold, run }
    const timers = new Set()
    let observer
    let idle = 0
    let heroStarted = false

    const cancelAll = () => {
      for (const rec of records.values()) {
        rec.hold?.cancel()
        rec.run?.cancel()
      }
      records.clear()
    }

    // Lifts the hold and starts the entrance in the same task, so there's no frame
    // between them. The animation holds its first keyframe through any delay.
    const reveal = (el, delay = 0, fromAbove = false) => {
      const rec = records.get(el)
      if (!rec?.holding) return
      rec.holding = false
      const { from, duration } = motion(el, fromAbove)
      rec.hold.cancel()
      rec.hold = null
      rec.run = el.animate([from], {
        duration,
        delay: delay + (Number(el.getAttribute('data-reveal-delay')) || 0),
        easing: EASE,
        fill: 'backwards',
      })
    }

    const rearm = (el) => {
      const rec = records.get(el)
      if (!rec || rec.holding) return
      rec.run?.cancel()
      rec.run = null
      rec.hold = hiddenFor(el)
      rec.holding = true
    }

    const track = (el) => {
      records.set(el, { holding: true, hold: hiddenFor(el), run: null })
    }

    // Anything holding that is on screen right now gets revealed. A backstop for a
    // missed observer callback, run when scrolling settles.
    const sweep = () => {
      for (const [el, rec] of records) {
        if (!rec.holding || el.hasAttribute('data-hero')) continue
        const r = el.getBoundingClientRect()
        if (r.bottom > 0 && r.top < window.innerHeight * 0.85) reveal(el)
      }
    }
    const onScroll = () => {
      clearTimeout(idle)
      idle = setTimeout(sweep, 220)
    }

    try {
      observer = new IntersectionObserver(
        (entries) => {
          const arriving = []
          for (const entry of entries) {
            const rec = records.get(entry.target)
            if (!rec) continue
            if (entry.isIntersecting && entry.intersectionRatio >= ENTER_RATIO) {
              if (rec.holding) arriving.push(entry)
            } else if (!entry.isIntersecting && !rec.holding) {
              // Fully off the bottom of the screen (the reader scrolled back up past it).
              const below = entry.boundingClientRect.top >= (entry.rootBounds?.height ?? window.innerHeight)
              if (below) rearm(entry.target)
            }
          }
          arriving
            .sort(
              (a, b) =>
                a.boundingClientRect.top - b.boundingClientRect.top ||
                a.boundingClientRect.left - b.boundingClientRect.left,
            )
            .forEach((entry, i) => {
              const fromAbove = entry.boundingClientRect.top < 0
              reveal(entry.target, Math.min(i, MAX_STEPS) * STAGGER, fromAbove)
            })
        },
        { threshold: [0, ENTER_RATIO] },
      )

      const hero = []
      for (const el of document.querySelectorAll('[data-reveal]')) {
        if (el.hasAttribute('data-hero')) {
          track(el)
          hero.push(el)
        } else if (el.getBoundingClientRect().top >= window.innerHeight) {
          // Below the fold. Anything already on screen at load is left visible.
          track(el)
          observer.observe(el)
        }
      }

      // The hero plays once the fonts are in (or after a short wait), so text doesn't
      // swap mid-entrance. A backstop timer guarantees it plays regardless.
      const playHero = () => {
        if (heroStarted) return
        heroStarted = true
        requestAnimationFrame(() => {
          for (const el of hero) reveal(el, HERO_START + (Number(el.getAttribute('data-hero')) || 0) * HERO_STAGGER)
        })
      }
      if (hero.length) {
        const ready = document.fonts?.ready
        if (ready) ready.then(playHero, playHero)
        for (const [ms, fn] of [
          [450, playHero],
          [2500, sweep],
        ]) {
          const t = setTimeout(fn, ms)
          timers.add(t)
        }
      }
      timers.add(setTimeout(sweep, 1500))

      window.addEventListener('scroll', onScroll, { passive: true })
    } catch {
      observer?.disconnect()
      cancelAll() // every element goes back to being plainly visible
    }

    return () => {
      window.removeEventListener('scroll', onScroll)
      clearTimeout(idle)
      timers.forEach(clearTimeout)
      observer?.disconnect()
      cancelAll()
    }
  }, [])
}

export default useScrollReveal
