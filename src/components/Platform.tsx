import { Users, Bot, FileText } from 'lucide-react'
import TiltCard from './TiltCard'

const services = [
  {
    icon: Users,
    title: 'AI Creator Matchmaking',
    description: 'Our AI scans 85,000+ vetted creators and surfaces the perfect roster for your brand DNA in seconds.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Bot,
    title: 'Growth Co-Pilot',
    description: 'Personal AI assistant for creators and brands — content ideas, audience insights, and weekly growth plans.',
    gradient: 'from-cyan-400 to-blue-500',
  },
  {
    icon: FileText,
    title: 'Deal Flow & Payments',
    description: 'Briefs, contracts, approvals, and payouts — all inside one collaboration workspace.',
    gradient: 'from-pink-500 to-orange-400',
  },
]

export default function Platform() {
  return (
    <section id="platform" className="relative z-10 px-6 md:px-12 py-20 max-w-7xl mx-auto font-sans">
      <p className="text-sm text-gray-500 uppercase tracking-widest mb-2">THE PLATFORM</p>
      <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold mb-14">
        One workspace,<br />
        <span className="text-gradient">infinite collabs</span>
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        {services.map((service) => (
          <TiltCard key={service.title} tiltStrength={10}>
            <div className={`rounded-2xl bg-gradient-to-br ${service.gradient} p-[3px]`}>
              <div className="rounded-[14px] bg-dark-800 p-6 md:p-8 flex flex-col">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-5 opacity-90`}>
                  <service.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{service.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed flex-1">{service.description}</p>
                <a href="#" className="text-purple-400 text-sm font-semibold mt-4 hover:text-purple-300 transition-colors">
                  Learn more →
                </a>
              </div>
            </div>
          </TiltCard>
        ))}
      </div>
    </section>
  )
}
