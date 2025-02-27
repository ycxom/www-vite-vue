<!-- LogoGlow.vue -->
<template>
  <div class="logo-container" :style="containerStyle" @mousedown="startDrag" @touchstart="startDrag">
    <img :src="logoSrc" alt="Logo" class="logo" :style="logoStyle" ref="logoRef" draggable="false" />
    <div class="glow-effect" :style="glowStyle"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

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
  // 物理参数
  springStrength: {
    type: Number,
    default: 0.08 // 弹簧强度
  },
  damping: {
    type: Number,
    default: 0.85 // 阻尼系数
  },
  maxStretch: {
    type: Number,
    default: 150 // 最大拉伸距离
  },
  // 弹力系数 - 值越大，Logo越难被拉长
  elasticity: {
    type: Number,
    default: 0.6
  },
  // 自然回弹时间 (毫秒)
  returnDuration: {
    type: Number,
    default: 800
  }
});

// 基础样式
const containerStyle = computed(() => {
  return {
    width: props.width,
    height: props.height,
    position: 'relative',
    userSelect: 'none',
    willChange: isDragging.value ? 'transform' : 'auto'
  };
});

// Logo元素
const logoRef = ref(null);
const isDragging = ref(false);
const startX = ref(0);
const startY = ref(0);
const offsetX = ref(0);
const offsetY = ref(0);
const velocityX = ref(0);
const velocityY = ref(0);

// 上一次位置和时间戳 (用于计算速度)
let lastX = 0;
let lastY = 0;
let lastTimestamp = 0;
let previousOffsetX = 0;
let previousOffsetY = 0;

// 非线性拉力曲线
// 这个函数将使Logo在拉伸初期容易移动，但越拉越难
const applyElasticForce = (offset, maxStretch) => {
  const normalizedOffset = Math.abs(offset) / maxStretch;
  const elasticFactor = Math.pow(normalizedOffset, props.elasticity);
  const direction = offset >= 0 ? 1 : -1;

  return direction * Math.min(Math.abs(offset), maxStretch * elasticFactor);
};

// Logo样式，包含变换和硬件加速
const logoStyle = computed(() => {
  // 应用非线性拉力曲线
  const elasticX = applyElasticForce(offsetX.value, props.maxStretch);
  const elasticY = applyElasticForce(offsetY.value, props.maxStretch);

  return {
    transform: `translate3d(${elasticX}px, ${elasticY}px, 0)`,
    transition: isDragging.value ? 'none' : `transform ${props.returnDuration}ms cubic-bezier(0.25, 0.8, 0.25, 1)`,
    userSelect: 'none',
    WebkitUserSelect: 'none',
    pointerEvents: 'auto',
    willChange: isDragging.value ? 'transform' : 'auto',
    transformOrigin: 'center'
  };
});

// 发光效果样式 - 与Logo移动稍有延迟
const glowStyle = computed(() => {
  // 发光效果跟随，但有意的延迟和弱化
  const elasticX = applyElasticForce(offsetX.value, props.maxStretch) * 0.8;
  const elasticY = applyElasticForce(offsetY.value, props.maxStretch) * 0.8;

  return {
    background: props.glowColor,
    filter: `blur(${props.glowSize})`,
    transform: `translate3d(${elasticX}px, ${elasticY}px, 0)`,
    transition: isDragging.value ? 'none' : `transform ${props.returnDuration * 1.2}ms cubic-bezier(0.25, 0.8, 0.25, 1)`,
    willChange: isDragging.value ? 'transform' : 'auto'
  };
});

// 开始拖动
const startDrag = (event) => {
  // 防止文本选择和默认拖拽
  event.preventDefault();

  // 获取起始位置
  const clientX = event.clientX || (event.touches && event.touches[0] ? event.touches[0].clientX : 0);
  const clientY = event.clientY || (event.touches && event.touches[0] ? event.touches[0].clientY : 0);

  startX.value = clientX - offsetX.value;
  startY.value = clientY - offsetY.value;
  lastX = clientX;
  lastY = clientY;
  lastTimestamp = performance.now();
  isDragging.value = true;

  // 添加移动和释放事件监听
  document.addEventListener('mousemove', onDrag, { passive: false });
  document.addEventListener('touchmove', onDrag, { passive: false });
  document.addEventListener('mouseup', stopDrag);
  document.addEventListener('touchend', stopDrag);

  // 停止任何正在进行的物理动画
  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value);
    animationFrame.value = null;
  }
};

