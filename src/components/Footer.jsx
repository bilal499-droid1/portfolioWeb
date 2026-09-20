// Footer, measured from footer.png (a 960px-wide mock-up). The EMAIL and
// CONTACT wordmarks are outlined and deliberately clipped by the bottom of
// their row, as in the mock-up.
const EMAIL = 'talhamushtaq03official@gmail.com'
const PHONE = '0324-5486292'

const LINKS = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/' },
  { label: 'Behance', href: 'https://www.behance.net/' },
]

function ContactCell({ label, value, href, mark }) {
  return (
    <div className="relative overflow-hidden px-[2rem] pt-[clamp(2.5rem,6.6vw,6rem)] pb-[clamp(3rem,7vw,6.5rem)] text-right">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[0.3em] left-[1.5rem] font-sans text-[clamp(3rem,9.5vw,8rem)] leading-none font-extrabold tracking-[0.02em] whitespace-nowrap select-none"
        style={{ WebkitTextStroke: '1px rgba(190,60,54,0.13)', color: 'transparent' }}
      >
        {mark}
      </span>

      <p className="relative text-[0.8125rem] text-white/30">{label}</p>
      <p className="relative mt-[0.85rem]">
        <a
          href={href}
          className="text-[clamp(0.95rem,1.4vw,1.25rem)] text-[#b8453d] transition-colors duration-300 hover:text-[#e4665f]"
        >
          {value}
        </a>
      </p>
    </div>
  )
}

function Footer() {
  return (
    <footer className="relative isolate overflow-hidden bg-[#090303] font-jost text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(40% 34% at 50% 96%, rgba(120,12,12,0.22), transparent 74%)',
        }}
      />

      {/* Developed-by line above the contact row */}
      <div className="relative px-[clamp(1.5rem,4vw,3.5rem)] pt-[clamp(2rem,4.5vw,4rem)] pb-[clamp(1.25rem,2.4vw,2rem)] text-right">
        <p className="text-[0.8125rem] text-white/28">
          Developed by <span className="text-[#b8453d]">Bilal</span>
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

      {/* Oversized sign-off, bleeding to both edges */}
      <div className="relative flex justify-center overflow-hidden pt-[clamp(1.5rem,3vw,2.5rem)]">
        <span
          aria-hidden="true"
          className="bg-clip-text font-sans text-[18vw] leading-[0.82] font-extrabold tracking-[0.085em] whitespace-nowrap text-transparent select-none"
          style={{ backgroundImage: 'linear-gradient(170deg, #4a0f0f 0%, #2a0808 46%, #140404 100%)' }}
        >
          LetsTalk
        </span>
      </div>

      <div className="relative mx-auto max-w-[59rem] px-[clamp(1rem,2vw,1.5rem)]">
        <div className="flex flex-col items-center gap-[0.9rem] border-t border-white/[0.07] py-[1.5rem] text-[0.75rem] sm:flex-row sm:justify-between">
          <p className="text-white/45">© 2026 Talha Mushtaq. All rights reserved.</p>

          <nav className="flex items-center gap-[1.75rem] text-white/45">
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
    </footer>
  )
}

export default Footer
