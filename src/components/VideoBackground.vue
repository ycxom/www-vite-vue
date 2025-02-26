<!-- components/VideoBackground.vue -->
<template>
    <div class="video-container">
      <video 
        ref="videoElement"
        autoplay 
        muted 
        loop 
        playsinline 
        class="fullscreen-video"
      >
        <source :src="videoSrc" type="video/mp4">
      </video>
      <div class="overlay"></div>
      <div class="content">
        <slot></slot>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  
  const props = defineProps({
    videoSrc: {
      type: String,
      required: true
    }
  });
  
  const videoElement = ref(null);
  
  const resizeVideo = () => {
    const video = videoElement.value;
    if (!video) return;
    
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const windowRatio = windowWidth / windowHeight;
    const videoRatio = video.videoWidth / video.videoHeight;
    
    if (windowRatio > videoRatio) {
      video.style.width = '100vw';
      video.style.height = 'auto';
      video.style.top = '50%';
      video.style.left = '0';
      video.style.transform = 'translateY(-50%)';
    } else {
      video.style.width = 'auto';
      video.style.height = '100vh';
      video.style.top = '0';
      video.style.left = '50%';
      video.style.transform = 'translateX(-50%)';
    }
  };
  
  onMounted(() => {
    const video = videoElement.value;
    if (video) {
      video.addEventListener('loadedmetadata', resizeVideo);
      if (video.readyState >= 1) {
        resizeVideo();
      }
    }
    
    window.addEventListener('resize', resizeVideo);
  });
  
  onUnmounted(() => {
    const video = videoElement.value;
    if (video) {
      video.removeEventListener('loadedmetadata', resizeVideo);
    }
    window.removeEventListener('resize', resizeVideo);
  });
  </script>
  
  <style scoped>
  .video-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background-color: #0d0f16;
  }
  
  .fullscreen-video {
    position: absolute;
    min-width: 100%;
    min-height: 100%;
    width: auto;
    height: auto;
    z-index: 1;
    object-fit: cover;
  }
  
  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(13, 15, 22, 0.7);
    z-index: 2;
  }
  
  .content {
  position: relative;
  z-index: 3;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start; /* 改为从上往下排列 */
  align-items: center;
  color: white;
  -webkit-overflow-scrolling: touch; /* 增强移动端滚动体验 */
}
</style>