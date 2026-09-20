import AboutIntro from './components/AboutIntro'
import DesignerIntro from './components/DesignerIntro'
import Footer from './components/Footer'
import Header from './components/Header'
import HeroDetails from './components/HeroDetails'
import Nebula from './components/Nebula'
import RevealPoster from './components/RevealPoster'
import Skills from './components/Skills'
import Trajectory from './components/Trajectory'
import WelcomeBanner from './components/WelcomeBanner'
import WorkList from './components/WorkList'
import bgPortfolio from './assets/bg-portfolio.webp'

function App() {
  return (
    <div id="top" className="relative font-sans">
      <div
        className="relative flex h-svh flex-col overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url(${bgPortfolio})` }}
      >
        <Header />

        <main className="flex min-h-0 flex-1 items-center justify-center">
          <RevealPoster />
        </main>

        {/* Above the poster, below the cards and header, so the smoke drifts across the face. */}
        <Nebula />

        <HeroDetails />
      </div>

      <AboutIntro />
      <DesignerIntro />
      <WorkList />
      <Skills />
      <Trajectory />
      <WelcomeBanner />
      <Footer />
    </div>
  )
}

export default App
