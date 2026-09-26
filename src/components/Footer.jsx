// Footer, taken from the Figma frame "Frame 512" (1648:2604), a 1920px artboard.
// Sizes and offsets are that frame's pixels expressed as vw, so the whole block
// scales the way the artboard does, with clamps holding it together on a phone.
//
// The wordmarks are deliberately clipped: EMAIL and CONTACT by the bottom of the
// contact row, and LetsTalk by the footer's own bottom edge, with the legal bar
// laid over it rather than sitting below it.
const EMAIL = 'talhamushtaq03official@gmail.com'
const PHONE = '0324-5486292'

const LINKS = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/' },
  { label: 'Behance', href: 'https://www.behance.net/' },
]

// 1920px artboard value -> vw, with a floor for narrow screens and the artboard
// value itself as the ceiling so nothing keeps growing past the design.
const v = (px, minRem) => `clamp(${minRem}rem, ${((px / 1920) * 100).toFixed(2)}vw, ${(px / 16).toFixed(4)}rem)`

function ContactCell({ label, value, href, mark }) {
  return (
    <div
      data-reveal="up"
      className="relative overflow-hidden px-[2rem] text-right"
      style={{ paddingTop: v(122, 2), paddingBottom: v(218, 3) }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[0.3em] left-[1.5rem] font-sans leading-none font-extrabold tracking-[0.02em] whitespace-nowrap select-none"
        style={{ fontSize: v(197, 3), WebkitTextStroke: '1px rgba(190,60,54,0.13)', color: 'transparent' }}
      >
        {mark}
      </span>

      <p className="relative font-light text-[#995d5d]" style={{ fontSize: v(18, 0.75) }}>
        {label}
      </p>
      <p className="relative mt-[0.85rem]">
        <a
          href={href}
          className="text-[#863131] transition-colors duration-300 hover:text-[#b8453d]"
          style={{ fontSize: v(25, 0.95) }}
        >
          {value}
        </a>
      </p>
    </div>
  )
}

function Footer() {
  return (
    <footer id="contact" className="relative isolate overflow-hidden bg-[#090303] font-jost text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(40% 34% at 50% 96%, rgba(120,12,12,0.22), transparent 74%)',
        }}
      />

      {/* Developed-by line above the contact row */}
      <div
        data-reveal="fade"
        className="relative text-right"
        style={{ paddingInline: v(73, 1.5), paddingTop: v(107, 2), paddingBottom: v(20, 1.25) }}
      >
        <p className="text-[#3c1e1e]" style={{ fontSize: v(19, 0.8125) }}>
          Developed by{' '}
          <a
            href="https://personal-portfolio-wpxq.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#863d3d] underline-offset-[0.2em] transition-colors hover:text-[#c25555] hover:underline"
          >
            Bilal
          </a>
        </p>
      </div>

      {/* Full-bleed contact row, split down the middle */}
      <div className="relative grid grid-cols-1 border-y border-[#ff7a70]/[0.09] sm:grid-cols-2 sm:divide-x sm:divide-[#ff7a70]/[0.09]">
        <ContactCell label="For queries, send to this email" value={EMAIL} href={`mailto:${EMAIL}`} mark="EMAIL" />
        <ContactCell
          label="For queries, send to this email"
          value={PHONE}
          href={`tel:${PHONE.replace(/-/g, '')}`}
          mark="CONTACT"
        />
      </div>

      {/* Oversized sign-off, bleeding past both edges and clipped by the footer's own
          bottom. The legal bar shares this box and is laid over the lower part of the
          wordmark, as the artboard has it. Too narrow for that to stay legible, the
          bar drops back below the wordmark instead. */}
      {/* 536 of the artboard's height, which is what crops the wordmark; on a phone it
          grows to fit instead, since there the bar sits below rather than over it. */}
      <div className="relative overflow-hidden sm:h-[27.92vw]" style={{ paddingTop: v(70, 1.5) }}>
        <span
          data-reveal="fade-slow"
          aria-hidden="true"
          className="block bg-clip-text text-center font-roboto font-extrabold tracking-[-0.03em] whitespace-nowrap text-transparent select-none"
          style={{
            // 506px on the artboard; leading is the font's own, which is what makes
            // the text box tall enough to be cropped at the bottom.
            fontSize: `clamp(4rem, ${((506 / 1920) * 100).toFixed(2)}vw, 31.625rem)`,
            lineHeight: 1.172,
            backgroundImage: 'linear-gradient(180deg, #c81b1b 0%, rgba(16,4,4,0.2) 100%)',
          }}
        >
          LetsTalk
        </span>

        <div
          data-reveal="fade"
          className="relative flex justify-center px-[1.5rem] sm:absolute sm:inset-x-0 sm:bottom-0"
        >
          {/* 1280 of the artboard's 1920, the same container the design uses. */}
          <div
            className="flex w-full max-w-[80rem] flex-col items-center gap-[0.9rem] border-t border-white/[0.05] text-[0.75rem] sm:flex-row sm:justify-between"
            style={{ paddingTop: v(41, 1.25), paddingBottom: v(40, 1.25) }}
          >
            <p className="text-[#c0c0c0]">© 2026 Talha Mushtaq. All rights reserved.</p>

            <nav className="flex items-center gap-[1.5rem] text-[#737373]">
              <a href="#top" className="transition-colors duration-300 hover:text-white/80">
                Back to top ↑
              </a>
              {LINKS.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors duration-300 hover:text-white/80"
                >
                  {l.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
