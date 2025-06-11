<template>
  <div class="video-container">
    <video ref="videoElement" autoplay muted loop playsinline preload="metadata" class="fullscreen-video"
      @loadedmetadata="resizeVideo" @error="handleVideoError">
      <source :src="videoSrc" type="video/mp4">
      <p>Your browser does not support the video tag.</p>
    </video>
    <div class="overlay" :class="{ 'fallback-bg': videoError }"></div>
    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// 组件属性
const props = defineProps({
  videoSrc: {
    type: String,
    required: true
  },
  fallbackColor: {
    type: String,
    default: '#0d0f16'
  }
})

// 状态变量
const videoElement = ref(null)
const videoError = ref(false)

// 视频尺寸调整
const resizeVideo = () => {
  const video = videoElement.value
  if (!video || videoError.value) return

  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight
  const windowRatio = windowWidth / windowHeight
  const videoRatio = video.videoWidth / video.videoHeight

  if (windowRatio > videoRatio) {
    video.style.width = '100vw'
    video.style.height = 'auto'
    video.style.top = '50%'
    video.style.left = '0'
    video.style.transform = 'translateY(-50%)'
  } else {
    video.style.width = 'auto'
    video.style.height = '100vh'
    video.style.top = '0'
    video.style.left = '50%'
    video.style.transform = 'translateX(-50%)'
  }
}

// 视频错误处理
const handleVideoError = (error) => {
  console.warn('Video loading failed:', error)
  videoError.value = true

  if (videoElement.value) {
    videoElement.value.style.display = 'none'
  }
}

// 检测低性能设备
const isLowPerformanceDevice = () => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  const hasLowMemory = navigator.deviceMemory && navigator.deviceMemory < 4
  const hasSlowConnection = navigator.connection &&
    (navigator.connection.effectiveType === 'slow-2g' ||
      navigator.connection.effectiveType === '2g')

  return isMobile || hasLowMemory || hasSlowConnection
}

// 生命周期钩子
onMounted(() => {
  const video = videoElement.value
  if (!video) return

  // 低性能设备优化
  if (isLowPerformanceDevice()) {
    video.preload = 'none'
  }

  if (video.readyState >= 1) {
    resizeVideo()
  }

  window.addEventListener('resize', resizeVideo, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeVideo)

  // 清理视频资源
  const video = videoElement.value
  if (video) {
    video.pause()
    video.removeAttribute('src')
    video.load()
  }
})
</script>

<style scoped>
.video-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: v-bind('props.fallbackColor');
}

.fullscreen-video {
  position: absolute;
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  z-index: 1;
  object-fit: cover;
  transition: opacity 0.3s ease;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(13, 15, 22, 0.7);
  z-index: 2;
  transition: background-color 0.3s ease;
}

.overlay.fallback-bg {
  background-color: rgba(13, 15, 22, 0.9);
}

.content {
  position: relative;
  z-index: 3;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  color: white;
  -webkit-overflow-scrolling: touch;
}

/* 减少动画偏好时暂停视频 */
@media (prefers-reduced-motion: reduce) {
  .fullscreen-video {
    animation-play-state: paused;
  }
}

/* 低性能设备优化 */
@media (max-width: 768px) {
  .fullscreen-video {
    will-change: auto;
  }
}
</style>