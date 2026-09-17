import { useEffect, useRef } from 'react'
import layerTop from '../assets/layer-top.webp'
import layerBottom from '../assets/layer-bottom.webp'
import labelPortfolio from '../assets/label-portfolio.webp'

const BRUSH_RADIUS = 150 // px at the poster's native width (1038px)
const FADE_PER_FRAME = 0.035 // how quickly the revealed trail fades out (0–1)
const TRAIL_LIFETIME = 2000 // ms after the last movement before the loop stops
const GLOW_TRAIL_FADE = 0.045 // how quickly the red cursor trail fades (0–1); lower = longer tail
const GLOW_TRAIL_WIDTH = 14 // px at the poster's native width
const MAX_DPR = 2

// The dark grayscale layer is shown by default. Moving the pointer paints a
// soft, fading trail into a mask canvas, and the colour layer is drawn only
// where that mask is painted. A red glow trail (same colours as the cursor dot)
// follows the pointer on its own canvas and fades out quickly.
function RevealPoster() {
  const frameRef = useRef(null)
  const canvasRef = useRef(null)
  const trailRef = useRef(null)
  const glowRef = useRef(null)

  useEffect(() => {
    const frame = frameRef.current
    const canvas = canvasRef.current
    const glow = glowRef.current
    const ctx = canvas.getContext('2d')
    const trail = trailRef.current
    const trailCtx = trail.getContext('2d')
    const mask = document.createElement('canvas')
    const maskCtx = mask.getContext('2d')

    const image = new Image()
    image.src = layerTop

    let width = 0
    let height = 0
    let dpr = 1
    let raf = 0
    let lastMove = 0
    let last = null // last painted point
    let pending = [] // pointer positions not yet painted

    const resize = () => {
      const rect = frame.getBoundingClientRect()
      width = rect.width
      height = rect.height
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      for (const c of [canvas, mask, trail]) {
        c.width = Math.round(width * dpr)
        c.height = Math.round(height * dpr)
      }
      last = null
    }

    // Same result as `object-fit: cover`, so the canvas lines up with the <img>.
    const drawCover = (img) => {
      const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight)
      const w = img.naturalWidth * scale
      const h = img.naturalHeight * scale
      ctx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h)
    }

    const stamp = (x, y, r) => {
      const g = maskCtx.createRadialGradient(x, y, 0, x, y, r)
      g.addColorStop(0, 'rgba(0,0,0,0.9)')
      g.addColorStop(0.5, 'rgba(0,0,0,0.6)')
      g.addColorStop(1, 'rgba(0,0,0,0)')
      maskCtx.fillStyle = g
      maskCtx.beginPath()
      maskCtx.arc(x, y, r, 0, Math.PI * 2)
      maskCtx.fill()
    }

    // One segment of the glow trail: a wide soft red stroke with a brighter core.
    const trailSegment = (a, b, w) => {
      trailCtx.lineCap = 'round'
      trailCtx.shadowColor = '#e10b0b'
      trailCtx.shadowBlur = w * 1.4
      trailCtx.strokeStyle = 'rgba(225, 11, 11, 0.55)'
      trailCtx.lineWidth = w
      trailCtx.beginPath()
      trailCtx.moveTo(a.x, a.y)
      trailCtx.lineTo(b.x, b.y)
      trailCtx.stroke()
      trailCtx.shadowBlur = w * 0.5
      trailCtx.strokeStyle = 'rgba(248, 113, 113, 0.85)'
      trailCtx.lineWidth = w * 0.25
      trailCtx.stroke()
    }

    const tick = (now) => {
      const r = Math.max(70, BRUSH_RADIUS * (width / 1038))
      const trailWidth = Math.max(8, GLOW_TRAIL_WIDTH * (width / 1038))
      maskCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
      trailCtx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Fade the glow trail faster than the reveal so it reads as a short tail.
      trailCtx.globalCompositeOperation = 'destination-out'
      trailCtx.shadowBlur = 0
      trailCtx.fillStyle = `rgba(0,0,0,${GLOW_TRAIL_FADE})`
      trailCtx.fillRect(0, 0, width, height)
      trailCtx.globalCompositeOperation = 'source-over'

      // Fade what was painted before.
      maskCtx.globalCompositeOperation = 'destination-out'
      maskCtx.fillStyle = `rgba(0,0,0,${FADE_PER_FRAME})`
      maskCtx.fillRect(0, 0, width, height)
      maskCtx.globalCompositeOperation = 'source-over'

      // Paint new pointer positions, filling gaps so fast moves stay continuous.
      for (const p of pending) {
        if (last) {
          const dist = Math.hypot(p.x - last.x, p.y - last.y)
          const steps = Math.max(1, Math.ceil(dist / (r * 0.25)))
          for (let i = 1; i <= steps; i++) {
            stamp(last.x + ((p.x - last.x) * i) / steps, last.y + ((p.y - last.y) * i) / steps, r)
          }
          trailSegment(last, p, trailWidth)
        } else {
          stamp(p.x, p.y, r)
        }
        last = p
      }
      pending = []

      const idle = now - lastMove > TRAIL_LIFETIME
      // Low-alpha fades never quite reach zero, so wipe once the trail is done.
      if (idle) {
        maskCtx.clearRect(0, 0, width, height)
        trailCtx.clearRect(0, 0, width, height)
      }

      // Colour layer, clipped to the mask.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.globalCompositeOperation = 'source-over'
      ctx.clearRect(0, 0, width, height)
      if (image.complete && image.naturalWidth) {
        drawCover(image)
        ctx.globalCompositeOperation = 'destination-in'
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.drawImage(mask, 0, 0)
      }

      raf = idle ? 0 : requestAnimationFrame(tick)
    }

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }

    const onMove = (e) => {
      const rect = frame.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      pending.push({ x, y })
      lastMove = performance.now()
      glow.style.transform = `translate(${x}px, ${y}px)`
      glow.style.opacity = '1'
      kick()
    }

    const onLeave = () => {
      last = null
      glow.style.opacity = '0'
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(frame)

    frame.addEventListener('pointermove', onMove)
    frame.addEventListener('pointerdown', onMove)
    frame.addEventListener('pointerleave', onLeave)
    frame.addEventListener('pointerup', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      frame.removeEventListener('pointermove', onMove)
      frame.removeEventListener('pointerdown', onMove)
      frame.removeEventListener('pointerleave', onLeave)
      frame.removeEventListener('pointerup', onLeave)
    }
  }, [])

  return (
    <div
      ref={frameRef}
      className="relative aspect-[1038/1080] h-[115%] max-w-full shrink-0 cursor-none touch-none self-end select-none"
    >
      {/* Screen-blended with the page background; the blend is set on the wrapper
          because the vignette mask would otherwise isolate the image from it. */}
      <div className="poster-vignette absolute inset-0 mix-blend-screen">
        <img
          src={layerBottom}
          alt="UI UX Design Portfolio"
          draggable="false"
          className="absolute inset-0 size-full object-cover brightness-[0.3]"
        />
      </div>
      <div className="poster-vignette absolute inset-0">
        <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 size-full" />
      </div>
      <canvas
        ref={trailRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full mix-blend-screen"
      />
      {/* Sits outside the vignette so the label stays crisp at the poster's bottom edge. */}
      <img
        src={labelPortfolio}
        alt=""
        draggable="false"
        className="pointer-events-none absolute inset-0 size-full object-cover"
      />
      <div
        ref={glowRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 opacity-0 transition-opacity duration-300"
      >
        <div className="size-10 -translate-1/2 rounded-full bg-brand/80 blur-md mix-blend-screen" />
        <div className="absolute top-0 left-0 size-3 -translate-1/2 rounded-full bg-red-400 blur-[2px]" />
      </div>
    </div>
  )
}

export default RevealPoster
