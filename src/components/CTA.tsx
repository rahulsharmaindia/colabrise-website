import { Mail } from 'lucide-react'

export default function CTA() {
  return (
    <section className="relative z-10 px-6 md:px-12 py-20 max-w-7xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600/20 via-pink-500/20 to-cyan-400/20 border border-white/10 p-12 md:p-16">
        {/* Background gradient blobs */}
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tl from-pink-500/30 to-purple-600/30 rounded-full blur-[80px]" />
        <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-gradient-to-br from-cyan-400/20 to-purple-500/20 rounded-full blur-[80px]" />

        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
            Ready to rise<br />
            together?
          </h2>
          <p className="text-gray-300 max-w-md mb-8">
            Whether you're a brand or a creator, your AI growth assistant is waiting. Join the Colabrise beta today.
          </p>
          <a
            href="mailto:hello@colabrise.com"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white font-medium text-sm hover:bg-white/15 transition-colors"
          >
            <Mail className="w-4 h-4" />
            hello@colabrise.com
          </a>
        </div>
      </div>
    </section>
  )
}
