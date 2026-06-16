import TiltCard from './TiltCard'

const stats = [
  { value: '420M+', label: 'Combined reach', gradient: 'from-cyan-300 to-cyan-500' },
  { value: '1,200+', label: 'Campaigns delivered', gradient: 'from-purple-400 to-violet-500' },
  { value: '8.4x', label: 'Avg. ROAS', gradient: 'from-pink-400 to-rose-500' },
  { value: '94%', label: 'Brand retention', gradient: 'from-violet-400 to-purple-600' },
]

export default function Stats() {
  return (
    <section className="relative z-10 px-6 md:px-12 py-20 max-w-7xl mx-auto font-sans">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <TiltCard key={stat.label} tiltStrength={10}>
            <div className="glass-card p-8 text-center">
              <p className={`text-3xl md:text-4xl font-semibold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(168,85,247,0.4)]`}>
                {stat.value}
              </p>
              <p className="text-base text-gray-400 mt-2">{stat.label}</p>
            </div>
          </TiltCard>
        ))}
      </div>
    </section>
  )
}
