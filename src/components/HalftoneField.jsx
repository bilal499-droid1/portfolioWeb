import { useEffect, useRef } from 'react'

// An interactive halftone dot field for a section's background, drawn on a canvas
// that sits below the section's content. The cursor acts like a small mass: dots
// within its reach are drawn toward it, on springs, so they lean in, overshoot a
// little and swing back once it moves on. Near the cursor they also grow, brighten
// and shimmer, and settle slowly enough to leave a soft trail. Far from the cursor
// the grid is perfectly still.
//
// The field draws the whole grid itself (`baseAlpha` is the resting dot opacity),
// because a dot that moves can't share its spot with a static one. It ignores the
// pointer for hit-testing (pointer-events are off), never stops or consumes an
// event, and only backs the part of the section near the viewport with pixels, and
// only while that part is on screen. Reduced motion keeps the still grid and drops
// the reaction.

const MAX_DPR = 2
const TAU = Math.PI * 2
const PEAK_RISE = 0.07 // s: how fast a dot brightens once the cursor reaches it
const SETTLE = 0.5 // s: how slowly it relaxes after the cursor leaves
const CURSOR_LAG = 0.05 // s: the cursor's pull eases toward the real pointer
const STIFFNESS = 90 // spring pulling a dot toward where the cursor wants it
const DAMPING = 11 // enough friction to swing back with one soft overshoot

// One pointer listener shared by every field on the page.
const pointer = { x: 0, y: 0, inside: false }
const subscribers = new Set()
const notify = () => subscribers.forEach((fn) => fn())
const onMove = (e) => {
  pointer.x = e.clientX
  pointer.y = e.clientY
  pointer.inside = true
  notify()
}
const onLeave = () => {
  pointer.inside = false
  notify()
}
// A finger has no hover: once it lifts, the dots settle.
const onUp = (e) => {
  if (e.pointerType !== 'mouse') onLeave()
}

function subscribe(fn) {
  if (!subscribers.size) {
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    window.addEventListener('pointercancel', onLeave, { passive: true })
    window.addEventListener('blur', onLeave)
    document.documentElement.addEventListener('pointerleave', onLeave)
  }
  subscribers.add(fn)
  return () => {
    subscribers.delete(fn)
    if (!subscribers.size) {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onLeave)
      window.removeEventListener('blur', onLeave)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }
}

