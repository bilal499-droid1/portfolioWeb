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

// The two cards are kept compact so the poster stays the focus. Everything inside
// them is sized through c(), which is k() shrunk by CARD_SCALE; ct() also keeps
// small text from dropping below a readable pixel size on narrow screens.
const CARD_SCALE = 0.78
const c = (n) => k(+(n * CARD_SCALE).toFixed(2))
const ct = (n, minPx) => `max(${minPx}px, ${c(n)})`

// The cards hug the face instead of the screen edges. The poster is centred and
// sized from the viewport height (its own width is --pw), and the face spans
// roughly 24% left and 31% right of its centre, so measuring from there keeps the
// cards the same distance from the face at any window shape.
const INFO_WIDTH = 200
const CV_WIDTH = 180
const FACE_GAP = 14
const faceRight = `calc(50% + 0.31 * var(--pw) + ${k(FACE_GAP)})`

const cardStyle = {
  borderRadius: k(10),
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
      style={{
        '--k': `min(calc(100vw / 910), calc((100svh - 6rem - 1.7vw) / ${SAMPLE_HEIGHT}))`,
        '--pw': 'min(calc((100svh - 6rem) * 1.1053), 100vw)',
      }}
    >
      {/* Title + intro */}
      <div data-reveal="up" data-hero="2" className="absolute" style={{ left: k(38), top: y(100), width: k(215) }}>
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

      {/* Info card with the tagline 40px below it, stacked up from the ribbon. The
          column spans the full width so the card's margin can be measured from the centre. */}
      <div className="absolute inset-x-0 flex flex-col items-start gap-10" style={{ bottom: k(8) }}>
        <div
          data-reveal="left"
          data-hero="3"
          className="relative"
          style={{ marginLeft: `calc(50% - 0.24 * var(--pw) - ${k(FACE_GAP + INFO_WIDTH)})` }}
        >
          <dl
            className="border border-white/15 font-roboto"
            style={{ ...cardStyle, width: k(INFO_WIDTH), padding: `${c(16)} ${c(16)} ${c(22)}` }}
          >
            {INFO.map(({ label, value }, i) => (
              <div key={label} style={{ marginTop: i ? c(12) : 0 }}>
                <dt className="font-medium text-[#b33333]" style={{ fontSize: ct(12.5, 10) }}>
                  {label}
                </dt>
                <dd className="text-[#b06262]" style={{ fontSize: ct(10.5, 9), marginTop: c(3) }}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          {/* Anchored to the card's bottom edge so it stays attached if the card's height changes. */}
          <Connector
            position={{ left: '100%', bottom: k(20.5) }}
            width={109}
            height={50}
            points="0,12 65,12 91,36"
            dot={[97, 39]}
          />
        </div>

        <p data-reveal="up-sm" data-hero="4" className="leading-none text-white" style={{ marginLeft: k(38) }}>
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
        data-reveal="fade"
        data-hero="3"
        className="absolute rounded-full border border-white/50 font-inter tracking-wide text-[#d0d0d0] uppercase"
        style={{ right: k(32), top: y(108), fontSize: k(8.5), padding: `${k(5)} ${k(11)}` }}
      >
        Creative Portfolio
      </span>

      {/* About / CV card */}
      <div
        data-reveal="right"
        data-hero="4"
        className="pointer-events-auto absolute border border-white/15 font-roboto"
        style={{ ...cardStyle, left: faceRight, top: y(178), width: k(CV_WIDTH), padding: `${c(22)} ${c(15)} ${c(10)}` }}
      >
        <p className="text-center text-[#8a2e2e]" style={{ fontSize: ct(8.5, 9) }}>
          A little something about me
        </p>
        <a
          href="#"
          className="flex items-center justify-center border border-[#5a1818] bg-linear-to-b from-[#3a0808] to-[#1c0202] font-medium text-[#df6464] transition-colors hover:border-[#8a2a2a] hover:text-[#f08080]"
          style={{ height: c(44), borderRadius: c(7), marginTop: c(12), gap: c(7), fontSize: ct(11, 10) }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ width: ct(11, 10), height: ct(11, 10) }}>
            <path d="M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm7 1.5V9h5.5L13 3.5ZM8 12v1.6h8V12H8Zm0 3.5v1.6h8v-1.6H8Z" />
          </svg>
          Download CV
        </a>
        <div className="flex justify-end" style={{ gap: c(8), marginTop: c(12) }}>
          {[
            { label: 'LinkedIn', text: 'in' },
            { label: 'Behance', text: 'Bē' },
          ].map(({ label, text }) => (
            <a
              key={label}
              href="#"
              aria-label={label}
              className="grid place-items-center rounded-full bg-[#3a1010] font-bold text-[#9a5a5a] transition-colors hover:text-[#e08a8a]"
              style={{ width: ct(23, 20), height: ct(23, 20), fontSize: ct(10, 9) }}
            >
              {text}
            </a>
          ))}
        </div>
        <Connector
          position={{ right: `calc(100% - ${k(15)})`, top: `calc(100% - ${k(4)})` }}
          width={107}
          height={70}
          points="15,59 63,59 92,30 92,4"
          dot={[15, 59]}
        />
      </div>

      {/* Services */}
      <ul data-reveal="up-sm" data-hero="5" className="absolute" style={{ right: k(30), top: y(385), width: k(200) }}>
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
