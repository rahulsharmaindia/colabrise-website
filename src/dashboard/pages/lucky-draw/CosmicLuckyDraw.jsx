/**
 * CosmicLuckyDraw
 * ────────────────────────────────────────────────────────────────────────────
 * A self-contained "warp speed starfield" lucky-draw component.
 *
 * No 3D libraries. A tiny custom perspective projection is drawn onto a single
 * high-DPI <canvas> inside a requestAnimationFrame loop. Participant names live
 * as points in a 3D field (x, y, z); we project them to 2D with a focal length
 * and animate the camera flying through them, finally locking the pre-chosen
 * winner dead-center with a confetti burst.
 *
 * Everything is driven by refs (not React state) inside the rAF loop so the
 * animation never triggers re-renders. React state is used only for the UI
 * chrome (textarea value, entry count, winner banner, running flag).
 *
 * Deps: React + Tailwind + lucide-react icons only.
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { Sparkles, Rocket, Users, RotateCcw, Trophy } from 'lucide-react'

// ── Tunable constants ────────────────────────────────────────────────────────
const FOCAL_LENGTH = 400 // perspective strength; larger = flatter/less fisheye
const BASE_FONT = 22 // base font size (world units) before perspective scaling
const Z_MAX = 1000 // far clip plane: names spawn/recycle here
const IDLE_SPEED = 0.5 // z-decrement per frame while drifting
const WARP_SPEED = 32 // z-decrement per frame at peak warp (spec: 25–40)
const WINNER_Z = 150 // final locked depth of the winning name

// Animation-phase timing (ms), measured from draw start.
const ACCEL_MS = 1500 // ramp up to warp
const WARP_MS = 3500 // sustained warp flight
const DECEL_MS = 2200 // ease out + converge winner to center

// Animation phases.
const PHASE = {
  IDLE: 'IDLE',
  ACCELERATING: 'ACCELERATING',
  WARP_SPEED: 'WARP_SPEED',
  DECELERATING: 'DECELERATING',
  REVEAL: 'REVEAL',
}

// ── Pure helpers ──────────────────────────────────────────────────────────────

/** Random float in [min, max). */
function rand(min, max) {
  return Math.random() * (max - min) + min
}

/** Clamp a value into [min, max]. */
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}

/**
 * Parse the raw textarea string into a clean list of names.
 * Splits on commas and newlines, trims, drops empties, de-duplicates
 * (case-insensitive) while preserving the first-seen casing/order.
 */
function parseNames(raw) {
  const seen = new Set()
  const out = []
  for (const part of raw.split(/[\n,]+/)) {
    const name = part.trim()
    if (!name) continue
    const key = name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(name)
  }
  return out
}

