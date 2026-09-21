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
    range: '2026 — Present',
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
    range: '2025 — 2026',
    badge: 'Lead Chapter',
    title: 'Lead UI/UX Designer & Technologist',
    aside: 'Studio / Contract',
    subtitle: 'Focus line for this role goes here',
    body: 'Replace this paragraph with the description for this role. At this width it runs to about three lines, matching the mock-up.',
    bullets: ['Replace with the first achievement', 'Replace with the second achievement'],
    tags: ['Primary Tag', 'Second Tag', 'Third Tag'],
  },
  {
    range: '2024 — 2025',
    badge: 'Scale Up',
    title: 'Senior Product Designer',
    aside: 'Product Systems',
    subtitle: 'Focus line for this role goes here',
    body: 'Replace this paragraph with the description for this role. At this width it runs to about three lines, matching the mock-up.',
    bullets: ['Replace with the first achievement', 'Replace with the second achievement'],
    tags: ['Primary Tag', 'Second Tag', 'Third Tag'],
  },
  {
    range: '2023 — 2024',
    badge: 'Agency & Labs',
    title: 'UI/UX Designer & Frontend Dev',
    aside: 'Agency Work',
    subtitle: 'Focus line for this role goes here',
    body: 'Replace this paragraph with the description for this role. At this width it runs to about two lines, matching the mock-up.',
    bullets: ['Replace with the first achievement'],
    tags: ['Primary Tag', 'Second Tag', 'Third Tag'],
  },
  {
    range: '2021 — 2023',
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

function Entry({ entry, index, total }) {
  const { range, badge, title, aside, subtitle, body, bullets, tags, featured } = entry
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
          className="font-mono text-[0.8125rem] tracking-[0.06em] whitespace-nowrap"
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

function Trajectory() {
  return (
    <section id="trajectory" className="relative isolate overflow-hidden bg-[#0a0101] font-jost text-white">
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
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,96,86,0.14) 1px, transparent 1px)',
          backgroundSize: '21px 21px',
        }}
      />
      <HalftoneField />

      <div className="relative mx-auto max-w-[56rem] px-[6vw] pt-[clamp(3.5rem,7vw,6rem)] pb-[clamp(4rem,8vw,7rem)]">
        <p className="flex justify-center">
          <span className="inline-flex items-center gap-[0.45rem] rounded-full border border-[#e1201a]/35 bg-[#1a0505]/70 px-[0.8rem] py-[0.28rem] text-[0.5625rem] tracking-[0.2em] text-[#d8534c] uppercase">
            <span aria-hidden="true" className="size-[4px] rotate-45 bg-[#e1201a]" />
            Chronology &amp; Evolution
          </span>
        </p>

        <h2 className="mt-[1.35rem] text-center text-[clamp(1.5rem,2.45vw,2.25rem)] leading-[1.1] font-bold tracking-[-0.02em] text-white">
          Trajectory Across Design &amp; Code
        </h2>

        <p className="mx-auto mt-[0.9rem] max-w-[27rem] text-center text-[0.8125rem] leading-[1.6] text-white/35">
          An open-ended dual timeline tracking academic foundations through high-impact product architecture and
          forward-looking autonomous AI design systems.
        </p>

        {/* The rail runs behind the nodes and fades toward the earliest entry. */}
        <div className="relative mt-[clamp(2.5rem,5vw,4rem)]">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 hidden w-px sm:block"
            style={{
              left: '11rem',
              backgroundImage: 'linear-gradient(180deg, #f02822 0%, rgba(240,40,34,0.55) 42%, rgba(240,40,34,0.12) 100%)',
            }}
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
