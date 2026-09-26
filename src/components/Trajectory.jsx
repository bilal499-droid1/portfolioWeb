import { useEffect, useRef } from 'react'
import HalftoneField from './HalftoneField'

// Sixth screen ("Trajectory"), measured from suv5.png (a 510px-wide mock-up).
//
// ⚠ COPY IS PLACEHOLDER. suv5.png is 510px wide for a full page, which puts the
// body text at roughly 2px per character — unreadable at any magnification. The
// date ranges, the role titles and the section header below were legible and are
// taken from the mock-up. Every `aside`, `badge`, `subtitle`, `body`, `bullets`
// and `tags` value is a stand-in of the right length so the layout matches; swap
// them for the real copy.
const ENTRIES = [
  {
    range: 'DevOps Trainee at INARA Technologies',
    badge: 'Forward Decade',
    title: 'Design Systems Lead & AI UX Architect',
    aside: 'Active Practice',
    subtitle: 'Focus line for this role goes here',
    body: 'Replace this paragraph with the description for this role. At this width it runs to about three lines, which is what the mock-up shows for the opening entry.',
    bullets: [
      'Replace with the first achievement for this role',
      'Replace with the second achievement for this role',
    ],
    tags: ['Primary Tag', 'Second Tag', 'Third Tag', 'Fourth Tag'],
    featured: true,
  },
  {
    range: 'Junior UI/UX Designer at Hexler Tech',
    badge: 'Lead Chapter',
    title: 'Lead UI/UX Designer & Technologist',
    aside: 'Studio / Contract',
    subtitle: 'Focus line for this role goes here',
    body: 'Replace this paragraph with the description for this role. At this width it runs to about three lines, matching the mock-up.',
    bullets: ['Replace with the first achievement', 'Replace with the second achievement'],
    tags: ['Primary Tag', 'Second Tag', 'Third Tag'],
  },
  {
    range: 'UI/UX and Development Intern at INARA Technologies',
    badge: 'Scale Up',
    title: 'Senior Product Designer',
    aside: 'Product Systems',
    subtitle: 'Focus line for this role goes here',
    body: 'Replace this paragraph with the description for this role. At this width it runs to about three lines, matching the mock-up.',
    bullets: ['Replace with the first achievement', 'Replace with the second achievement'],
    tags: ['Primary Tag', 'Second Tag', 'Third Tag'],
  },
  {
    range: '2021 — 2025 BS in Software Engineering from University of Engineering and Technology, Taxila',
    badge: 'Agency & Labs',
    title: 'UI/UX Designer & Frontend Dev',
    aside: 'Agency Work',
    subtitle: 'Focus line for this role goes here',
    body: 'Replace this paragraph with the description for this role. At this width it runs to about two lines, matching the mock-up.',
    bullets: ['Replace with the first achievement'],
    tags: ['Primary Tag', 'Second Tag', 'Third Tag'],
  },
  {
    range: 'Creative Design Freelancer since 2023',
    badge: 'Digital Shift',
    title: 'Visual & Interaction Designer',
    aside: 'Early Practice',
    subtitle: 'Focus line for this role goes here',
    body: 'Replace this paragraph with the description for this role. At this width it runs to about two lines, matching the mock-up.',
    bullets: ['Replace with the first achievement'],
    tags: ['Primary Tag', 'Second Tag', 'Third Tag'],
  },
  {
    range: '2013 — 2017',
    badge: 'Academic Foundation',
    title: 'B.S. in Computer Science & Interaction Design',
    aside: 'Education',
    subtitle: 'Focus line for this qualification goes here',
    body: 'Replace this paragraph with the description for this qualification. At this width it runs to about two lines, matching the mock-up.',
    bullets: ['Replace with a highlight from this period'],
    tags: ['Primary Tag', 'Second Tag', 'Third Tag'],
  },
]

