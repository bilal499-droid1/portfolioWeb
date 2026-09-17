import glassHi from '../assets/glass-hi.webp'

// Second screen ("About me"), measured from sample2 (a 762px-wide mock-up).
// --u is one sample pixel, scaled to the viewport width and capped on very wide
// screens so the name doesn't become enormous.
const u = (n) => `calc(${n} * var(--u))`

const ROLES = ['UI/UX Designer', 'Web Engineering', 'Video Post Production']

// Each line of the name fades from white to a soft pink toward its baseline.
const nameLineClass = 'block bg-linear-to-b from-white from-35% to-[#ecd2d2] bg-clip-text text-transparent'

function AboutIntro() {
  return (
    <section
      id="about"
      className="relative overflow-hidden bg-[#0b0101] font-inter"
      style={{ '--u': 'min(calc(100vw / 762), 2.2px)', paddingTop: u(69), paddingBottom: u(248) }}
    >
      {/* Red glow low in the section, then the faint dot grid over everything. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 26% at 50% 76%, #860606 0%, rgba(110,5,5,0.8) 45%, transparent 100%), linear-gradient(180deg, #0b0101 0%, #0f0202 55%, #120203 100%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1.4px)',
          backgroundSize: `${u(19)} ${u(19)}`,
        }}
      />

      <div className="relative flex flex-col items-center px-4">
        <span
          className="inline-flex items-center rounded-full border border-[#4e0b0b] tracking-wide text-[#b03434] uppercase"
          style={{ height: u(22), paddingInline: u(12), gap: u(22), fontSize: `max(10px, ${u(7)})` }}
        >
          <span className="rounded-full bg-[#bf1b1b]" style={{ width: u(6), height: u(6) }} />
          About me
          <span style={{ width: u(12) }} />
        </span>

        <div className="relative text-center" style={{ marginTop: u(46) }}>
          <h2
            className="font-sans font-bold tracking-[-0.01em] uppercase"
            style={{ fontSize: u(129), lineHeight: 0.87 }}
          >
            <span className={nameLineClass}>Talha</span>
            <span className={nameLineClass}>Mushtaq</span>
          </h2>
          <img
            src={glassHi}
            alt="Hi, I am"
            draggable="false"
            className="pointer-events-none absolute top-1/2 left-1/2 max-w-none drop-shadow-[0_18px_30px_rgba(0,0,0,0.45)] select-none"
            style={{ width: u(150), transform: `translate(calc(-50% - ${u(12)}), calc(-50% + ${u(9)}))` }}
          />
        </div>

        <ul
          className="flex flex-wrap items-center justify-center text-[#d9d9d9] uppercase"
          style={{ marginTop: u(76), columnGap: u(30), rowGap: 8, fontSize: `max(11px, ${u(8.5)})` }}
        >
          {ROLES.map((role, i) => (
            <li key={role} className="flex items-center" style={{ gap: u(30) }}>
              {i > 0 && <span aria-hidden="true" className="size-[3px] rounded-full bg-black/60" />}
              <span className={i === 0 ? 'text-[#e65b5b]' : undefined}>{role}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default AboutIntro
