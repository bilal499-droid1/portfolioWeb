import { useEffect, useRef, useState } from 'react'
import HalftoneField from './HalftoneField'

// Fourth screen ("My Work"), measured from suv2.png (a 635px-wide mock-up).
// The mock-up shows its three cards in three different states — dim, mid, and
// fully red — which reads as one frame of a hover/scroll reveal rather than
// three different card designs, so the red state lives on :hover here.

const PROJECTS = [
  {
    title: 'Finance Management Portal',
    role: 'UI Design & Full-Stack Implementation',
    blurb:
      'Designed a personal finance dashboard for expense tracking and budget visualization, prioritizing at-a-glance financial clarity over dense tabular data. Implemented a MySQL-backed data layer with real-time chart rendering to turn raw transaction records into readable visual summaries.',
    tags: ['React.js', 'Tailwind CSS', 'JavaScript', 'MySQL'],
  },
  {
    title: 'Parking Management System',
    role: 'Full-Stack Application',
    blurb:
      'Designed a real-time occupancy dashboard that lets facility operators view and allocate parking slots instantly. Architected role-based Admin and End User views so each stakeholder only sees the workflows relevant to their responsibilities.',
    tags: ['React.js', 'Tailwind CSS', 'JavaFX', 'Oracle DB'],
  },
  {
    title: 'Fatwrap.pk',
    url: 'https://fatwrap.pk',
    role: 'Brand Identity, UI/UX Design & Social Media Marketing',
    blurb:
      "Designed end-to-end UI/UX for a food brand's ordering experience, from user journey maps through prototypes covering menu browsing to order confirmation. Created a mobile-first interface with a food-forward visual hierarchy and clearly placed CTAs to support conversion goals. Ran Instagram campaigns for the brand, producing mostly static posts alongside a handful of reels to build visibility and engagement.",
    tags: ['Figma', 'Adobe Illustrator', 'Photoshop'],
  },
  {
    title: 'Sugarloop.pk',
    url: 'https://sugarloop.pk',
    role: 'Brand Identity, UI/UX Design & Social Media Marketing',
    blurb:
      "Developed user personas, empathy maps, and interaction flows to translate a bakery brand's product experience into a digital presence. Designed a high-fidelity mobile interface with a visual product showcase and a streamlined ordering flow that reduced steps from discovery to checkout. Ran Instagram campaigns to promote the doughnut offerings and grow audience engagement.",
    tags: ['Figma', 'Adobe Photoshop'],
  },
  {
    title: 'Kricket.pk',
    url: 'https://kricket.pk',
    role: 'UI / UX Designer and Frontend Developer',
    blurb:
      'A cricket-focused digital experience built around clarity, accessibility, and visual engagement. The interface organizes cricket content into an intuitive structure while maintaining a modern, responsive design across devices.',
    tags: ['JavaScript', 'Figma', 'React', 'Tailwind'],
  },
].map((p, i) => ({ ...p, n: String(i + 1).padStart(2, '0') }))

const TOTAL = String(PROJECTS.length).padStart(2, '0')

// The stack anchor, and how far each card's top sits below the one it covers, so the
// deck shows its edges instead of one card hiding the rest completely.
const STACK_TOP = '5.5rem'
const PEEK = 14 // px per card
const DIP = 0.075 // how far a covered card shrinks
const VEIL = 0.55 // how far it dims

// Stacking wants room to read, and a pointer, and a card shorter than the screen.
const STACKABLE = '(min-width: 768px) and (prefers-reduced-motion: no-preference)'

const clamp01 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n)
const smoothstep = (t) => t * t * (3 - 2 * t)

// Shrinks and dims each pinned card by how far the next one has come over it. The
// reading is live geometry rather than a scroll offset, so it needs no measuring
// pass and survives the cards changing height as text reflows.
function useCardStack(on, wraps, inners, veils) {
  useEffect(() => {
    if (!on) return
    let raf = 0

    const paint = () => {
      raf = 0
      const list = wraps.current
      for (let i = 0; i < list.length; i++) {
        const el = list[i]
        const inner = inners.current[i]
        if (!el || !inner) continue
        const next = list[i + 1]
        let p = 0
        if (next) {
          const a = el.getBoundingClientRect()
          const b = next.getBoundingClientRect()
          // 0 while the next card is still a full card-height below, 1 once it has
          // come right over this one.
          if (a.height > 0) p = clamp01(1 - (b.top - a.top) / a.height)
        }
        const e = smoothstep(p)
        inner.style.transform = `scale(${(1 - DIP * e).toFixed(4)})`
        const veil = veils.current[i]
        if (veil) veil.style.opacity = (VEIL * e).toFixed(3)
      }
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
      for (const el of inners.current) if (el) el.style.transform = ''
      for (const el of veils.current) if (el) el.style.opacity = ''
    }
  }, [on, wraps, inners, veils])
}

