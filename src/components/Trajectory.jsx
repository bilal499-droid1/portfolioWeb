import { useEffect, useRef } from 'react'
import HalftoneField from './HalftoneField'

const clamp01 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n)

// Grows the red rail as the reader scrolls through the timeline: it fills to wherever
// the middle of the screen has reached, and a glowing head rides its tip. Reduced
// motion gets the rail fully drawn.
function useRailProgress() {
  const track = useRef(null)
  const fill = useRef(null)
  const head = useRef(null)

  useEffect(() => {
    const draw = (p) => {
      const line = fill.current
      const dot = head.current
      if (line) line.style.transform = `scaleY(${p.toFixed(4)})`
      if (dot) {
        dot.style.top = `${(p * 100).toFixed(3)}%`
        dot.style.opacity = p > 0.002 && p < 0.998 ? '1' : '0'
      }
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      draw(1)
      return
    }

    let raf = 0
    const paint = () => {
      raf = 0
      const el = track.current
      if (!el) return
      const r = el.getBoundingClientRect()
      if (r.height > 0) draw(clamp01((window.innerHeight * 0.55 - r.top) / r.height))
    }
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(paint)
    }

    paint()
    window.addEventListener('scroll', kick, { passive: true })
    window.addEventListener('resize', kick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', kick)
      window.removeEventListener('resize', kick)
    }
  }, [])

  return { track, fill, head }
}

// Sixth screen ("Trajectory"), measured from suv5.png (a 510px-wide mock-up).
const ENTRIES = [
  {
    range: 'Present',
    badge: 'Forward Decade',
    title: 'DevOps Trainee at INARA Technologies',
    aside: 'Active Practice',
    subtitle: 'Building, shipping and running software reliably',
    body: 'Learning the other half of the product lifecycle: how code gets from a commit to production. I work on CI/CD pipelines, containerised deployments and cloud infrastructure, bringing a designer’s eye for clarity to how systems are built, monitored and maintained.',
    bullets: [
      'Setting up automated build, test and deployment pipelines',
      'Working with Docker, Linux servers and cloud environments',
    ],
    featured: true,
  },
  {
    range: '2025 — 2026',
    badge: 'Lead Chapter',
    title: 'Junior UI/UX Designer at Hexler Tech',
    aside: 'Studio / Contract',
    subtitle: 'Designing clear, usable interfaces for real products',
    body: 'Designed web and mobile interfaces from early wireframes through to polished, developer-ready screens. I worked closely with developers and stakeholders to turn requirements into user flows, prototypes and consistent visual systems in Figma.',
    bullets: [
      'Produced wireframes, high-fidelity mock-ups and interactive prototypes',
      'Built reusable components to keep designs consistent across screens',
    ],
  },
  {
    range: '2024 — 2025',
    badge: 'Scale Up',
    title: 'UI/UX and Frontend Intern at INARA Technologies',
    aside: 'Product Systems',
    subtitle: 'Where design met code',
    body: 'Worked across design and frontend development, taking interfaces from Figma into working, responsive pages. The role taught me how design decisions play out in code, and how to build layouts that stay faithful to the design on every screen size.',
    bullets: [
      'Designed UI screens and turned them into responsive frontend pages',
      'Collaborated with the development team on real client projects',
    ],
  },
  {
    range: '2021 — 2025',
    badge: 'Academic Foundation',
    title: 'BS in Software Engineering from University of Engineering and Technology, Taxila',
    aside: 'Education',
    subtitle: 'The engineering foundation behind the design work',
    body: 'Studied the full software development lifecycle, from requirements and system design to programming, testing and project management, alongside human-computer interaction, which shaped my interest in user-centred design.',
    bullets: ['Built a strong base in software design, development and teamwork'],
  },
]

