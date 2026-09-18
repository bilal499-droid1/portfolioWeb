import { useEffect, useRef } from 'react'

// Renders an image through a WebGL ripple shader. Where the pointer enters, the
// surface dents and rings spread out and settle, like a drop falling onto
// mercury; moving across it keeps stirring gentler ripples. Falls back to the
// plain <img> without WebGL or when the viewer prefers reduced motion.

const MAX_RIPPLES = 6
const RIPPLE_LIFETIME = 3.2 // seconds until a ripple has fully settled
const ENTER_STRENGTH = 1
const MOVE_STRENGTH = 0.65
const MOVE_SPACING = 40 // px of pointer travel between follow-up ripples
const MOVE_INTERVAL = 90 // ms between follow-up ripples
const OVERSCAN = 1.16 // canvas is 16% larger than the image so edges can bulge outward
const MAX_DPR = 2
// Effect intensity: px of ring displacement, px of dent pull, and glint/shadow amounts.
const WAVE_AMPLITUDE = 15
const DENT_AMPLITUDE = 24
const SHEEN = 0.22
const DENT_SHADE = 0.45

const VERTEX_SHADER = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`

const FRAGMENT_SHADER = `
precision mediump float;
uniform sampler2D uTex;
uniform vec2 uRes;      // canvas size in CSS px
uniform float uTime;
uniform vec4 uRipples[${MAX_RIPPLES}]; // x, y (0–1, y up), start time, strength
varying vec2 vUv;

const float OVERSCAN = ${OVERSCAN.toFixed(2)};
const float SPEED = 190.0;   // px per second the rings travel
const float WAVE_K = 0.2;    // ring frequency (radians per px)

void main() {
  vec2 px = vUv * uRes;
  vec2 disp = vec2(0.0);
  float sheen = 0.0;
  float depth = 0.0;

  for (int i = 0; i < ${MAX_RIPPLES}; i++) {
    vec4 r = uRipples[i];
    float age = uTime - r.z;
    if (r.w <= 0.0 || age < 0.0 || age > ${RIPPLE_LIFETIME.toFixed(1)}) continue;

    vec2 delta = px - r.xy * uRes;
    float d = length(delta);
    vec2 dir = d > 0.001 ? delta / d : vec2(0.0);

    // Rings exist only behind the travelling wavefront and fade with time and distance.
    float front = age * SPEED;
    float reached = 1.0 - smoothstep(front - 40.0, front, d);
    float envelope = exp(-age * 1.5) * exp(-d * 0.008) * reached * r.w;
    float phase = (d - front) * WAVE_K;
    float wave = sin(phase) * envelope;

    // The impact point itself sinks briefly before the rings take over.
    float dent = exp(-(d * d) / 1600.0) * exp(-age * 3.2) * r.w;

    disp += dir * (wave * ${WAVE_AMPLITUDE.toFixed(1)} - dent * ${DENT_AMPLITUDE.toFixed(1)});
    sheen += cos(phase) * envelope;
    depth += dent;
  }

  vec2 uv = (vUv - 0.5) * OVERSCAN + 0.5 - (disp / uRes) * OVERSCAN;
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    gl_FragColor = vec4(0.0);
    return;
  }
  vec4 color = texture2D(uTex, uv);
  // Metallic glint on the ring crests and a shadowed hollow at the impact
  // (colour is premultiplied, so the glint is scaled by alpha).
  color.rgb += sheen * ${SHEEN.toFixed(2)} * color.a;
  color.rgb *= 1.0 - clamp(depth, 0.0, 1.0) * ${DENT_SHADE.toFixed(2)};
  gl_FragColor = color;
}`

function compile(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) || 'shader compile failed')
  }
  return shader
}

function LiquidGlass({ src, alt, className = '', style }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const imgRef = useRef(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    const img = imgRef.current
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true })
    if (!gl) return

    let program
    try {
      program = gl.createProgram()
      gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER))
      gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER))
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('link failed')
    } catch {
      return // keep the plain image
    }
    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(program, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uRes = gl.getUniformLocation(program, 'uRes')
    const uTime = gl.getUniformLocation(program, 'uTime')
    const uRipples = gl.getUniformLocation(program, 'uRipples')

    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

    const ripples = new Float32Array(MAX_RIPPLES * 4)
    let nextSlot = 0
    let ready = false
    let raf = 0
    let width = 0
    let height = 0
    const startedAt = performance.now()
    const now = () => (performance.now() - startedAt) / 1000
    let lastSpawn = { x: 0, y: 0, t: 0 }

    const draw = () => {
      if (!ready) return
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform2f(uRes, width, height)
      gl.uniform1f(uTime, now())
      gl.uniform4fv(uRipples, ripples)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }

    const animating = () => {
      const t = now()
      for (let i = 0; i < MAX_RIPPLES; i++) {
        if (ripples[i * 4 + 3] > 0 && t - ripples[i * 4 + 2] < RIPPLE_LIFETIME) return true
      }
      return false
    }

    const tick = () => {
      draw()
      raf = animating() ? requestAnimationFrame(tick) : 0
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      canvas.width = Math.max(1, Math.round(width * dpr))
      canvas.height = Math.max(1, Math.round(height * dpr))
      draw()
    }

    const spawn = (e, strength) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const o = nextSlot * 4
      ripples[o] = x / rect.width
      ripples[o + 1] = 1 - y / rect.height
      ripples[o + 2] = now()
      ripples[o + 3] = strength
      nextSlot = (nextSlot + 1) % MAX_RIPPLES
      lastSpawn = { x: e.clientX, y: e.clientY, t: performance.now() }
      if (!raf) raf = requestAnimationFrame(tick)
    }

    const onEnter = (e) => spawn(e, ENTER_STRENGTH)
    const onMove = (e) => {
      const moved = Math.hypot(e.clientX - lastSpawn.x, e.clientY - lastSpawn.y)
      if (moved > MOVE_SPACING && performance.now() - lastSpawn.t > MOVE_INTERVAL) spawn(e, MOVE_STRENGTH)
    }

    const upload = () => {
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
      ready = true
      wrap.dataset.liquid = 'on' // swaps the static <img> for the canvas
      resize()
    }
    if (img.complete && img.naturalWidth) upload()
    else img.addEventListener('load', upload, { once: true })

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    wrap.addEventListener('pointerenter', onEnter)
    wrap.addEventListener('pointermove', onMove)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      img.removeEventListener('load', upload)
      wrap.removeEventListener('pointerenter', onEnter)
      wrap.removeEventListener('pointermove', onMove)
      delete wrap.dataset.liquid
      gl.deleteTexture(texture)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
    }
  }, [])

  const bleed = `${((OVERSCAN - 1) / 2) * 100}%`

  return (
    <div ref={wrapRef} className={`group/liquid ${className}`} style={style}>
      {/* Sizes the block, carries the alt text, and is the fallback when WebGL is off. */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        draggable="false"
        className="block w-full select-none group-data-[liquid=on]/liquid:opacity-0"
      />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute hidden group-data-[liquid=on]/liquid:block"
        style={{ left: `-${bleed}`, top: `-${bleed}`, width: `${OVERSCAN * 100}%`, height: `${OVERSCAN * 100}%` }}
      />
    </div>
  )
}

export default LiquidGlass
