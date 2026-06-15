import { Sparkles } from 'lucide-react'

const navLinks = ['Platform', 'AI Assistant', 'Creators', 'Features', 'Contact']

export default function Navbar() {
  return (
    <nav className="relative z-50 flex items-center justify-between px-6 md:px-12 py-4 max-w-7xl mx-auto">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-pink-400 to-purple-500" />
        <span className="text-white font-bold text-xl">Colabrise</span>
      </div>

      <div className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => (
          <a
            key={link}
            href={`#${link.toLowerCase().replace(' ', '-')}`}
            className="text-sm text-gray-300 hover:text-white transition-colors"
          >
            {link}
          </a>
        ))}
      </div>

      <button className="px-5 py-2 text-sm font-medium rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:opacity-90 transition-opacity flex items-center gap-2">
        <Sparkles className="w-4 h-4" />
        Get early access
      </button>
    </nav>
  )
}
