import bannerWelcome from '../assets/banner-welcome.webp'

// Full-width tilted ribbon laid across the seam between the hero and the About
// section (top: 100svh is the hero's bottom edge). The artwork (1920×275) carries
// the bright front ribbon and its shadow; the darker ribbon behind it, angled the
// other way, is drawn here to match the sample.
function WelcomeBanner() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[100svh] z-10 aspect-[1920/275] -translate-y-[80%] select-none">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[#820202]"
        style={{ clipPath: 'polygon(0 10%, 100% 31%, 100% 70%, 0 70%)' }}
      />
      <img
        src={bannerWelcome}
        alt="Welcome to my realm"
        draggable="false"
        className="relative size-full"
      />
    </div>
  )
}

export default WelcomeBanner
