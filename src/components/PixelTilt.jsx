import { useEffect, useRef } from 'react'

// A hover effect in two parts that work together.
//
//   <PixelTilt>       tilts its children in 3D toward the pointer, on a spring, so the
//                     card leans in, overshoots a touch and settles back when it leaves.
//                     A child styled with translateZ(...) floats above the card's face.
//   <PixelGravityImage> draws an image on a canvas. Under the pointer it breaks into
//                     square pixels, and the cursor acts like a small charge: the few
//                     pixels within its reach are pushed away from it on springs,
//                     shrinking as they go so a clearing opens around the cursor, then
//                     drop back into place.
//
// The image listens to the nearest <PixelTilt> (or its own box, used alone). Both only
// animate while something is moving, and fall back to the plain, still image without a
// 2D canvas or when the viewer prefers reduced motion.

const MAX_DPR = 2
const TILT_MAX = 9 // deg at the card's edge
const TILT_SCALE = 1.025 // how much the card lifts while hovered
const TILT_STIFFNESS = 120
const TILT_DAMPING = 14
const CELL_DIVISIONS = 34 // pixels across the image
const RISE = 0.06 // s: how fast a pixel wakes as the cursor reaches it
const SETTLE = 0.45 // s: how slowly it falls back asleep
const CURSOR_LAG = 0.05 // s: the pull eases toward the real pointer
const STIFFNESS = 80 // spring driving a pixel to where the cursor wants it
const DAMPING = 10 // one soft overshoot on the way back
const GAP_COLOR = '#140606' // shows through where pixels have been pushed away

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Tracks the pointer over `el`, in coordinates relative to `el`'s own layout box.
function trackPointer(el, onChange) {
  const state = { x: 0, y: 0, inside: false }
  const move = (e) => {
    const r = el.getBoundingClientRect()
    state.x = e.clientX - r.left
    state.y = e.clientY - r.top
    state.inside = true
    onChange()
  }
  const leave = () => {
    state.inside = false
    onChange()
  }
  // A finger has no hover: once it lifts, everything settles.
  const up = (e) => {
    if (e.pointerType !== 'mouse') leave()
  }
  el.addEventListener('pointerenter', move)
  el.addEventListener('pointermove', move)
  el.addEventListener('pointerleave', leave)
  el.addEventListener('pointerup', up)
  el.addEventListener('pointercancel', leave)
  const off = () => {
    el.removeEventListener('pointerenter', move)
    el.removeEventListener('pointermove', move)
    el.removeEventListener('pointerleave', leave)
    el.removeEventListener('pointerup', up)
    el.removeEventListener('pointercancel', leave)
  }
  return { state, off }
}

export function PixelTilt({ children, className = '' }) {
  const areaRef = useRef(null)
  const tiltRef = useRef(null)

  useEffect(() => {
    if (reducedMotion()) return
    const area = areaRef.current
    const card = tiltRef.current

    let rx = 0 // current rotation (deg) and its velocity
    let ry = 0
    let vx = 0
    let vy = 0
    let s = 1
    let raf = 0
    let last = 0

    const frame = (now) => {
      raf = 0
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60
      last = now

      let tx = 0
      let ty = 0
      if (pointer.inside) {
        const w = area.offsetWidth || 1
        const h = area.offsetHeight || 1
        const nx = Math.min(Math.max(pointer.x / w, 0), 1) * 2 - 1
        const ny = Math.min(Math.max(pointer.y / h, 0), 1) * 2 - 1
        tx = -ny * TILT_MAX // top edge tips away when the pointer is near it
        ty = nx * TILT_MAX
      }
      const ts = pointer.inside ? TILT_SCALE : 1

      vx += ((tx - rx) * TILT_STIFFNESS - vx * TILT_DAMPING) * dt
      vy += ((ty - ry) * TILT_STIFFNESS - vy * TILT_DAMPING) * dt
      rx += vx * dt
      ry += vy * dt
      s += (ts - s) * (1 - Math.exp(-dt / 0.12))

      const moving =
        Math.abs(tx - rx) + Math.abs(ty - ry) > 0.01 || Math.abs(vx) + Math.abs(vy) > 0.05 || Math.abs(ts - s) > 0.0005
      if (!moving && !pointer.inside) {
        card.style.transform = ''
        last = 0
        return
      }
      card.style.transform = `perspective(1000px) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg) scale(${s.toFixed(4)})`
      if (moving) raf = requestAnimationFrame(frame)
      else last = 0
    }
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame)
    }
    const { state: pointer, off } = trackPointer(area, kick)

    return () => {
      cancelAnimationFrame(raf)
      off()
      card.style.transform = ''
    }
  }, [])

  return (
    <div ref={areaRef} data-tilt-area="" className={`relative ${className}`}>
      <div ref={tiltRef} className="relative will-change-transform" style={{ transformStyle: 'preserve-3d' }}>
        {children}
      </div>
    </div>
  )
}

