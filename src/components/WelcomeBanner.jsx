// Full-width tilted ribbon laid across the seam between the hero and the About
// section (top: 100svh is the hero's bottom edge). The bright front ribbon runs
// "Welcome to my realm" as a scrolling marquee; the darker ribbon behind it,
// angled the other way, matches the sample. Sizes follow the 1920×275 artwork.
const PHRASE = 'Welcome to my realm'

// One group must be wider than the ribbon (~110vw); each phrase + star is ~32vw.
function RibbonGroup() {
  return (
    <div aria-hidden="true" className="flex shrink-0 items-center">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className="flex items-center">
          <span className="px-[1.6vw]">{PHRASE}</span>
          <span className="px-[1.6vw] text-[0.8em]">★</span>
        </span>
      ))}
    </div>
  )
}

function WelcomeBanner() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[100svh] z-10 aspect-[1920/275] -translate-y-[20%] select-none overflow-x-clip">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[#820202]"
        style={{ clipPath: 'polygon(0 10%, 100% 31%, 100% 70%, 0 70%)' }}
      />
      <div className="absolute top-[34.5%] -left-[5%] flex h-[42%] w-[110%] -rotate-[1.97deg] items-center overflow-hidden bg-[#c01515] shadow-[0_0.6vw_0.9vw_rgba(0,0,0,0.35)]">
        <span className="sr-only">{PHRASE}</span>
        <div className="flex w-max animate-marquee font-ribbon text-[2.1vw] leading-none font-bold whitespace-nowrap text-black uppercase motion-reduce:animate-none">
          <RibbonGroup />
          <RibbonGroup />
        </div>
      </div>
    </div>
  )
}

export default WelcomeBanner
