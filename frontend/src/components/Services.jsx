import React from "react";
import Tilt from "react-parallax-tilt";

const SERVICES = [
    {
        title: "Creator Matchmaking",
        sub: "Algorithmic + human curation",
        body: "We map your brand DNA to 640+ vetted creators — by audience, vibe, and conversion intent. No vanity follower counts.",
        accent: "#ff007f",
        icon: "M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2",
        span: "md:col-span-2",
    },
    {
        title: "Campaign Ops",
        sub: "End-to-end, zero babysitting",
        body: "Briefs, contracts, content review, FTC. Handled.",
        accent: "#b026ff",
        icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
        span: "",
    },
    {
        title: "Performance Analytics",
        sub: "What actually moved",
        body: "Real-time dashboards. Attribution beyond clicks. We tie creator activity to revenue, not just reach.",
        accent: "#00e5ff",
        icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
        span: "",
    },
    {
        title: "UGC Engine",
        sub: "Scroll-stopping content, weekly",
        body: "An always-on pipeline of authentic UGC for paid social, retargeting and PDP pages.",
        accent: "#ff007f",
        icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
        span: "",
    },
    {
        title: "Always-On Strategy",
        sub: "Fractional CMO energy",
        body: "Quarterly creative sprints, channel testing, and a content calendar mapped to your funnel. We sit in your Slack, not in your inbox.",
        accent: "#00e5ff",
        icon: "M13 10V3L4 14h7v7l9-11h-7z",
        span: "md:col-span-2",
    },
];

function Card({ s }) {
    return (
        <Tilt
            tiltMaxAngleX={6}
            tiltMaxAngleY={6}
            glareEnable
            glareMaxOpacity={0.15}
            glareColor={s.accent}
            glarePosition="all"
            scale={1.01}
            transitionSpeed={1500}
            className={`${s.span} h-full`}
        >
            <div
                data-testid={`service-card-${s.title.toLowerCase().replace(/\s+/g, "-")}`}
                className="glass h-full rounded-3xl p-8 md:p-10 relative overflow-hidden group"
                style={{
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 30px 80px -40px ${s.accent}66`,
                }}
            >
                <div
                    className="absolute -top-20 -right-20 h-60 w-60 rounded-full opacity-30 blur-3xl"
                    style={{ background: s.accent }}
                />
                <div className="relative z-10 flex flex-col h-full">
                    <div
                        className="h-12 w-12 rounded-2xl flex items-center justify-center mb-6"
                        style={{
                            background: `${s.accent}22`,
                            border: `1px solid ${s.accent}55`,
                        }}
                    >
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke={s.accent}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d={s.icon}
                            />
                        </svg>
                    </div>
                    <div
                        className="font-body text-xs uppercase tracking-[0.25em] mb-2"
                        style={{ color: s.accent }}
                    >
                        {s.sub}
                    </div>
                    <h3 className="font-display font-black text-3xl md:text-4xl text-white tracking-tighter leading-tight">
                        {s.title}
                    </h3>
                    <p className="font-body text-white/65 mt-4 leading-relaxed">
                        {s.body}
                    </p>
                    <div className="mt-auto pt-6 flex items-center gap-2 text-white/60 group-hover:text-white transition-colors">
                        <span className="font-body text-sm">Learn more</span>
                        <span>→</span>
                    </div>
                </div>
            </div>
        </Tilt>
    );
}

export default function Services() {
    return (
        <section
            id="services"
            data-testid="services-section"
            className="relative py-28 lg:py-36"
        >
            <div
                className="blob blob-violet"
                style={{
                    width: 500,
                    height: 500,
                    top: 100,
                    left: -200,
                    opacity: 0.25,
                }}
            />
            <div className="relative max-w-7xl mx-auto px-6">
                <div className="max-w-3xl mb-16">
                    <div className="font-body text-xs uppercase tracking-[0.3em] text-[#00e5ff] mb-4">
                        / what we do
                    </div>
                    <h2 className="font-display font-black text-4xl md:text-6xl tracking-tighter text-white leading-[1.05]">
                        A full-stack growth engine
                        <br />
                        <span className="gradient-text">disguised</span> as a
                        creator agency.
                    </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-5 auto-rows-fr">
                    {SERVICES.map((s) => (
                        <Card key={s.title} s={s} />
                    ))}
                </div>
            </div>
        </section>
    );
}
