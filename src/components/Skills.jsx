import { useEffect, useRef, useState } from 'react'
import HalftoneField from './HalftoneField'

// Fifth screen ("Skills"), measured from suv4.png (a 506px-wide mock-up): a large
// outlined SKILLS wordmark with cards centred on it.
//
// On a wide screen the section is taller than the viewport and holds a pinned stage,
// so scrolling through it plays a sequence instead of moving the page:
//
//   1. the wordmark rises with the page and locks once it reaches the middle
//   2. the first card rises from below the fold and settles on the wordmark
//   3. the other three slide out from behind it into the row, turning red as they go
//
// Everything is driven by how far the reader has scrolled into the section, so it
// runs backwards just as well. The row's resting layout is ordinary CSS grid; the
// sequence only ever applies a transform offset from where a card already sits,
// which is what keeps 4-across, 2x2 and the phone list on the same code path.
//
// Narrow screens and reduced motion get the plain, unpinned row instead.

const SKILLS = [
  {
    title: ['Algorithmic', 'Problem solving'],
    blurb:
      'Applying structured thinking and computational techniques to break down complex problems, develop efficient solutions, and optimize them for performance, scalability, and reliability.',
    tags: ['Optimization', 'Data Structures', 'Logical reasoning', 'Complexity Analysis'],
  },
  {
    title: ['Interface &', 'Experience Design'],
    blurb:
      'Shaping research, flows and hierarchy into interfaces that stay legible under real content, then holding them together with a design system that survives contact with a roadmap.',
    tags: ['Design Systems', 'Prototyping', 'User Research', 'Accessibility'],
  },
  {
    title: ['Web', 'Engineering'],
    blurb:
      'Building what the design promises: responsive, accessible front-ends with measured performance budgets, so the shipped product keeps the detail the mock-up had.',
    tags: ['React', 'Tailwind', 'Performance', 'Responsive Build'],
  },
  {
    title: ['Motion &', 'Post Production'],
    blurb:
      'Giving interfaces and stories their timing — motion that explains a change rather than decorating it, and edits graded and cut to hold attention from the first frame.',
    tags: ['Motion Graphics', 'Video Editing', 'Color Grading', 'Micro-interactions'],
  },
]

// How much scrolling the pinned sequence spans. 100svh of it is the stage standing
// still, so the sequence itself gets the remainder.
const STAGE_VH = 340

// Windows within the sequence (0 = just pinned, 1 = about to release).
const RISE_SPAN = 0.2 // the first card coming up from below the fold
const FAN_START = 0.27 // the row starting to open out from the stack
// One window for the whole row, so both sides leave the stack on the same frame and
// the row reads as opening out from the middle. The outer cards simply have further
// to travel in the same span, which is what gives the spread its shape.
const FAN_SPAN = 0.56
const SETTLE = 0.09 // s: how quickly the sequence catches up to the scrollbar

const RED_FILL = 'linear-gradient(180deg, #8f1a1a 0%, #4a0c0c 62%)'
const BLACK_FILL = 'linear-gradient(180deg, #131111 0%, #0c0b0b 62%)'

const clamp01 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n)
const smoothstep = (t) => t * t * (3 - 2 * t)
// A card's progress through its own window of the sequence.
const phase = (p, start, span) => smoothstep(clamp01((p - start) / span))

