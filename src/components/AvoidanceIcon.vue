<!-- components/AvoidanceIcon.vue -->
<template>
    <div ref="container" class="avoidance-container" :style="containerStyle">
        <div ref="iconElement" class="avoidance-element" :style="elementStyle">
            <slot></slot>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, shallowRef } from 'vue';

const props = defineProps({
    // 闪避半径（鼠标距离多远开始有闪避效果）
    avoidanceRadius: {
        type: Number,
        default: 100
    },
    // 最大闪避距离
    maxDistance: {
        type: Number,
        default: 30
    },
    // 闪避速度因子
    speedFactor: {
        type: Number,
        default: 0.15
    },
    // 回归速度因子
    returnFactor: {
        type: Number,
        default: 0.08
    },
    // 是否启用闪避效果 (可用于低性能设备禁用)
    enabled: {
        type: Boolean,
        default: true
    }
});

// 使用 shallowRef 优化性能
const container = shallowRef(null);
const iconElement = shallowRef(null);

// 元素的偏移量 (使用单个对象减少响应式开销)
const offset = shallowRef({ x: 0, y: 0 });
// 目标偏移量 (闪避方向)
const targetOffset = shallowRef({ x: 0, y: 0 });
// 元素位置缓存
let elementRect = null;
// 是否在鼠标影响范围内
let isNearMouse = false;
// 动画帧
let animationFrame = null;
// 节流计时器
let throttleTimer = null;
// 上次鼠标位置
let lastMouseX = -1000;
let lastMouseY = -1000;

// 容器样式
const containerStyle = computed(() => ({
    position: 'relative',
    display: 'inline-block',
    overflow: 'visible',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
    pointerEvents: props.enabled ? 'auto' : 'none'
}));

// 元素样式
const elementStyle = computed(() => ({
    transform: `translate(${offset.value.x}px, ${offset.value.y}px)`,
    transition: isNearMouse ? 'none' : 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
    willChange: isNearMouse ? 'transform' : 'auto',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
    WebkitTouchCallout: 'none'
}));

// 节流函数 - 限制鼠标事件处理频率
const throttle = (callback, limit = 16) => { // 约60fps
    return function (...args) {
        if (!throttleTimer) {
            throttleTimer = setTimeout(() => {
                callback(...args);
                throttleTimer = null;
            }, limit);
        }
    };
};

// 处理鼠标移动 (使用节流优化性能)
const handleMouseMove = throttle((e) => {
    if (!props.enabled || !elementRect) return;

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    // 如果鼠标位置与上次相同，不处理
    if (mouseX === lastMouseX && mouseY === lastMouseY) return;

    lastMouseX = mouseX;
    lastMouseY = mouseY;

    calculateAvoidance(mouseX, mouseY);
}, 16);

// 计算闪避方向和距离
const calculateAvoidance = (pointerX, pointerY) => {
    // 元素中心点位置
    const elementCenterX = elementRect.left + elementRect.width / 2;
    const elementCenterY = elementRect.top + elementRect.height / 2;

    // 指针到元素中心的距离
    const dx = elementCenterX - pointerX;
    const dy = elementCenterY - pointerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 在闪避半径内才触发闪避
    if (distance < props.avoidanceRadius) {
        isNearMouse = true;

        // 闪避方向与鼠标到元素的方向相同，距离越近，闪避越强
        const avoidFactor = Math.max(0, 1 - distance / props.avoidanceRadius);
        const avoidanceForce = avoidFactor * props.maxDistance;

        // 归一化方向向量 * 闪避力度
        const length = Math.max(0.1, Math.sqrt(dx * dx + dy * dy));
        targetOffset.value = {
            x: (dx / length) * avoidanceForce,
            y: (dy / length) * avoidanceForce
        };

        // 确保动画在运行
        if (!animationFrame && props.enabled) {
            animationFrame = requestAnimationFrame(animateAvoidance);
        }
    } else if (isNearMouse) {
        // 离开闪避范围，回归原位
        isNearMouse = false;
        targetOffset.value = { x: 0, y: 0 };

        // 确保动画在运行
        if (!animationFrame && props.enabled) {
            animationFrame = requestAnimationFrame(animateAvoidance);
        }
    }
};

// 平滑动画闪避和回归
const animateAvoidance = () => {
    if (!props.enabled) {
        offset.value = { x: 0, y: 0 };
        animationFrame = null;
        return;
    }

    // 当前位置与目标位置的差
    const dx = targetOffset.value.x - offset.value.x;
    const dy = targetOffset.value.y - offset.value.y;

    // 根据是否在鼠标附近选择不同的速度因子
    const speedFactor = isNearMouse ? props.speedFactor : props.returnFactor;

    // 平滑移动 (使用临时对象减少GC)
    const newOffset = {
        x: offset.value.x + dx * speedFactor,
        y: offset.value.y + dy * speedFactor
    };

    // 更新位置
    offset.value = newOffset;

    // 如果运动几乎停止且接近目标位置，可以停止动画
    const isMoving = Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1;
    const isAtTarget = !isNearMouse &&
        Math.abs(offset.value.x) < 0.1 &&
        Math.abs(offset.value.y) < 0.1;

    if (isMoving || !isAtTarget) {
        // 继续动画
        animationFrame = requestAnimationFrame(animateAvoidance);
    } else {
        // 完全回到原位置
        offset.value = { x: 0, y: 0 };
        animationFrame = null;
    }
};

// 更新元素位置信息
const updateElementRect = throttle(() => {
    if (iconElement.value) {
        elementRect = iconElement.value.getBoundingClientRect();
    }
}, 100);

// 初始化和清理
onMounted(() => {
    updateElementRect();

    // 使用事件代理处理鼠标移动，提高性能
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('touchmove', handleMouseMove, { passive: true });

    // 监听滚动和调整大小以更新元素位置
    window.addEventListener('scroll', updateElementRect, { passive: true });
    window.addEventListener('resize', updateElementRect, { passive: true });
});

onUnmounted(() => {
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }

    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('touchmove', handleMouseMove);
    window.removeEventListener('scroll', updateElementRect);
    window.removeEventListener('resize', updateElementRect);

    if (throttleTimer) {
        clearTimeout(throttleTimer);
    }
});
</script>

<style scoped>
.avoidance-container {
    display: inline-block;
    position: relative;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    touch-action: none;
}

.avoidance-element {
    display: inline-block;
    position: relative;
    will-change: transform;
    z-index: 1;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -webkit-touch-callout: none;
    pointer-events: auto;
}
</style>