import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAV = [
    { label: "Services", href: "#services" },
    { label: "Work", href: "#case-studies" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 30);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <header
            data-testid="navbar"
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
                scrolled ? "py-3" : "py-5"
            }`}
        >
            <div className="max-w-7xl mx-auto px-6">
                <div
                    className={`flex items-center justify-between px-5 py-3 rounded-2xl transition-all duration-500 ${
                        scrolled
                            ? "glass"
                            : "bg-transparent border border-transparent"
                    }`}
                >
                    <a
                        href="#"
                        data-testid="navbar-logo"
                        className="flex items-center gap-2"
                    >
                        <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-[#ff007f] via-[#b026ff] to-[#00e5ff]" />
                        <span className="font-display font-black text-xl tracking-tighter text-white">
                            ColabRise
                        </span>
                    </a>

                    <nav className="hidden md:flex items-center gap-8">
                        {NAV.map((n) => (
                            <a
                                key={n.label}
                                href={n.href}
                                data-testid={`nav-link-${n.label.toLowerCase()}`}
                                className="font-body text-sm text-white/70 hover:text-white transition-colors"
                            >
                                {n.label}
                            </a>
                        ))}
                    </nav>

                    <div className="flex items-center gap-3">
                        <a
                            href="#book-a-call"
                            data-testid="navbar-cta-book-call"
                            className="gradient-border px-5 py-2.5 font-body text-sm font-semibold text-white hover:scale-105 transition-transform"
                        >
                            Book a call
                        </a>
                        <button
                            onClick={() => setOpen((o) => !o)}
                            className="md:hidden text-white/80"
                            data-testid="navbar-mobile-toggle"
                            aria-label="Toggle menu"
                        >
                            <div className="space-y-1.5">
                                <span className="block h-px w-6 bg-white" />
                                <span className="block h-px w-6 bg-white" />
                            </div>
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {open && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="md:hidden glass mt-2 rounded-2xl px-6 py-5 flex flex-col gap-4"
                        >
                            {NAV.map((n) => (
                                <a
                                    key={n.label}
                                    href={n.href}
                                    onClick={() => setOpen(false)}
                                    className="font-body text-white/80"
                                >
                                    {n.label}
                                </a>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    );
}
