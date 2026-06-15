import React, { useState } from "react";
import { Toaster, toast } from "sonner";
import { submitLead } from "@/lib/api";

const BUDGETS = ["< $5k/mo", "$5k–$15k/mo", "$15k–$50k/mo", "$50k+/mo"];

export default function LeadForm() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        company: "",
        budget: "",
        message: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const setField = (k) => (e) =>
        setForm((f) => ({ ...f, [k]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email) {
            toast.error("Name and email are required.");
            return;
        }
        setSubmitting(true);
        try {
            await submitLead(form);
            setSubmitted(true);
            toast.success("We'll be in touch within 24 hours.");
            setForm({
                name: "",
                email: "",
                company: "",
                budget: "",
                message: "",
            });
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong. Try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section
            id="book-a-call"
            data-testid="lead-form-section"
            className="relative py-28 lg:py-36 border-t border-white/5"
        >
            <Toaster theme="dark" position="top-center" />
            <div
                className="blob blob-cyan"
                style={{
                    width: 480,
                    height: 480,
                    top: 0,
                    left: -200,
                    opacity: 0.3,
                }}
            />
            <div
                className="blob blob-pink"
                style={{
                    width: 480,
                    height: 480,
                    bottom: -120,
                    right: -120,
                    opacity: 0.3,
                }}
            />

            <div className="relative max-w-6xl mx-auto px-6 grid lg:grid-cols-[1fr_1.2fr] gap-12 items-center">
                <div>
                    <div className="font-body text-xs uppercase tracking-[0.3em] text-[#ff007f] mb-4">
                        / let's talk
                    </div>
                    <h2 className="font-display font-black text-4xl md:text-6xl tracking-tighter text-white leading-[1.05]">
                        Book a 30-min
                        <br />
                        <span className="gradient-text">strategy call.</span>
                    </h2>
                    <p className="font-body text-white/65 mt-6 max-w-md leading-relaxed">
                        No decks. No discovery questionnaires. Just a sharp
                        conversation with a senior strategist who&apos;s run plays
                        for brands like yours.
                    </p>

                    <div className="mt-10 space-y-3">
                        {[
                            "Senior strategist, not an AE",
                            "Custom plan within 48 hours",
                            "Zero pressure - we only pitch when it fits",
                        ].map((t) => (
                            <div
                                key={t}
                                className="flex items-center gap-3 font-body text-white/80"
                            >
                                <span
                                    className="h-1.5 w-1.5 rounded-full"
                                    style={{ background: "#00e5ff" }}
                                />
                                {t}
                            </div>
                        ))}
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    data-testid="lead-capture-form"
                    className="glass rounded-3xl p-8 md:p-10 space-y-5"
                >
                    {submitted ? (
                        <div
                            data-testid="lead-form-success"
                            className="py-10 text-center"
                        >
                            <div className="mx-auto h-14 w-14 rounded-full bg-gradient-to-br from-[#ff007f] to-[#00e5ff] flex items-center justify-center mb-5">
                                <svg
                                    className="h-6 w-6 text-black"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={3}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            <h3 className="font-display font-black text-2xl text-white">
                                You&apos;re in.
                            </h3>
                            <p className="font-body text-white/65 mt-2">
                                A strategist will reach out within 24 hours.
                            </p>
                            <button
                                type="button"
                                onClick={() => setSubmitted(false)}
                                className="mt-6 text-sm text-[#00e5ff] font-body underline-offset-4 hover:underline"
                            >
                                Send another
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <Field
                                    label="Full name"
                                    testId="lead-name"
                                    value={form.name}
                                    onChange={setField("name")}
                                    placeholder="Ada Lovelace"
                                    required
                                />
                                <Field
                                    label="Work email"
                                    testId="lead-email"
                                    type="email"
                                    value={form.email}
                                    onChange={setField("email")}
                                    placeholder="ada@brand.co"
                                    required
                                />
                            </div>
                            <Field
                                label="Company"
                                testId="lead-company"
                                value={form.company}
                                onChange={setField("company")}
                                placeholder="Brand & role"
                            />
                            <div>
                                <label className="font-body text-xs uppercase tracking-[0.2em] text-white/55 mb-2 block">
                                    Monthly budget
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {BUDGETS.map((b) => (
                                        <button
                                            key={b}
                                            type="button"
                                            data-testid={`lead-budget-${b}`}
                                            onClick={() =>
                                                setForm((f) => ({
                                                    ...f,
                                                    budget: b,
                                                }))
                                            }
                                            className={`px-4 py-2 rounded-full text-sm font-body border transition-all ${
                                                form.budget === b
                                                    ? "border-[#ff007f] bg-[#ff007f]/15 text-white"
                                                    : "border-white/15 text-white/70 hover:border-white/30"
                                            }`}
                                        >
                                            {b}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="font-body text-xs uppercase tracking-[0.2em] text-white/55 mb-2 block">
                                    What are you trying to launch?
                                </label>
                                <textarea
                                    data-testid="lead-message"
                                    rows={4}
                                    value={form.message}
                                    onChange={setField("message")}
                                    placeholder="Quick context on the brand, goals, and timing..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-body text-white placeholder:text-white/30 focus:outline-none focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] transition-colors resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                data-testid="lead-submit-button"
                                className="w-full px-6 py-4 rounded-full font-display font-bold text-black disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] transition-transform"
                                style={{
                                    background:
                                        "linear-gradient(110deg, #ff007f, #b026ff, #00e5ff)",
                                    boxShadow: "0 20px 60px -20px #ff007f88",
                                }}
                            >
                                {submitting
                                    ? "Sending..."
                                    : "Book my strategy call →"}
                            </button>
                            <p className="font-body text-xs text-white/40 text-center">
                                We respond within one business day. No spam,
                                ever.
                            </p>
                        </>
                    )}
                </form>
            </div>
        </section>
    );
}

function Field({
    label,
    testId,
    value,
    onChange,
    placeholder,
    type = "text",
    required = false,
}) {
    return (
        <div>
            <label className="font-body text-xs uppercase tracking-[0.2em] text-white/55 mb-2 block">
                {label}
                {required && <span className="text-[#ff007f] ml-1">*</span>}
            </label>
            <input
                data-testid={testId}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-body text-white placeholder:text-white/30 focus:outline-none focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] transition-colors"
            />
        </div>
    );
}
