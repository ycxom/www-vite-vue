<template>
    <canvas 
      ref="canvasRef" 
      class="dot-pattern-canvas"
      :style="{ zIndex: zIndex }"
    ></canvas>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  
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
  });
  
  const canvasRef = ref(null);
  let context = null;
  let dots = [];
  let canvasWidth = 0;
  let canvasHeight = 0;
  let dpr = 1; 
  let animationFrame = null;
  
  const mouseX = ref(-1000);
  const mouseY = ref(-1000);
  
  const parseColor = (color) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    const data = ctx.getImageData(0, 0, 1, 1).data;
    return { r: data[0], g: data[1], b: data[2], a: data[3] / 255 };
  };
  
  const createDots = () => {
    dots = [];
    const dotColor = parseColor(props.dotColor);
    
    const cols = Math.ceil(canvasWidth / props.spacing);
    const rows = Math.ceil(canvasHeight / props.spacing);
    
    for (let row = 0; row <= rows; row++) {
      for (let col = 0; col <= cols; col++) {
        const x = col * props.spacing;
        const y = row * props.spacing;
        
        const distanceToEdgeX = Math.min(x, canvasWidth - x);
        const distanceToEdgeY = Math.min(y, canvasHeight - y);
        const distanceToEdge = Math.min(distanceToEdgeX, distanceToEdgeY);
        
        let baseOpacity = 1;
        if (distanceToEdge < props.fadeDistance) {
          baseOpacity = distanceToEdge / props.fadeDistance;
        }
        
        dots.push({
          x,
          y,
          baseOpacity,
          opacity: baseOpacity,
          scale: 1,
          color: { ...dotColor },
          pulseOffset: Math.random() * Math.PI * 2
        });
      }
    }
  };
  
  const throttle = (callback, limit) => {
    let waiting = false;
    return function() {
      if (!waiting) {
        callback.apply(this, arguments);
        waiting = true;
        setTimeout(() => {
          waiting = false;
        }, limit);
      }
    };
  };
  
  const handleMouseMove = throttle((e) => {
    mouseX.value = e.clientX;
    mouseY.value = e.clientY;
  }, 16);
  
  const handleTouchMove = throttle((e) => {
    if (e.touches && e.touches[0]) {
      mouseX.value = e.touches[0].clientX;
      mouseY.value = e.touches[0].clientY;
    }
  }, 16);
  
  const updateDots = (timestamp) => {
    const time = timestamp / 1000;
    
    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];
      
      dot.opacity = dot.baseOpacity;
      dot.scale = 1;
      
      // 计算点到鼠标的距离
      const dx = dot.x - mouseX.value;
      const dy = dot.y - mouseY.value;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // 应用鼠标效果
      if (distance < props.mouseRadius) {
        const factor = 1 - distance / props.mouseRadius;
        dot.opacity = dot.baseOpacity * (1 - factor * props.effectIntensity);
        dot.scale = 1 - factor * 0.2;
      }
    }
  };
  
  const drawDots = (timestamp) => {
    if (!context) return;
    
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    
    updateDots(timestamp);
    
    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];
      if (dot.opacity <= 0.01) continue;
      
      context.beginPath();
      context.arc(
        dot.x, 
        dot.y, 
        props.dotSize * dot.scale, 
        0, 
        Math.PI * 2
      );
      
      context.fillStyle = `rgba(${dot.color.r}, ${dot.color.g}, ${dot.color.b}, ${dot.color.a * dot.opacity})`;
      context.fill();
    }
    
    animationFrame = requestAnimationFrame(drawDots);
  };
  
  const resizeCanvas = () => {
    if (!canvasRef.value) return;
    
    dpr = window.devicePixelRatio || 1;
    
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    
    canvasRef.value.width = canvasWidth * dpr;
    canvasRef.value.height = canvasHeight * dpr;
    
    canvasRef.value.style.width = `${canvasWidth}px`;
    canvasRef.value.style.height = `${canvasHeight}px`;
    
    context = canvasRef.value.getContext('2d');
    context.scale(dpr, dpr);
    
    createDots();
  };
  
  onMounted(() => {
    resizeCanvas();
    
    animationFrame = requestAnimationFrame(drawDots);
    
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    
    window.addEventListener('mouseleave', () => {
      mouseX.value = -1000;
      mouseY.value = -1000;
    });
  });
  
  onUnmounted(() => {
    window.removeEventListener('resize', resizeCanvas);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('mouseleave', handleMouseMove);
    
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  });
  </script>
  
  <style scoped>
  .dot-pattern-canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  </style>