import AboutIntro from './components/AboutIntro'
import Header from './components/Header'
import HeroDetails from './components/HeroDetails'
import RevealPoster from './components/RevealPoster'
import WelcomeBanner from './components/WelcomeBanner'
import bgPortfolio from './assets/bg-portfolio.webp'

function App() {
  return (
    <div className="relative font-sans">
      <div
        className="relative flex h-svh flex-col overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url(${bgPortfolio})` }}
      >
        <Header />

        {/* Bottom padding keeps the poster (and its PORTFOLIO label) above the ribbon. */}
        <main className="flex min-h-0 flex-1 items-center justify-center pb-[8.4vw]">
          <RevealPoster />
        </main>

        <HeroDetails />
      </div>

      <AboutIntro />
      <WelcomeBanner />
    </div>
  )
}

export default App