function ProjectCard({ n, title, url, role, blurb, tags }) {
  return (
    <article data-reveal="up-lg" className="group relative overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#0e0403] px-[clamp(1.75rem,3.75vw,3.4rem)] pt-[clamp(3rem,7.4vw,6.7rem)] pb-[clamp(2.5rem,5.5vw,5rem)] transition-colors duration-500 hover:border-[#e1201a]/35">
      {/* Red bloom, revealed on hover. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          backgroundImage:
            'radial-gradient(75% 90% at 62% 118%, rgba(198,12,12,0.55), rgba(120,6,6,0.22) 45%, transparent 76%)',
        }}
      />

      {/* Outlined index, sitting against the right edge. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-[clamp(2.5rem,8.8vw,8rem)] right-[1.1rem] font-bebas text-[clamp(4rem,9.2vw,8.3rem)] leading-none tracking-[0.01em] select-none"
        style={{ WebkitTextStroke: '1px rgba(225,30,30,0.26)', color: 'transparent' }}
      >
        {n}
      </span>

      <div data-reveal="up" data-reveal-delay="160" className="relative max-w-[46rem]">
        <p className="text-[0.625rem] tracking-[0.18em] text-[#d23f50]">
          {n} <span className="px-[0.25em] text-[#d23f50]/60">/</span> {TOTAL}
        </p>

        <h3 className="mt-[1.2rem] text-[clamp(1.6rem,2.78vw,2.5rem)] leading-none font-bold tracking-[-0.01em] text-white transition-colors duration-500 group-hover:text-[#e1201a]">
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-[0.3em] underline-offset-[0.18em] hover:underline"
            >
              {title}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="size-[0.6em] transition-transform duration-300 group-hover:translate-x-[0.08em] group-hover:-translate-y-[0.08em]"
              >
                <path d="M7 17 17 7M8 7h9v9" />
              </svg>
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          ) : (
            title
          )}
        </h3>

        <p className="mt-[1.4rem] max-w-[44rem] text-[0.9375rem] leading-[1.6] text-[#ac9a9a]/85">{blurb}</p>

        <p className="mt-[1.45rem] flex items-center gap-[0.6rem] text-[0.6875rem] tracking-[0.01em] text-[#c3221d]">
          <span aria-hidden="true" className="h-[1.15rem] w-[2px] bg-[#c3221d]" />
          {role}
        </p>

        <ul className="mt-[2.95rem] flex flex-wrap gap-[0.6rem]">
          {tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-white/[0.14] bg-white/[0.05] px-[1rem] py-[0.35rem] text-[0.8125rem] font-semibold tracking-[0.02em] text-[#d4cfcf]"
            >
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}

function WorkList() {
  const [stack, setStack] = useState(() => window.matchMedia(STACKABLE).matches)
  const wraps = useRef([])
  const inners = useRef([])
  const veils = useRef([])

  useEffect(() => {
    const mq = window.matchMedia(STACKABLE)
    const sync = () => setStack(mq.matches)
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useCardStack(stack, wraps, inners, veils)

  return (
    // No overflow clip: it would make this the scroll container and the cards below
    // would never pin. Every layer inside already keeps to its own box.
    <section id="work" className="relative isolate -mt-px bg-[#0a0101] font-jost text-white">
      {/* Red pool low in the section, matching the mock-up's bottom glow. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: [
            'radial-gradient(52% 26% at 62% 102%, rgba(168,12,12,0.42), transparent 74%)',
            'radial-gradient(40% 24% at 8% -4%, rgba(120,24,24,0.20), transparent 70%)',
          ].join(','),
        }}
      />

      <HalftoneField baseAlpha={0.16} />

      {/* Melts the top edge into the flat #0a0202 that DesignerIntro ends on; the glow and
          dots fade in beneath it. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[clamp(6rem,14vw,13rem)] bg-linear-to-b from-[#0a0202] to-transparent"
      />

      {/* Settles the glow and dots into the flat #0a0101 that Skills fades up from, so
          the join between the two sections doesn't show. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[clamp(6rem,14vw,13rem)] bg-linear-to-t from-[#0a0101] to-transparent"
      />

      <div className="relative mx-auto max-w-[1600px] px-[8vw] pt-[clamp(4rem,8vw,7rem)] pb-[clamp(4rem,8vw,7rem)] lg:pr-[24vw]">
        <h2 data-reveal="up" className="mb-[clamp(3rem,7vw,6.5rem)] text-center text-[clamp(2.25rem,5vw,4.5rem)] leading-none font-bold tracking-[-0.02em] text-white lg:-mr-[16vw]">
          My Work
        </h2>

        {/* Stacked, the gap is what each card stays pinned for before the next one
            reaches it, so it is opened up to give the hand-off room to read. */}
        <div
          className={`flex flex-col ${
            stack ? 'gap-[clamp(4rem,11vw,11rem)] pb-[clamp(3rem,8vw,8rem)]' : 'gap-[clamp(1.75rem,5.35vw,4.8rem)]'
          }`}
        >
          {PROJECTS.map((p, i) => (
            <div
              key={p.n}
              ref={(el) => {
                wraps.current[i] = el
              }}
              // Each card pins a little lower than the one it covers, and over it.
              className={stack ? 'sticky' : undefined}
              style={{ top: `calc(${STACK_TOP} + ${i * PEEK}px)`, zIndex: i + 1 }}
            >
              <div
                ref={(el) => {
                  inners.current[i] = el
                }}
                className="relative will-change-transform"
                style={{ transformOrigin: 'top center' }}
              >
                <ProjectCard {...p} />

                {/* Dims the card as the next one comes over it, so it reads as
                    receding rather than simply being hidden. */}
                {stack && (
                  <span
                    ref={(el) => {
                      veils.current[i] = el
                    }}
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-[22px] bg-[#060101] opacity-0"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default WorkList
