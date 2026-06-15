import React from "react";
import { motion } from "framer-motion";

const PHONE_IMG =
    "https://images.unsplash.com/photo-1483478550801-ceba5fe50e8e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzN8MHwxfHNlYXJjaHwzfHxzbWFydHBob25lJTIwZGFya3xlbnwwfHx8fDE3ODE1NTQwODN8MA&ixlib=rb-4.1.0&q=85";

function Phone({ rotate = -8, delay = 0, scale = 1, accent = "#ff007f" }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40, rotate: rotate - 6 }}
            animate={{
                opacity: 1,
                y: [0, -22, 0],
                rotate: rotate,
            }}
            transition={{
                opacity: { duration: 0.8, delay },
                rotate: { duration: 0.8, delay },
                y: {
                    duration: 7 + delay,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay,
                },
            }}
            style={{
                transform: `scale(${scale})`,
                boxShadow: `0 30px 80px -20px ${accent}55, 0 0 0 1px rgba(255,255,255,0.08)`,
            }}
            className="relative rounded-[2.4rem] p-2 bg-gradient-to-b from-white/10 to-white/[0.02] backdrop-blur-xl"
        >
            <div className="relative h-[420px] w-[210px] rounded-[2rem] overflow-hidden bg-black">
                <img
                    src={PHONE_IMG}
                    alt="phone preview"
                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/70" />
                {/* notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 h-5 w-24 rounded-full bg-black/80 border border-white/10" />
                {/* fake UI */}
                <div className="absolute bottom-5 left-4 right-4 space-y-2">
                    <div
                        className="text-[10px] uppercase tracking-[0.25em] font-display font-bold"
                        style={{ color: accent }}
                    >
                        Live Drop
                    </div>
                    <div className="font-display text-white text-base font-bold leading-tight">
                        @ariawave · 2.4M
                    </div>
                    <div className="flex gap-2">
                        <div className="px-2 py-1 rounded-full text-[9px] font-body bg-white/10 text-white/80">
                            +318% reach
                        </div>
                        <div className="px-2 py-1 rounded-full text-[9px] font-body bg-white/10 text-white/80">
                            5.2x ROAS
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default function FloatingPhones() {
    return (
        <div
            data-testid="floating-phones"
            className="relative h-[520px] w-full hidden md:block"
        >
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <Phone rotate={-10} delay={0.1} scale={0.95} accent="#ff007f" />
            </div>
            <div className="absolute left-[58%] top-[18%]">
                <Phone rotate={9} delay={0.4} scale={0.82} accent="#00e5ff" />
            </div>
            <div className="absolute left-[8%] top-[24%]">
                <Phone rotate={-18} delay={0.7} scale={0.78} accent="#b026ff" />
            </div>
        </div>
    );
}
