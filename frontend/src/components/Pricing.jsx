import React from "react";

const TIERS = [
    {
        name: "Ignite",
        price: "$4.8k",
        period: "/mo",
        pitch: "For brands ready to test the waters.",
        features: [
            "Up to 6 creators / month",
            "Brief + creative direction",
            "Single-channel activation",
            "Monthly performance report",
        ],
        accent: "#b026ff",
        featured: false,
        cta: "Start with Ignite",
    },
    {
        name: "Pro",
        price: "$12k",
        period: "/mo",
        pitch: "Our most loved plan. Built for scale.",
        features: [
            "Up to 20 creators / month",
            "Multi-channel orchestration",
            "Always-on UGC engine",
            "Real-time dashboard",
            "Dedicated strategist",
        ],
        accent: "#ff007f",
        featured: true,
        cta: "Go Pro",
    },
    {
        name: "Empire",
        price: "Custom",
        period: "",
        pitch: "Category-defining brand programs.",
        features: [
            "Unlimited creator activations",
            "Global rollouts",
            "Fractional CMO + brand strategist",
            "Paid social amplification",
            "Quarterly executive offsites",
        ],
        accent: "#00e5ff",
        featured: false,
        cta: "Talk to founders",
    },
];

export default function Pricing() {
    return (
        <section
            id="pricing"
            data-testid="pricing-section"
            className="relative py-28 lg:py-36"
        >
            <div
                className="blob blob-pink"
                style={{
                    width: 420,
                    height: 420,
                    bottom: -120,
                    right: -120,
                    opacity: 0.3,
                }}
            />
            <div className="relative max-w-7xl mx-auto px-6">
                <div className="max-w-3xl mb-16">
                    <div className="font-body text-xs uppercase tracking-[0.3em] text-[#b026ff] mb-4">
                        / pricing
                    </div>
                    <h2 className="font-display font-black text-4xl md:text-6xl tracking-tighter text-white leading-[1.05]">
                        Plans built for
                        <br />
                        <span className="gradient-text">ambitious</span>{" "}
                        operators.
                    </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {TIERS.map((t) => (
                        <div
                            key={t.name}
                            data-testid={`pricing-tier-${t.name.toLowerCase()}`}
                            className={`relative rounded-3xl p-8 md:p-10 ${
                                t.featured
                                    ? "bg-gradient-to-b from-white/[0.08] to-white/[0.02]"
                                    : "glass"
                            }`}
                            style={
                                t.featured
                                    ? {
                                          boxShadow:
                                              "0 30px 100px -30px #ff007f55, inset 0 1px 0 rgba(255,255,255,0.08)",
                                      }
                                    : {}
                            }
                        >
                            {t.featured && (
                                <>
                                    <div
                                        className="absolute inset-0 rounded-3xl pointer-events-none"
                                        style={{
                                            padding: 1.5,
                                            background:
                                                "linear-gradient(135deg, #ff007f, #b026ff, #00e5ff)",
                                            WebkitMask:
                                                "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                                            WebkitMaskComposite: "xor",
                                            maskComposite: "exclude",
                                        }}
                                    />
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] font-display font-bold text-black bg-gradient-to-r from-[#ff007f] via-[#b026ff] to-[#00e5ff]">
                                        Most loved
                                    </div>
                                </>
                            )}

                            <div className="relative">
                                <div
                                    className="font-body text-xs uppercase tracking-[0.3em] mb-3"
                                    style={{ color: t.accent }}
                                >
                                    {t.name}
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="font-display font-black text-5xl tracking-tighter text-white">
                                        {t.price}
                                    </span>
                                    <span className="font-body text-white/55">
                                        {t.period}
                                    </span>
                                </div>
                                <p className="font-body text-white/60 mt-3 text-sm">
                                    {t.pitch}
                                </p>

                                <div className="my-7 h-px bg-white/10" />

                                <ul className="space-y-3 mb-9">
                                    {t.features.map((f) => (
                                        <li
                                            key={f}
                                            className="flex items-start gap-3 font-body text-sm text-white/80"
                                        >
                                            <svg
                                                className="h-4 w-4 mt-0.5 shrink-0"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke={t.accent}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={3}
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                <a
                                    href="#book-a-call"
                                    data-testid={`pricing-cta-${t.name.toLowerCase()}`}
                                    className={`block text-center px-6 py-3.5 rounded-full font-display font-bold transition-all ${
                                        t.featured
                                            ? "text-black"
                                            : "text-white border border-white/15 hover:border-white/40"
                                    }`}
                                    style={
                                        t.featured
                                            ? {
                                                  background:
                                                      "linear-gradient(110deg, #ff007f, #b026ff, #00e5ff)",
                                              }
                                            : {}
                                    }
                                >
                                    {t.cta}
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