function Entry({ entry, index, total, nodeRef }) {
  const { range, badge, title, aside, subtitle, body, bullets, tags, featured } = entry
  // The rail and its nodes fade with depth, exactly as the mock-up does.
  const fade = 1 - (index / (total - 1)) * 0.62

  return (
    <li
      data-reveal="up"
      className="group/entry relative grid grid-cols-[minmax(0,1fr)] gap-y-[1rem] border-t border-white/[0.05] pt-[1.5rem] pb-[2.2rem] sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-y-0"
    >
      {/* The red wash, on whichever entry the pointer is over. Scaled from its left
          edge so it arrives across the entry rather than just fading up in place. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 -left-[2.5rem] w-[15rem] origin-left scale-x-[0.35] rounded-r-[1.75rem] opacity-0 transition-[transform,opacity] duration-[450ms] ease-out group-hover/entry:scale-x-100 group-hover/entry:opacity-100"
        style={{
          backgroundImage:
            'linear-gradient(90deg, rgba(150,14,14,0.24) 0%, rgba(150,14,14,0.15) 58%, transparent 100%)',
        }}
      />

      {/* Left rail: date and chapter badge */}
      <div className="relative z-[1] sm:pr-[1.5rem] sm:text-right">
        <p
          className="font-mono text-[0.8125rem] leading-[1.4] tracking-[0.06em] text-balance"
          style={{ color: `rgba(255,255,255,${0.35 + 0.6 * fade})` }}
        >
          {range}
        </p>
        <p className="mt-[0.5rem] sm:flex sm:justify-end">
          <span
            className={`inline-flex items-center gap-[0.35rem] rounded-full border px-[0.55rem] py-[0.2rem] text-[0.5625rem] tracking-[0.12em] whitespace-nowrap uppercase ${
              featured
                ? 'border-[#2ea36a]/45 bg-[#0c2418]/60 text-[#4bd28d]'
                : index === 1
                  ? 'border-[#e1201a]/40 bg-[#1e0606]/60 text-[#e4665f]'
                  : 'border-white/[0.09] bg-white/[0.03] text-white/35'
            }`}
          >
            <span aria-hidden="true" className="size-[3px] rotate-45 bg-current" />
            {badge}
          </span>
        </p>
      </div>

      {/* Node sitting on the rail. Every node is a resting one now; the active marker
          is a single dot that travels the rail and sits over whichever this is. */}
      <span
        ref={nodeRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-[1.4rem] left-0 hidden -translate-x-1/2 rounded-full sm:block"
        style={{
          left: '11rem',
          width: 11,
          height: 11,
          border: `2px solid rgba(240,40,34,${0.35 + 0.65 * fade})`,
          background: '#0a0101',
        }}
      />

      {/* Right rail: the role itself */}
      <div className="relative z-[1] sm:pl-[2.6rem]">
        <div className="flex items-start justify-between gap-[1rem]">
          <h3
            className="text-[clamp(1rem,1.35vw,1.2rem)] leading-[1.25] font-semibold tracking-[-0.01em] text-white/90 transition-colors duration-300 group-hover/entry:text-[#e1201a]"
          >
            {title}
          </h3>
          <span className="mt-[0.15rem] shrink-0 text-[0.625rem] tracking-[0.04em] whitespace-nowrap text-white/25">
            {aside}
          </span>
        </div>

        <p className="mt-[0.55rem] flex items-center gap-[0.5rem] text-[0.75rem] text-[#c3221d]">
          <span aria-hidden="true" className="h-[0.85rem] w-[2px] shrink-0 bg-[#c3221d]" />
          {subtitle}
        </p>

        <p className="mt-[0.75rem] max-w-[38rem] text-[0.8125rem] leading-[1.6] text-white/38">{body}</p>

        <ul className="mt-[0.9rem] space-y-[0.3rem]">
          {bullets.map((b) => (
            <li key={b} className="flex gap-[0.55rem] text-[0.75rem] leading-[1.5] text-white/30">
              <span aria-hidden="true" className="mt-[0.5em] size-[3px] shrink-0 rounded-full bg-[#c3221d]" />
              {b}
            </li>
          ))}
        </ul>

        <ul className="mt-[1.1rem] flex flex-wrap gap-[0.4rem]">
          {tags.map((t, i) => (
            <li
              key={t}
              className={`rounded-[4px] border px-[0.55rem] py-[0.25rem] text-[0.625rem] tracking-[0.02em] ${
                featured && i === 0
                  ? 'border-[#e1201a]/50 bg-[#1e0606]/60 text-[#e4665f]'
                  : 'border-white/[0.09] bg-white/[0.03] text-white/35'
              }`}
            >
              {t}
            </li>
          ))}
        </ul>
      </div>
    </li>
  )
}

// Where down the screen the timeline reads as "now".
const ANCHOR = 0.45
// Of each gap between two nodes, the share spent sitting on a node before moving on.
// This is what makes the dot settle on an entry rather than drift past it.
const DWELL = 0.3
const DOT_SETTLE = 0.08 // s: how quickly the dot catches up to the scrollbar

const clamp01 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n)
const smoothstep = (t) => t * t * (3 - 2 * t)

