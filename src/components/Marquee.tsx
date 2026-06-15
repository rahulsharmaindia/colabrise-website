import { Plus } from 'lucide-react'

const brands = ['FENTY', 'RHODE', 'DUOLINGO', 'OURA', 'ARC', 'LIQUID DEATH']

export default function Marquee() {
  return (
    <section className="relative z-10 py-8 border-t border-b border-white/5 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...brands, ...brands].map((brand, i) => (
          <div key={i} className="flex items-center gap-2 mx-8">
            <span className="text-gray-400 font-semibold text-sm tracking-wider">{brand}</span>
            <Plus className="w-3 h-3 text-gray-600" />
          </div>
        ))}
      </div>
    </section>
  )
}
