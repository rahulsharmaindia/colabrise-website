import { Instagram, Youtube, Twitter } from 'lucide-react'
import TiltCard from './TiltCard'

const creators = [
  {
    initials: 'LV',
    name: '@luna.vega',
    category: 'FASHION & LIFESTYLE',
    followers: '2.4M',
    gradient: 'from-pink-400 to-purple-500',
  },
  {
    initials: 'KB',
    name: '@kai.builds',
    category: 'TECH & REVIEWS',
    followers: '890K',
    gradient: 'from-cyan-400 to-blue-500',
  },
  {
    initials: 'ME',
    name: '@mira.eats',
    category: 'FOOD & TRAVEL',
    followers: '1.6M',
    gradient: 'from-orange-400 to-pink-500',
  },
  {
    initials: 'DF',
    name: '@dex.fitness',
    category: 'HEALTH & PERFORMANCE',
    followers: '3.1M',
    gradient: 'from-green-400 to-emerald-500',
  },
]

export default function Creators() {
  return (
    <section id="creators" className="relative z-10 px-6 md:px-12 py-20 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">OUR ROSTER</p>
          <h2 className="text-4xl md:text-5xl font-bold">
            Creators on <span className="text-gradient">Colabrise</span>
          </h2>
        </div>
        <p className="text-gray-400 text-sm max-w-sm">
          A vetted network of voices shaping culture — each one paired with their own AI growth assistant.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {creators.map((creator) => (
          <TiltCard key={creator.name} tiltStrength={10}>
            <div className="rounded-2xl border border-white/10 bg-dark-800 p-4 h-full flex flex-col shadow-[0_20px_80px_-5px_rgba(139,92,246,0.5),0_10px_40px_rgba(139,92,246,0.3)] hover:shadow-[0_20px_80px_-5px_rgba(236,72,153,0.6),0_10px_50px_rgba(236,72,153,0.4)] transition-shadow duration-300">
              {/* Large gradient avatar card */}
              <div className={`w-full aspect-[4/3] rounded-xl bg-gradient-to-br ${creator.gradient} flex items-center justify-center mb-5`}>
                <span className="text-4xl md:text-5xl font-bold text-white">{creator.initials}</span>
              </div>

              {/* Info below */}
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">{creator.category}</p>
              <p className="text-white font-semibold text-sm mt-1">{creator.name}</p>
              <p className="mt-2">
                <span className="text-gradient font-bold text-xl">{creator.followers}</span>
                <span className="text-gray-500 text-xs ml-1.5">followers</span>
              </p>
              <div className="flex gap-3 mt-3">
                <Instagram className="w-4 h-4 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer" />
                <Youtube className="w-4 h-4 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer" />
                <Twitter className="w-4 h-4 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer" />
              </div>
            </div>
          </TiltCard>
        ))}
      </div>
    </section>
  )
}
