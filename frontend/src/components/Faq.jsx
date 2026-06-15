import React from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
    {
        q: "What size brands do you work with?",
        a: "Most of our clients are venture-backed DTC, consumer tech, and lifestyle brands doing $2M–$80M ARR. If you're earlier, talk to us anyway — we run a small founder program with reduced rates.",
    },
    {
        q: "How fast can a campaign go live?",
        a: "Onboarding to first creator post averages 14 days. For brands with existing assets and clear briefs, we've launched in 6.",
    },
    {
        q: "Do you do paid amplification?",
        a: "Yes. Empire plans include whitelisted paid social powered by creator content. We typically see 30-50% lower CPAs vs. brand-led creative.",
    },
    {
        q: "Can we keep using our internal creator manager?",
        a: "Absolutely. Many of our clients use ColabRise as a force multiplier on top of internal teams. We're built to plug into your existing ops.",
    },
    {
        q: "What does reporting look like?",
        a: "Real-time dashboard with reach, engagement, click-through, sentiment, and revenue attribution. Plus a monthly strategy review with your dedicated lead.",
    },
];

export default function Faq() {
    return (
        <section
            id="faq"
            data-testid="faq-section"
            className="relative py-28 lg:py-36"
        >
            <div className="relative max-w-4xl mx-auto px-6">
                <div className="text-center mb-14">
                    <div className="font-body text-xs uppercase tracking-[0.3em] text-[#00e5ff] mb-4">
                        / questions
                    </div>
                    <h2 className="font-display font-black text-4xl md:text-6xl tracking-tighter text-white leading-[1.05]">
                        Quick answers,
                        <br />
                        <span className="gradient-text">no fluff.</span>
                    </h2>
                </div>

                <Accordion type="single" collapsible className="space-y-4">
                    {FAQS.map((f, i) => (
                        <AccordionItem
                            key={i}
                            value={`item-${i}`}
                            className="glass rounded-2xl border-0 px-6 data-[state=open]:bg-white/[0.05]"
                            data-testid={`faq-item-${i}`}
                        >
                            <AccordionTrigger className="font-display font-bold text-left text-white text-lg md:text-xl hover:no-underline py-6">
                                {f.q}
                            </AccordionTrigger>
                            <AccordionContent className="font-body text-white/65 text-base leading-relaxed pb-6">
                                {f.a}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}
