import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Marquee from '../components/Marquee'
import Stats from '../components/Stats'
import Creators from '../components/Creators'
import Platform from '../components/Platform'
import AIAssistant from '../components/AIAssistant'
import CTA from '../components/CTA'
import Footer from '../components/Footer'
import GradientBlobs from '../components/GradientBlobs'

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-dark-900">
      <GradientBlobs />
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <Stats />
        <Creators />
        <Platform />
        <AIAssistant />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
