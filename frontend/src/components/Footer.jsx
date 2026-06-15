import React from "react";

export default function Footer() {
    return (
        <footer
            data-testid="footer"
            className="relative pt-24 pb-10 border-t border-white/5 overflow-hidden"
        >
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-12 mb-16">
                    <div>
                        <div className="flex items-center gap-2 mb-5">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#ff007f] via-[#b026ff] to-[#00e5ff]" />
                            <span className="font-display font-black text-2xl tracking-tighter text-white">
                                ColabRise
                            </span>
                        </div>
                        <p className="font-body text-white/55 max-w-sm leading-relaxed">
                            Influencer marketing for brands that refuse to
                            blend in. New York · Lisbon · Singapore.
                        </p>
                    </div>

                    {[
                        {
                            title: "Company",
                            links: ["About", "Careers", "Press", "Contact"],
                        },
                        {
                            title: "Services",
                            links: [
                                "Matchmaking",
                                "Campaign Ops",
                                "Analytics",
                                "UGC Engine",
                            ],
                        },
                        {
                            title: "Resources",
                            links: ["Case studies", "Blog", "Reports", "Trends"],
                        },
                    ].map((col) => (
                        <div key={col.title}>
                            <div className="font-display font-bold text-white mb-4">
                                {col.title}
                            </div>
                            <ul className="space-y-3">
                                {col.links.map((l) => (
                                    <li key={l}>
                                        <a
                                            href="#"
                                            className="font-body text-sm text-white/55 hover:text-white transition-colors"
                                        >
                                            {l}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="relative">
                    <div
                        aria-hidden
                        className="select-none pointer-events-none font-display font-black tracking-tighter text-[clamp(64px,18vw,260px)] leading-none bg-clip-text text-transparent"
                        style={{
                            backgroundImage:
                                "linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0))",
                        }}
                    >
                        COLABRISE
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5">
                    <div className="font-body text-xs text-white/40">
                        © {new Date().getFullYear()} ColabRise Inc. All rights
                        reserved.
                    </div>
                    <div className="flex items-center gap-6 text-white/40 font-body text-xs">
                        <a href="#" className="hover:text-white">
                            Privacy
                        </a>
                        <a href="#" className="hover:text-white">
                            Terms
                        </a>
                        <a href="#" className="hover:text-white">
                            Cookies
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
