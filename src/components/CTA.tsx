import { ArrowUpRight } from 'lucide-react'

export default function CTA() {
  return (
    <section id="contact" className="relative z-10 px-6 md:px-12 py-20 max-w-7xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 p-12 md:p-16">
        <div className="relative z-10">
          <h2 className="font-display text-4xl md:text-5xl font-semibold leading-tight mb-4 text-black">
            Ready to rise<br />
            together?
          </h2>
          <p className="text-black/70 max-w-md mb-8">
            Whether you're a brand or a creator, your AI growth assistant is waiting. Join the Colabrise beta today.
          </p>
          <a
            href="mailto:contactus@colabrise.com"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white font-medium text-sm hover:bg-black/80 transition-colors"
          >
            contactus@colabrise.com
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  )
}
