const footerLinks = {
  Platform: ['AI Matchmaking', 'Growth Co-Pilot', 'Deal Flow', 'Analytics'],
  Company: ['About', 'Careers', 'Blog', 'Press'],
  Resources: ['Documentation', 'Help Center', 'API', 'Status'],
  Legal: ['Privacy', 'Terms', 'Cookies'],
}

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 px-6 md:px-12 py-12 max-w-7xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-pink-400 to-purple-500" />
            <span className="text-white font-semibold text-lg">Colabrise</span>
          </div>
          <p className="text-gray-500 text-xs">
            Where creators and brands collab rise.
          </p>
        </div>

        {Object.entries(footerLinks).map(([category, links]) => (
          <div key={category}>
            <h4 className="text-white text-sm font-semibold mb-3">{category}</h4>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link}>
                  <a href="#" className="text-gray-500 text-xs hover:text-gray-300 transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-gray-600 text-xs">© 2024 Colabrise. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="text-gray-500 text-xs hover:text-gray-300 transition-colors">Twitter</a>
          <a href="#" className="text-gray-500 text-xs hover:text-gray-300 transition-colors">Instagram</a>
          <a href="#" className="text-gray-500 text-xs hover:text-gray-300 transition-colors">LinkedIn</a>
        </div>
      </div>
    </footer>
  )
}