function SkillCard({ title, blurb, tags, pinned, depth, cardRef }) {
  // Pinned, the row has to fit four across and still leave the wordmark visible, so
  // the card loses the mock-up's deep top padding. Everything else is unchanged.
  const pad = pinned ? 'px-[1.1rem] pt-[1.7rem] pb-[2.6rem]' : 'px-[1.25rem] pt-[5rem] pb-[3.6rem]'
  const width = pinned ? 'w-full' : 'w-[clamp(17rem,24vw,21.5rem)]'

  return (
    <article
      ref={cardRef}
      data-reveal={pinned ? undefined : 'scale'}
      className={`group/card relative flex flex-col rounded-[16px] border border-white/[0.07] ${width} ${pad}`}
      // Earlier cards sit on top, so the later ones read as coming out from behind them.
      style={{ backgroundImage: BLACK_FILL, zIndex: pinned ? depth : undefined, willChange: pinned ? 'transform' : undefined }}
    >
      {/* The red state, faded in over the black one so the resting card is untouched.
          Hover only, and scoped to this card, so the rest of the row stays black. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[16px] border border-[#e07a74]/30 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
        style={{ backgroundImage: RED_FILL }}
      />

      <div className="relative flex flex-1 flex-col">
        <h3
          className={`font-sans leading-[1.06] font-bold tracking-[-0.02em] text-white ${
            pinned ? 'text-[clamp(1.15rem,1.65vw,1.6rem)]' : 'text-[clamp(1.4rem,2.3vw,2.05rem)]'
          }`}
        >
          {title.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h3>

        <p
          className={`text-[#877b7b] ${
            pinned ? 'mt-[0.85rem] text-[0.75rem] leading-[1.5]' : 'mt-[1.15rem] text-[0.8125rem] leading-[1.55]'
          }`}
        >
          {blurb}
        </p>

        <hr className={`border-0 border-t border-white/[0.07] ${pinned ? 'mt-[1.4rem]' : 'mt-[2rem]'}`} />

        <ul className={`flex flex-wrap gap-[0.5rem] ${pinned ? 'mt-[1.1rem]' : 'mt-[1.6rem]'}`}>
          {tags.map((tag) => (
            <li
              key={tag}
              className={`rounded-[5px] border border-[#c47a72]/25 leading-none text-[#b89a98] ${
                pinned ? 'px-[0.55rem] py-[0.42rem] text-[0.7rem]' : 'px-[0.7rem] py-[0.5rem] text-[0.8125rem]'
              }`}
            >
              {tag}
            </li>
          ))}
        </ul>

        <hr className={`border-0 border-t border-white/[0.07] ${pinned ? 'mt-[1.1rem]' : 'mt-[1.6rem]'}`} />
      </div>

      {/* Ring marker in the bottom corner. */}
      <span
        aria-hidden="true"
        className="absolute right-[1.25rem] bottom-[1rem] size-[1.5rem] rounded-full border-2 border-[#e07a74]/45 bg-[#c92a2a] shadow-[0_0_10px_rgba(201,42,42,0.55)]"
      />
    </article>
  )
}

