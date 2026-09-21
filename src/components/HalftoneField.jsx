import { useEffect, useRef } from 'react'

// An interactive halftone layer for a section's background. The sections already
// paint a static dot grid in CSS; this canvas sits directly on top of it, on the
// same grid, and swells the dots around the cursor: they grow, brighten and
// shimmer, then settle back slowly so the pointer leaves a soft comet trail. Away
// from the cursor nothing is drawn, so the existing pattern stays calm. Pass
// `baseAlpha` for a section with no CSS grid of its own (the hero) to have the
// canvas draw the resting dots too.
//
// It is a plain background layer: pointer-events are off, it sits below the
// section's content, and it never stops or consumes an event. Only the part of the
// section near the viewport is backed by pixels, and only while that part is on
// screen. Reduced motion keeps the resting dots and drops the reaction.

const MAX_DPR = 1.5 // the dots are tiny and soft; more pixels buy nothing
const TAU = Math.PI * 2
const PEAK_RISE = 0.07 // s: how fast a dot swells once the cursor reaches it
const SETTLE = 0.5 // s: how slowly it relaxes after the cursor leaves
const CURSOR_LAG = 0.05 // s: the cursor's influence eases toward the real pointer

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
// grids that scale with it. `color` is an 'r,g,b' string; `peakAlpha` is how
// opaque a dot gets right under the cursor.
function HalftoneField({ spacing = 21, color = '255,96,86', peakAlpha = 0.5, baseAlpha = 0 }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const section = wrapRef.current.parentElement
    const ctx = canvas.getContext('2d')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let pitch = 21
    let reach = 140 // px: how far from the cursor a dot still reacts
    let maxRadius = 3.5
    let cols = 0
    let rows = 0
    let energy = new Float32Array(0) // per dot, 0 (resting) to 1 (under the cursor)
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
      maxRadius = Math.min(pitch * 0.17, 4.5)
      const width = section.offsetWidth
      sectionH = section.offsetHeight
      cols = Math.ceil(width / pitch)
      rows = Math.ceil(sectionH / pitch)
      energy = new Float32Array(cols * rows)
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
    // dots scroll in step with the CSS grid, and re-centres it when the viewport
    // nears an edge.
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

      if (baseAlpha) {
        ctx.globalAlpha = baseAlpha
        ctx.beginPath()
        for (let j = j0; j <= j1; j++) {
          const cy = (j + 0.5) * pitch - oy
          for (let i = 0; i < cols; i++) {
            const cx = (i + 0.5) * pitch
            ctx.moveTo(cx + 1, cy)
            ctx.arc(cx, cy, 1, 0, TAU)
          }
        }
        ctx.fill()
      }

      let settling = false
      if (!reduced) {
        const rise = 1 - Math.exp(-dt / PEAK_RISE)
        const fall = 1 - Math.exp(-dt / SETTLE)
        const reach2 = reach * reach
        const shimmer = now * 0.0016
        for (let j = j0; j <= j1; j++) {
          const cy = (j + 0.5) * pitch - oy
          const dy = cy - py
          const rowNear = tracking && Math.abs(dy) < reach
          for (let i = 0; i < cols; i++) {
            const idx = j * cols + i
            let e = energy[idx]
            let target = 0
            const cx = (i + 0.5) * pitch
            if (rowNear) {
              const dx = cx - px
              const d2 = dx * dx + dy * dy
              if (d2 < reach2) {
                const t = 1 - Math.sqrt(d2) / reach
                target = t * t * (3 - 2 * t) // smoothstep: soft edge, full strength at the cursor
              }
            }
            e += (target - e) * (target > e ? rise : fall)
            if (e < 0.004) {
              energy[idx] = 0
              continue
            }
            energy[idx] = e
            settling = true

            // Each dot shimmers a little out of step with its neighbours, in
            // proportion to how awake it is.
            const wobble = 1 + 0.14 * e * Math.sin(shimmer + i * 0.9 + j * 1.7)
            ctx.globalAlpha = Math.min(1, peakAlpha * e)
            ctx.beginPath()
            ctx.arc(cx, cy, (1 + e * (maxRadius - 1)) * wobble, 0, TAU)
            ctx.fill()
          }
        }
      }
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

  return (
    <div ref={wrapRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute top-0 left-0" />
    </div>
  )
}

export default HalftoneField
