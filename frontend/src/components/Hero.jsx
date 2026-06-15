import React from "react";
import { motion } from "framer-motion";
import FloatingPhones from "./FloatingPhones";

export default function Hero() {
    return (
        <section
            data-testid="hero-section"
            className="relative pt-40 pb-28 overflow-hidden"
        >
            {/* Gradient blobs */}
            <div
                className="blob blob-pink"
                style={{
                    width: 480,
                    height: 480,
                    top: -120,
                    left: -120,
                    opacity: 0.55,
                }}
            />
            <div
                className="blob blob-violet"
                style={{
                    width: 520,
                    height: 520,
                    top: 80,
                    right: -160,
                    opacity: 0.5,
                }}
            />
            <div
                className="blob blob-cyan"
                style={{
                    width: 440,
                    height: 440,
                    bottom: -160,
                    left: "30%",
                    opacity: 0.35,
                }}
            />
            <div className="grain" />

            <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
                <div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 gradient-border px-4 py-1.5 mb-8"
                    >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#00e5ff] animate-pulse" />
                        <span className="font-body text-xs uppercase tracking-[0.25em] text-white/80">
                            Influencer marketing, reinvented
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="font-display font-black text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-[0.95] tracking-tighter text-white"
                    >
                        Bold.{" "}
                        <span className="text-white/40 italic font-light">
                            Dark.
                        </span>
                        <br />
                        <span className="gradient-text shimmer">Viral.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.25 }}
                        className="mt-8 max-w-xl font-body text-lg text-white/70 leading-relaxed"
                    >
                        ColabRise pairs ambitious brands with the internet's
                        most magnetic creators — engineering campaigns that
                        don&apos;t just trend, they reshape culture.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="mt-10 flex flex-wrap items-center gap-4"
                    >
                        <a
                            href="#book-a-call"
                            data-testid="hero-cta-primary"
                            className="group relative inline-flex items-center gap-2 px-7 py-4 rounded-full font-display font-bold text-black overflow-hidden"
                            style={{
                                background:
                                    "linear-gradient(110deg, #ff007f 0%, #b026ff 50%, #00e5ff 100%)",
                                boxShadow: "0 20px 60px -10px #ff007f88",
                            }}
                        >
                            <span className="relative z-10">
                                Launch a campaign
                            </span>
                            <svg
                                className="relative z-10 h-4 w-4 group-hover:translate-x-1 transition-transform"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                />
                            </svg>
                        </a>
                        <a
                            href="#case-studies"
                            data-testid="hero-cta-secondary"
                            className="glass px-7 py-4 rounded-full font-display font-semibold text-white hover:bg-white/10 transition-colors"
                        >
                            See the receipts ↓
                        </a>
                    </motion.div>

                    {/* Stat row */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.6 }}
                        className="mt-14 grid grid-cols-3 gap-6 max-w-lg"
                    >
                        {[
                            { v: "2.8B", l: "Impressions delivered" },
                            { v: "640+", l: "Creators in network" },
                            { v: "5.4x", l: "Avg. ROAS" },
                        ].map((s) => (
                            <div key={s.l}>
                                <div className="font-display font-black text-3xl gradient-text">
                                    {s.v}
                                </div>
                                <div className="font-body text-xs text-white/55 mt-1">
                                    {s.l}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>

                <div className="relative">
                    <FloatingPhones />
                </div>
            </div>
        </section>
    );
}