export function PixelGravityImage({ src, alt, className = '' }) {
  const wrapRef = useRef(null)
  const imgRef = useRef(null)
  const canvasRef = useRef(null)
  const glareRef = useRef(null)

  useEffect(() => {
    if (reducedMotion()) return
    const wrap = wrapRef.current
    const img = imgRef.current
    const canvas = canvasRef.current
    const glare = glareRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const sharp = document.createElement('canvas') // the image, cover-fitted, at canvas resolution
    const sharpCtx = sharp.getContext('2d')
    let ready = false
    let dpr = 1
    let w = 0
    let h = 0
    let cell = 10
    let cols = 0
    let rows = 0
    let colors = []
    let energy = new Float32Array(0)
    let offX = new Float32Array(0)
    let offY = new Float32Array(0)
    let velX = new Float32Array(0)
    let velY = new Float32Array(0)
    let reach = 70
    let pushMax = 26
    let sx = 0 // the cursor's eased position, in canvas CSS px
    let sy = 0
    let tracking = false
    let raf = 0
    let last = 0

    // Source rect that reproduces object-fit: cover for a w × h box.
    const coverRect = () => {
      const iw = img.naturalWidth
      const ih = img.naturalHeight
      const scale = Math.max(w / iw, h / ih)
      const sw = w / scale
      const sh = h / scale
      return [(iw - sw) / 2, (ih - sh) / 2, sw, sh]
    }

    const layout = () => {
      w = wrap.clientWidth
      h = wrap.clientHeight
      if (!w || !h || !ready) return
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      sharp.width = canvas.width
      sharp.height = canvas.height
      const src = coverRect()
      sharpCtx.imageSmoothingQuality = 'high'
      sharpCtx.drawImage(img, ...src, 0, 0, sharp.width, sharp.height)

      cell = w / CELL_DIVISIONS
      cols = CELL_DIVISIONS
      rows = Math.ceil(h / cell)
      // Kept tight on purpose: only a small cluster around the cursor should react.
      reach = Math.min(w * 0.22, 95)
      pushMax = cell * 2.4

      // Each pixel's colour is the average of the image under it: let the browser
      // downsample the whole image to one texel per cell.
      const tiny = document.createElement('canvas')
      tiny.width = cols
      tiny.height = rows
      const tinyCtx = tiny.getContext('2d', { willReadFrequently: true })
      tinyCtx.imageSmoothingQuality = 'high'
      tinyCtx.drawImage(sharp, 0, 0, cols * cell * dpr, rows * cell * dpr, 0, 0, cols, rows)
      const data = tinyCtx.getImageData(0, 0, cols, rows).data
      colors = new Array(cols * rows)
      for (let i = 0; i < colors.length; i++) {
        colors[i] = `rgb(${data[i * 4]},${data[i * 4 + 1]},${data[i * 4 + 2]})`
      }

      const n = cols * rows
      energy = new Float32Array(n)
      offX = new Float32Array(n)
      offY = new Float32Array(n)
      velX = new Float32Array(n)
      velY = new Float32Array(n)
      tracking = false
      paintRest()
    }

    const paintRest = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.drawImage(sharp, 0, 0)
    }

    const frame = (now) => {
      raf = 0
      if (!ready || !cols) return
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60
      last = now

      if (pointer.inside) {
        const r = canvas.getBoundingClientRect()
        const area = pointerHost.getBoundingClientRect()
        // The pointer is tracked on the host; shift it into the canvas's box.
        const px = pointer.x + area.left - r.left
        const py = pointer.y + area.top - r.top
        if (!tracking) {
          sx = px
          sy = py
          tracking = true
        }
        const ease = 1 - Math.exp(-dt / CURSOR_LAG)
        sx += (px - sx) * ease
        sy += (py - sy) * ease
      } else {
        tracking = false
      }

      glare.style.opacity = pointer.inside ? '1' : '0'
      if (pointer.inside) glare.style.background = `radial-gradient(circle at ${sx}px ${sy}px, rgba(255,210,200,0.22), transparent 55%)`

      paintRest()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const rise = 1 - Math.exp(-dt / RISE)
      const fall = 1 - Math.exp(-dt / SETTLE)
      const reach2 = reach * reach
      let settling = false

      // Pass 1: move every awake pixel and punch its home cell out of the photo.
      ctx.fillStyle = GAP_COLOR
      for (let j = 0; j < rows; j++) {
        const cy = (j + 0.5) * cell
        const rowNear = tracking && Math.abs(sy - cy) < reach
        for (let i = 0; i < cols; i++) {
          const idx = j * cols + i
          if (!rowNear && energy[idx] === 0 && offX[idx] === 0 && offY[idx] === 0) continue
          const cx = (i + 0.5) * cell

          let target = 0
          let tx = 0
          let ty = 0
          if (rowNear) {
            const dx = sx - cx
            const dy = sy - cy
            const d2 = dx * dx + dy * dy
            if (d2 < reach2 && d2 > 0.25) {
              const d = Math.sqrt(d2)
              const t = 1 - d / reach
              target = t * t * (3 - 2 * t)
              // Shoved away from the cursor, hardest for the pixels right under it.
              const push = pushMax * target
              tx = -(dx / d) * push
              ty = -(dy / d) * push
            }
          }

          let e = energy[idx]
          e += (target - e) * (target > e ? rise : fall)
          velX[idx] += ((tx - offX[idx]) * STIFFNESS - velX[idx] * DAMPING) * dt
          velY[idx] += ((ty - offY[idx]) * STIFFNESS - velY[idx] * DAMPING) * dt
          offX[idx] += velX[idx] * dt
          offY[idx] += velY[idx] * dt

          const moving =
            Math.abs(offX[idx]) + Math.abs(offY[idx]) > 0.03 || Math.abs(velX[idx]) + Math.abs(velY[idx]) > 0.3
          if (e < 0.004 && !moving) {
            energy[idx] = 0
            offX[idx] = 0
            offY[idx] = 0
            velX[idx] = 0
            velY[idx] = 0
            continue
          }
          energy[idx] = e
          settling = true
          ctx.globalAlpha = Math.min(1, e * 1.4)
          ctx.fillRect(i * cell, j * cell, cell, cell)
        }
      }

      // Pass 2: draw the awake pixels as flat squares at their pushed positions,
      // smaller the harder they're pushed, so gaps open between them.
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const idx = j * cols + i
          const e = energy[idx]
          if (e === 0 && offX[idx] === 0 && offY[idx] === 0) continue
          const size = cell * (1 - 0.32 * e)
          const x = (i + 0.5) * cell + offX[idx] - size / 2
          const y = (j + 0.5) * cell + offY[idx] - size / 2
          ctx.globalAlpha = Math.min(1, e * 2)
          ctx.fillStyle = colors[idx]
          ctx.fillRect(x, y, size, size)
        }
      }
      ctx.globalAlpha = 1

      if (tracking || settling) raf = requestAnimationFrame(frame)
      else {
        last = 0
        paintRest()
      }
    }

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame)
    }
    const pointerHost = wrap.closest('[data-tilt-area]') || wrap
    const { state: pointer, off } = trackPointer(pointerHost, kick)

    const start = () => {
      ready = true
      layout()
      wrap.dataset.pixel = 'on'
    }
    if (img.complete && img.naturalWidth) start()
    else img.addEventListener('load', start, { once: true })
    const sizing = new ResizeObserver(layout)
    sizing.observe(wrap)

    return () => {
      cancelAnimationFrame(raf)
      off()
      sizing.disconnect()
      img.removeEventListener('load', start)
      delete wrap.dataset.pixel
    }
  }, [src])

  return (
    <div ref={wrapRef} className={`group/pixel relative ${className}`}>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        draggable="false"
        className="h-full w-full object-cover select-none group-data-[pixel=on]/pixel:opacity-0"
      />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 hidden h-full w-full group-data-[pixel=on]/pixel:block"
      />
      <div
        ref={glareRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 mix-blend-screen transition-opacity duration-300"
      />
    </div>
  )
}