function Entry({ entry, index, total }) {
  const { range, badge, title, aside, subtitle, body, bullets, featured } = entry
  // The rail and its nodes fade with depth, exactly as the mock-up does.
  const fade = 1 - (index / (total - 1)) * 0.62

  return (
    <li className="relative grid grid-cols-[minmax(0,1fr)] gap-y-[1rem] border-t border-white/[0.05] pt-[1.5rem] pb-[2.2rem] sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-y-0">
      {featured && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 -left-[2.5rem] w-[15rem] rounded-r-[1.75rem]"
          style={{
            backgroundImage:
              'linear-gradient(90deg, rgba(150,14,14,0.24) 0%, rgba(150,14,14,0.15) 58%, transparent 100%)',
          }}
        />
      )}

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

      {/* Node sitting on the rail */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-[1.4rem] left-0 hidden -translate-x-1/2 rounded-full sm:block"
        style={{
          left: '11rem',
          width: featured ? 15 : 11,
          height: featured ? 15 : 11,
          border: `2px solid rgba(240,40,34,${0.35 + 0.65 * fade})`,
          background: '#0a0101',
          boxShadow: featured ? '0 0 12px rgba(240,40,34,0.85)' : 'none',
        }}
      />

      {/* Right rail: the role itself */}
      <div className="relative z-[1] sm:pl-[2.6rem]">
        <div className="flex items-start justify-between gap-[1rem]">
          <h3
            className={`text-[clamp(1rem,1.35vw,1.2rem)] leading-[1.25] font-semibold tracking-[-0.01em] ${
              featured ? 'text-[#e1201a]' : 'text-white/90'
            }`}
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
      </div>
    </li>
  )
}

function Trajectory() {
  const { track, fill, head } = useRailProgress()

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
        <p className="flex justify-center">
          <span className="inline-flex items-center gap-[0.45rem] rounded-full border border-[#e1201a]/35 bg-[#1a0505]/70 px-[0.8rem] py-[0.28rem] text-[0.5625rem] tracking-[0.2em] text-[#d8534c] uppercase">
            <span aria-hidden="true" className="size-[4px] rotate-45 bg-[#e1201a]" />
            Chronology &amp; Evolution
          </span>
        </p>

        <h2 className="mt-[1.35rem] text-center text-[clamp(1.5rem,2.45vw,2.25rem)] leading-[1.1] font-bold tracking-[-0.02em] text-white">
          My Professional Journey
        </h2>

        <p className="mx-auto mt-[0.9rem] max-w-[27rem] text-center text-[0.8125rem] leading-[1.6] text-white/35">
          An open-ended dual timeline tracking academic foundations through high-impact product architecture and
          forward-looking autonomous AI design systems.
        </p>

        {/* The rail runs behind the nodes: a faint track, and a red fill that grows down
            it as the reader scrolls. */}
        <div ref={track} className="relative mt-[clamp(2.5rem,5vw,4rem)]">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 hidden w-px bg-[rgba(240,40,34,0.14)] sm:block"
            style={{ left: '11rem' }}
          />
          <span
            ref={fill}
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 hidden w-[2px] origin-top -translate-x-1/2 sm:block"
            style={{
              left: 'calc(11rem + 0.5px)',
              transform: 'scaleY(0)',
              backgroundImage: 'linear-gradient(180deg, #f02822 0%, #f02822 70%, rgba(240,40,34,0.6) 100%)',
              boxShadow: '0 0 8px rgba(240,40,34,0.55)',
            }}
          />
          <span
            ref={head}
            aria-hidden="true"
            className="pointer-events-none absolute z-[2] hidden size-[7px] -translate-1/2 rounded-full bg-[#ff4a42] opacity-0 transition-opacity duration-300 sm:block"
            style={{ left: 'calc(11rem + 0.5px)', top: 0, boxShadow: '0 0 10px 3px rgba(240,40,34,0.75)' }}
          />
          <ul className="relative">
            {ENTRIES.map((entry, i) => (
              <Entry key={entry.range} entry={entry} index={i} total={ENTRIES.length} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default Trajectory