// Drives the pinned sequence: reads how far the section has been scrolled through and
// writes each card's offset from its resting slot. Does nothing unless `on` is true.
function useSkillSequence(on, refs) {
  useEffect(() => {
    if (!on) return
    const { section, row, fit, cards } = refs
    const stage = section.current
    const rowEl = row.current
    const fitEl = fit.current
    if (!stage || !rowEl || !fitEl) return

    // Where each card rests, and where the middle of the row is. Layout positions,
    // so a transform on the card can't disturb them.
    let slots = []
    let rise = 0
    let scale = 1

    const measure = () => {
      const stageH = window.innerHeight
      const rowW = rowEl.offsetWidth
      const rowH = rowEl.offsetHeight
      // Never let the row outgrow the stage, whatever the grid or the text wrapped to.
      scale = Math.min(1, (stageH * 0.78) / (rowH || 1))
      fitEl.style.transform = scale < 1 ? `scale(${scale.toFixed(4)})` : ''
      // Far enough to clear the bottom of the screen before the first card appears.
      // Divided by the fit scale because the wrapper shrinks this offset too.
      rise = (stageH * 0.62 + rowH / 2) / scale
      // offsetLeft/Top are measured from the nearest positioned ancestor, which here
      // is the stage wrapper rather than the row, so the row's own offset has to come
      // back out before these read as positions within the row.
      const baseX = rowEl.offsetLeft
      const baseY = rowEl.offsetTop
      slots = cards.current.map((el) => {
        if (!el) return { dx: 0, dy: 0 }
        // The offset that would stack this card in the middle of the row.
        return {
          dx: (rowW - el.offsetWidth) / 2 - (el.offsetLeft - baseX),
          dy: (rowH - el.offsetHeight) / 2 - (el.offsetTop - baseY),
        }
      })
    }

    let target = 0
    let shown = -1
    let raf = 0
    let last = 0

    const progress = () => {
      const r = stage.getBoundingClientRect()
      const span = stage.offsetHeight - window.innerHeight
      return span > 0 ? clamp01(-r.top / span) : 0
    }

    const paint = (p) => {
      // Everything rises together, then the whole row opens out together.
      const up = phase(p, 0, RISE_SPAN)
      const out = phase(p, FAN_START, FAN_SPAN)
      for (let i = 0; i < cards.current.length; i++) {
        const el = cards.current[i]
        if (!el) continue
        const slot = slots[i] || { dx: 0, dy: 0 }
        const x = slot.dx * (1 - out)
        const y = slot.dy * (1 - out) + (1 - up) * rise
        // The ones still stacked sit a little back, so the row has some depth.
        const s = 0.93 + 0.07 * out
        el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${s.toFixed(4)})`
        // The whole stack fades up together. Fading only the front card would let the
        // ones behind it show through while it was still part-way transparent.
        el.style.opacity = up.toFixed(3)
      }
    }

    const frame = (now) => {
      raf = 0
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60
      last = now
      // Eases toward the scrollbar rather than snapping to it: still scroll-locked,
      // but without a wheel's step showing up as a jump.
      const next = shown + (target - shown) * (1 - Math.exp(-dt / SETTLE))
      const done = Math.abs(target - next) < 0.0002
      shown = done ? target : next
      paint(shown)
      if (!done) raf = requestAnimationFrame(frame)
      else last = 0
    }

    const kick = () => {
      target = progress()
      if (shown < 0) {
        // First run: start where the scrollbar already is, don't sweep in from zero.
        shown = target
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

    measure()
    kick()

    const sizing = new ResizeObserver(relayout)
    sizing.observe(rowEl)
    window.addEventListener('scroll', kick, { passive: true })
    window.addEventListener('resize', relayout)

    return () => {
      cancelAnimationFrame(raf)
      sizing.disconnect()
      window.removeEventListener('scroll', kick)
      window.removeEventListener('resize', relayout)
      fitEl.style.transform = ''
      for (const el of cards.current) {
        if (!el) continue
        el.style.transform = ''
        el.style.opacity = ''
      }
    }
  }, [on, refs])
}

// The pinned sequence needs room for four cards and a reader who is using a scroll
// wheel, so it is kept to tablets and up, and off entirely for reduced motion.
const PINNABLE = '(min-width: 768px) and (prefers-reduced-motion: no-preference)'

function Skills() {
  const [pinned, setPinned] = useState(() => window.matchMedia(PINNABLE).matches)
  const section = useRef(null)
  const row = useRef(null)
  const fit = useRef(null)
  const cards = useRef([])
  const refs = useRef({ section, row, fit, cards }).current

  useEffect(() => {
    const mq = window.matchMedia(PINNABLE)
    const sync = () => setPinned(mq.matches)
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useSkillSequence(pinned, refs)

  const heading = (
    <h2
      data-reveal={pinned ? undefined : 'fade-slow'}
      className="text-center font-sans text-[18vw] leading-[0.85] font-extrabold tracking-[0.02em] select-none"
      style={{ WebkitTextStroke: '1px rgba(228,60,54,0.16)', color: 'transparent' }}
    >
      SKILLS
    </h2>
  )

  const list = SKILLS.map((s, i) => (
    <SkillCard
      key={s.title.join(' ')}
      {...s}
      pinned={pinned}
      depth={SKILLS.length - i}
      cardRef={(el) => {
        cards.current[i] = el
      }}
    />
  ))

  // Backdrop, edge fades and dot field. Pinned, these ride the stage so they stay
  // viewport-sized and the joins still land on the section's own edges.
  const backdrop = (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: [
            'radial-gradient(48% 30% at 50% -6%, rgba(140,16,16,0.30), transparent 72%)',
            'radial-gradient(60% 26% at 50% 106%, rgba(120,12,12,0.26), transparent 74%)',
          ].join(','),
        }}
      />

      <HalftoneField baseAlpha={0.16} />

      {/* Melts the top edge into the flat #0a0101 that WorkList ends on; the bloom and
          dots fade in beneath it. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[clamp(6rem,14vw,13rem)] bg-linear-to-b from-[#0a0101] to-transparent"
      />
      {/* And the same at the bottom, settling into the flat colour Trajectory fades up from. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[clamp(6rem,14vw,13rem)] bg-linear-to-t from-[#0a0101] to-transparent"
      />
    </>
  )

  if (!pinned) {
    return (
      <section id="skills" className="relative isolate -mt-px overflow-hidden bg-[#0a0101] font-jost text-white">
        {backdrop}
        <div className="relative mx-auto max-w-[1600px] px-[8vw] pt-[clamp(3.5rem,7vw,6rem)] pb-[clamp(4rem,9vw,8rem)]">
          {heading}
          <div className="mt-[clamp(3rem,9vw,8rem)] flex flex-wrap justify-center gap-[clamp(1.5rem,2.5vw,2.25rem)]">
            {list}
          </div>
        </div>
      </section>
    )
  }

  return (
    // No overflow clip here: it would make this the scroll container and the stage
    // below would never pin. The stage does the clipping instead.
    <section
      id="skills"
      ref={section}
      className="relative isolate -mt-px bg-[#0a0101] font-jost text-white"
      style={{ height: `${STAGE_VH}svh` }}
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        {backdrop}

        {/* The wordmark sits on the middle of the stage, so it rides up with the page
            and is exactly centred at the moment the stage pins. */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-[8vw]">{heading}</div>

        <div className="absolute inset-0 flex items-center px-[6vw]">
          <div ref={fit} className="w-full">
            <div
              ref={row}
              className="grid w-full grid-cols-2 items-start gap-[clamp(0.9rem,1.6vw,1.5rem)] lg:grid-cols-4"
            >
              {list}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Skills
