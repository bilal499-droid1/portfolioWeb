// Faint red nebula flowing behind the hero, gathered towards its lower edge so it
// glows just above the welcome ribbon. It sits directly on the background image,
// under every other hero layer. Soft gradient clouds orbit on looping paths (each
// on its own period, so they never sync up) while a layer of turbulence wisps
// swirls through them. Screen-blended, so it only ever lightens the
// background, and it holds still under reduced motion.

const CLOUDS = [
  { className: 'bottom-[-18%] left-[-12%] h-[70%] w-[60%] bg-[#8f0a12]/30', duration: '12s', delay: '0s' },
  { className: 'bottom-[-10%] right-[-8%] h-[60%] w-[55%] bg-[#b3131b]/22', duration: '16s', delay: '-9s', reverse: true },
  { className: 'bottom-[8%] left-[28%] h-[42%] w-[45%] bg-[#ff3b4a]/12', duration: '10s', delay: '-4s' },
  { className: 'top-[12%] right-[14%] h-[38%] w-[34%] bg-[#6d0710]/18', duration: '19s', delay: '-16s', reverse: true },
]

function Nebula() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden mix-blend-screen">
      {CLOUDS.map(({ className, duration, delay, reverse }) => (
        <div
          key={className}
          className={`absolute animate-nebula-orbit rounded-full blur-[90px] motion-reduce:animate-none ${className}`}
          style={{ animationDuration: duration, animationDelay: delay, animationDirection: reverse ? 'reverse' : undefined }}
        />
      ))}

      {/* Wisps: red-tinted fractal noise turning slowly, faded out towards the top and sides. */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{ maskImage: 'radial-gradient(ellipse 70% 55% at 50% 85%, #000 20%, transparent 75%)' }}
      >
        <svg className="absolute inset-[-40%] size-[180%] animate-nebula-swirl motion-reduce:animate-none">
          <filter id="nebula-wisps">
            <feTurbulence type="fractalNoise" baseFrequency="0.0035 0.006" numOctaves="4" seed="7" />
            <feColorMatrix values="0 0 0 0 0.85  0 0 0 0 0.08  0 0 0 0 0.1  0 0 0 4.5 -2" />
          </filter>
          <rect width="100%" height="100%" filter="url(#nebula-wisps)" />
        </svg>
      </div>
    </div>
  )
}

export default Nebula
