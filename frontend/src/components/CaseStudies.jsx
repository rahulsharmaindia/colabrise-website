import React from "react";
import Tilt from "react-parallax-tilt";

const STUDIES = [
    {
        brand: "AURORA SKIN",
        creator: "@miravale · 1.2M",
        img: "https://images.unsplash.com/photo-1548361403-cb0c785eea54?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjd8MHwxfHNlYXJjaHwxfHxuZW9uJTIwZmFzaGlvbiUyMHBvcnRyYWl0fGVufDB8fHx8MTc4MTU1NDA4M3ww&ixlib=rb-4.1.0&q=85",
        metric: "+412%",
        metricLabel: "Site sessions in 21 days",
        tag: "DTC · Beauty",
        accent: "#ff007f",
    },
    {
        brand: "NEBULA AUDIO",
        creator: "@jaykinetic · 860K",
        img: "https://images.unsplash.com/photo-1649935819961-18b1c2267995?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjd8MHwxfHNlYXJjaHwyfHxuZW9uJTIwZmFzaGlvbiUyMHBvcnRyYWl0fGVufDB8fHx8MTc4MTU1NDA4M3ww&ixlib=rb-4.1.0&q=85",
        metric: "7.8x",
        metricLabel: "Return on ad spend",
        tag: "Consumer Electronics",
        accent: "#00e5ff",
    },
    {
        brand: "VANTA FITNESS",
        creator: "12-creator squad",
        img: "https://images.unsplash.com/photo-1548361403-cb0c785eea54?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjd8MHwxfHNlYXJjaHwxfHxuZW9uJTIwZmFzaGlvbiUyMHBvcnRyYWl0fGVufDB8fHx8MTc4MTU1NDA4M3ww&ixlib=rb-4.1.0&q=85",
        metric: "31M",
        metricLabel: "Organic reach (no boosts)",
        tag: "Wellness",
        accent: "#b026ff",
    },
];

export default function CaseStudies() {
    return (
        <section
            id="case-studies"
            data-testid="case-studies-section"
            className="relative py-28 lg:py-36 border-t border-white/5"
        >
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
                    <div className="max-w-2xl">
                        <div className="font-body text-xs uppercase tracking-[0.3em] text-[#ff007f] mb-4">
                            / receipts
                        </div>
                        <h2 className="font-display font-black text-4xl md:text-6xl tracking-tighter text-white leading-[1.05]">
                            Campaigns that
                            <br />
                            <span className="gradient-text">moved markets.</span>
                        </h2>
                    </div>
                    <p className="font-body text-white/60 max-w-sm">
                        We don&apos;t do &ldquo;engagement&rdquo;. We do conversions, category
                        captures, and unfair share-of-voice.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {STUDIES.map((c) => (
                        <Tilt
                            key={c.brand}
                            tiltMaxAngleX={8}
                            tiltMaxAngleY={8}
                            glareEnable
                            glareMaxOpacity={0.2}
                            glareColor={c.accent}
                        >
                            <div
                                data-testid={`case-study-${c.brand.toLowerCase().replace(/\s+/g, "-")}`}
                                className="glass rounded-3xl overflow-hidden group"
                            >
                                <div className="relative h-72 overflow-hidden">
                                    <img
                                        src={c.img}
                                        alt={c.brand}
                                        className="absolute inset-0 w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                                    <div
                                        className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] font-body font-semibold"
                                        style={{
                                            background: `${c.accent}33`,
                                            color: c.accent,
                                            border: `1px solid ${c.accent}66`,
                                        }}
                                    >
                                        {c.tag}
                                    </div>
                                    <div className="absolute bottom-4 left-5 right-5">
                                        <div className="font-body text-xs text-white/60">
                                            {c.creator}
                                        </div>
                                        <div className="font-display font-black text-2xl text-white tracking-tighter">
                                            {c.brand}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div
                                        className="font-display font-black text-5xl tracking-tighter"
                                        style={{ color: c.accent }}
                                    >
                                        {c.metric}
                                    </div>
                                    <div className="font-body text-sm text-white/65 mt-1">
                                        {c.metricLabel}
                                    </div>
                                </div>
                            </div>
                        </Tilt>
                    ))}
                </div>
            </div>
        </section>
    );
}