/** Build a fresh 3D starfield point for a given name. */
function makeStar(text) {
  return {
    text,
    x: rand(-500, 500),
    y: rand(-500, 500),
    z: rand(1, Z_MAX),
    isWinner: false,
  }
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function CosmicLuckyDraw() {
  // UI state (chrome only — never read inside the hot rAF loop).
  const [rawNames, setRawNames] = useState(
    'Aarav\nDiya\nRohan\nMeera\nKabir\nAnanya\nVivaan\nIshita',
  )
  const [running, setRunning] = useState(false)
  const [winner, setWinner] = useState(null)

  const names = parseNames(rawNames)
  const count = names.length

  // Canvas + animation refs.
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const rafRef = useRef(0)
  const starsRef = useRef([]) // active 3D points
  const particlesRef = useRef([]) // confetti particles
  const dprRef = useRef(1)

  // Animation control, held in a single ref so the loop reads live values
  // without re-subscribing each frame.
  const animRef = useRef({
    phase: PHASE.IDLE,
    startTime: 0, // timestamp when the draw began
    velocity: IDLE_SPEED, // current global z-velocity
    winnerIndex: -1, // index into starsRef of the chosen winner
    revealScale: 0, // eases 0→1 as the winner locks in
    pulse: 0, // free-running phase accumulator for the pulsing glow
    confettiFired: false,
  })

  // ── Seed / reseed the starfield whenever the parsed names change ──────────────
  // We keep this in a ref-synced effect so idle drift always reflects the
  // current roster without restarting an in-progress draw.
  useEffect(() => {
    if (running) return // don't disturb an active draw
    starsRef.current = names.map(makeStar)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawNames, running])

  // ── High-DPI canvas sizing via ResizeObserver ─────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2) // cap for perf
      dprRef.current = dpr
      const { clientWidth: w, clientHeight: h } = container
      canvas.width = Math.max(1, Math.floor(w * dpr))
      canvas.height = Math.max(1, Math.floor(h * dpr))
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(container)
    window.addEventListener('resize', resize)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', resize)
    }
  }, [])

  // ── Confetti burst from canvas center ────────────────────────────────────────
  const fireConfetti = useCallback((cx, cy) => {
    const colors = ['#34d399', '#22d3ee', '#a855f7', '#f472b6', '#facc15', '#60a5fa']
    const particles = []
    const n = 160
    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 * i) / n + rand(-0.1, 0.1)
      const speed = rand(4, 13)
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: rand(2, 6),
        color: colors[(Math.random() * colors.length) | 0],
        life: 1, // 1 → 0
        decay: rand(0.008, 0.02),
        spin: rand(-0.3, 0.3),
        rot: rand(0, Math.PI * 2),
      })
    }
    particlesRef.current = particles
  }, [])

  // ── The main animation loop ──────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let lastTs = performance.now()

    const frame = (ts) => {
      rafRef.current = requestAnimationFrame(frame)
      const anim = animRef.current
      const dpr = dprRef.current
      const W = canvas.width
      const H = canvas.height
      const cx = W / 2
      const cy = H / 2
      const dt = Math.min(50, ts - lastTs) // ms, clamped against tab-switch jumps
      lastTs = ts
      anim.pulse += dt / 1000

      // ── Phase transitions (time-based) ──────────────────────────────────────
      if (anim.phase !== PHASE.IDLE && anim.phase !== PHASE.REVEAL) {
        const elapsed = ts - anim.startTime
        if (elapsed < ACCEL_MS) {
          anim.phase = PHASE.ACCELERATING
          // Ease-in ramp from idle speed up to warp.
          const t = elapsed / ACCEL_MS
          anim.velocity = IDLE_SPEED + (WARP_SPEED - IDLE_SPEED) * (t * t)
        } else if (elapsed < ACCEL_MS + WARP_MS) {
          anim.phase = PHASE.WARP_SPEED
          anim.velocity = WARP_SPEED
        } else if (elapsed < ACCEL_MS + WARP_MS + DECEL_MS) {
          anim.phase = PHASE.DECELERATING
          // Exponential ease-out of global velocity.
          const t = (elapsed - ACCEL_MS - WARP_MS) / DECEL_MS
          anim.velocity = Math.max(0, WARP_SPEED * Math.pow(1 - t, 3))
        } else {
          // Velocity has bled off → lock the reveal.
          anim.phase = PHASE.REVEAL
          anim.velocity = 0
        }
      }

      // Normalize per-frame step to a 60fps baseline so motion is
      // frame-rate independent.
      const step = anim.velocity * (dt / 16.67)

      // ── Clear (with motion-blur trails during warp) ─────────────────────────
      const trailing =
        anim.phase === PHASE.WARP_SPEED ||
        anim.phase === PHASE.ACCELERATING ||
        anim.phase === PHASE.DECELERATING
      // A translucent fill leaves faint trails → cheap motion blur.
      ctx.fillStyle = trailing ? 'rgba(2, 6, 23, 0.35)' : 'rgba(2, 6, 23, 1)'
      ctx.fillRect(0, 0, W, H)

      const stars = starsRef.current
      const winnerIdx = anim.winnerIndex

      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // ── Update + draw every star ────────────────────────────────────────────
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i]
        const isWinner = i === winnerIdx

        if (isWinner && (anim.phase === PHASE.DECELERATING || anim.phase === PHASE.REVEAL)) {
          // Winner: forcibly converge to the exact center and settle at WINNER_Z.
          s.x += (0 - s.x) * 0.08
          s.y += (0 - s.y) * 0.08
          s.z += (WINNER_Z - s.z) * 0.06
          if (anim.phase === PHASE.REVEAL) {
            anim.revealScale = clamp(anim.revealScale + dt / 450, 0, 1)
          }
        } else {
          // Everyone else: fly toward the camera.
          s.z -= step
          if (s.z <= 0) {
            // Recycle past the camera back out to the far plane.
            s.z = Z_MAX
            s.x = rand(-500, 500)
            s.y = rand(-500, 500)
          }
        }

        // Perspective projection.
        const scale = FOCAL_LENGTH / s.z
        const px = cx + s.x * scale * dpr
        const py = cy + s.y * scale * dpr
        let fontSize = BASE_FONT * scale * dpr

        // Opacity: brighter as z→0; fade near the far plane to avoid popping.
        let alpha = 1 - s.z / Z_MAX
        if (s.z > 800) alpha *= 1 - (s.z - 800) / 200
        alpha = clamp(alpha, 0, 1)

        // Skip offscreen non-winners (cheap culling).
        if (!isWinner) {
          if (px < -200 || px > W + 200 || py < -200 || py > H + 200) continue
          if (alpha <= 0.01) continue
        }

        ctx.save()

        if (isWinner && (anim.phase === PHASE.DECELERATING || anim.phase === PHASE.REVEAL)) {
          // ── SHOWSTOPPER: glowing, pulsing neon winner ─────────────────────
          const pulse = 1 + Math.sin(anim.pulse * 4) * 0.08 * anim.revealScale
          const winScale = (1 + anim.revealScale * 1.6) * pulse
          fontSize = BASE_FONT * (FOCAL_LENGTH / WINNER_Z) * winScale * dpr
          // Clamp so long names never overflow a narrow (mobile) canvas:
          // shrink the font until the text fits within 90% of the width.
          ctx.font = `800 ${fontSize}px ui-sans-serif, system-ui, sans-serif`
          const maxTextW = W * 0.9
          const measured = ctx.measureText(s.text).width
          if (measured > maxTextW) {
            fontSize = fontSize * (maxTextW / measured)
          }
          ctx.font = `800 ${fontSize}px ui-sans-serif, system-ui, sans-serif`
          ctx.globalAlpha = 1
          ctx.shadowColor = '#34d399'
          ctx.shadowBlur = 30 * dpr
          // Layered draws deepen the glow.
          ctx.fillStyle = 'rgba(16, 185, 129, 0.9)'
          ctx.fillText(s.text, cx, cy)
          ctx.shadowBlur = 60 * dpr
          ctx.fillStyle = '#6ee7b7'
          ctx.fillText(s.text, cx, cy)
          ctx.shadowBlur = 0
          ctx.fillStyle = '#ecfdf5'
          ctx.fillText(s.text, cx, cy)
        } else {
          // ── Regular star ──────────────────────────────────────────────────
          const weight = alpha > 0.6 ? 700 : 500
          ctx.font = `${weight} ${Math.max(1, fontSize)}px ui-sans-serif, system-ui, sans-serif`
          ctx.globalAlpha = alpha
          // Streak glow scales with speed for the warp look.
          if (trailing) {
            ctx.shadowColor = '#22d3ee'
            ctx.shadowBlur = clamp(anim.velocity, 0, 40) * dpr
          }
          // Cyan→violet tint by depth for a cyberpunk palette.
          ctx.fillStyle = alpha > 0.5 ? '#a5f3fc' : '#818cf8'
          ctx.fillText(s.text, px, py)
        }

        ctx.restore()
      }

      // ── Fire confetti exactly when the winner locks ─────────────────────────
      if (anim.phase === PHASE.REVEAL && !anim.confettiFired) {
        anim.confettiFired = true
        fireConfetti(cx, cy)
      }

      // ── Update + draw confetti ──────────────────────────────────────────────
      const particles = particlesRef.current
      if (particles.length) {
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i]
          p.x += p.vx * dpr
          p.y += p.vy * dpr
          p.vy += 0.18 * dpr // gravity
          p.vx *= 0.99
          p.rot += p.spin
          p.life -= p.decay
          if (p.life <= 0) {
            particles.splice(i, 1)
            continue
          }
          ctx.save()
          ctx.globalAlpha = clamp(p.life, 0, 1)
          ctx.translate(p.x, p.y)
          ctx.rotate(p.rot)
          ctx.fillStyle = p.color
          const sz = p.size * dpr
          ctx.fillRect(-sz / 2, -sz / 2, sz, sz * 1.6)
          ctx.restore()
        }
      }
    }

    rafRef.current = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(rafRef.current)
  }, [fireConfetti])

  // ── Start a draw ───────────────────────────────────────────────────────────
  const engage = () => {
    if (running || count < 2) return
    // Ensure the field reflects the current roster.
    starsRef.current = names.map(makeStar)
    setWinner(null)

    // Pick the winner instantly in the background (not revealed yet).
    const winnerIndex = (Math.random() * starsRef.current.length) | 0
    starsRef.current[winnerIndex].isWinner = true
    const winnerName = starsRef.current[winnerIndex].text

    animRef.current = {
      ...animRef.current,
      phase: PHASE.ACCELERATING,
      startTime: performance.now(),
      velocity: IDLE_SPEED,
      winnerIndex,
      revealScale: 0,
      confettiFired: false,
    }
    setRunning(true)

    // After the full choreography completes, surface the winner banner.
    const total = ACCEL_MS + WARP_MS + DECEL_MS
    window.setTimeout(() => {
      setWinner(winnerName)
      setRunning(false)
    }, total + 400)
  }

  // ── Reset back to idle drift ─────────────────────────────────────────────────
  const reset = () => {
    setWinner(null)
    setRunning(false)
    particlesRef.current = []
    animRef.current = {
      ...animRef.current,
      phase: PHASE.IDLE,
      velocity: IDLE_SPEED,
      winnerIndex: -1,
      revealScale: 0,
      confettiFired: false,
    }
    starsRef.current = names.map(makeStar)
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  // Mobile-first: a single scrolling column — the animation viewport sits on
  // top with a guaranteed height, the config panel flows beneath it. At `lg`
  // this upgrades to the fixed-height split-screen (config left, viewport right).
  return (
    <div className="flex flex-col lg:grid lg:grid-cols-4 min-h-full lg:h-full w-full bg-slate-950 text-white lg:overflow-hidden rounded-2xl">
      {/* ── Config panel (glassmorphism). On mobile it renders BELOW the
           viewport via order utilities; on desktop it's the left column. ── */}
      <div className="order-2 lg:order-none lg:col-span-1 bg-slate-900/50 backdrop-blur-md border-t lg:border-t-0 lg:border-r border-slate-800 p-5 sm:p-6 flex flex-col gap-4 sm:gap-5 lg:overflow-y-auto">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400 shrink-0" />
          <h2 className="text-base sm:text-lg font-bold tracking-wide">
            Cosmic <span className="text-cyan-400">Lucky Draw</span>
          </h2>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Participants
          </label>
          <textarea
            value={rawNames}
            onChange={(e) => setRawNames(e.target.value)}
            disabled={running}
            spellCheck={false}
            placeholder={'Paste names, one per line\nor separated, by, commas'}
            className="h-32 sm:h-40 lg:h-56 w-full resize-none rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-3 text-sm text-cyan-50 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-mono disabled:opacity-50"
          />
        </div>

        {/* Entry counter */}
        <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
          <span className="flex items-center gap-2 text-sm text-slate-300">
            <Users className="w-4 h-4 text-cyan-400" />
            Entries
          </span>
          <span className="text-xl font-bold tabular-nums text-cyan-300">{count}</span>
        </div>

        {/* Winner banner */}
        {winner && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-center animate-pulse">
            <p className="flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-wider text-emerald-400">
              <Trophy className="w-4 h-4" /> Winner
            </p>
            <p className="mt-1 text-lg font-bold text-emerald-300">{winner}</p>
          </div>
        )}

        <div className="mt-auto flex flex-col gap-3">
          {/* ENGAGE DRAW — large glowing button */}
          <button
            onClick={engage}
            disabled={running || count < 2}
            className="group relative flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 py-4 text-base font-bold uppercase tracking-wider text-slate-950 shadow-[0_0_25px_-4px_rgba(34,211,238,0.7)] transition-all hover:shadow-[0_0_35px_0px_rgba(34,211,238,0.9)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            <Rocket className="w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            {running ? 'Drawing…' : 'Engage Draw'}
          </button>

          {(winner || running) && (
            <button
              onClick={reset}
              disabled={running}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-5 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors disabled:opacity-40"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          )}

          {count < 2 && (
            <p className="text-center text-xs text-slate-500">
              Add at least 2 names to engage the draw.
            </p>
          )}
        </div>
      </div>

      {/* ── Animation viewport. On mobile it renders FIRST (order-1) with a
           guaranteed viewport-relative height so the starfield is always
           visible; on desktop it's the 3/4-width right column. ── */}
      <div
        ref={containerRef}
        className="order-1 lg:order-none lg:col-span-3 relative h-[50vh] min-h-[280px] lg:h-full lg:min-h-0 bg-black overflow-hidden"
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        {/* Idle hint overlay (hidden once a draw starts / finishes) */}
        {!running && !winner && (
          <div className="pointer-events-none absolute inset-x-0 bottom-6 text-center">
            <p className="text-sm text-slate-500">
              Names drift through deep space — press{' '}
              <span className="text-cyan-400 font-semibold">Engage Draw</span> to warp.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
