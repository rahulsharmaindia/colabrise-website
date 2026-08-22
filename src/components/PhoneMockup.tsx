import { Play } from 'lucide-react'
import { FaInstagram } from 'react-icons/fa6'

interface PhoneMockupProps {
  className?: string
  gradient: string
  label: string
  stat: string
  subtext: string
  isMain?: boolean
  icon?: 'instagram' | 'play'
}

export default function PhoneMockup({ className = '', gradient, label, stat, subtext, isMain, icon }: PhoneMockupProps) {
  return (
    <div
      className={`${className} group`}
    >
      {/* Outer thick gradient border */}
      <div
        className={`${isMain ? 'w-[230px] h-[354px]' : 'w-[177px] h-[265px]'} rounded-[28px] bg-gradient-to-br ${gradient} p-[12px] animate-float relative`}
        style={{ animationDelay: isMain ? '0s' : '1.5s' }}
      >
        {/* Glow effect behind card */}
        <div className={`absolute inset-0 rounded-[28px] bg-gradient-to-br ${gradient} blur-2xl opacity-50 -z-10`} />

        {/* Inner card */}
        <div className="w-full h-full rounded-[16px] bg-gradient-to-br from-white/20 to-white/5 relative overflow-hidden backdrop-blur-sm border border-white/10">
          {/* Dark tinted overlay */}
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-30`} />
          <div className="absolute inset-0 bg-black/40" />

          {/* Content */}
          <div className="relative z-10 p-4 flex flex-col h-full">
            {/* Top section */}
            <div className="mb-auto">
              {/* Icon */}
              {icon === 'instagram' && (
                <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2">
                  <FaInstagram className="w-4 h-4 text-white" />
                </div>
              )}
              {icon === 'play' && (
                <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2">
                  <Play className="w-4 h-4 text-white" />
                </div>
              )}
              {isMain && (
                <div className="flex justify-between items-start">
                  <p className="text-[11px] text-white/70 font-medium uppercase tracking-wider">{label}</p>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-300/80" />
                </div>
              )}
              {!isMain && label && (
                <p className="text-[11px] text-white/80 font-medium">{label}</p>
              )}
              <p className={`${isMain ? 'text-3xl mt-1' : 'text-2xl mt-1'} font-semibold text-white`}>{stat}</p>
              {isMain && subtext && (
                <p className="text-xs text-white/60 mt-0.5">{subtext}</p>
              )}
            </div>

            {/* Middle area - frosted glass rectangle */}
            <div className={`${isMain ? 'h-20' : 'h-12'} rounded-xl bg-white/15 backdrop-blur-sm border border-white/10 shrink-0`} />

            {/* Bottom section */}
            <div className="mt-auto pt-2">
              {isMain ? (
                <div className="flex gap-2 items-center">
                  <div className="w-12 h-5 rounded-full bg-white/15 backdrop-blur-sm" />
                  <div className="w-7 h-5 rounded-full bg-green-400/80" />
                </div>
              ) : (
                subtext && <p className="text-[10px] text-white/60">{subtext}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
