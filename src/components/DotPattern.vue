<template>
  <canvas
    ref="canvasRef"
    class="dot-pattern-canvas"
    :style="{ zIndex: zIndex }"
    @touchstart.prevent
  ></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// 组件属性
const props = defineProps({
  dotSize: {
    type: Number,
    default: 2
  },
  dotColor: {
    type: String,
    default: 'rgba(255, 255, 255, 0.3)'
  },
  spacing: {
    type: Number,
    default: 20
  },
  fadeDistance: {
    type: Number,
    default: 100
  },
  zIndex: {
    type: Number,
    default: 2
  },
  mouseRadius: {
    type: Number,
    default: 120
  },
  effectIntensity: {
    type: Number,
    default: 0.9
  }
})

// 状态变量
const canvasRef = ref(null)
let context = null
let dots = []
let canvasWidth = 0
let canvasHeight = 0
let dpr = 1
let animationFrame = null
let isVisible = true

const mouseX = ref(-1000)
const mouseY = ref(-1000)

// 工具函数
const isLowPerformanceDevice = () => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  const hasLowMemory = navigator.deviceMemory && navigator.deviceMemory < 4
  const prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return isMobile || hasLowMemory || prefersReducedMotion
}

const parseColor = (color) => {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = color
    ctx.fillRect(0, 0, 1, 1)
    const data = ctx.getImageData(0, 0, 1, 1).data
    return { r: data[0], g: data[1], b: data[2], a: data[3] / 255 }
  } catch (error) {
    console.warn('Failed to parse color:', color, error)
    return { r: 255, g: 255, b: 255, a: 0.3 }
  }
}

const throttle = (callback, limit) => {
  let waiting = false
  return function (...args) {
    if (!waiting) {
      callback.apply(this, args)
      waiting = true
      setTimeout(() => {
        waiting = false
      }, limit)
    }
  }
}

// 创建点阵
const createDots = () => {
  dots = []
  const dotColor = parseColor(props.dotColor)
  const spacing = isLowPerformanceDevice() ? props.spacing * 1.5 : props.spacing

  const cols = Math.ceil(canvasWidth / spacing)
  const rows = Math.ceil(canvasHeight / spacing)

  for (let row = 0; row <= rows; row++) {
    for (let col = 0; col <= cols; col++) {
      const x = col * spacing
      const y = row * spacing

      const distanceToEdgeX = Math.min(x, canvasWidth - x)
      const distanceToEdgeY = Math.min(y, canvasHeight - y)
      const distanceToEdge = Math.min(distanceToEdgeX, distanceToEdgeY)

      let baseOpacity = 1
      if (distanceToEdge < props.fadeDistance) {
        baseOpacity = distanceToEdge / props.fadeDistance
      }

      dots.push({
        x,
        y,
        baseOpacity,
        opacity: baseOpacity,
        scale: 1,
        color: { ...dotColor },
        pulseOffset: Math.random() * Math.PI * 2
      })
    }
  }
}

// 事件处理器
const handleMouseMove = throttle((e) => {
  if (!isVisible) return
  mouseX.value = e.clientX
  mouseY.value = e.clientY
}, 16)

const handleTouchMove = throttle((e) => {
  if (!isVisible || !e.touches || !e.touches[0]) return
  mouseX.value = e.touches[0].clientX
  mouseY.value = e.touches[0].clientY
}, 16)

const handleMouseLeave = () => {
  mouseX.value = -1000
  mouseY.value = -1000
}

// 更新点状态
const updateDots = (timestamp) => {
  if (!isVisible) return

  for (let i = 0; i < dots.length; i++) {
    const dot = dots[i]
    dot.opacity = dot.baseOpacity
    dot.scale = 1

    const dx = dot.x - mouseX.value
    const dy = dot.y - mouseY.value
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance < props.mouseRadius) {
      const factor = 1 - distance / props.mouseRadius
      dot.opacity = dot.baseOpacity * (1 - factor * props.effectIntensity)
      dot.scale = 1 - factor * 0.2
    }
  }
}

// 绘制点阵
const drawDots = (timestamp) => {
  if (!context || !isVisible) return

  context.clearRect(0, 0, canvasWidth, canvasHeight)
  updateDots(timestamp)

  for (let i = 0; i < dots.length; i++) {
    const dot = dots[i]
    if (dot.opacity <= 0.01) continue

    context.beginPath()
    context.arc(
      dot.x,
      dot.y,
      props.dotSize * dot.scale,
      0,
      Math.PI * 2
    )
    context.fillStyle = `rgba(${dot.color.r}, ${dot.color.g}, ${dot.color.b}, ${dot.color.a * dot.opacity})`
    context.fill()
  }

  if (isVisible) {
    animationFrame = requestAnimationFrame(drawDots)
  }
}

// 画布大小调整
const resizeCanvas = () => {
  if (!canvasRef.value) return

  dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvasWidth = window.innerWidth
  canvasHeight = window.innerHeight

  canvasRef.value.width = canvasWidth * dpr
  canvasRef.value.height = canvasHeight * dpr
  canvasRef.value.style.width = `${canvasWidth}px`
  canvasRef.value.style.height = `${canvasHeight}px`

  context = canvasRef.value.getContext('2d')
  context.scale(dpr, dpr)

  createDots()
}

// 可见性处理
const handleVisibilityChange = () => {
  isVisible = !document.hidden

  if (isVisible) {
    if (!animationFrame) {
      animationFrame = requestAnimationFrame(drawDots)
    }
  } else {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame)
      animationFrame = null
    }
  }
}

// 生命周期钩子
onMounted(() => {
  if (isLowPerformanceDevice()) {
    console.log('Low performance device detected, skipping dot pattern animation')
    return
  }

  resizeCanvas()
  animationFrame = requestAnimationFrame(drawDots)

  // 事件监听
  window.addEventListener('resize', resizeCanvas)
  window.addEventListener('mousemove', handleMouseMove, { passive: true })
  window.addEventListener('touchmove', handleTouchMove, { passive: true })
  window.addEventListener('mouseleave', handleMouseLeave)
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  // 清理事件监听
  window.removeEventListener('resize', resizeCanvas)
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('touchmove', handleTouchMove)
  window.removeEventListener('mouseleave', handleMouseLeave)
  document.removeEventListener('visibilitychange', handleVisibilityChange)

  // 清理动画
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
})
</script>

<style scoped>
.dot-pattern-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  user-select: none;
}
</style>