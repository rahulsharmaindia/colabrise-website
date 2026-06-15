import React from "react";
import Marquee from "react-fast-marquee";

const BRANDS = [
    "NOVA",
    "PULSE",
    "AURORA",
    "VANTA",
    "NEBULA",
    "KINETIC",
    "ECHELON",
    "PRISM",
    "ORBIT",
    "FLUX",
];

export default function BrandMarquee() {
    return (
        <section
            data-testid="brand-marquee-section"
            className="relative py-14 border-y border-white/5 bg-black/40"
        >
            <div className="max-w-7xl mx-auto px-6 mb-8 flex items-center gap-3">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                <span className="font-body text-xs uppercase tracking-[0.3em] text-white/50">
                    Trusted by category-defining brands
                </span>
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            </div>

            <Marquee gradient={false} speed={45} pauseOnHover>
                {BRANDS.concat(BRANDS).map((b, i) => (
                    <div
                        key={i}
                        className="mx-12 flex items-center gap-3 opacity-70 hover:opacity-100 transition-opacity"
                    >
                        <div
                            className="h-2 w-2 rounded-full"
                            style={{
                                background:
                                    i % 3 === 0
                                        ? "#ff007f"
                                        : i % 3 === 1
                                          ? "#b026ff"
                                          : "#00e5ff",
                            }}
                        />
                        <span className="font-display font-black tracking-tighter text-2xl md:text-3xl text-white/80">
                            {b}
                        </span>
                    </div>
                ))}
            </Marquee>
        </section>
    );
}
