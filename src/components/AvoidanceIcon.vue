<template>
    <div ref="container" class="avoidance-container" :style="containerStyle">
        <div ref="iconElement" class="avoidance-element" :style="elementStyle" @mouseenter="handleMouseEnter"
            @mouseleave="handleMouseLeave">
            <slot></slot>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, shallowRef, watch } from 'vue'

// 组件属性
const props = defineProps({
    avoidanceRadius: {
        type: Number,
        default: 100
    },
    maxDistance: {
        type: Number,
        default: 30
    },
    speedFactor: {
        type: Number,
        default: 0.15
    },
    returnFactor: {
        type: Number,
        default: 0.08
    },
    enabled: {
        type: Boolean,
        default: true
    }
})

// 响应式状态
const container = shallowRef(null)
const iconElement = shallowRef(null)
const offset = shallowRef({ x: 0, y: 0 })
const targetOffset = shallowRef({ x: 0, y: 0 })

// 状态变量
let elementRect = null
let isNearMouse = false
let animationFrame = null
let throttleTimer = null
let lastMouseX = -1000
let lastMouseY = -1000
let isHovered = false

// 监听启用状态变化
watch(() => props.enabled, (newValue) => {
    if (!newValue) {
        resetPosition()
    }
})

// 计算样式
const containerStyle = computed(() => ({
    position: 'relative',
    display: 'inline-block',
    overflow: 'visible',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
    pointerEvents: props.enabled ? 'auto' : 'none'
}))

const elementStyle = computed(() => ({
    transform: `translate3d(${offset.value.x}px, ${offset.value.y}px, 0)`,
    transition: isNearMouse ? 'none' : 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
    willChange: isNearMouse ? 'transform' : 'auto',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
    WebkitTouchCallout: 'none'
}))

// 工具函数
const throttle = (callback, limit = 16) => {
    return function (...args) {
        if (!throttleTimer) {
            throttleTimer = setTimeout(() => {
                callback(...args)
                throttleTimer = null
            }, limit)
        }
    }
}

// 事件处理器
const handleMouseMove = throttle((e) => {
    if (!props.enabled || !elementRect) return

    const mouseX = e.clientX
    const mouseY = e.clientY

    if (mouseX === lastMouseX && mouseY === lastMouseY) return

    lastMouseX = mouseX
    lastMouseY = mouseY

    calculateAvoidance(mouseX, mouseY)
}, 16)

// 避让计算
const calculateAvoidance = (pointerX, pointerY) => {
    const elementCenterX = elementRect.left + elementRect.width / 2
    const elementCenterY = elementRect.top + elementRect.height / 2

    const dx = elementCenterX - pointerX
    const dy = elementCenterY - pointerY
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance < props.avoidanceRadius && !isHovered) {
        isNearMouse = true
        const avoidFactor = Math.max(0, 1 - distance / props.avoidanceRadius)
        const avoidanceForce = avoidFactor * props.maxDistance
        const length = Math.max(0.1, Math.sqrt(dx * dx + dy * dy))

        targetOffset.value = {
            x: (dx / length) * avoidanceForce,
            y: (dy / length) * avoidanceForce
        }

        if (!animationFrame && props.enabled) {
            animationFrame = requestAnimationFrame(animateAvoidance)
        }
    } else if (isNearMouse && !isHovered) {
        isNearMouse = false
        targetOffset.value = { x: 0, y: 0 }

        if (!animationFrame && props.enabled) {
            animationFrame = requestAnimationFrame(animateAvoidance)
        }
    }
}

// 动画处理
const animateAvoidance = () => {
    if (!props.enabled) {
        resetPosition()
        return
    }

    const dx = targetOffset.value.x - offset.value.x
    const dy = targetOffset.value.y - offset.value.y
    const speedFactor = isNearMouse ? props.speedFactor : props.returnFactor

    const newOffset = {
        x: offset.value.x + dx * speedFactor,
        y: offset.value.y + dy * speedFactor
    }

    offset.value = newOffset

    const isMoving = Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1
    const isAtTarget = !isNearMouse &&
        Math.abs(offset.value.x) < 0.1 &&
        Math.abs(offset.value.y) < 0.1

    if (isMoving || !isAtTarget) {
        animationFrame = requestAnimationFrame(animateAvoidance)
    } else {
        offset.value = { x: 0, y: 0 }
        animationFrame = null
    }
}

// 位置重置
const resetPosition = () => {
    offset.value = { x: 0, y: 0 }
    targetOffset.value = { x: 0, y: 0 }
    isNearMouse = false

    if (animationFrame) {
        cancelAnimationFrame(animationFrame)
        animationFrame = null
    }
}

// 鼠标事件处理
const handleMouseEnter = () => {
    isHovered = true
    isNearMouse = false
    targetOffset.value = { x: 0, y: 0 }
}

const handleMouseLeave = () => {
    isHovered = false
}

// 元素位置更新
const updateElementRect = throttle(() => {
    if (iconElement.value) {
        elementRect = iconElement.value.getBoundingClientRect()
    }
}, 100)

// 生命周期钩子
onMounted(() => {
    updateElementRect()

    // 事件监听
    document.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('touchmove', handleMouseMove, { passive: true })
    window.addEventListener('scroll', updateElementRect, { passive: true })
    window.addEventListener('resize', updateElementRect, { passive: true })
})

onUnmounted(() => {
    // 清理动画
    if (animationFrame) {
        cancelAnimationFrame(animationFrame)
    }

    // 移除事件监听
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('touchmove', handleMouseMove)
    window.removeEventListener('scroll', updateElementRect)
    window.removeEventListener('resize', updateElementRect)

    // 清理定时器
    if (throttleTimer) {
        clearTimeout(throttleTimer)
    }
})
</script>