// `spacing` is the grid pitch in px, or a function of the viewport width for
// grids that scale with it. `color` is an 'r,g,b' string. `baseAlpha` is a resting
// dot's opacity and `peakAlpha` how opaque a dot gets right under the cursor.
// `fadeBottom` fades the grid out over the last quarter of the section.
function HalftoneField({ spacing = 21, color = '255,96,86', peakAlpha = 0.5, baseAlpha = 0.15, fadeBottom = false }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const section = wrapRef.current.parentElement
    const ctx = canvas.getContext('2d')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let pitch = 21
    let reach = 140 // px: how far from the cursor a dot still feels it
    let pullMax = 40 // px: the furthest a dot is drawn toward the cursor
    let soften = 30 // px: inside this the pull fades, so dots don't pile onto the cursor
    let maxRadius = 3
    let cols = 0
    let rows = 0
    // Per dot: how awake it is (0 resting, 1 under the cursor), and its spring
    // state, an offset from home and the velocity of that offset.
    let energy = new Float32Array(0)
    let offX = new Float32Array(0)
    let offY = new Float32Array(0)
    let velX = new Float32Array(0)
    let velY = new Float32Array(0)
    let dpr = 1
    let sectionH = 0
    let cssW = 0
    let cssH = 0
    let oy = 0 // where the canvas starts inside the section
    let placedOy = -1
    let sx = 0 // the cursor's eased position, in viewport coordinates
    let sy = 0
    let tracking = false
    let visible = false
    let needsLayout = true
    let raf = 0
    let last = 0

    const layout = () => {
      needsLayout = false
      pitch = typeof spacing === 'function' ? spacing(window.innerWidth) : spacing
      reach = Math.min(pitch * 6.5, 200, window.innerWidth * 0.35)
      pullMax = Math.min(pitch * 2, reach * 0.3)
      soften = pitch * 1.4
      maxRadius = Math.min(pitch * 0.12, 3.2)
      const width = section.offsetWidth
      sectionH = section.offsetHeight
      cols = Math.ceil(width / pitch)
      rows = Math.ceil(sectionH / pitch)
      const dots = cols * rows
      energy = new Float32Array(dots)
      offX = new Float32Array(dots)
      offY = new Float32Array(dots)
      velX = new Float32Array(dots)
      velY = new Float32Array(dots)
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      // A screen and a half of height, so scrolling can ride the page's own
      // motion for a while before the canvas has to be moved.
      cssW = width
      cssH = Math.min(sectionH, Math.round(window.innerHeight * 1.5))
      canvas.width = Math.max(1, Math.round(cssW * dpr))
      canvas.height = Math.max(1, Math.round(cssH * dpr))
      canvas.style.width = `${cssW}px`
      canvas.style.height = `${cssH}px`
      placedOy = -1
    }

    // Keeps the canvas parked while the viewport stays well inside it, so its
    // dots scroll with the page, and re-centres it when the viewport nears an edge.
    const anchor = (rect) => {
      const top = -rect.top
      const bottom = top + window.innerHeight
      const maxOy = Math.max(0, sectionH - cssH)
      const pad = window.innerHeight * 0.25
      const nearTop = oy > 0 && top - pad * 0.5 < oy
      const nearBottom = oy < maxOy && bottom + pad * 0.5 > oy + cssH
      if (nearTop || nearBottom || placedOy < 0) oy = Math.min(Math.max(top - pad, 0), maxOy)
      if (oy !== placedOy) {
        canvas.style.transform = `translate3d(0, ${oy}px, 0)`
        placedOy = oy
      }
    }

    const frame = (now) => {
      raf = 0
      if (!visible) return
      if (needsLayout) layout()
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60
      last = now

      const rect = section.getBoundingClientRect()
      anchor(rect)

      const live = pointer.inside && !reduced
      if (live) {
        if (!tracking) {
          sx = pointer.x
          sy = pointer.y
          tracking = true
        }
        const ease = 1 - Math.exp(-dt / CURSOR_LAG)
        sx += (pointer.x - sx) * ease
        sy += (pointer.y - sy) * ease
      } else {
        tracking = false
      }
      const px = sx - rect.left
      const py = sy - rect.top - oy

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, cssW, cssH)
      ctx.fillStyle = `rgb(${color})`

      const j0 = Math.max(0, Math.floor(oy / pitch) - 1)
      const j1 = Math.min(rows - 1, Math.ceil((oy + cssH) / pitch))
      const rise = 1 - Math.exp(-dt / PEAK_RISE)
      const fall = 1 - Math.exp(-dt / SETTLE)
      const reach2 = reach * reach
      const shimmer = now * 0.0016
      const resting = new Path2D() // every dot the cursor isn't touching, filled in one go
      let settling = false

      for (let j = j0; j <= j1; j++) {
        const cy = (j + 0.5) * pitch - oy
        const rowNear = tracking && Math.abs(py - cy) < reach
        for (let i = 0; i < cols; i++) {
          const cx = (i + 0.5) * pitch
          const idx = j * cols + i
          let e = energy[idx]
          let x = offX[idx]
          let y = offY[idx]
          let vx = velX[idx]
          let vy = velY[idx]

          // Where the cursor would like this dot to be, and how strongly it is felt.
          let target = 0
          let tx = 0
          let ty = 0
          if (rowNear) {
            const dx = px - cx
            const dy = py - cy
            const d2 = dx * dx + dy * dy
            if (d2 < reach2 && d2 > 0.25) {
              const d = Math.sqrt(d2)
              const t = 1 - d / reach
              target = t * t * (3 - 2 * t) // smoothstep: soft edge, full strength at the cursor
              // Pulled toward the cursor, softened close in and never past halfway.
              const pull = Math.min(pullMax * target * (d / (d + soften)) * 1.6, d * 0.5)
              tx = (dx / d) * pull
              ty = (dy / d) * pull
            }
          }

          e += (target - e) * (target > e ? rise : fall)
          vx += ((tx - x) * STIFFNESS - vx * DAMPING) * dt
          vy += ((ty - y) * STIFFNESS - vy * DAMPING) * dt
          x += vx * dt
          y += vy * dt

          const moving = Math.abs(x) + Math.abs(y) > 0.03 || Math.abs(vx) + Math.abs(vy) > 0.3
          if (e < 0.004 && !moving) {
            energy[idx] = 0
            offX[idx] = 0
            offY[idx] = 0
            velX[idx] = 0
            velY[idx] = 0
            resting.moveTo(cx + 1, cy)
            resting.arc(cx, cy, 1, 0, TAU)
            continue
          }
          energy[idx] = e
          offX[idx] = x
          offY[idx] = y
          velX[idx] = vx
          velY[idx] = vy
          settling = true

          // Each dot shimmers a little out of step with its neighbours, in
          // proportion to how awake it is.
          const wobble = 1 + 0.14 * e * Math.sin(shimmer + i * 0.9 + j * 1.7)
          ctx.globalAlpha = Math.min(1, baseAlpha + (peakAlpha - baseAlpha) * e)
          ctx.beginPath()
          ctx.arc(cx + x, cy + y, (1 + e * (maxRadius - 1)) * wobble, 0, TAU)
          ctx.fill()
        }
      }

      ctx.globalAlpha = baseAlpha
      ctx.fill(resting)
      ctx.globalAlpha = 1

      // A cursor parked over some other section leaves this one idle; moving it
      // (or scrolling) wakes the loop again.
      const near = tracking && py > -reach && py < cssH + reach
      if (near || settling) {
        raf = requestAnimationFrame(frame)
      } else {
        last = 0
        tracking = false // so the next wake-up snaps to the pointer instead of sweeping from where it was
      }
    }

    const kick = () => {
      if (visible && !raf) raf = requestAnimationFrame(frame)
    }
    const relayout = () => {
      needsLayout = true
      kick()
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible) {
          needsLayout = true
          kick()
        } else {
          cancelAnimationFrame(raf)
          raf = 0
          last = 0
          tracking = false
          canvas.width = 1 // hand the pixels back while the section is off screen
          canvas.height = 1
        }
      },
      { rootMargin: '200px 0px' },
    )
    observer.observe(section)
    const sizing = new ResizeObserver(relayout)
    sizing.observe(section)
    window.addEventListener('resize', relayout)
    window.addEventListener('scroll', kick, { passive: true })
    const unsubscribe = reduced ? () => {} : subscribe(kick)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      sizing.disconnect()
      window.removeEventListener('resize', relayout)
      window.removeEventListener('scroll', kick)
      unsubscribe()
    }
  }, [spacing, color, peakAlpha, baseAlpha])

  const fade = fadeBottom ? 'linear-gradient(180deg, #000 75%, transparent 100%)' : undefined
  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ maskImage: fade, WebkitMaskImage: fade }}
    >
      <canvas ref={canvasRef} className="absolute top-0 left-0" />
    </div>
  )
}

export default HalftoneField
