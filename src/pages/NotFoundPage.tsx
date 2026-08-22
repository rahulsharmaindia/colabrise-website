import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Navbar from '../components/Navbar'
import GradientBlobs from '../components/GradientBlobs'

export default function NotFoundPage() {
  return (
    <div className="relative min-h-screen bg-dark-900">
      <GradientBlobs />
      <Navbar />
      <main className="relative z-10 px-6 md:px-12 py-24 max-w-7xl mx-auto text-center">
        <p className="text-sm text-gray-500 uppercase tracking-widest mb-4">404</p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold mb-6">
          This page <span className="text-gradient">doesn't exist.</span>
        </h1>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 text-white font-medium text-sm hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back home
        </Link>
      </main>
    </div>
  )
}
