<template>
  <div class="logo-container" :style="containerStyle" @mousedown="startDrag" @touchstart="startDrag">
    <img :src="logoSrc" alt="Logo" class="logo" :style="logoStyle" ref="logoRef" draggable="false" />
    <div class="glow-effect" :style="glowStyle"></div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'

// 组件属性
const props = defineProps({
  logoSrc: {
    type: String,
    required: true
  },
  width: {
    type: String,
    default: '300px'
  },
  height: {
    type: String,
    default: 'auto'
  },
  glowColor: {
    type: String,
    default: 'rgba(255, 255, 255, 0.7)'
  },
  glowSize: {
    type: String,
    default: '70px'
  },
  springStrength: {
    type: Number,
    default: 0.08
  },
  damping: {
    type: Number,
    default: 0.85
  },
  maxStretch: {
    type: Number,
    default: 150
  },
  elasticity: {
    type: Number,
    default: 0.6
  },
  returnDuration: {
    type: Number,
    default: 800
  }
})

// 响应式状态
const logoRef = ref(null)
const isDragging = ref(false)
const startX = ref(0)
const startY = ref(0)
const offsetX = ref(0)
const offsetY = ref(0)
const velocityX = ref(0)
const velocityY = ref(0)

// 状态变量
let lastX = 0
let lastY = 0
let lastTimestamp = 0
let previousOffsetX = 0
let previousOffsetY = 0
const animationFrame = ref(null)

// 计算样式
const containerStyle = computed(() => ({
  width: props.width,
  height: props.height,
  position: 'relative',
  userSelect: 'none',
  willChange: isDragging.value ? 'transform' : 'auto'
}))

// 非线性拉力曲线
const applyElasticForce = (offset, maxStretch) => {
  const normalizedOffset = Math.abs(offset) / maxStretch
  const elasticFactor = Math.pow(normalizedOffset, props.elasticity)
  const direction = offset >= 0 ? 1 : -1
  return direction * Math.min(Math.abs(offset), maxStretch * elasticFactor)
}

const logoStyle = computed(() => {
  const elasticX = applyElasticForce(offsetX.value, props.maxStretch)
  const elasticY = applyElasticForce(offsetY.value, props.maxStretch)

  return {
    transform: `translate3d(${elasticX}px, ${elasticY}px, 0)`,
    transition: isDragging.value ? 'none' : `transform ${props.returnDuration}ms cubic-bezier(0.25, 0.8, 0.25, 1)`,
    userSelect: 'none',
    WebkitUserSelect: 'none',
    pointerEvents: 'auto',
    willChange: isDragging.value ? 'transform' : 'auto',
    transformOrigin: 'center'
  }
})

const glowStyle = computed(() => {
  const elasticX = applyElasticForce(offsetX.value, props.maxStretch) * 0.8
  const elasticY = applyElasticForce(offsetY.value, props.maxStretch) * 0.8

  return {
    background: props.glowColor,
    filter: `blur(${props.glowSize})`,
    transform: `translate3d(${elasticX}px, ${elasticY}px, 0)`,
    transition: isDragging.value ? 'none' : `transform ${props.returnDuration * 1.2}ms cubic-bezier(0.25, 0.8, 0.25, 1)`,
    willChange: isDragging.value ? 'transform' : 'auto'
  }
})

// 拖拽控制
const startDrag = (event) => {
  event.preventDefault()

  const clientX = event.clientX || (event.touches && event.touches[0] ? event.touches[0].clientX : 0)
  const clientY = event.clientY || (event.touches && event.touches[0] ? event.touches[0].clientY : 0)

  startX.value = clientX - offsetX.value
  startY.value = clientY - offsetY.value
  lastX = clientX
  lastY = clientY
  lastTimestamp = performance.now()
  isDragging.value = true

  // 添加事件监听
  document.addEventListener('mousemove', onDrag, { passive: false })
  document.addEventListener('touchmove', onDrag, { passive: false })
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchend', stopDrag)

  // 停止动画
  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value)
    animationFrame.value = null
  }
}