// Walks a single marker down the rail as the section is scrolled, settling it on each
// entry's node in turn. Position comes straight from the scroll offset, so it runs
// backwards on the way up, and it never touches the entries' own styling — hovering
// an entry and scrolling past one stay separate things.
function useTimelineDot(rail, list, nodes, dot) {
  useEffect(() => {
    const railEl = rail.current
    const listEl = list.current
    const dotEl = dot.current
    if (!railEl || !listEl || !dotEl) return
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Each node's centre, down the rail. Built from layout offsets rather than
    // rects because the entries carry a reveal transform that would skew a rect.
    let stops = []
    const measure = () => {
      stops = nodes.current.map((el) => {
        if (!el || !el.offsetHeight) return null
        // node -> its entry (the node is absolute inside it) -> the list -> the rail.
        return listEl.offsetTop + el.offsetParent.offsetTop + el.offsetTop + el.offsetHeight / 2
      })
    }

    const target = () => {
      const last = stops.length - 1
      if (last < 0 || stops[0] == null) return null
      const y = window.innerHeight * ANCHOR - railEl.getBoundingClientRect().top
      if (y <= stops[0]) return stops[0]
      if (y >= stops[last]) return stops[last]
      for (let i = 0; i < last; i++) {
        const a = stops[i]
        const b = stops[i + 1]
        if (y < b) return a + (b - a) * smoothstep(clamp01(((y - a) / (b - a) - DWELL) / (1 - 2 * DWELL)))
      }
      return stops[last]
    }

    let want = 0
    let shown = -1
    let raf = 0
    let last = 0

    const paint = (y) => {
      dotEl.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`
    }

    const frame = (now) => {
      raf = 0
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60
      last = now
      const next = shown + (want - shown) * (1 - Math.exp(-dt / DOT_SETTLE))
      const done = Math.abs(want - next) < 0.05
      shown = done ? want : next
      paint(shown)
      if (!done) raf = requestAnimationFrame(frame)
      else last = 0
    }

    const kick = () => {
      const t = target()
      if (t == null) {
        dotEl.style.opacity = '0' // no rail to sit on (the narrow layout hides it)
        return
      }
      dotEl.style.opacity = '1'
      want = t
      if (shown < 0 || !smooth) {
        shown = want
        paint(shown)
        return
      }
      if (!raf) raf = requestAnimationFrame(frame)
    }

    const relayout = () => {
      measure()
      shown = -1
      kick()
    }

    relayout()

    const sizing = new ResizeObserver(relayout)
    sizing.observe(listEl)
    window.addEventListener('scroll', kick, { passive: true })
    window.addEventListener('resize', relayout)

    return () => {
      cancelAnimationFrame(raf)
      sizing.disconnect()
      window.removeEventListener('scroll', kick)
      window.removeEventListener('resize', relayout)
      dotEl.style.transform = ''
      dotEl.style.opacity = ''
    }
  }, [rail, list, nodes, dot])
}

function Trajectory() {
  const rail = useRef(null)
  const list = useRef(null)
  const dot = useRef(null)
  const nodes = useRef([])

  useTimelineDot(rail, list, nodes, dot)

  return (
    <section id="trajectory" className="relative isolate -mt-px overflow-hidden bg-[#0a0101] font-jost text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: [
            'radial-gradient(45% 22% at 50% -2%, rgba(150,16,16,0.28), transparent 72%)',
            'radial-gradient(55% 24% at 50% 103%, rgba(120,12,12,0.24), transparent 74%)',
          ].join(','),
        }}
      />
      <HalftoneField baseAlpha={0.14} />

      {/* Melts the top edge into the flat #0a0101 that Skills ends on; the bloom and dots
          fade in beneath it. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[clamp(6rem,14vw,13rem)] bg-linear-to-b from-[#0a0101] to-transparent"
      />

      <div className="relative mx-auto max-w-[56rem] px-[6vw] pt-[clamp(3.5rem,7vw,6rem)] pb-[clamp(4rem,8vw,7rem)]">
        <p data-reveal="up-sm" className="flex justify-center">
          <span className="inline-flex items-center gap-[0.45rem] rounded-full border border-[#e1201a]/35 bg-[#1a0505]/70 px-[0.8rem] py-[0.28rem] text-[0.5625rem] tracking-[0.2em] text-[#d8534c] uppercase">
            <span aria-hidden="true" className="size-[4px] rotate-45 bg-[#e1201a]" />
            Chronology &amp; Evolution
          </span>
        </p>

        <h2 data-reveal="up" className="mt-[1.35rem] text-center text-[clamp(1.5rem,2.45vw,2.25rem)] leading-[1.1] font-bold tracking-[-0.02em] text-white">
          My Professional Journey
        </h2>

        <p data-reveal="up" className="mx-auto mt-[0.9rem] max-w-[27rem] text-center text-[0.8125rem] leading-[1.6] text-white/35">
          An open-ended dual timeline tracking academic foundations through high-impact product architecture and
          forward-looking autonomous AI design systems.
        </p>

        {/* The rail runs behind the nodes and fades toward the earliest entry. */}
        <div ref={rail} className="relative mt-[clamp(2.5rem,5vw,4rem)]">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 hidden w-px sm:block"
            style={{
              left: '11rem',
              backgroundImage: 'linear-gradient(180deg, #f02822 0%, rgba(240,40,34,0.55) 42%, rgba(240,40,34,0.12) 100%)',
            }}
          />

          {/* The active marker: one dot for the whole rail, moved by the scroll
              position, so the entries' own nodes never change and can't flicker. */}
          <span
            ref={dot}
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-0 z-[2] hidden rounded-full will-change-transform sm:block"
            style={{
              left: '11rem',
              width: 15,
              height: 15,
              marginLeft: -7.5,
              marginTop: -7.5,
              border: '2px solid #f02822',
              background: '#000',
              boxShadow: '0 0 12px rgba(240,40,34,0.85)',
            }}
          />

          <ul ref={list} className="relative">
            {ENTRIES.map((entry, i) => (
              <Entry
                key={entry.range}
                entry={entry}
                index={i}
                total={ENTRIES.length}
                nodeRef={(el) => {
                  nodes.current[i] = el
                }}
              />
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default Trajectory
