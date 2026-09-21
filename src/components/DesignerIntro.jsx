import suv1 from '../assets/suv1.png'
import HalftoneField from './HalftoneField'

// Third screen, measured from kopster.png (an 815px-wide mock-up). Sits directly
// below AboutIntro, and its top edge fades up from the flat colour that section
// ends on, so the join between them doesn't show.
const STATS = [
  { value: '08+', label: 'Years Crafting' },
  { value: '30+', label: 'Digital Products' },
  { value: '100%', label: 'Full Execution', accent: true },
]

function CodeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[55%] w-[55%]"
    >
      <path d="m9 6-6 6 6 6" />
      <path d="m15 6 6 6-6 6" />
      <path d="m13.5 4-3 16" />
    </svg>
  )
}

function DesignerIntro() {
  return (
    <section id="designer" className="relative isolate -mt-px min-h-svh overflow-hidden bg-[#0a0202] font-jost text-white">
      {/* Red bloom: strongest along the top edge, with a second pool behind the card. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: [
            'radial-gradient(70% 45% at 24% -6%, rgba(158,26,26,0.38), transparent 70%)',
            'radial-gradient(48% 42% at 88% 72%, rgba(122,26,22,0.30), transparent 72%)',
            'radial-gradient(30% 90% at 0% 50%, rgba(150,110,110,0.10), transparent 70%)',
          ].join(','),
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,96,86,0.20) 1px, transparent 1px)',
          backgroundSize: '21px 21px',
        }}
      />
      <HalftoneField />

      {/* Melts the section's top edge into the flat #120203 that AboutIntro ends on, so
          the two read as one page; the bloom and dots fade in beneath it. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[clamp(6rem,14vw,13rem)] bg-linear-to-b from-[#120203] to-transparent"
      />

      {/* Hairline closing the section. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-[1.8%] h-px bg-white/[0.055]" />

      <div className="relative mx-auto flex min-h-svh max-w-[1600px] items-center px-[8vw] pt-[4rem] pb-[10rem] lg:pr-[14vw]">
        <div className="grid w-full grid-cols-1 items-center gap-20 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-[6vw]">
          <div>
            <p className="flex items-center gap-[0.55rem] text-[0.625rem] font-medium tracking-[0.3em] text-coral uppercase">
              <span aria-hidden="true" className="h-px w-[18px] bg-coral/80" />
              Product Designer &amp; Creative Technologist
            </p>

            <h2 className="mt-[1.6rem] max-w-[37.5rem] font-sans text-[clamp(2.1rem,3.7vw,3.35rem)] leading-[0.96] font-light tracking-[-0.03em] text-white/95">
              I&apos;m a{' '}
              <span className="font-accent relative font-normal text-coral italic">
                UI/UX designer
                <span aria-hidden="true" className="absolute -bottom-[0.12em] left-0 h-px w-full bg-coral/60" />
              </span>{' '}
              who builds what I design. Design systems, prototypes, responsive interfaces from research to launch.
            </h2>

            <p className="mt-[1.9rem] max-w-[28rem] text-[0.875rem] leading-[1.65] text-white/45">
              Bridging the chasm between meticulous visual craft and production-ready code. Focusing on fintech,
              high-utility SaaS, and expressive brand-led applications.
            </p>

            <a
              href="#work"
              className="group relative mt-[2.2rem] inline-flex h-[3.1rem] w-[8.4rem] items-center justify-center overflow-hidden rounded-[10px] border border-coral/45 text-[0.95rem] text-white/90 transition-colors duration-300 hover:border-coral/80 hover:text-white"
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-80"
                style={{
                  backgroundImage: 'radial-gradient(120% 130% at 50% 118%, rgba(200,26,26,0.62), transparent 68%)',
                }}
              />
              <span className="relative">My work</span>
            </a>

            <div aria-hidden="true" className="mt-[2.6rem] h-px max-w-[26.75rem] bg-linear-to-r from-white/15 to-transparent" />

            <dl className="mt-[1.4rem] grid max-w-[26.75rem] grid-cols-3">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <dt
                    className={`text-[1.45rem] leading-none font-medium tracking-[-0.01em] ${
                      stat.accent ? 'text-coral' : 'text-white'
                    }`}
                  >
                    {stat.value}
                  </dt>
                  <dd className="mt-[0.55rem] text-[0.625rem] tracking-[0.02em] text-white/40">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative w-[clamp(15rem,23.5vw,21.2rem)] justify-self-center lg:justify-self-end">
            <div
              className="relative rounded-[13px] border border-white/[0.07] p-[0.7rem]"
              style={{
                backgroundImage: 'linear-gradient(150deg, rgba(58,16,14,0.85), rgba(20,6,6,0.9))',
                boxShadow: '0 40px 90px -30px rgba(0,0,0,0.9)',
              }}
            >
              <div className="relative aspect-[182/225] overflow-hidden rounded-[8px]">
                <img src={suv1} alt="Chick in a yellow raincoat standing on wet pavement" className="h-full w-full object-cover" />

                <span aria-hidden="true" className="absolute top-0 left-0 size-[13px] border-t border-l border-coral" />
                <span aria-hidden="true" className="absolute top-0 right-0 size-[13px] border-t border-r border-coral/70" />
                <span aria-hidden="true" className="absolute bottom-0 left-0 size-[13px] border-b border-l border-coral/70" />
                <span aria-hidden="true" className="absolute right-0 bottom-0 size-[13px] border-r border-b border-coral" />

                {/* Frosted tech strip */}
                <div className="absolute inset-x-[0.45rem] bottom-[0.8rem] flex h-[1.2rem] items-center justify-between rounded-[5px] border border-white/15 bg-white/10 px-[0.45rem] backdrop-blur-md">
                  <span className="flex items-center gap-[0.4rem] text-[0.6rem] font-medium whitespace-nowrap text-white/90">
                    <span aria-hidden="true" className="size-[4px] rounded-full bg-coral shadow-[0_0_6px_rgba(248,114,107,0.9)]" />
                    Figma • React • Tailwind
                  </span>
                  <span className="text-[0.55rem] tracking-[0.06em] text-white/40">01/03</span>
                </div>
              </div>
            </div>

            {/* Location pill, straddling the top edge */}
            <div className="absolute top-0 -right-[1.35rem] flex -translate-y-1/2 items-center gap-[0.4rem] rounded-full border border-white/[0.09] bg-[#1c1211] px-[0.55rem] py-[0.3rem] shadow-[0_8px_24px_-8px_rgba(0,0,0,0.8)]">
              <span aria-hidden="true" className="size-[4px] bg-coral" />
              <span className="text-[0.6rem] tracking-[0.015em] whitespace-nowrap text-white/75">London / Lagos</span>
            </div>

            {/* Specialization card, straddling the bottom-left edge */}
            <div className="absolute -bottom-[1.75rem] -left-[1rem] flex items-center gap-[0.5rem] rounded-[16px] border border-white/[0.07] bg-[#1a0f0e]/85 py-[0.55rem] pr-[0.9rem] pl-[0.5rem] shadow-[0_18px_40px_-16px_rgba(0,0,0,0.9)] backdrop-blur-md">
              <span
                aria-hidden="true"
                className="flex size-[1.55rem] shrink-0 items-center justify-center rounded-[8px] text-[#f5b0aa]"
                style={{ backgroundImage: 'linear-gradient(145deg, #c9433c, #8c2a26)' }}
              >
                <CodeIcon />
              </span>
              <span className="block">
                <span className="block text-[0.5rem] leading-none tracking-[0.16em] text-white/35 uppercase">Specialization</span>
                <span className="mt-[0.3rem] block text-[0.72rem] leading-none font-medium whitespace-nowrap text-white/90">
                  Design Systems &amp; Prototyping
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default DesignerIntro
