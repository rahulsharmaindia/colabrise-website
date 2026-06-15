import { Sparkles, Palette, TrendingUp, MessageCircle } from 'lucide-react'
import TiltCard from './TiltCard'

const aiFeatures = [
  {
    icon: Sparkles,
    title: 'Smart Match Engine',
    description: 'AI compares brand voice, audience overlap, and past performance to recommend creators that actually convert.',
  },
  {
    icon: Palette,
    title: 'Content Studio',
    description: "Generate hooks, scripts, captions, and shot lists tuned to each creator's tone and each brand's brief.",
  },
  {
    icon: TrendingUp,
    title: 'Growth Forecasts',
    description: 'Predict reach, engagement, and ROI before a single dollar is spent — and track it live after launch.',
  },
  {
    icon: MessageCircle,
    title: '24/7 AI Assistant',
    description: 'Ask your assistant anything: pricing a deal, negotiating a brief, analyzing a competitor, planning next month.',
  },
]

export default function AIAssistant() {
  return (
    <section id="ai-assistant" className="relative z-10 px-6 md:px-12 py-24 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        {/* Left: Copy + Feature Cards */}
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            AI GROWTH ASSISTANT
          </div>

          <h2 className="font-display text-5xl md:text-6xl font-extrabold mb-6 leading-[1.05]">
            Your <span className="text-gradient italic">always-on</span><br />
            growth partner.
          </h2>
          <p className="text-gray-400 leading-relaxed mb-10 max-w-lg text-lg">
            Every creator and brand on Colabrise gets a dedicated AI assistant trained on their audience, content, and goals — predicting what to post, who to collab with, and what to charge.
          </p>

          {/* Feature cards - 2x2 grid */}
          <div className="grid grid-cols-2 gap-4">
            {aiFeatures.map((feature) => (
              <div key={feature.title} className="rounded-2xl border border-white/10 bg-dark-800 p-6">
                <feature.icon className="w-7 h-7 text-gray-400 mb-3" />
                <h4 className="text-white text-base font-bold mb-2">{feature.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Chat Mockup */}
        <div className="flex justify-center">
          <TiltCard tiltStrength={20}>
            <div className="glass-card p-8 w-full max-w-lg">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-base">Colabrise AI</p>
                  <p className="text-gray-500 text-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                    Online · learning your audience
                  </p>
                </div>
              </div>

              {/* User message */}
              <div className="ml-auto bg-purple-500/20 border border-purple-500/30 rounded-2xl px-5 py-3 max-w-[90%] mb-5">
                <p className="text-sm text-gray-200">Find me 5 fashion creators under 500k with high US Gen-Z overlap.</p>
              </div>

              {/* Assistant response - creator card */}
              <div className="mr-auto bg-white/5 border border-white/10 rounded-2xl px-5 py-4 max-w-[95%] mb-5">
                <p className="text-sm text-gray-300 mb-3">Found 5 strong matches. Top pick:</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500" />
                    <div>
                      <p className="text-white text-sm font-semibold">@luna.vega</p>
                      <p className="text-gray-500 text-xs">412K · 71% US Gen-Z · 8.2% ER</p>
                    </div>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium">98% match</span>
                </div>
              </div>

              {/* User action button */}
              <div className="ml-auto mb-5">
                <div className="inline-block bg-purple-500/20 border border-purple-500/40 rounded-full px-5 py-2.5">
                  <p className="text-sm text-purple-300 font-medium">Draft a brief & forecast ROI.</p>
                </div>
              </div>

              {/* Assistant forecast */}
              <div className="mr-auto bg-white/5 border border-white/10 rounded-2xl px-5 py-4 max-w-[95%] mb-5">
                <p className="text-sm text-gray-300 mb-3">Brief drafted. Forecast:</p>
                <div className="flex gap-3">
                  {[
                    { value: '1.8M', label: 'reach' },
                    { value: '6.4x', label: 'ROAS' },
                    { value: '$12K', label: 'est. rev' },
                  ].map((item) => (
                    <div key={item.label} className="flex-1 rounded-xl bg-white/5 border border-white/10 p-3 text-center">
                      <p className="text-gradient font-bold text-base">{item.value}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Input bar */}
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-5 py-3">
                <MessageCircle className="w-5 h-5 text-gray-500 shrink-0" />
                <p className="text-sm text-gray-500 flex-1">Ask anything about your growth...</p>
                <button className="px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold">
                  Send
                </button>
              </div>
            </div>
          </TiltCard>
        </div>
      </div>
    </section>
  )
}
