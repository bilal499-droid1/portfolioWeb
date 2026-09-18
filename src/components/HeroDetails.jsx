// Text and cards arranged around the poster, measured from the sample mock-up
// (910×625). The mock-up's hero area runs from y=48 (under the header) to y=540
// (the ribbon); here that maps onto the space between our header and ribbon.
// Sizes are sample pixels × --k; vertical positions are percentages of that space.
const SAMPLE_TOP = 48
const SAMPLE_HEIGHT = 492
const k = (n) => `calc(${n} * var(--k))`
const y = (sampleY) => `${((sampleY - SAMPLE_TOP) / SAMPLE_HEIGHT) * 100}%`

const INFO = [
  { label: 'Based', value: 'Rawalpindi, Punjab, Pakistan' },
  { label: 'Focus', value: 'UI/UX, Motion graphics, Web Engineering' },
  { label: 'Languages', value: 'Urdu, Turkish, English' },
]

const SERVICES = ['User-Centered Design', 'Pixel-perfect Interfaces', 'Responsive Design', 'Prototyping']

const cardStyle = {
  borderRadius: k(12),
  background:
    'radial-gradient(120% 70% at 60% 100%, rgba(120,4,4,0.9), transparent 70%), linear-gradient(180deg, #120303, #2a0404)',
}

// A thin connector line ending in a ringed dot, drawn in sample pixels. `position`
// places the box (left/right/top) so it stays attached to its card.
function Connector({ position, width, height, points, dot }) {
  return (
    <svg
      aria-hidden="true"
      className="absolute overflow-visible"
      style={{ ...position, width: k(width), height: k(height) }}
      viewBox={`0 0 ${width} ${height}`}
    >
      <polyline points={points} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.6" />
      <circle cx={dot[0]} cy={dot[1]} r="6" fill="none" stroke="rgba(210,173,173,0.55)" strokeWidth="0.7" />
      <circle cx={dot[0]} cy={dot[1]} r="4.2" fill="#d2adad" />
    </svg>
  )
}

function HeroDetails() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-24 bottom-[1.7vw] z-[5] hidden select-none lg:block"
      style={{ '--k': `min(calc(100vw / 910), calc((100svh - 6rem - 1.7vw) / ${SAMPLE_HEIGHT}))` }}
    >
      {/* Title + intro */}
      <div className="absolute" style={{ left: k(38), top: y(100), width: k(215) }}>
        <h1 className="flex items-baseline whitespace-nowrap" style={{ gap: k(5) }}>
          <span className="font-bebas leading-none text-[#ec201d]" style={{ fontSize: k(38) }}>
            UI/UX
          </span>
          <span className="font-script leading-none text-white" style={{ fontSize: k(40) }}>
            Designer
          </span>
        </h1>
        <p className="font-jost text-[#9a1f1f]" style={{ fontSize: k(10.5), lineHeight: k(12.5), marginTop: k(3) }}>
          I turn ideas, problems, and messy requirements into clear digital experiences people actually enjoy using.
        </p>
      </div>

      {/* Info card with the tagline 40px below it, stacked up from the ribbon. */}
      <div className="absolute flex flex-col items-start gap-10" style={{ left: k(35), bottom: k(8) }}>
        <div className="relative" style={{ marginLeft: k(40) }}>
          <dl
            className="border border-white/15 font-roboto"
            style={{ ...cardStyle, width: k(255), padding: `${k(16)} ${k(16)} ${k(22)}` }}
          >
            {INFO.map(({ label, value }, i) => (
              <div key={label} style={{ marginTop: i ? k(12) : 0 }}>
                <dt className="font-medium text-[#b33333]" style={{ fontSize: k(12.5) }}>
                  {label}
                </dt>
                <dd className="text-[#b06262]" style={{ fontSize: k(10.5), marginTop: k(3) }}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          <Connector
            position={{ left: '100%', top: k(104) }}
            width={80}
            height={50}
            points="0,12 36,12 62,36"
            dot={[68, 39]}
          />
        </div>

        <p className="leading-none text-white" style={{ marginLeft: k(3) }}>
          <span className="block whitespace-nowrap">
            <span className="font-bebas" style={{ fontSize: k(19) }}>
              CREATING
            </span>
            <span className="font-script" style={{ fontSize: k(20), marginLeft: k(4) }}>
              experience
            </span>
          </span>
          <span className="block whitespace-nowrap" style={{ marginTop: k(-3) }}>
            <span className="font-bebas" style={{ fontSize: k(13) }}>
              WITH
            </span>
            <span className="font-script" style={{ fontSize: k(20), marginLeft: k(4) }}>
              emotions
            </span>
          </span>
        </p>
      </div>

      {/* Creative portfolio pill */}
      <span
        className="absolute rounded-full border border-white/50 font-inter tracking-wide text-[#d0d0d0] uppercase"
        style={{ right: k(32), top: y(108), fontSize: k(8.5), padding: `${k(5)} ${k(11)}` }}
      >
        Creative Portfolio
      </span>

      {/* About / CV card */}
      <div
        className="pointer-events-auto absolute border border-white/15 font-roboto"
        style={{ ...cardStyle, right: k(70), top: y(178), width: k(240), padding: `${k(22)} ${k(15)} ${k(10)}` }}
      >
        <p className="text-center text-[#8a2e2e]" style={{ fontSize: k(8.5) }}>
          A little something about me
        </p>
        <a
          href="#"
          className="flex items-center justify-center border border-[#5a1818] bg-linear-to-b from-[#3a0808] to-[#1c0202] font-medium text-[#df6464] transition-colors hover:border-[#8a2a2a] hover:text-[#f08080]"
          style={{ height: k(44), borderRadius: k(7), marginTop: k(12), gap: k(7), fontSize: k(11) }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ width: k(11), height: k(11) }}>
            <path d="M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm7 1.5V9h5.5L13 3.5ZM8 12v1.6h8V12H8Zm0 3.5v1.6h8v-1.6H8Z" />
          </svg>
          Download CV
        </a>
        <div className="flex justify-end" style={{ gap: k(8), marginTop: k(12) }}>
          {[
            { label: 'LinkedIn', text: 'in' },
            { label: 'Behance', text: 'Bē' },
          ].map(({ label, text }) => (
            <a
              key={label}
              href="#"
              aria-label={label}
              className="grid place-items-center rounded-full bg-[#3a1010] font-bold text-[#9a5a5a] transition-colors hover:text-[#e08a8a]"
              style={{ width: k(23), height: k(23), fontSize: k(10) }}
            >
              {text}
            </a>
          ))}
        </div>
        <Connector
          position={{ right: `calc(100% - ${k(15)})`, top: `calc(100% - ${k(4)})` }}
          width={70}
          height={70}
          points="15,59 55,30 55,4"
          dot={[15, 59]}
        />
      </div>

      {/* Services */}
      <ul className="absolute" style={{ right: k(30), top: y(385), width: k(200) }}>
        {SERVICES.map((service, i) => (
          <li
            key={service}
            className="flex items-center font-services text-[#b19191] italic"
            style={{ fontSize: k(13), marginTop: i ? k(18) : 0 }}
          >
            <span className="text-[#d8d6d6] not-italic" style={{ width: k(24) }}>
              +
            </span>
            {service}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default HeroDetails
