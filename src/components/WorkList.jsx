import HalftoneField from './HalftoneField'

// Fourth screen ("My Work"), measured from suv2.png (a 635px-wide mock-up).
// The mock-up shows its three cards in three different states — dim, mid, and
// fully red — which reads as one frame of a hover/scroll reveal rather than
// three different card designs, so the red state lives on :hover here.
const TOTAL = '04'

const PROJECTS = [
  { n: '01', title: 'Kricket.pk' },
  { n: '02', title: 'Kricket.pk' },
  { n: '03', title: 'Kricket.pk' },
]

const BLURB =
  'A cricket-focused digital experience built around clarity, accessibility, and visual engagement. The interface organizes cricket content into an intuitive structure while maintaining a modern, responsive design across devices.'

const ROLE = 'UI / UX Designer and Frontend Developer'
const TAGS = ['Javascript', 'Figma', 'React', 'Tailwind']

function ProjectCard({ n, title }) {
  return (
    <article className="group relative overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#0e0403] px-[clamp(1.75rem,3.75vw,3.4rem)] pt-[clamp(3rem,7.4vw,6.7rem)] pb-[clamp(2.5rem,5.5vw,5rem)] transition-colors duration-500 hover:border-[#e1201a]/35">
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

      <div className="relative max-w-[46rem]">
        <p className="text-[0.625rem] tracking-[0.18em] text-[#d23f50]">
          {n} <span className="px-[0.25em] text-[#d23f50]/60">/</span> {TOTAL}
        </p>

        <h3 className="mt-[1.2rem] text-[clamp(1.6rem,2.78vw,2.5rem)] leading-none font-normal tracking-[-0.01em] text-white/40 transition-colors duration-500 group-hover:text-[#e1201a]">
          {title}
        </h3>

        <p className="mt-[1.4rem] max-w-[44rem] text-[0.9375rem] leading-[1.6] text-[#ac9a9a]/85">{BLURB}</p>

        <p className="mt-[1.45rem] flex items-center gap-[0.6rem] text-[0.6875rem] tracking-[0.01em] text-[#c3221d]">
          <span aria-hidden="true" className="h-[1.15rem] w-[2px] bg-[#c3221d]" />
          {ROLE}
        </p>

        <ul className="mt-[2.95rem] flex flex-wrap gap-[0.45rem]">
          {TAGS.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-white/[0.09] bg-white/[0.03] px-[0.7rem] py-[0.15rem] text-[0.5625rem] tracking-[0.02em] text-[#8e8b8b]"
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
  return (
    <section id="work" className="relative isolate overflow-hidden bg-[#0a0101] font-jost text-white">
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

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,96,86,0.16) 1px, transparent 1px)',
          backgroundSize: '21px 21px',
        }}
      />
      <HalftoneField />

      <div className="relative mx-auto max-w-[1600px] px-[8vw] pt-[clamp(4rem,8vw,7rem)] pb-[clamp(4rem,8vw,7rem)] lg:pr-[24vw]">
        <h2 className="mb-[clamp(3rem,7vw,6.5rem)] text-center text-[clamp(2.25rem,5vw,4.5rem)] leading-none font-bold tracking-[-0.02em] text-white lg:-mr-[16vw]">
          My Work
        </h2>

        <div className="flex flex-col gap-[clamp(1.75rem,5.35vw,4.8rem)]">
          {PROJECTS.map((p) => (
            <ProjectCard key={p.n} {...p} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default WorkList
