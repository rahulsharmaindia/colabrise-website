import { Link } from 'react-router-dom'
import { ArrowRight, Play } from 'lucide-react'
import PhoneMockup from './PhoneMockup'
import TiltCard from './TiltCard'

export default function Hero() {
  return (
    <section id="hero" className="relative z-10 px-6 md:px-12 pt-16 pb-20 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            AI GROWTH ASSISTANT · NOW IN BETA
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.0] tracking-tight mb-6">
            Where<br />
            creators<br />
            and brands<br />
            <span className="text-gradient">collab rise.</span>
          </h1>

          <p className="text-gray-400 text-base md:text-lg max-w-md mb-8 leading-relaxed">
            Colabrise is the collaboration platform with an AI growth assistant built in — match, brief, create, and grow, all in one place.
          </p>

          <div className="flex items-center gap-4">
            <Link
              to="/brands/register"
              className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium text-sm flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25"
            >
              Start collaborating
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="/#ai-assistant"
              className="px-6 py-3 rounded-full border border-white/20 text-white font-medium text-sm flex items-center gap-2 hover:bg-white/5 transition-colors"
            >
              <Play className="w-4 h-4" />
              See the AI assistant
            </a>
          </div>
        </div>

        <div className="relative flex justify-center items-center min-h-[476px]">
          <TiltCard tiltStrength={8}>
            <div className="p-4 w-[595px] h-[476px] relative">
              {/* Left card */}
              <PhoneMockup
                className="absolute left-0 top-[120px] z-10 -rotate-6"
                gradient="from-cyan-400 to-blue-600"
                label="@luna.vega"
                stat="2.4M"
                subtext="+340% engagement"
                icon="instagram"
              />
              {/* Center card */}
              <PhoneMockup
                className="absolute left-1/2 -translate-x-1/2 top-[60px] z-20"
                gradient="from-purple-500 via-violet-500 to-cyan-400"
                label="AI CO-PILOT"
                stat="+820%"
                subtext="forecasted reach"
                isMain
              />
              {/* Right card */}
              <PhoneMockup
                className="absolute right-0 top-[200px] z-10 rotate-6"
                gradient="from-pink-500 via-red-400 to-orange-400"
                label="@mira.eats"
                stat="1.6M"
                subtext=""
                icon="play"
              />
            </div>
          </TiltCard>
        </div>
      </div>
    </section>
  )
}
