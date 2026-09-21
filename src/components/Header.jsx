import { useState } from 'react'

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'My Work', href: '#work' },
  { label: 'Design Systems', href: '#design-systems' },
  { label: 'Experience', href: '#experience' },
]

function Logo() {
  return (
    <a href="#" className="flex items-center gap-3.5 lg:mr-[60px]">
      <span className="grid size-10 place-items-center rounded-xl border border-coral/15 bg-linear-to-br from-coral/20 to-coral/5 font-display text-[14px] font-normal text-white">
        TM
      </span>
      <span className="leading-none">
        <span className="block font-display text-[13px] font-normal tracking-[0.07em] text-white">
          TALHA MUSHTAQ
        </span>
        <span className="mt-1.5 block font-mono text-[10.5px] tracking-[0.2em] text-white/50">
          UI/UX &amp; CODE
        </span>
      </span>
    </a>
  )
}

function AvailabilityBadge() {
  return (
    <span className="inline-flex h-7.5 items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-950/70 px-3 text-[11.5px] text-emerald-400/90">
      <span className="relative flex size-2">
        <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/60 motion-reduce:hidden" />
        <span className="relative size-2 rounded-full bg-emerald-500" />
      </span>
      Available for Q2 Projects
    </span>
  )
}

function TalkButton({ className = '' }) {
  return (
    <a
      href="#contact"
      className={`inline-flex h-8.5 items-center rounded-full border border-white/10 bg-white/5 px-4.5 text-xs font-medium tracking-wide text-white uppercase transition-colors hover:border-white/20 hover:bg-white/10 ${className}`}
    >
      Let&apos;s Talk
    </a>
  )
}

function Header() {
  const [active, setActive] = useState('About')
  const [open, setOpen] = useState(false)

  return (
    <header data-reveal="down" data-hero="0" className="relative z-20 px-5 sm:px-8 lg:px-12">
      <div className="flex h-24 items-center justify-between border-b border-white/5 pt-2">
        {/* Equal flex-1 sides keep the nav centred; the logo and actions hug it from either side. */}
        <div className="flex flex-1 lg:justify-end">
          <Logo />
        </div>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-[34px]">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  onClick={() => setActive(label)}
                  aria-current={active === label ? 'page' : undefined}
                  className={`text-[14.5px] transition-colors ${
                    active === label ? 'text-coral' : 'text-white/80 hover:text-white'
                  }`}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden flex-1 items-center gap-4 lg:flex">
          <div className="ml-[50px] flex items-center gap-4">
            <AvailabilityBadge />
            <TalkButton />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-white lg:hidden"
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <div
          id="mobile-menu"
          className="absolute inset-x-5 top-full mt-2 rounded-2xl border border-white/10 bg-neutral-950/95 p-5 backdrop-blur sm:inset-x-8 lg:hidden"
        >
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  onClick={() => {
                    setActive(label)
                    setOpen(false)
                  }}
                  aria-current={active === label ? 'page' : undefined}
                  className={`block rounded-lg px-3 py-2.5 text-[15px] ${
                    active === label ? 'text-coral' : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/5 pt-4">
            <AvailabilityBadge />
            <TalkButton />
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