// 拖动中 - 使用高性能事件处理
const onDrag = (event) => {
  if (!isDragging.value) return;

  // 防止默认行为，如滚动
  event.preventDefault();

  const clientX = event.clientX || (event.touches && event.touches[0] ? event.touches[0].clientX : 0);
  const clientY = event.clientY || (event.touches && event.touches[0] ? event.touches[0].clientY : 0);

  // 计算新位置
  const newOffsetX = clientX - startX.value;
  const newOffsetY = clientY - startY.value;

  // 应用非线性限制，而不是硬性截断最大距离
  offsetX.value = newOffsetX;
  offsetY.value = newOffsetY;

  // 计算速度 (用于释放后的动量)
  const now = performance.now();
  const dt = now - lastTimestamp;

  if (dt > 0) {
    // 使用加权平均来平滑速度
    const instantVelocityX = (clientX - lastX) / dt;
    const instantVelocityY = (clientY - lastY) / dt;

    // 平滑速度 (80% 新速度, 20% 旧速度)
    velocityX.value = instantVelocityX * 0.8 + velocityX.value * 0.2;
    velocityY.value = instantVelocityY * 0.8 + velocityY.value * 0.2;

    lastX = clientX;
    lastY = clientY;
    lastTimestamp = now;
  }

  // 保存当前位置用于下一帧计算
  previousOffsetX = offsetX.value;
  previousOffsetY = offsetY.value;
};

// 停止拖动
const stopDrag = () => {
  isDragging.value = false;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('touchmove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
  document.removeEventListener('touchend', stopDrag);

  // 计算释放时的能量
  const speed = Math.sqrt(velocityX.value * velocityX.value + velocityY.value * velocityY.value);
  const distance = Math.sqrt(offsetX.value * offsetX.value + offsetY.value * offsetY.value);

  // 如果速度和距离都小，直接回到原位
  if (speed < 0.1 && distance < 30) {
    resetPosition();
    return;
  }

  // 启动物理效果动画
  startPhysicsAnimation();
};

// 物理效果动画
const animationFrame = ref(null);

const startPhysicsAnimation = () => {
  let lastAnimTime = performance.now();
  const initialOffsetX = offsetX.value;
  const initialOffsetY = offsetY.value;
  const initialVelocityX = velocityX.value * 15; // 放大初速度
  const initialVelocityY = velocityY.value * 15;
  let progress = 0;

  const animate = (timestamp) => {
    // 动画进度 (0-1)
    const deltaTime = timestamp - lastAnimTime;
    lastAnimTime = timestamp;

    // 时间进度
    progress += deltaTime / props.returnDuration;

    if (progress >= 1) {
      // 动画完成，重置位置
      resetPosition();
      return;
    }

    // 应用基于物理的缓动
    // 这个自定义缓动函数结合了弹簧物理和衰减
    const springFactor = Math.pow(1 - progress, 3); // 弹簧力随时间衰减
    const dampFactor = Math.pow(props.damping, progress * 20); // 阻尼随时间增加

    // 结合初始动量、弹簧力和阻尼
    const momentumX = initialVelocityX * dampFactor;
    const momentumY = initialVelocityY * dampFactor;

    // 弹簧回弹力
    const springX = -initialOffsetX * springFactor * props.springStrength;
    const springY = -initialOffsetY * springFactor * props.springStrength;

    // 更新位置 - 指数衰减
    offsetX.value = initialOffsetX * Math.pow(0.1, progress) + momentumX + springX;
    offsetY.value = initialOffsetY * Math.pow(0.1, progress) + momentumY + springY;

    // 添加轻微的振荡
    const oscillation = Math.sin(progress * Math.PI * 2) * Math.pow(1 - progress, 2) * 10;
    offsetX.value += oscillation * (initialOffsetX > 0 ? 1 : -1);
    offsetY.value += oscillation * (initialOffsetY > 0 ? 1 : -1);

    // 继续动画
    animationFrame.value = requestAnimationFrame(animate);
  };

  // 启动动画
  animationFrame.value = requestAnimationFrame(animate);
};

// 重置位置
const resetPosition = () => {
  offsetX.value = 0;
  offsetY.value = 0;
  velocityX.value = 0;
  velocityY.value = 0;

  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value);
    animationFrame.value = null;
  }
};

// 清理动画
onUnmounted(() => {
  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value);
  }
});
</script>

<style scoped>
.logo-container {
  position: relative;
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
  /* 性能优化 */
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
  /* 性能优化 */
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