const onDrag = (event) => {
  if (!isDragging.value) return

  event.preventDefault()

  const clientX = event.clientX || (event.touches && event.touches[0] ? event.touches[0].clientX : 0)
  const clientY = event.clientY || (event.touches && event.touches[0] ? event.touches[0].clientY : 0)

  const newOffsetX = clientX - startX.value
  const newOffsetY = clientY - startY.value

  offsetX.value = newOffsetX
  offsetY.value = newOffsetY

  // 计算速度
  const now = performance.now()
  const dt = now - lastTimestamp

  if (dt > 0) {
    const instantVelocityX = (clientX - lastX) / dt
    const instantVelocityY = (clientY - lastY) / dt

    velocityX.value = instantVelocityX * 0.8 + velocityX.value * 0.2
    velocityY.value = instantVelocityY * 0.8 + velocityY.value * 0.2

    lastX = clientX
    lastY = clientY
    lastTimestamp = now
  }

  previousOffsetX = offsetX.value
  previousOffsetY = offsetY.value
}

const stopDrag = () => {
  isDragging.value = false

  // 移除事件监听
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchend', stopDrag)

  // 计算释放时的状态
  const speed = Math.sqrt(velocityX.value * velocityX.value + velocityY.value * velocityY.value)
  const distance = Math.sqrt(offsetX.value * offsetX.value + offsetY.value * offsetY.value)

  // 直接回到原位或启动物理动画
  if (speed < 0.1 && distance < 30) {
    resetPosition()
  } else {
    startPhysicsAnimation()
  }
}

// 物理动画
const startPhysicsAnimation = () => {
  let lastAnimTime = performance.now()
  const initialOffsetX = offsetX.value
  const initialOffsetY = offsetY.value
  const initialVelocityX = velocityX.value * 15
  const initialVelocityY = velocityY.value * 15
  let progress = 0

  const animate = (timestamp) => {
    const deltaTime = timestamp - lastAnimTime
    lastAnimTime = timestamp

    progress += deltaTime / props.returnDuration

    if (progress >= 1) {
      resetPosition()
      return
    }

    const springFactor = Math.pow(1 - progress, 3)
    const dampFactor = Math.pow(props.damping, progress * 20)

    const momentumX = initialVelocityX * dampFactor
    const momentumY = initialVelocityY * dampFactor

    const springX = -initialOffsetX * springFactor * props.springStrength
    const springY = -initialOffsetY * springFactor * props.springStrength

    offsetX.value = initialOffsetX * Math.pow(0.1, progress) + momentumX + springX
    offsetY.value = initialOffsetY * Math.pow(0.1, progress) + momentumY + springY

    const oscillation = Math.sin(progress * Math.PI * 2) * Math.pow(1 - progress, 2) * 10
    offsetX.value += oscillation * (initialOffsetX > 0 ? 1 : -1)
    offsetY.value += oscillation * (initialOffsetY > 0 ? 1 : -1)

    animationFrame.value = requestAnimationFrame(animate)
  }

  animationFrame.value = requestAnimationFrame(animate)
}

// 重置位置
const resetPosition = () => {
  offsetX.value = 0
  offsetY.value = 0
  velocityX.value = 0
  velocityY.value = 0

  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value)
    animationFrame.value = null
  }
}

// 清理
onUnmounted(() => {
  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value)
  }
})
</script>

<style scoped>
.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  touch-action: none;
  cursor: grab;
}

.logo-container:active {
  cursor: grabbing;
}

.logo {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
  user-select: none;
  -webkit-user-drag: none;
  pointer-events: none;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.glow-effect {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0.8;
  z-index: 1;
  animation: pulse 4s infinite ease-in-out;
  pointer-events: none;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

@keyframes pulse {
  0% {
    opacity: 0.5;
    filter: blur(calc(v-bind('props.glowSize') * 0.9));
  }

  50% {
    opacity: 0.8;
    filter: blur(calc(v-bind('props.glowSize') * 1.1));
  }

  100% {
    opacity: 0.5;
    filter: blur(calc(v-bind('props.glowSize') * 0.9));
  }
}
</style>