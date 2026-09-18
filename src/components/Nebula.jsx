import { useEffect, useRef } from 'react'

// Dark red smoke churning across the whole hero, matched to the nebulavideo
// sample: big soft clouds of deep red that warm towards red-orange at their
// densest, with near-black voids between them, constantly folding into new
// shapes. It is domain-warped fractal noise drawn in WebGL at a fraction of the
// screen resolution (the smoke has no fine detail, so upscaling only softens it)
// and screen-blended over the background and poster, beneath the cards and text.
// Reduced motion shows one still frame; without WebGL the hero stays as it was.

const RESOLUTION = 0.25 // canvas pixels per CSS pixel
const FRAME_INTERVAL = 1000 / 30 // ms; the smoke moves too softly to need 60fps
const SPEED = 0.16 // how fast the smoke folds and drifts
const SCALE = 1.15 // cloud size: lower means fewer, larger clouds

const VERTEX_SHADER = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`

const FRAGMENT_SHADER = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
varying vec2 vUv;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 p = vUv * vec2(uRes.x / uRes.y, 1.0) * ${SCALE.toFixed(2)};
  float t = uTime * ${SPEED.toFixed(3)};

  // Two rounds of warping bend the noise into rolling, folding smoke.
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t * 0.7));
  vec2 r = vec2(fbm(p + 2.2 * q + vec2(1.7, 9.2) + t * 1.3),
                fbm(p + 2.2 * q + vec2(8.3, 2.8) - t * 0.9));
  float f = fbm(p + 1.8 * r);

  float density = smoothstep(0.15, 0.8, f);
  float heat = smoothstep(0.55, 1.0, f * (0.6 + length(q)));

  vec3 deep = vec3(0.10, 0.02, 0.012);
  vec3 warm = vec3(0.19, 0.045, 0.025);
  vec3 hot = vec3(0.06, 0.022, 0.01);
  vec3 color = mix(deep, warm, density) * density + hot * heat * density;
  gl_FragColor = vec4(color, 1.0);
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

function Nebula() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false })
    if (!gl) return

    let program
    try {
      program = gl.createProgram()
      gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER))
      gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER))
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('link failed')
    } catch {
      return // leave the hero without smoke
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

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Start mid-flow so the first frame is already fully formed smoke.
    const startedAt = performance.now() - 40000
    let raf = 0
    let lastFrame = 0
    let visible = true

    const draw = () => {
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uTime, (performance.now() - startedAt) / 1000)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }

    const tick = (now) => {
      raf = requestAnimationFrame(tick)
      if (now - lastFrame < FRAME_INTERVAL) return
      lastFrame = now
      draw()
    }

    const start = () => {
      if (!still && visible && !raf) raf = requestAnimationFrame(tick)
    }
    const stop = () => {
      cancelAnimationFrame(raf)
      raf = 0
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = Math.max(1, Math.round(rect.width * RESOLUTION))
      canvas.height = Math.max(1, Math.round(rect.height * RESOLUTION))
      draw()
    }

    // Only churn while the hero is on screen.
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) start()
      else stop()
    })
    intersection.observe(canvas)
    const sizing = new ResizeObserver(resize)
    sizing.observe(canvas)
    resize()
    start()

    return () => {
      stop()
      intersection.disconnect()
      sizing.disconnect()
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 size-full blur-lg mix-blend-screen"
    />
  )
}

export default Nebula
